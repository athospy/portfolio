# Chat with my resume

A small backend that lets visitors ask questions about my background and get answers grounded in what's actually on this site, not a general-purpose LLM guessing. This README explains the technique choices, not just how to run it — a "here's the run command" README doesn't show the reasoning, and the reasoning is the point.

## Why Claude Haiku 4.5, not a bigger model

The task is grounded lookup Q&A over a few KB of text: "does he have Django experience?", "what AI projects has he built?". That's not a task that benefits from a frontier model's reasoning depth — it benefits from strict instruction-following ("only answer from what's given, decline honestly otherwise") and low latency, since this is a chat widget where a slow response reads worse than no widget at all.

Cost math at Haiku 4.5 pricing ($1/MTok input, $5/MTok output): a ~2,300-token system prompt plus a short question costs roughly $0.002 in input, and the 400-token output cap costs roughly $0.002 in output. **About $0.004 per question.** Even 5,000 questions in a month, which would be a lot of traffic for a personal portfolio, lands around $20. The rate limits in this repo (10 req/min and 60 req/day per IP, 300 req/day globally) exist as an abuse backstop, not because the expected cost from real visitors is scary.

## Why no vector search

A resume plus site bio plus project list is a few KB of text, small enough to stuff the entire knowledge base into the system prompt on every call instead of building a retrieval index. Skipping RAG here isn't a shortcut, it's the correct call for this corpus size: no infrastructure to keep in sync between an index and the source text, no chunking-strategy decisions, and no retrieval-miss failure mode where the right fact exists but the wrong chunk got retrieved. RAG is absolutely the right tool for a much bigger, growing corpus (a blog archive, a book list); it's overkill for a document this small. The line I'd revisit this at is roughly 30-50K tokens of source text.

## Caching mechanics, and whether it actually activated

`cache_control: {"type": "ephemeral"}` on the system block is a real mechanism, but it only helps above a **minimum cacheable prompt size, which is model-specific** — 4,096 tokens for Haiku 4.5, the highest minimum in the current model lineup (Opus/Sonnet need 1,024; Fable 5 needs 512). I measured this knowledge base's rendered system prompt with the `count_tokens` endpoint before assuming caching would kick in: **2,329 tokens.** Under the threshold. `usage.cache_creation_input_tokens` and `usage.cache_read_input_tokens` both come back `0` on every call.

I deliberately didn't pad the knowledge base with filler to clear 4,096 tokens — that would hurt answer quality (more irrelevant text for the model to sift, a worse-maintained source doc) to chase a cost optimization that's marginal at this scale anyway. The `cache_control` markers are still in the code, correctly placed (explicit breakpoint on the static system prompt, top-level auto-caching for growing per-visitor conversation history), so caching activates for free the moment the knowledge base naturally grows past the threshold. Verifying this empirically instead of assuming it worked is itself the point: a lot of code "adds caching" by copy-pasting `cache_control` and never checking whether it did anything.

## Structured outputs instead of full Citations

Grounding claims like "answer only from the content below" are a request, not a guarantee. Two ways to make that guarantee stronger exist on the Claude API. **Citations** (`citations: {"enabled": true}` on a document content block) is the most rigorous: the response carries verified pointers into the exact source text. It requires moving the knowledge base out of the system prompt into a `document`-type content block on the user turn, which reshapes the caching story and adds real implementation complexity.

This project uses the lighter option instead: `output_config.format` forces a JSON shape — `{reasoning, in_scope, source_excerpt, answer}` — instead of free text.

- `in_scope` is a hard boolean the backend can log and the widget can style differently, instead of parsing prose to guess whether the bot declined.
- `source_excerpt` is the model's best-effort quote backing the answer (or `null` for a decline), rendered in the widget as a small "from his background:" footnote. Not cryptographically verified like true Citations, but most of the trust-building value without the prompt-shape rework.
- `reasoning` is declared **first** in the schema, deliberately. Claude fills JSON fields in order, so forcing it to state what it's basing the answer on before writing the answer works as a lightweight chain-of-thought: it can't produce a `source_excerpt` and `answer` without having already committed, in `reasoning`, to whether the question is actually answerable. `reasoning` is logged server-side for debugging and never sent to the widget.

Full Citations stays a documented, deliberate stretch beyond v1 — worth revisiting if the eval scores show `source_excerpt` starting to paraphrase instead of quote.

## Eval pipeline

`eval/dataset.json` has 10 cases mixing real in-scope questions (Django experience, AI projects, current role, education, years of experience) with out-of-scope and adversarial ones (a language not in the stack, a salary question, "did he work at Google," a fabricated project name, an opinion-about-a-former-manager question).

`eval/grader.py` runs each case through the live backend, then sends the question/answer/expected outcome to a second Haiku call that grades strengths, weaknesses, and a 1-10 score — asking for the reasoning *before* the score, for the same reason the main schema puts `reasoning` first: it stops the grader from defaulting to a lazy middling number.

Current result: **8.20/10 average.** One case is worth calling out rather than hiding: "Did he work at Google?" was answered `in_scope: true` with a confident, grounded "no" (Google genuinely isn't in the knowledge base's employer list), and the grader scored it a 2/10 for a scope violation. That's a real edge case in how "in scope" is defined for negative-existence questions, not an obviously wrong answer, and it's left as a known limitation rather than patched reflexively.

Re-run the eval whenever `system_prompt.py` or `knowledge_base.md` changes, and compare the new average to the last one before calling a prompt change "done":

```bash
uvicorn main:app --port 8000 &
python eval/grader.py
```

## Running locally

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in a real ANTHROPIC_API_KEY, never commit .env
uvicorn main:app --reload --port 8000
```

The static site expects this at `http://localhost:8000/api/chat` in dev and `https://santiagomorel.dev/api/chat` in production (see `js/chat-widget.js`).
