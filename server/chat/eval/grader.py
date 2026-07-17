"""Eval runner for the chat widget's system prompt.

Runs every case in dataset.json through the live backend, then asks a second
Haiku call to grade each response. Re-run this whenever system_prompt.py or
knowledge_base.md changes, and compare the new average against the last run
before considering a prompt change "done" (see plan Phase 3).

Usage:
    uvicorn main:app --port 8000 &   # backend must be running
    python eval/grader.py
"""

import json
import statistics
import sys
from datetime import datetime, timezone
from pathlib import Path

import anthropic
import httpx

BACKEND_URL = "http://localhost:8000/api/chat"
GRADER_MODEL = "claude-haiku-4-5"

DATASET_PATH = Path(__file__).parent / "dataset.json"
RESULTS_DIR = Path(__file__).parent / "results"

GRADER_SCHEMA = {
    "type": "object",
    "properties": {
        # Reasoning first, same lazy-default-score problem as any grader -
        # asking for it before the score stops the model defaulting to a
        # lazy middling number.
        "reasoning": {"type": "string"},
        "strengths": {"type": "string"},
        "weaknesses": {"type": "string"},
        "score": {"type": "integer"},
    },
    "required": ["reasoning", "strengths", "weaknesses", "score"],
    "additionalProperties": False,
}

GRADER_PROMPT = """You are grading a chat widget's response for a software engineer's portfolio site.

Question asked: {question}
Bot's answer: {answer}
Bot's source_excerpt: {source_excerpt}
Bot's in_scope flag: {in_scope}

Expected: {expect_in_scope_label}
{must_mention_line}

Grade this response on a 1-10 scale. A good response:
- Correctly identifies whether the question is in-scope (answerable from a resume/portfolio knowledge base) or out-of-scope
- If in-scope, gives an accurate, concise answer that mentions the expected facts
- If out-of-scope, declines gracefully without fabricating information
- Does not pad an honest "I don't know" with speculation

State your reasoning before assigning the score."""


def run_case(case: dict, client: httpx.Client) -> dict:
    resp = client.post(BACKEND_URL, json={"message": case["question"], "history": []}, timeout=30)
    resp.raise_for_status()
    return resp.json()


def grade_case(case: dict, result: dict, anthropic_client: anthropic.Anthropic) -> dict:
    must_mention_line = (
        f"Must mention: {', '.join(case['must_mention'])}" if case["must_mention"] else "No specific facts required."
    )
    prompt = GRADER_PROMPT.format(
        question=case["question"],
        answer=result["answer"],
        source_excerpt=result["source_excerpt"],
        in_scope=result["in_scope"],
        expect_in_scope_label="in-scope" if case["expect_in_scope"] else "out-of-scope",
        must_mention_line=must_mention_line,
    )
    response = anthropic_client.messages.create(
        model=GRADER_MODEL,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
        output_config={"format": {"type": "json_schema", "schema": GRADER_SCHEMA}},
    )
    text = next(b.text for b in response.content if b.type == "text")
    return json.loads(text)


def main() -> None:
    dataset = json.loads(DATASET_PATH.read_text())
    anthropic_client = anthropic.Anthropic()

    results = []
    with httpx.Client() as http_client:
        for case in dataset:
            print(f"Running: {case['id']}...", file=sys.stderr)
            try:
                result = run_case(case, http_client)
            except httpx.HTTPError as e:
                print(f"  FAILED to reach backend: {e}", file=sys.stderr)
                continue
            grade = grade_case(case, result, anthropic_client)
            results.append(
                {
                    "id": case["id"],
                    "question": case["question"],
                    "expected_in_scope": case["expect_in_scope"],
                    "actual_in_scope": result["in_scope"],
                    "answer": result["answer"],
                    "source_excerpt": result["source_excerpt"],
                    "score": grade["score"],
                    "reasoning": grade["reasoning"],
                    "strengths": grade["strengths"],
                    "weaknesses": grade["weaknesses"],
                }
            )

    scores = [r["score"] for r in results]
    average = statistics.mean(scores) if scores else 0

    print(f"\n{'=' * 60}")
    for r in results:
        match = "OK" if r["actual_in_scope"] == r["expected_in_scope"] else "SCOPE MISMATCH"
        print(f"[{r['score']}/10] {r['id']} ({match})")
        print(f"  Q: {r['question']}")
        print(f"  A: {r['answer']}")
        print(f"  {r['reasoning']}")
    print(f"{'=' * 60}")
    print(f"Average score: {average:.2f}/10 across {len(results)} cases")

    RESULTS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    output_path = RESULTS_DIR / f"eval-{timestamp}.json"
    output_path.write_text(json.dumps({"average": average, "results": results}, indent=2))
    print(f"Saved to {output_path}")


if __name__ == "__main__":
    main()
