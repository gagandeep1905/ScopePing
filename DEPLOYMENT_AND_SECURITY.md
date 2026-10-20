# ScopePing deployment and security checklist

## Before sharing the public URL

- [ ] Deploy through Vercel and confirm the static UI and `/api/analyze` endpoint work.
- [ ] Confirm `GEMINI_API_KEY` is stored only in Vercel Environment Variables.
- [ ] Confirm `GEMINI_MODEL` is either unset (defaults to `gemini-3.8-flash`) or a model available to the API project.
- [ ] Confirm AI success is labeled `AI ANALYSIS` and fallback is labeled `LOCAL CHECK`.
- [ ] Test an extra request, a likely included revision, and a vague request.
- [ ] Confirm suggested hours are applied only after the user presses **Use suggested estimate**.
- [ ] Confirm quotes and client replies remain editable and are never sent automatically.
- [ ] Test copy message, saving to request log, status changes, search and JSON export.
- [ ] Download a change-order PDF; verify project details, change description, fee, timeline, approval text, signature lines and page footer.
- [ ] Open the site on a phone-sized viewport and confirm the analysis panel is readable.
- [ ] Publish a privacy notice before collecting user data or marketing publicly.
- [ ] Decide retention, model-provider disclosure and a support contact before launch.

## PDF generation

The change-order PDF is created locally in the browser with jsPDF loaded from jsDelivr. No PDF content is sent to a separate PDF service. The CDN dependency must load for direct PDF download to work.

## Environment variables

`GEMINI_API_KEY` is a server-only secret. Create a key in [Google AI Studio](https://aistudio.google.com/apikey) and configure it in Vercel Project Settings → Environment Variables. Do not place it in `index.html`, `app.js`, a committed `.env` file or browser local storage.

`GEMINI_MODEL` is optional and defaults to `gemini-3.8-flash`. Free-tier eligibility and quotas are account/region/model dependent and may change; check [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).

After changing environment variables, redeploy the project. The old `OPENAI_API_KEY` and `OPENAI_MODEL` variables are no longer used and can be removed once the Gemini integration is verified.

## Free-tier data warning

Google's terms say content sent through unpaid Gemini API services may be used to improve Google products and can be processed by human reviewers. Do not submit confidential contracts, personal data, credentials or sensitive client information on the free tier. Review the [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms) and obtain client permission where needed.

ScopePing sends the project name, original scope, new request, revision allowance and hourly rate to Google Gemini when AI mode is active. Use anonymized test data while validating the integration.

## Launch limitations to communicate

- This version uses localStorage, so projects are local to one browser and do not sync.
- AI outputs can be wrong. The local fallback is a simple heuristic, not AI and not a contract interpretation.
- The tool offers drafting support and planning estimates, not legal advice.
- Do not promise guaranteed payment collection, legal enforceability or exact work estimates.
- Public rate limiting, authentication, team sync, database persistence, metering and abuse protection are not implemented.

## Recommended next engineering milestones

1. Add request throttling and an allowed-origin policy.
2. Add a privacy page, data-deletion/export information and provider disclosures.
3. Add accounts and encrypted cloud persistence only after user demand justifies it.
4. Add a controlled paid plan only after validating willingness to pay and setting API usage limits.
5. Add automated tests for scope classifications, quote calculations, request storage and provider errors.
