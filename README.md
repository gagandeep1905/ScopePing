# ScopePing 1.2 — Gemini-powered scope comparison

ScopePing helps freelance web developers and designers compare a client request against the original agreed scope, estimate the likely change impact, and prepare a clear reply before extra work begins.

## What works in this version

- Original scope baseline: project, client, project value, hourly rate, revision allowance and included deliverables.
- Scope comparison: compare the baseline scope with a client request using the server-side Google Gemini API when configured.
- Transparent local fallback: if the server is unavailable or no Gemini key is configured, a simple keyword-based check runs and is labelled **LOCAL CHECK**. It is not represented as AI.
- Actionable error messages for missing keys, invalid keys, model configuration, free-tier quotas and rate limits.
- Findings: likely-covered items, possible extras, clarifying questions, confidence-sensitive wording and a cautious starting estimate.
- Editable quote: review the estimate and apply suggested hours/days; the add-on fee is recalculated from the user's hourly rate and rounded to the nearest ₹100.
- Reply builder and request log: edit replies, search and update request status, copy replies, delete records and export JSON.
- Local persistence: data stays in the current browser's localStorage; there is no user account or cloud sync.

## Quick start (offline/local fallback)

Open `index.html` in a modern browser. Project setup, local comparison, estimates, message generation and request history work without an API key. Since a `file://` page cannot reach the Vercel API route, it uses the clearly labelled local comparison mode.

## Run the full app locally

1. Install Node.js 20 or newer.
2. From this folder, run `npm install`.
3. Run `npm run dev` and open the local URL shown by Vercel CLI.
4. To enable Gemini locally, set `GEMINI_API_KEY` in your local environment before starting the dev server. `GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`. Keep the key private and never put it in browser JavaScript.

## Deploy to Vercel

1. Ensure the repository root contains `index.html`, `app.js`, `styles.css`, `package.json`, `vercel.json`, and `api/analyze.js`.
2. Open the Vercel project connected to this repository. Use **Other** as the framework preset, repository root as the Root Directory, no custom build command, and no custom Output Directory override.
3. In **Project Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` — your private Google AI Studio API key (server-side only)
   - `GEMINI_MODEL` — optional; defaults to `gemini-3.6-flash`
4. Add the variables to Production and any Preview/Development environments you use, then redeploy.
5. Test the comparison button. **AI ANALYSIS** means the Gemini API call succeeded; **LOCAL CHECK** means the fallback was used. The toast now gives a safe diagnostic message for common API failures.

Create a key in [Google AI Studio](https://aistudio.google.com/apikey). The Gemini API offers a free tier for eligible models, including Gemini 3.6 Flash at the time this version was prepared, subject to account, region, and model-specific quota limits. Check the [current pricing](https://ai.google.dev/gemini-api/docs/pricing) and [usage limits](https://ai.google.dev/gemini-api/docs/rate-limits).

The endpoint lives at `api/analyze.js` and is served as `/api/analyze`. The secret is read from `process.env.GEMINI_API_KEY` only; it is never returned to the browser. The previous `OPENAI_API_KEY` and `OPENAI_MODEL` variables are no longer used by this version and can be removed after verifying the Gemini setup.

## Free-tier data and privacy warning

Google's terms state that data submitted through unpaid Gemini API services may be used to improve Google's products, and human reviewers may process such inputs and outputs. **Do not submit confidential client contracts, private personal data, credentials, or sensitive business information using a free-tier API key.** See the [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms).

When AI mode is enabled, the project name, original scope, client request, revision allowance and hourly rate are sent to Google Gemini to perform the analysis. Use anonymized/sample content until you have reviewed the provider's terms and obtained any permission required to share client data.

## API, cost and limitations

- Gemini free-tier usage is subject to rate limits and availability. A 429 usually means the request hit a quota or rate limit; check Google AI Studio usage and limits. The fallback continues to work without AI.
- Free-tier availability and pricing can change. Check the official pricing page before relying on a specific quota.
- The local fallback uses simple keyword matching. It cannot reliably understand nuanced clauses, implied terms, attachments or full contract context.
- This tool is not legal, tax or accounting advice. It does not decide what a contract legally includes.
- Time estimates are planning suggestions only. Validate deliverables, assumptions, fee, payment terms and revised deadline yourself.
- INR is the current display currency. Client messages are drafts; ScopePing never sends messages automatically.
- Authentication, multi-device sync, rate limiting, a database, payment processing and abuse protection are not implemented. Add these before making this a high-traffic public production service.
- Browser data is device-specific and can be lost when browser storage is cleared. Export data regularly.

## Project files

- `index.html`, `styles.css`, `app.js` — frontend
- `api/analyze.js` — optional server-side Gemini endpoint
- `vercel.json` — Vercel hosting config
- `.env.example` — environment variable names only, no secrets
- `DEPLOYMENT_AND_SECURITY.md` — launch checklist
