# ScopePing 1.1 — Scope comparison + Vercel-ready MVP

ScopePing helps freelance web developers and designers compare a client request against the original agreed scope, estimate the likely change impact, and prepare a clear reply before extra work begins.

## What works in this version

- Original scope baseline: project, client, project value, hourly rate, revision allowance and included deliverables.
- Scope comparison: compare the baseline scope with the client's request using a server-side OpenAI Responses API call when configured.
- Transparent local fallback: if the server is unavailable or no API key is configured, a simple keyword-based check runs and is labelled **LOCAL CHECK**. It is not represented as AI.
- Findings: likely-covered items, possible extras, clarifying questions, confidence-sensitive wording and a cautious starting estimate.
- Editable quote: review the estimate and apply suggested hours/days; the add-on fee is recalculated from the user's hourly rate and rounded to the nearest ₹100.
- Reply builder: the generated message changes based on the latest scope result (covered, likely extra, mixed or unclear).
- Request log: search, status updates, copy replies, delete saved records, and JSON export.
- Local persistence: data stays in the current browser's localStorage; there is no user account or cloud sync.

## Quick start (offline/local fallback)

Open `index.html` in a modern browser. You can test project setup, local comparison, estimates, message generation and request history without an API key. Since a `file://` page cannot reach the Vercel API route, it uses the clearly labelled local comparison mode.

## Run the full app locally

1. Install Node.js 20 or newer.
2. From this folder, run `npm install`.
3. Run `npm run dev` and open the local URL shown by Vercel CLI.
4. To enable AI locally, set `OPENAI_API_KEY` in your local environment before starting the dev server. Keep it private and never paste it into browser JavaScript.

If the CLI requests that you log in or link a Vercel project, follow its instructions. You can still inspect the static app without doing this; local fallback works independently.

## Deploy to Vercel

1. Create a new GitHub repository and upload the **contents** of this folder (not the parent folder containing other product files).
2. Import the repository in Vercel.
3. Use the default static build settings. No build command is required; the site files sit at the repository root.
4. In **Project Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` — your private OpenAI API key (server-side only)
   - `OPENAI_MODEL` — optional; defaults to `gpt-4.1-mini`
5. Add the variables to the Production, Preview and Development environments you intend to use, then redeploy.
6. Test the request-comparison button. An `AI ANALYSIS` label means the server API succeeded; a `LOCAL CHECK` label means fallback logic was used.

The AI endpoint lives at `api/analyze.js`. Vercel's Node.js function runtime serves it as `/api/analyze`. The API key is read from `process.env` only and is never returned to the browser.

## API and cost notes

- AI comparison requires an OpenAI API account/key with API access and billing configured for your account. ChatGPT subscriptions and API usage are separate products and access/billing should be checked in your OpenAI Platform account.
- The fallback mode works with no API key, but only uses simple matching rules. It cannot understand nuanced clauses, implied terms, attachments or the full context of a commercial agreement.
- Request text and the scope you submit are sent to the configured AI provider when AI mode is enabled. Do not submit sensitive client information unless you are permitted to do so.
- No provider rate limit, sign-in, team sync, database, usage quota or abuse protection has been added. Add these before making a public, high-traffic production service.
- Browser data is device-specific and can be lost when browser storage is cleared. Export data regularly.

## Important limitations

- This tool is not legal, tax or accounting advice. It does not decide what a contract legally includes.
- Time estimates are planning suggestions only. Validate the deliverables, assumptions, fee, payment terms and revised deadline yourself.
- INR is the current display currency.
- Client messages are drafts. ScopePing never sends messages automatically.
- Authentication, multi-device storage, shareable client approvals, billing, rate limiting and a usage/paywall system are not implemented in this MVP.

## Project files

- `index.html`, `styles.css`, `app.js` — frontend
- `api/analyze.js` — optional server-side AI endpoint
- `vercel.json` — Vercel hosting config
- `.env.example` — environment variable names only, no secret
- `docs/DEPLOYMENT_AND_SECURITY.md` — launch checklist
