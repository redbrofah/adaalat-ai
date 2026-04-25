# AdaalatAI — Architecture

## High-level data flow

```
                          User browser
                              │
        Next.js App Router    │   SSE: /api/case/[id]/events
                              │
              ┌───────────────┴────────────────┐
              ▼                                ▼
   POST /api/case  ───►  spawn  ───►  runOrchestrator(input)
                                              │
                                              │ publish() → in-process event bus
                                              │ writes case.json + per-agent JSON
                                              ▼
                            ┌─────────────────────────────┐
                            │      Orchestrator           │
                            └────┬───────┬───────┬────────┘
                                 │       │       │
   step 1 (sequential):  Vision agent   │       │
   step 2 (parallel):    [Classification, Conflict, Precedent, Deadline, Reasoning]
   step 3 (sequential):  Synthesis (consumes all 6 outputs)
   step 4 (sequential):  Critic (consumes synthesis)
                                                          ▼
                                                   final SynthesisOutput
                                                   stored to disk
```

## Why this shape

- **Vision must be sequential** — its output (extracted text) becomes input for the parallel batch.
- **The parallel five are independent** — they each take the full case text, so we run them concurrently with `Promise.allSettled` and tolerate individual failures.
- **Synthesis must be sequential** — it composes everyone's output.
- **Critic is optional** — it re-reads synthesis and flags issues without re-running the model.

## Agent contract

Every agent implements the `AgentDefinition<TOutput>` interface:

```ts
{
  id, displayName, systemPrompt,
  model: "opus" | "sonnet" | "haiku",
  thinkingBudget?, cacheSystem?,
  buildUserMessage: (ctx) => string | MessageParam[],
  tools?, toolHandlers?
}
```

`runAgent(def, ctx)` then handles:
- Publishing `running` / `done` / `error` events to the in-process event bus
- Calling Claude with the right model + thinking config (Opus 4.7 uses `output_config.effort: "high"`; Sonnet 4.6 uses `thinking.budget_tokens`)
- Parsing JSON output with the repair fallback (truncations get auto-closed)
- Tracking token usage and cost
- Persisting the agent's structured output to disk for later replay

## MCP design

The Precedent agent is the only one that needs tools. It's given four:

| Tool | Backed by | Purpose |
|---|---|---|
| `search_bdlaws(query, year_min?, year_max?, limit?)` | `src/lib/mcp/bdlaws.ts` | Keyword scoring across 1,484 act JSONs |
| `get_act_section(actName, sectionQuery)` | same | Fetch a specific act's sections |
| `search_scob(query, case_type?, limit?)` | `src/lib/mcp/scob.ts` | Keyword scoring across 5,824 SCOB chunks |
| `get_judgment_full_text(citation)` | same | Fetch the chunks containing a citation |

These same functions are also exposed as **standalone MCP servers** in `mcp-servers/bdlaws-mcp/` and `mcp-servers/scob-mcp/` so they can be plugged into Claude Desktop or any other MCP client.

The agent loop is up to **12 turns**, which is generous — for a typical family case the precedent agent issues 6–10 tool calls before assembling the final JSON.

## Streaming

We use **Server-Sent Events** (no WebSockets needed for one-way streaming). The dashboard `EventSource` listens to `/api/case/[id]/events`. The route subscribes to the in-process event bus and replays history first, then streams live events. A 15s heartbeat keeps proxies happy.

## Why no vector DB

We started with the assumption that 1,484 acts + 2,000 pages of SCOB needed embeddings. But:

1. The acts JSON dataset is *already* per-section-structured with English titles. A keyword score weighted toward title matches recovers the right act >90% of the time on test cases.
2. SCOB is dense academic English. A simple BM25-flavored score works well for the precedent agent because the agent issues many specific queries, not one fuzzy one.
3. Embedding adds an Anthropic-external API dependency (Voyage / OpenAI) that the user explicitly wanted to avoid.

A vector layer remains as a roadmap item; the search functions in `src/lib/mcp/` are designed so swapping the scorer is local.

## Cost control

- System prompts are cache-controlled via `cache_control: { type: "ephemeral" }` so the second case in a batch hits the cache.
- Sonnet 4.6 is used for all non-creative agents; Opus 4.7 only for Reasoning + Synthesis (where the depth pays off).
- Critic uses Sonnet 4.6.
- The orchestrator computes a per-agent and total cost using the table in `src/lib/anthropic/client.ts` and emits it as a final event.

## Persistence

Every case is written to `data/uploads/<caseId>/` as:
```
data/uploads/<caseId>/
├── case.json                # original CaseFile
├── classification.json
├── conflict.json
├── precedent.json
├── deadline.json
├── reasoning.json
├── vision.json (if applicable)
├── synthesis.json
└── critic.json
```

This means `/case/[id]/brief` can be reloaded any time after processing, and `/admin` can list all past cases.

## Production considerations (post-hackathon)

- Replace in-process event bus with Redis pub/sub for horizontal scaling.
- Replace filesystem persistence with Postgres + S3.
- Add per-tenant API keys, audit logs, and signed-order PDFs.
- Add a "human-in-the-loop" gate so a judge must explicitly accept each section before the order is signed.
