"""FastAPI backend for the "chat with my resume" widget.

Stateless with one deliberate exception: question_log.jsonl (see
_log_question below) records each question asked and whether it was
in-scope, so knowledge-base gaps can be spotted over time. No IP, no
history, no answer text - just enough to see what visitors ask. See
internal-docs/chat-with-resume-plan.md for the reasoning behind the model
choice, caching strategy, and grounding approach.
"""

import json
import logging
import os
import time
from collections import defaultdict, deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, Optional

import anthropic
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from system_prompt import RESPONSE_SCHEMA, build_system_prompt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chat")

MODEL = "claude-haiku-5-5"
MAX_TOKENS = 400
HISTORY_LIMIT = 6  # last 6 entries (3 exchanges), regardless of what the client sends

QUESTION_LOG_PATH = Path(__file__).parent / "question_log.jsonl"

PER_IP_PER_MINUTE = 10
PER_IP_PER_DAY = 60
GLOBAL_PER_DAY = 300

CORS_ORIGINS = [
    "https://santiagomorel.dev",
    "http://localhost:8080",
]

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env
SYSTEM_PROMPT = build_system_prompt()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    history: list[HistoryMessage] = Field(default_factory=list)


# --- In-memory rate limiting -------------------------------------------------
# Single-process app on one VPS, so in-memory counters are fine (see plan
# section 1). Resets on process restart - acceptable tradeoff, not a bug.

_per_ip_minute_hits: dict[str, deque[float]] = defaultdict(deque)
_per_ip_day_hits: dict[str, tuple[str, int]] = {}
_global_day_hits: tuple[str, int] = ("", 0)


def _today_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _check_rate_limit(ip: str) -> Optional[int]:
    """Returns retry_after_seconds if rate-limited, else None."""
    global _global_day_hits

    now = time.monotonic()
    today = _today_utc()

    # Per-IP per-minute (sliding window)
    hits = _per_ip_minute_hits[ip]
    while hits and now - hits[0] > 60:
        hits.popleft()
    if len(hits) >= PER_IP_PER_MINUTE:
        logger.info("rate limit trip: per-ip-minute ip=%s", ip)
        return 60

    # Per-IP per-day
    day, count = _per_ip_day_hits.get(ip, (today, 0))
    if day != today:
        day, count = today, 0
    if count >= PER_IP_PER_DAY:
        logger.info("rate limit trip: per-ip-day ip=%s", ip)
        return 86400

    # Global per-day
    g_day, g_count = _global_day_hits
    if g_day != today:
        g_day, g_count = today, 0
    if g_count >= GLOBAL_PER_DAY:
        logger.info("rate limit trip: global-day ip=%s", ip)
        return 86400

    # Record the hit across all three counters.
    hits.append(now)
    _per_ip_day_hits[ip] = (day, count + 1)
    _global_day_hits = (g_day, g_count + 1)
    return None


def _log_question(question: str, in_scope: bool) -> None:
    """Appends one line to question_log.jsonl - never let this break a response."""
    try:
        with QUESTION_LOG_PATH.open("a", encoding="utf-8") as f:
            f.write(
                json.dumps(
                    {
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "question": question,
                        "in_scope": in_scope,
                    }
                )
                + "\n"
            )
    except OSError:
        logger.exception("failed to write question_log.jsonl")


@app.post("/api/chat")
async def chat(request: Request):
    ip = request.client.host if request.client else "unknown"

    retry_after = _check_rate_limit(ip)
    if retry_after is not None:
        return JSONResponse(
            status_code=429,
            content={"error": "rate_limited", "retry_after_seconds": retry_after},
        )

    try:
        body = await request.json()
        chat_request = ChatRequest.model_validate(body)
    except Exception:
        return JSONResponse(
            status_code=400,
            content={"error": "invalid_request", "detail": "message must be 1-500 chars; history must be a list of {role, content}"},
        )

    capped_history = chat_request.history[-HISTORY_LIMIT:]
    messages = [{"role": m.role, "content": m.content} for m in capped_history]
    messages.append({"role": "user", "content": chat_request.message})

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            # Grounded lookup Q&A doesn't need reasoning, and Haiku 5.5 (unlike
            # 4.5) runs adaptive thinking by default when `thinking` is
            # omitted - leaving it on would eat into MAX_TOKENS and add
            # latency for no benefit here.
            thinking={"type": "disabled"},
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            cache_control={"type": "ephemeral"},
            messages=messages,
            output_config={"format": {"type": "json_schema", "schema": RESPONSE_SCHEMA}},
        )
    except anthropic.APIError as e:
        logger.error("Anthropic API error: %s", e)
        return JSONResponse(status_code=500, content={"error": "server_error"})

    if response.stop_reason == "refusal":
        # Haiku 5.5 runs safety classifiers with no server-side fallback
        # (unlike Fable 5.1) - a decline is a normal 200, not an exception.
        category = response.stop_details.category if response.stop_details else None
        logger.info("chat: ip=%s refusal category=%s", ip, category)
        _log_question(chat_request.message, in_scope=False)
        return JSONResponse(
            content={
                "answer": "That's not something I can help with here - feel free to reach out to Santiago directly.",
                "source_excerpt": None,
                "in_scope": False,
            }
        )

    text = next((b.text for b in response.content if b.type == "text"), None)
    if text is None:
        logger.error("No text block in response: %s", response)
        return JSONResponse(status_code=500, content={"error": "server_error"})

    parsed = json.loads(text)

    logger.info(
        "chat: ip=%s in_scope=%s cache_read=%s cache_write=%s reasoning=%s",
        ip,
        parsed["in_scope"],
        response.usage.cache_read_input_tokens,
        response.usage.cache_creation_input_tokens,
        parsed["reasoning"],
    )
    _log_question(chat_request.message, in_scope=parsed["in_scope"])

    return JSONResponse(
        content={
            "answer": parsed["answer"],
            "source_excerpt": parsed["source_excerpt"],
            "in_scope": parsed["in_scope"],
        }
    )
