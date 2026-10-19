# ScopePing 1.2 — Gemini API integration

## Included
- Switched server-side scope comparison from OpenAI Responses API to Google's Gemini generateContent API.
- Default model: `gemini-3.6-flash`, configurable with `GEMINI_MODEL`.
- Server-side `GEMINI_API_KEY` configuration; no key is exposed to browser code.
- Structured JSON response schema for in-scope/extras/clarification and time estimates.
- More actionable, safe error messages for invalid key, permissions, quota/rate limits, missing model and malformed responses.
- Local keyword fallback remains available and clearly labelled.
- Free-tier privacy warning added to app/docs.

## Deployment
1. Create a key in [Google AI Studio](https://aistudio.google.com/apikey).
2. In Vercel, add `GEMINI_API_KEY` (Secret) for Production and redeploy.
3. Optionally add `GEMINI_MODEL=gemini-3.6-flash`.
4. Test `https://your-domain/api/analyze` in a browser; a POST-only route should respond with `405 method_not_allowed` to a browser GET.
5. Run a comparison in the app. `AI ANALYSIS` indicates success; `LOCAL CHECK` displays a safe error reason.

## Free-tier privacy
Google may use content submitted through unpaid Gemini API services to improve its products and may send prompts/outputs to human reviewers. Do not use real confidential client contracts or personal information with the free tier. Review Google’s current terms and pricing before public launch.

The app is not legal advice. Human review is required. API free-tier availability and quotas can change.
