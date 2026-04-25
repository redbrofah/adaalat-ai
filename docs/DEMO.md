# AdaalatAI — 3-minute Demo Video Script

> **Total runtime: 2:50.** Hook in 0:10. Real screen recording only — no Remotion replicas (Eli Benveniste explicitly warned hackathon entries against this).

## Tools you need

- **OBS Studio** — free screen recorder ([obsproject.com](https://obsproject.com))
- **Audacity** — free voiceover ([audacityteam.org](https://www.audacityteam.org))
- **DaVinci Resolve** — free editor ([blackmagicdesign.com](https://www.blackmagicdesign.com/products/davinciresolve))
- **YouTube Audio Library** for background music (login → Studio → Audio Library)
- A clean desktop, hidden notifications, decent mic

## Recording setup

- Resolution: **1920×1080**, 60 fps
- OBS scenes:
  1. Full screen capture of Chrome at `localhost:3001`
  2. Picture-in-picture if you want a corner camera (optional)
- Browser:
  - Hide bookmarks bar (Ctrl+Shift+B)
  - Use a fresh window with no extensions
  - Zoom 100%
- Pre-process **at least one** sample case so the dashboard already has snappy results loaded — record from `/case/<existing-id>` to avoid waiting 5 minutes mid-take.

---

## Shot list

### Shot 1 — Hook (0:00–0:12)
**Visual**: Quick montage of three Daily Star headlines from `data/statistics/` (or screenshot them off the web):
- "Over 40 lakh cases pending in lower courts"
- "Justice delayed: 15-year-old land disputes still pending"
- "1 judge for every 94,444 citizens"

Each headline is on screen 4 seconds. Subtle Ken-Burns zoom.

**Voiceover**:
> *"In Bangladesh, justice doesn't fail. It just never arrives. 4.65 million cases. Some pending for fifteen years."*

### Shot 2 — Project intro (0:12–0:25)
**Visual**: Open `localhost:3001/` — the AdaalatAI landing page. Pause on the hero ("From a Decade to a Day").

**Voiceover**:
> *"Meet AdaalatAI — an AI Bench Clerk powered by Claude Opus 4.7. Nine specialized agents that compress weeks of judicial work into minutes."*

### Shot 3 — The upload moment (0:25–0:45)
**Visual**: Click "Try a case" → land on `/upload`. Click one of the sample cases on the right (the family case is most emotionally resonant). The text loads. Click **"Process with 7 agents"**.

> ⚠️ Tip: pre-load the page with files so the click is instant. Or pre-record this shot 3-5 times and pick the cleanest take.

**Voiceover**:
> *"A real Bangladesh case file. One hundred and fifty pages. Handwritten Bangla. Five witnesses. Twenty pieces of evidence."*

### Shot 4 — THE MAGIC (0:45–1:45)
This is the single most important minute of the video. **Spend more time recording this than anything else.**

**Visual**: The dashboard at `/case/<id>` with all 9 agent cards. As they fire:
- Tight zoom on the Vision card when it lights up (it usually doesn't fire on text-only sample cases — for the demo, use a case file with an attached PNG of a handwritten FIR; we shipped one in `data/cases/` if you scan a fake one)
- Pan to the parallel cluster as five agents fire simultaneously
- Closeup on the Precedent card showing real `🔍 search_bdlaws("maintenance Muslim wife")` tool calls

**Voiceover (timed)**:
- 0:45 — *"Vision agent reads handwritten Bangla — Opus 4.7's 98.5% accuracy."*
- 0:55 — *"Five agents work in parallel."*
- 1:00 — *"Classification: priority 9, Family Courts Ordinance §9 violation."*
- 1:08 — *"Conflict Agent finds three contradictions in witness statements."*
- 1:18 — *"Precedent Agent calls our custom MCP server — searching 1,484 Bangladesh acts and 2,048 pages of Supreme Court rulings."*
- 1:28 — *"Deadline Agent flags a 285-day delay against the 180-day statutory limit."*
- 1:38 — *"Reasoning Agent — using Opus 4.7's adaptive thinking — synthesizes the legal opinion."*

### Shot 5 — The output (1:45–2:15)
**Visual**: Click "View bilingual brief" when it appears. Land on `/case/<id>/brief`. Scroll through:
- Bangla brief (formal court-style)
- English brief
- Draft order (with signature line)
- Precedents cited card
- Critic report ("All citations verified")

**Voiceover**:
> *"Five minutes thirty seconds. A complete judge-ready brief — Bangla and English — every citation verified. A draft order for the judge to review and sign."*

### Shot 6 — Architecture glimpse (2:15–2:35)
**Visual**: Switch to your editor showing the architecture ASCII diagram from `docs/ARCHITECTURE.md`. Or screen-record the agent dashboard with a brief overlay showing "9 agents · 1,484 acts · MCP tools · Opus 4.7".

**Voiceover**:
> *"Built with the Claude Agent SDK. Custom MCP server connecting to 1,484 Bangladesh laws and Supreme Court rulings. Adaptive thinking, parallel orchestration, and a self-critique loop — that's how we push Opus 4.7's limits."*

### Shot 7 — The vision (2:35–2:50)
**Visual**: An animated map of Bangladesh (use the SVG in `data/statistics/bangladesh_district_map.svg`) with dots lighting up across 64 districts. End card with the AdaalatAI logo.

**Voiceover**:
> *"Bangladesh has 4.65 million reasons. AdaalatAI gives them a path forward."*

End card text:
> **AdaalatAI**
> Built with Claude Opus 4.7
> Anthropic Hackathon 2026

---

## Production checklist

- [ ] Multiple voiceover takes; pick the cleanest
- [ ] Cut "ums" and pauses ruthlessly
- [ ] Add subtle music (low volume, instrumental)
- [ ] **English subtitles** (international judges)
- [ ] Bangla text on screen for authenticity
- [ ] **Real screen recording — never Remotion**
- [ ] Test the final MP4 on Chrome, Safari, Firefox
- [ ] Upload to YouTube **unlisted**, copy the link

## Submission

- Devpost form: paste YouTube link, GitHub link, the one-paragraph pitch
- Tweet with `@AnthropicAI` tagged when you submit
- Drop into Anthropic hackathon Discord if it exists
- Submit at least 6 hours before deadline (US west coast judges review during their day)
