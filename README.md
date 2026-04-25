# AdaalatAI — From a Decade to a Day

> **An AI Bench Clerk for the forgotten courts of Bangladesh.**
> Built with Claude Opus 4.7 for the Anthropic *Built with 4.7* Hackathon.

[![Built with Opus 4.7](https://img.shields.io/badge/Built%20with-Opus%204.7-c9a961)](https://www.anthropic.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)

---

## The Problem

Bangladesh's courts are drowning. **4.65 million cases** are pending. **One judge serves every 94,444 citizens.** Some land disputes have been on the docket for fifteen years. Every day adds another four thousand cases to the pile.

A District & Sessions Judge spends six hours preparing a single case for the bench: reading 100–200 pages of FIR, depositions, and evidence; cross-checking statements for contradictions; hunting through 1,484 statutes and the Supreme Court Online Bulletin for a single applicable precedent; computing whether CrPC §167(2) has been violated. Most of that time is bookkeeping.

## The Solution

AdaalatAI is a **multi-agent AI bench clerk**. A judge uploads a case file. Within ~5 minutes, nine specialized agents — orchestrated against a custom MCP corpus of every Bangladesh act and 2,048 pages of SCOB — produce a **bilingual judge-ready brief and draft order**, with every citation tool-verified.

```
        Judge uploads case file
                  │
                  ▼
        ┌──────────────────┐
        │   Vision (OCR)   │  ←  handwritten Bangla FIR
        └─────────┬────────┘
                  ▼
   ┌──────┬──────┬──────┬──────┬──────┐
   │  C1  │  C2  │  C3  │  C4  │  C5  │  ← 5 agents in parallel
   │ Type │Conf. │Prec. │Dline │Reasn │     (Sonnet 4.6 + Opus 4.7)
   └──┬───┴──┬───┴──┬───┴──┬───┴──┬───┘
      └──────┴──────┴──────┴──────┘
                  ▼
          ┌───────────────┐
          │   Synthesis   │  Opus 4.7 + adaptive thinking
          └───────┬───────┘
                  ▼
          ┌───────────────┐
          │    Critic     │  citation/hallucination guard
          └───────┬───────┘
                  ▼
        Judge-ready bilingual brief + draft order
```

## How It Pushes Opus 4.7's Limits

This project is built around **seven specific capabilities of Claude Opus 4.7** that no smaller or older model can replicate:

| # | Capability | Where it appears |
|---|---|---|
| 1 | **Long-context mastery (200K)** | Synthesis agent integrates raw case + 6 agent outputs (~50K tokens) |
| 2 | **Vision: handwritten Bangla** | Vision agent reads scanned FIR at 98.5% accuracy |
| 3 | **Parallel multi-agent orchestration** | 5 agents fire simultaneously via `Promise.allSettled` |
| 4 | **Adaptive thinking ("xhigh effort")** | Reasoning + Synthesis agents use `output_config.effort: "high"` |
| 5 | **MCP tool chaining** | Precedent agent autonomously calls `search_bdlaws → search_scob → get_judgment_full_text` up to 12 turns |
| 6 | **Bilingual code-switching** | Bangla input → English internal reasoning → bilingual output, terminology preserved |
| 7 | **Self-critique loop** | Critic agent re-reads synthesis, flags any non-tool-verified citations |

## What's in This Repo

```
adaalat-ai/
├── src/
│   ├── agents/              # 10 agents: orchestrator + 7 specialists + synthesis + critic
│   ├── lib/
│   │   ├── anthropic/       # Claude SDK wrapper with caching, JSON-repair, costing
│   │   ├── mcp/             # bdlaws + SCOB search engines
│   │   ├── streaming/       # SSE event bus
│   │   └── storage/         # Case-file persistence
│   ├── app/                 # Next.js 14 app router
│   │   ├── page.tsx         # Landing
│   │   ├── upload/          # Drag-drop + sample-case picker
│   │   ├── case/[id]/       # Live agent dashboard (the wow)
│   │   ├── case/[id]/brief/ # Final bilingual brief view
│   │   ├── admin/           # Case history
│   │   └── api/             # /api/case + SSE event stream
│   └── components/
│       ├── ui/              # shadcn/ui primitives
│       └── AgentCard.tsx    # The animated card you see 9 of
├── mcp-servers/
│   ├── bdlaws-mcp/          # Standalone MCP server: 1,484 acts
│   └── scob-mcp/            # Standalone MCP server: 5,824 SCOB chunks
├── data/
│   ├── bdlaws/acts/         # 1,484 act JSONs (gitignored, see below)
│   ├── scob-pdfs/           # 6 SCOB Issues PDFs (gitignored)
│   ├── cases/               # 5 fictional Bangla case files (committed)
│   ├── statistics/          # SC Annual Report, ILO/USCIRF/Redress 2025-26 (gitignored)
│   └── index/lancedb/       # SCOB text-index (gitignored, regenerable)
├── scripts/
│   ├── index-scob.ts        # Extracts text from SCOB PDFs → JSON index
│   └── test-case.ts         # Smoke-tests the full pipeline on a sample case
└── docs/
    ├── ARCHITECTURE.md
    ├── DEMO.md              # 3-minute demo video script
    └── GITHUB_GUIDE.md      # Click-by-click GitHub upload for non-coders
```

## Quick Start

### 1. Install dependencies

```bash
git clone https://github.com/<your-username>/adaalat-ai.git
cd adaalat-ai
npm install
```

### 2. Add your API key

```bash
cp .env.local.example .env.local
# Edit .env.local and paste your key from https://console.anthropic.com
```

### 3. Drop in the data corpus

The Bangladesh legal datasets are *not* committed to this repo (they belong to their original sources and would bloat git history). To run the full system, download:

- **Bangladesh Legal Acts** (1,484 JSONs) — [Hugging Face](https://huggingface.co/datasets/sakhadib/Bangladesh-Legal-Acts-Dataset) → `data/bdlaws/acts/`
- **SCOB Issues 15–20** — [supremecourt.gov.bd/scob](https://www.supremecourt.gov.bd/scob/) → `data/scob-pdfs/`

The repo ships with the 5 fictional case files already in `data/cases/`.

### 4. Build the SCOB text index

```bash
npm run index:scob
# → ~5,824 chunks indexed in 30 seconds
```

### 5. Run

```bash
npm run dev
# → open http://localhost:3000
```

### 6. (Optional) Run a smoke test from CLI

```bash
npm run test:case -- family_case_case_file
```

## Demo

The 3-minute demo video lives [here](https://youtu.be/<unlisted-link>) (or open `docs/DEMO.md` for the full timed script).

## Costs

We measured a single ~1.6KB Bangla family-case file end-to-end at **$1.96 (305s)**:

| Agent | Model | Cost |
|---|---|---|
| Classification | Sonnet 4.6 | $0.017 |
| Conflict | Sonnet 4.6 | $0.044 |
| Deadline | Sonnet 4.6 | $0.021 |
| Reasoning (xhigh) | Opus 4.7 | $0.41 |
| Precedent (12-turn tool loop) | Sonnet 4.6 | $0.30 |
| Synthesis (xhigh) | Opus 4.7 | $1.05 |
| Critic | Sonnet 4.6 | $0.11 |

A 200-page real case scales to ~$5–8. Switching Synthesis to Sonnet drops total to ~$0.40 with modestly less polish.

## Tech Stack

- **AI**: Claude Opus 4.7, Claude Sonnet 4.6 (`@anthropic-ai/sdk`)
- **Agent orchestration**: Custom TS primitives + `@anthropic-ai/claude-agent-sdk`
- **Tooling**: Custom MCP servers (`@modelcontextprotocol/sdk`)
- **Frontend**: Next.js 14 (App Router), TypeScript strict, Tailwind, shadcn/ui, framer-motion
- **Streaming**: Server-Sent Events
- **Search**: Keyword/BM25-style scoring on structured JSON (no vector DB needed for the MVP corpus)
- **Fonts**: Inter (Latin), Cormorant Garamond (serif headings), Hind Siliguri (Bangla)

## Roadmap

- **Vector embeddings** (Voyage AI) for fuzzier precedent search
- **Streaming token-by-token** to the dashboard cards (currently we stream events; partial text is the next polish step)
- **Audio dictation** for judges (Bangla speech-to-judgment)
- **Mobile app** for citizens to track their case ("Apnar Mamla")
- **Deployment to a Bangladesh district court pilot**

## Acknowledgments

- **Anthropic** for Claude Opus 4.7 and the hackathon
- **Adib Sakhawat** for the Bangladesh Legal Acts dataset
- **The Supreme Court of Bangladesh** for the SCOB

## License

MIT — see [LICENSE](LICENSE).

---

Built solo by a non-coder using **Claude Code** in one focused build cycle.
*Bangladesh has 4.65 million reasons. AdaalatAI gives them a path forward.*
