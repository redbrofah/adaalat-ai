# Hackathon Submission — Copy-Paste Ready

> Anthropic *Built with 4.7* Hackathon submission for AdaalatAI.
> Open this file when filling the submission form. Each section is the exact text to paste into the corresponding field.

---

## 1. Project name
```
AdaalatAI
```

---

## 2. Selected Hackathon Problem Statement
**Choose: "Build for what you know"**

Reasoning: Bangladesh's judicial backlog is a problem the founder lives with as a citizen. The "Build for what's next" track is much more crowded — domain expertise is the unfair advantage here.

---

## 3. Project description (paragraph)

```
AdaalatAI is an AI bench clerk that turns a 200-page Bangladesh court file into a judge-ready bilingual brief and a draft order in five minutes. Bangladesh has 4.65 million pending cases and one judge for every 94,444 citizens. A judge spends four to six hours preparing each case for the bench: reading the FIR, witness depositions, and evidence; cross-checking statements for contradictions; searching 1,484 statutes and the Supreme Court Online Bulletin for relevant precedent; computing whether a procedural deadline like CrPC §167(2) has been violated.

AdaalatAI compresses this work to minutes. A custom orchestrator runs nine specialised Claude Opus 4.7 agents (Vision, Classification, Conflict Detection, Precedent Search via MCP, Deadline, Reasoning with adaptive thinking, Translation, Synthesis, Critic) over a custom MCP corpus of every Bangladesh act and 2,048 pages of SCOB. The output is a bilingual brief in formal Bangla and English plus a signature-ready draft order, with every citation tool-verified by an adversarial Critic agent.

The same brief is useful to lawyers preparing arguments and to plaintiffs and defendants who simply need to understand what is happening in their own case.
```

---

## 4. Public GitHub Repository
```
https://github.com/redbrofah/adaalat-ai
```

---

## 5. Demo Video
> Replace with the YouTube unlisted URL after recording.
```
https://youtu.be/REPLACE_AFTER_UPLOAD
```

Live demo (no login required):
```
https://adaalat-ai.vercel.app
```

Click "View demo" on the homepage to see a pre-processed family case brief, no API spend.

---

## 6. Thoughts and feedback on building with Opus 4.7 (paragraph)

```
Opus 4.7 made three things possible that smaller models would have struggled with. First, the parallel agentic efficiency was real — five specialist agents running concurrently completed work that would have taken sequential calls four times longer. Second, adaptive thinking with output_config.effort: "high" gave the Reasoning and Synthesis agents the depth needed for genuine constitutional analysis, not just retrieval. Third, the bilingual handling — Bangla input, English internal reasoning, bilingual output with legal terminology preserved — was effortless. The 12-turn MCP tool loop on the Precedent agent ran without losing thread. The biggest pain was JSON output truncation on long bilingual briefs; I wrote a small JSON repair fallback and also added a style guard that strips em-dashes from generated text. Net: this product would not be viable on any model below 4.7.
```

---

## 7. Did you use Claude managed agents? If so, how?

```
Yes, but lightly. The orchestration layer is custom TypeScript over the official @anthropic-ai/sdk because we needed per-agent control over model choice (Sonnet 4.6 for cheap routine work; Opus 4.7 only for Reasoning and Synthesis), per-agent thinking budgets, prompt caching, and a parallel cascade pattern with 1.5s stagger. We use the @anthropic-ai/claude-agent-sdk package indirectly for SDK type primitives. The MCP tooling layer is fully custom — two standalone @modelcontextprotocol/sdk servers (bdlaws-mcp, scob-mcp) wrapping a keyword scorer over 1,484 Bangladesh acts and 5,824 SCOB chunks.
```

---

## Pre-submit checklist

- [ ] **Vercel Authentication disabled** so judges can access without login
  - Vercel project → Settings → Deployment Protection → "No Protection" or disable Vercel Authentication
- [ ] **Demo video recorded** locally on `localhost:3000` (Vercel free tier times out at 60s; localhost has no limit)
- [ ] **Video uploaded to YouTube as Unlisted** (not Private)
- [ ] **API key revoked and replaced** at https://console.anthropic.com (the dev key was visible in chat history)
- [ ] **GitHub repo public**, README renders, no `.env.local` visible in file tree
- [ ] **Live URL** loads in incognito at https://adaalat-ai.vercel.app

---

## What works on the live URL (for judges to click around)

- Landing page with bilingual EN/BN toggle
- "View demo" → loads a pre-processed family case brief instantly
- Login flow (any email accepted; sets localStorage)
- Past cases (admin) shows bundled demo case
- Brief view in both Bangla and English
- All read-only flows

## What does NOT work on the live URL

- Uploading a NEW case to be processed live — Vercel free tier has a 60s function timeout; full processing takes ~5 minutes. The demo video shows live processing because it was recorded on `localhost:3000` where there is no timeout.

This is a known limitation of Vercel Hobby plan; production deployment to a court would use Vercel Pro (300s) or self-hosted Node with no timeout.
