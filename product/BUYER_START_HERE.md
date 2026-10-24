# Welcome to ScopePing

Thank you for purchasing ScopePing — the Freelancer Scope & Change-Order Toolkit.

## What you received

- ScopePing web-app source files you can run and customize.
- Project baseline and client change-request form.
- Optional Gemini-based scope comparison (bring your own Google AI Studio API key).
- Extra-hours, delivery-time and quote calculator.
- Client reply drafts in English and Hinglish.
- Browser-based change-order PDF generator.
- Local request log and JSON export.
- Blank change-order PDF template and sample document.
- Setup, FAQ, troubleshooting and license documents.

## 5-minute first test

1. Extract the ZIP file.
2. Open the `ScopePing Source` folder.
3. Open `index.html` in a modern browser to test the local-only experience.
4. Enter an original project scope and a new client request.
5. If an analysis is already available from the hosted/local API, the app can include it in the PDF. Otherwise it still creates a change-order draft without an attached AI assessment.
6. Click **Download change-order PDF** in the client reply panel.

Opening `index.html` directly is useful for previewing the interface and local tools. The AI endpoint requires deployment or the Vercel development server.

## Enable optional Gemini analysis

The app does not include an AI provider key or usage credits. To enable live analysis:

1. Create your own API key at https://aistudio.google.com/apikey.
2. Deploy the source to your own Vercel project.
3. Add `GEMINI_API_KEY` as a Secret environment variable in Vercel. Optionally set `GEMINI_MODEL` to a model available to your account. If omitted, the app source uses its configured default.
4. Redeploy after saving the variable.
5. Test the analysis feature with anonymous/sample information.

**Privacy note:** Google's unpaid Gemini API terms may allow submitted content to be used to improve Google products and may involve human review. Do not send confidential client contracts, personal information, passwords, or sensitive business information through a free-tier key. Review the provider's current terms before using real client data.

## Need help?

Start with `INSTALLATION.md` and `FAQ.md`. For support with files included in this purchase, use the support channel listed on the Gumroad product page. Support does not include custom installation, API credits, hosting, legal advice or bespoke development unless the listing explicitly says otherwise.
