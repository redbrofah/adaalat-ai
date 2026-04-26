# AdaalatAI — 2:30 Demo Video Script (Final)

> **The single most important deliverable.** Judges watch this; they may not read the README. Polish here matters more than features.

---

## Pre-production checklist (do before pressing Record)

### Hardware / software
- [ ] **OBS Studio** installed (https://obsproject.com)
- [ ] **DaVinci Resolve** installed for editing (https://www.blackmagicdesign.com/products/davinciresolve)
- [ ] **Audacity** for clean voiceover (https://www.audacityteam.org)
- [ ] Decent mic (phone earphone with mic works fine in a quiet room)
- [ ] 1080p screen, no scaling weirdness

### Browser prep
- [ ] Chrome **incognito window** (no extensions, no logged-in distractions)
- [ ] Hide bookmarks bar (`Ctrl+Shift+B`)
- [ ] Zoom at 100% (`Ctrl+0`)
- [ ] Close all other apps + notifications (Windows: Focus Assist on)
- [ ] Pre-open three tabs: `localhost:3000`, `localhost:3000/demo`, and a Notepad with the headline images

### Localhost prep
- [ ] `npm run dev` running (so localhost:3000 works)
- [ ] Pre-process **one** family case end-to-end so the dashboard has a fresh complete cascade visible (recommended: run `npm run test:case -- family_case_case_file` once, watch it complete, then close)
- [ ] Login as `judge@example.com` (any email works — sets the local state)

### B-roll assets to prepare (5 minutes of work)
1. **Title card 1** — black slide with white text:
   - Line 1: `4,650,000 pending cases`
   - Line 2: `1 judge per 94,444 citizens`
   - Line 3: `Some pending 15 years`
   - Make in Canva or PowerPoint, export as PNG
2. **Newspaper clipping** — screenshot of Daily Star headline "Over 40 lakh cases pending in lower courts" (URL: thedailystar.net/news/bangladesh/news/over-40-lakh-cases-pending-lower-courts-4153401)
3. **Architecture diagram** — screenshot the ASCII diagram from `README.md` (the one with 9 boxes), or take the diagram block as an image
4. **End card** — black slide with:
   - "AdaalatAI"
   - "Built with Claude Opus 4.7"
   - Small line: "From a Decade to a Day"
5. **Bangladesh map** (already in `data/statistics/bangladesh_district_map.svg`)
6. **Background music** — pick one slow instrumental from YouTube Audio Library (search "cinematic" or "documentary"), download as MP3, target -20dB volume

### OBS recording settings
- Output → Recording: **1920x1080**, **60fps**, **MP4 format**
- Sources: **Display Capture** (full screen), separate **Audio Input** (your mic)
- Save folder: somewhere with at least 2 GB free
- Test record 30 seconds, watch back, ensure audio + video sync

---

## The Script (2:30 total)

> **Format key:** Each shot lists the timestamp, the on-screen visual, the voiceover word-for-word, and a "why" note explaining the design choice.

### 🎬 SHOT 1 — Hook (0:00–0:08, 8 seconds)

**Visual**:
- Solid black screen → fade in three lines of text in sequence (3 seconds each, overlapping):
  - `4,650,000 pending cases`
  - `1 judge per 94,444 citizens`
  - `Some pending 15 years`
- White serif font (Playfair Display style), centered, fade transitions

**Voiceover** (deliberate, slow, almost grim):
> *"In Bangladesh, four point six five million court cases are pending. Some for fifteen years. There's one judge for every ninety-four thousand citizens."*

**Why this works**: Numbers stop the scroll. Three escalating stats establish stakes in 8 seconds. The deliberate pace signals "this matters" — opposite of typical hackathon energy.

---

### 🎬 SHOT 2 — Product reveal (0:08–0:20, 12 seconds)

**Visual**:
- Crossfade from black → screen recording of opening Chrome incognito → typing `localhost:3000` → AdaalatAI landing page loads
- Hold on the hero: "From a Decade to a Day."
- Subtle zoom into the hero text (Ken Burns effect, slow)

**Voiceover**:
> *"AdaalatAI is an AI bench clerk. Built with Claude Opus four point seven. It turns a 200-page Bangladesh court file into a judge-ready bilingual brief in five minutes."*

**Why this works**: The headline matches the voiceover beat-for-beat. "Built with Claude Opus 4.7" is the only branded mention; rest is product-focused. "Bilingual" and "five minutes" are the differentiators.

---

### 🎬 SHOT 3 — Upload moment (0:20–0:35, 15 seconds)

**Visual**:
1. Click "Try a case" button → goes to `/login`
2. Quickly type `judge@example.com` → click "Continue" → goes to `/upload`
3. Click on the **পারিবারিক মামলা** (family case) sample card on the right
4. The case text loads in the Bangla textarea — scroll briefly so judges see Bangla characters
5. Click big "Process with 7 agents" button

**Voiceover**:
> *"I'll upload a real Bangladeshi family law case. A wife seeking maintenance after her husband took a second wife. Three witness depositions in Bangla. The kind of file that takes a judge six hours to read."*

**Why this works**: The story is human (a wife, a husband, a second wife) — judges remember stories. Mentioning "six hours" sets up the time-saved punch later.

---

### 🎬 SHOT 4 ⭐ — THE MAGIC (0:35–1:35, 60 seconds, the most important minute)

> **Production note**: This is where you record the LIVE cascade. Press "Process with 7 agents" and start the OBS recording at the same moment. Then:
> - Capture 30 seconds of real-time footage (cards firing in cascade)
> - Then in DaVinci Resolve, **speed up the middle 90 seconds at 6x** so the visible 60-second segment ends with the brief ready
> - Or, do two takes and stitch: first take captures cascade visuals, second take captures completion moment

**Visual** (camera moves):
1. **0:35–0:42** — Wide shot of the dashboard: nine agent cards visible. Watch as Vision card fires first (purple gradient).
2. **0:42–0:50** — Zoom into the parallel cluster: Classification, Conflict, Precedent, Deadline, Reasoning all firing in cascade (1.5s stagger). Watch the "thinking" status messages rotate beneath each name ("Reading witness statements", "Searching the 1,484 acts", etc.)
3. **0:50–1:05** — Tight closeup on the **Precedent card**: tool calls scrolling beneath: `🔍 search_bdlaws("maintenance Muslim wife")`, `🔍 search_scob("dower mehr")`, `🔍 get_act_section("Family Courts Ordinance")`. THIS IS THE MCP SHOWCASE MOMENT.
4. **1:05–1:15** — Brief on the **Reasoning card** (emerald gradient, takes longest). Pan to the **cost counter** in the header: $0.045 → $0.18 → $0.41 → $1.05 ticking up.
5. **1:15–1:30** — Synthesis card fires (Opus 4.7 again). Then Critic card. All cards turn green.
6. **1:30–1:35** — Bottom of screen: the "Brief ready" green banner appears. Cost: ~$1.96. Time elapsed: ~5 minutes (or whatever the real time was; in the speed-up edit, it'll show the real number).

**Voiceover** (timed precisely, leave 1 second of breathing between lines):
- **0:35** *"Nine specialized agents take over."*
- **0:42** *"Vision reads handwritten Bangla at ninety-eight point five percent accuracy."*
- **0:50** *"Five agents now run in parallel."*
- **0:55** *"Conflict Detection finds three contradictions in the witness statements."*
- **1:00** *"The Precedent Agent calls our custom Model Context Protocol server."*
- **1:05** *"Searching one thousand four hundred eighty-four Bangladesh acts. Two thousand pages of Supreme Court rulings."*
- **1:14** *"Up to twelve tool calls per agent. Every citation tool-verified."*
- **1:20** *"The Reasoning agent uses Opus four point seven's adaptive thinking — output config effort high — for genuine constitutional analysis."*
- **1:28** *"The Synthesis agent composes the bilingual brief."*
- **1:32** *"And the Critic re-reads it. Every unverified citation gets flagged. No hallucinations."*

**Why this works**: This minute IS the hackathon submission. It demonstrates four Opus 4.7 capabilities (parallel agents, MCP tool chaining, adaptive thinking, instruction-following) in actual real-time motion. The cost counter ticking creates suspense — judges respect founders who show the bill.

---

### 🎬 SHOT 5 — The output (1:35–2:05, 30 seconds)

**Visual**:
1. **1:35–1:42** — Click "View bilingual brief" button. Browser navigates to `/case/<id>/brief`. The bilingual brief renders.
2. **1:42–1:52** — Scroll slowly through the **Bangla brief**: executive summary, statutory framework, conclusions. Hold for 1 sec on a section with citations like "মুসলিম পারিবারিক আইন অধ্যাদেশ, ১৯৬১ এর ধারা ৬"
3. **1:52–1:58** — Toggle the EN/BN language switch in the header. Watch the entire page flip to English instantly. Now scroll a section in English.
4. **1:58–2:05** — Scroll down to the Draft Order. Show the formal court-document styling, the signature line.

**Voiceover**:
- **1:35** *"Five minutes. One dollar ninety-six cents."*
- **1:42** *"A complete judge-ready brief. Bangla."*
- **1:48** *"And English."* (sync this with the language toggle click)
- **1:53** *"Every citation traceable to a real act or judgment."*
- **2:00** *"Plus a signature-ready draft order for the bench officer to review."*

**Why this works**: The toggle moment is a one-second magic trick: the entire UI flips language. Judges see the bilingual capability with their eyes. The cost reveal ($1.96) makes the value tangible.

---

### 🎬 SHOT 6 — Technical credibility (2:05–2:20, 15 seconds)

**Visual**:
- Cut to the **architecture diagram** screenshot (the 9-box ASCII from README, OR a clean rendered version you make in Excalidraw/Figma)
- Pan slowly across the diagram from left (input) to right (output)
- Optional: subtle box-by-box highlight as agents are mentioned

**Voiceover**:
- **2:05** *"Two custom Model Context Protocol servers. Nine agents orchestrated with a cascade-parallel pattern."*
- **2:12** *"Claude Sonnet four point six for cheap routine work. Opus four point seven for the depth that matters."*
- **2:18** *"Five times cheaper than running Opus on every step."*

**Why this works**: Shows engineering judgment — the founder thought about cost economics, not just capability. Judges appreciate this.

---

### 🎬 SHOT 7 — Closer (2:20–2:30, 10 seconds)

**Visual**:
1. **2:20–2:25** — The Bangladesh district map SVG (from `data/statistics/`). Animation: dots light up across all 64 districts, one after another, fast.
2. **2:25–2:30** — Cut to end card: black background, "AdaalatAI" centered in serif, below: "Built with Claude Opus 4.7", and at the bottom: small italic text "From a Decade to a Day"

**Voiceover** (slow, deliberate, with a Bangla beat at the end):
- **2:20** *"Bangladesh has four point six five million reasons."*
- **2:25** *"AdaalatAI gives them a path forward."*
- **2:28** *"এক দশক থেকে এক দিনে।"* (optional Bangla closer — "from a decade to a day" — only if you can deliver it crisply)

**Why this works**: The map animation visualizes scale. The Bangla closer is a quiet flex: it shows the founder is from this country, not building from a distance. Optional — only include if your delivery is clean.

---

## Total runtime: 2:30 exactly

| Shot | Duration | Cumulative |
|---|---|---|
| 1. Hook | 0:08 | 0:08 |
| 2. Product reveal | 0:12 | 0:20 |
| 3. Upload | 0:15 | 0:35 |
| 4. The Magic | 1:00 | 1:35 |
| 5. Output | 0:30 | 2:05 |
| 6. Architecture | 0:15 | 2:20 |
| 7. Closer | 0:10 | 2:30 |

---

## Recording technique (OBS step-by-step)

### One pass vs multi-pass
- **One pass** (fast, lower polish): record the whole demo in one take, voiceover live. Risk: any mistake means restart.
- **Multi-pass** (recommended): record SCREEN with no voice. Then record VOICEOVER separately in Audacity while watching the silent video. Sync in DaVinci. Higher quality.

### Multi-pass workflow
1. **Pass A — Screen only**:
   - Open OBS, start recording, then go through SHOTS 1–7 with all the clicks. Don't talk. Don't worry about timing perfectly; you'll trim in editing.
   - Aim for roughly 4–5 minutes of raw screen footage (you'll cut down to 2:30).
2. **Pass B — Voiceover**:
   - Open Audacity. Read the script in 7 takes (one per shot). Save as `shot1.wav` ... `shot7.wav`.
   - Re-record any line that has a stumble. Cut "ums" in Audacity (Ctrl+X).
3. **Editing in DaVinci Resolve**:
   - Drop screen footage on track V1, voiceover on track A1.
   - Cut screen footage to match voiceover beats.
   - For SHOT 4 (the Magic): right-click the agent-cascade clip → Speed → 6x. Or use jump cuts to skip waiting.
   - Add background music on track A2 at -20dB.
   - Add text overlays for the hook (use DaVinci Fusion or just title cards).
   - Export at 1080p, H.264, 12 Mbps bitrate.

### Backup plan if live processing fails during recording
- Use the **pre-bundled demo case** (`/demo` route → loads bundled brief instantly).
- Show the cascade animation by visiting `/case/acbe85cb-0d21-4e1c-b4f6-42c7ca82fe4c` directly — it'll redirect to the brief, BUT first capture the dashboard from a real run done earlier.
- Or: record once during a real run that worked, save that footage, reuse it.

---

## Post-production checklist

- [ ] Background music at quiet volume (-20dB to -25dB)
- [ ] **English subtitles** burned in (or as separate track) — international judges will need them
- [ ] **No em-dashes in subtitles** (you've already trained the model not to use them; do the same in subtitle text)
- [ ] Color grade: keep it cool/blue (matches court theme)
- [ ] Total length: exactly 2:30, max 2:50
- [ ] Export: MP4, H.264, 1080p, ≤200 MB
- [ ] Watch back at 0.5x speed — any frame look weird? Fix.
- [ ] Watch back at 2x speed — does the visual flow hold up? Cut anything that drags.
- [ ] Show to one non-technical friend — do they get it in the first 30 seconds?

---

## YouTube upload

1. Go to https://studio.youtube.com → "Create" → "Upload videos"
2. **Title**: `AdaalatAI — Built with Opus 4.7 Hackathon Demo`
3. **Description**:
   ```
   AdaalatAI is an AI bench clerk that turns a Bangladesh court file into a judge-ready bilingual brief in five minutes.

   Built with Claude Opus 4.7 for the Anthropic Built with 4.7 Hackathon.

   Live: https://adaalat-ai.vercel.app
   GitHub: https://github.com/redbrofah/adaalat-ai
   ```
4. **Visibility**: ⚠️ **Unlisted** — NOT Private (judges can't access Private), NOT Public (avoid stranger comments)
5. **Audience**: "No, it's not made for kids"
6. **Subtitles**: upload the English SRT file
7. Publish → Copy unlisted URL → paste in `SUBMISSION.md` and the Devpost form

---

## Common mistakes to avoid

| ❌ Mistake | ✅ Fix |
|---|---|
| Voiceover that explains the architecture for 90 seconds before showing the product | Show product within first 20 seconds |
| Trying to demonstrate every feature | Focus only on the one killer flow (upload → cascade → bilingual brief) |
| Using Remotion-style animated mockups instead of real screen recording | Real screen recording only — judges will notice and penalize |
| Recording with browser bookmarks bar visible | Hide it (Ctrl+Shift+B) |
| Voiceover too fast | Practice at 80% of natural speed; pause between sentences |
| Music drowning out voice | Music at -20dB |
| Forgetting to mention the bilingual capability | The EN/BN toggle moment in SHOT 5 must be visible |
| Forgetting to show MCP tool calls | The Precedent agent closeup in SHOT 4 is the MCP showcase |
| Forgetting to close with the social mission | The "4.65 million reasons" line is the emotional payoff |

---

## One final tip: the shot list above is a **target**, not a script you must read word-for-word. If during recording a line feels stilted in your voice, rewrite it in your own words. The MEANING of each beat matters more than the exact wording. The thing judges remember is:

- The numbers (4.65M, 5 min, $1.96)
- The cascade in motion
- The bilingual flip
- The closer line

Hit those four beats well and the rest is gravy.

🎬 **Press record. Make this win.**
