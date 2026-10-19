# ScopePing deployment and security checklist

## Before sharing the public URL

- [ ] Deploy through Vercel and confirm the static UI loads on desktop and mobile.
- [ ] Confirm `OPENAI_API_KEY` is stored only in Vercel Environment Variables.
- [ ] Confirm AI success is labeled `AI ANALYSIS` and fallback is labeled `LOCAL CHECK`.
- [ ] Test a clearly new request, a likely included revision, and a vague request.
- [ ] Confirm recommended hours are applied only after the user presses **Use suggested estimate**.
- [ ] Confirm all quotes and client replies remain editable and are never sent automatically.
- [ ] Test copy message, saving to request log, status changes, search and JSON export.
- [ ] Open the site on a phone-sized viewport and confirm the analysis panel is readable.
- [ ] Add a privacy notice before collecting user data or marketing publicly.
- [ ] Decide on retention, model-provider disclosure and a support contact before launch.

## Environment variables

`OPENAI_API_KEY` is a server-only secret. Configure it in Vercel's project settings, not in `index.html`, `app.js`, a committed `.env` file, or client-side local storage. `.env.example` contains placeholders only.

`OPENAI_MODEL` is optional and defaults to `gpt-4.1-mini`. Choose a model available to your API project, and test it after changing this setting.

## Launch limitations to communicate

- This version uses localStorage, so projects are local to one browser and do not sync.
- AI analysis sends the submitted original scope and client request to the configured provider.
- The local fallback is a simple heuristic, not AI and not a contract interpretation.
- The tool offers drafting support and planning estimates, not legal advice.
- Do not promise guaranteed payment collection, legal enforceability or exact work estimates.

## Recommended next engineering milestones

1. Add request throttling and an allowed-origin policy if the API endpoint is opened publicly.
2. Add a privacy page and data-deletion/export information.
3. Add user accounts and encrypted cloud persistence only after user demand justifies the complexity.
4. Add a controlled paid plan only after testing willingness to pay and setting API usage limits.
5. Add automated tests for scope classifications, quote calculations, request storage and error states.
