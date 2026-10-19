# ScopePing 1.1 — Release notes

## Included
- Original-scope baseline and client-request input.
- Server-side AI scope comparison endpoint at `/api/analyze`.
- Clearly labelled local keyword fallback when no AI endpoint is available.
- Suggested additional hours/days and a user-reviewed quote estimate.
- Context-aware client reply builder.
- Request log, local browser persistence, search/status filters, and JSON export.
- Vercel deployment and security checklist.

## Important
This package is Vercel-ready source code, not a live deployment. Real AI analysis is activated only after configuring `OPENAI_API_KEY` as a server-side environment variable in Vercel and redeploying. Do not place the key in `index.html` or `app.js`.

The current MVP does not include login, database sync, quotas/rate limits, payment processing, or legal interpretation. Treat all suggestions as estimates for human review.
