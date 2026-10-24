# Installation and deployment

## Option A — Preview without deploying

1. Extract this purchase ZIP.
2. Open `ScopePing Source/index.html` in a modern desktop browser.
3. Try the quote calculator, local keyword check, reply generator, request log and PDF download.
4. An AI API call will not work from a `file://` page. Use Option B for live Gemini analysis.

The app loads jsPDF from a CDN for browser-side PDF generation, so an internet connection is required for PDF downloads.

## Option B — Deploy your own copy on Vercel

### 1. Upload source to GitHub

Create a new repository you control and upload the **contents** of `ScopePing Source` to the repository root. Ensure `index.html`, `app.js`, `styles.css`, `package.json`, `vercel.json` and `api/analyze.js` are in their expected locations.

### 2. Import into Vercel

- Import the repository into Vercel.
- Framework preset: **Other**.
- Root directory: repository root.
- Build command: none.
- Output directory: leave the override disabled / default.
- Deploy.

### 3. Configure optional Gemini API

In Vercel, open **Project → Settings → Environment Variables** and add:

- Key: `GEMINI_API_KEY`
- Type: Secret
- Value: your Google AI Studio API key
- Environment: Production (and Preview/Development if needed)

Optional:
- Key: `GEMINI_MODEL`
- Type: Config
- Value: a Gemini model that your API project can use.

If `GEMINI_MODEL` is omitted, the backend uses the default configured in `api/analyze.js`. Check Google's current model list and quotas; model names and availability can change.

Save and redeploy after editing environment variables. Never paste the API key into `index.html` or `app.js`, and never commit it to GitHub.

### 4. Test

- Open your deployed site and hard-refresh.
- Submit a sample project scope and request.
- `AI ANALYSIS` indicates the server-side AI request succeeded.
- `LOCAL CHECK` means the fallback is being used; read the notification for the cause.
- The GET request to `/api/analyze` may return `405 method_not_allowed` in a browser because the route expects POST.

## Local development server

Requires Node.js 20+ and the Vercel CLI dependency included in package.json.

1. Open Terminal in `ScopePing Source`.
2. Run `npm install`.
3. Set the environment variable in your shell (do not put the real key in a file committed to Git).
4. Run `npm run dev`.
5. Open the local URL printed by Vercel CLI.

For macOS/Linux with a current shell session, an example command is:
```bash
export GEMINI_API_KEY="paste-your-key-in-your-own-terminal"
npm run dev
```

## Important limitations

- Projects and request logs are stored in this browser using localStorage; no user accounts, database or cross-device sync are included.
- Gemini integration is optional and requires your own API key; the download includes no API credits.
- Free-tier quota and availability are controlled by Google and can change.
- The app is a source-code/template product, not a hosted SaaS subscription or guaranteed uptime service.
- PDF generation uses a browser-side CDN dependency.
- Scope findings and estimates are suggestions, not a legal interpretation or binding quote.
