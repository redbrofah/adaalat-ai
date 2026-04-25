# GitHub Upload Guide for AdaalatAI

> **Audience**: a non-coder. Every step is click-by-click. If anything is unclear, paste the screenshot back to Claude Code and ask.

## Why we upload to GitHub

The hackathon submission requires a public GitHub repository link. Judges click that link to see your code, your README, and to verify you actually built what your demo shows.

## Before you start

- ✅ The project must build cleanly: run `npm run build` once and confirm "Compiled successfully"
- ✅ The `.env.local` file is in `.gitignore` (already done) so your API key won't be uploaded
- ✅ The big data folders are in `.gitignore` so the repo stays small

---

## Step 1 — Create a GitHub account (if you don't have one)

1. Go to https://github.com/
2. Click **"Sign up"** in the top right
3. Use your email `reduankhan108@gmail.com`
4. Pick a username (e.g., `reduankhan` or `aderp`). Whatever you pick, write it down — you'll need it.
5. Verify your email when GitHub asks

---

## Step 2 — Install GitHub Desktop (the easy way, no command line)

1. Go to https://desktop.github.com/
2. Click **"Download for Windows"**
3. Run the installer; sign in with the account you just made

---

## Step 3 — Add your project to GitHub Desktop

1. Open **GitHub Desktop**
2. Top-left menu: **File → Add local repository…**
3. Click **"Choose…"** and select the folder `E:\Claude Hack\adaalat-ai`
4. GitHub Desktop will say *"This directory does not appear to be a Git repository. Would you like to **create a repository** here instead?"* — click that link.
5. In the dialog:
   - **Name**: `adaalat-ai`
   - **Description**: `From a Decade to a Day — AI Bench Clerk for Bangladesh courts. Built with Claude Opus 4.7 for the Anthropic hackathon.`
   - **Local path**: leave as is
   - **Initialize this repository with a README**: ⛔ leave UNCHECKED (we already have one)
   - **Git ignore**: leave as None (we have one)
   - **License**: pick **MIT**
6. Click **"Create Repository"**

---

## Step 4 — Verify the API key is NOT being uploaded

This is critical. Your `.env.local` has a real Anthropic API key — uploading it would let anyone spend your credits.

In GitHub Desktop's left panel ("Changes"):
- ✅ You should see things like `README.md`, `package.json`, `src/...`
- ❌ You should **NOT** see `.env.local`. If you see it, **stop and ask Claude Code to fix the gitignore.**

---

## Step 5 — Make the first commit

1. At the bottom of the left panel:
   - **Summary**: `Initial commit: AdaalatAI — Bangladesh judicial multi-agent system`
   - **Description** (optional): `Built solo with Claude Code for the Anthropic Built with 4.7 Hackathon.`
2. Click **"Commit to main"**

---

## Step 6 — Publish to GitHub

1. Top of GitHub Desktop, click **"Publish repository"**
2. Settings:
   - **Name**: `adaalat-ai`
   - **Description**: same as before
   - **Keep this code private**: ⛔ **UNCHECK this box** — the hackathon needs it public.
3. Click **"Publish Repository"**

GitHub Desktop uploads everything. After a few seconds, your repo is live at:

```
https://github.com/<your-username>/adaalat-ai
```

---

## Step 7 — Final check

Open your repo URL in a browser:

- ✅ The README is visible on the main page with the AdaalatAI title and the architecture diagram
- ✅ The `src/` folder is browsable
- ✅ There is **no** `.env.local` file anywhere (Ctrl+F in the file list)
- ✅ The `data/` folder shows only `cases/` and `templates/` (the bulky datasets are excluded)

If the API key is accidentally visible:
1. **Immediately** go to https://console.anthropic.com → Settings → API Keys → revoke that key
2. Create a new one
3. Update your local `.env.local` with the new key
4. Ask Claude Code to help you remove it from git history

---

## Step 8 — One more time, for the API key sanity check

Even if `.env.local` is gitignored, **the chat history with Claude Code contains your API key in plaintext**. After the hackathon is over:

1. Go to https://console.anthropic.com → Settings → API Keys
2. Find the `AdaalatAI-hackathon` key
3. Click **"Revoke"**
4. Create a new key for whatever comes next

---

## Step 9 — Submit on Devpost

1. Go to the hackathon's Devpost page
2. Click **"Submit your project"**
3. Fields:
   - **Project name**: AdaalatAI
   - **Tagline**: From a Decade to a Day — AI Bench Clerk for the forgotten courts of Bangladesh
   - **Built with**: Claude Opus 4.7, Claude Agent SDK, MCP, Next.js, TypeScript, Tailwind, shadcn/ui
   - **Link to GitHub**: your repo URL
   - **Demo video**: your YouTube unlisted link
   - **Description**: paste the README's "The Problem" + "The Solution" sections
4. Submit at least 6 hours before the deadline

You're done. 🎉

---

## Common problems

| Problem | Fix |
|---|---|
| GitHub Desktop says "no repository" | Make sure the path is `E:\Claude Hack\adaalat-ai`, not `E:\Claude Hack` |
| `.env.local` shows up in changes | Open `.gitignore`, confirm `.env*.local` is in there. If not, add it and re-stage. |
| The push is taking forever | Confirm `data/bdlaws/acts` and `data/scob-pdfs` are gitignored. If not, the 100MB+ data is being uploaded. |
| Can't find your repo URL | GitHub Desktop → top right → **"View on GitHub"** opens it |

If you get stuck at any step, take a screenshot, paste it into Claude Code, and ask — every step here is recoverable.
