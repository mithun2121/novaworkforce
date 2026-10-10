# Deploy NOVA Workforce to Cloudflare Pages

The source code is already prepared in this repository: https://github.com/mithun2121/novaworkforce (branch `main`). Do not create another repository and do not upload the ZIP again.

## 1. Create the Pages project

1. Sign in to https://dash.cloudflare.com/.
2. Open **Workers & Pages** and choose **Create application**.
3. Choose **Pages** and **Connect to Git**.
4. Connect GitHub if asked, then select repository `mithun2121/novaworkforce`.
5. Use these build settings:
   - Project name: `nova-workforce` if available; otherwise choose an available name.
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: leave blank (repository root)
6. Choose **Save and Deploy**.

Wait for the first deployment to succeed, then open its `pages.dev` URL. Check the home page and `/console/`, `/about/`, `/privacy/`, `/terms/`, `/cookies/`, and `/security/`. The live mission button remains disabled until the following configuration is finished.

## 2. Configure Turnstile and the Gemini API

1. Create a Turnstile widget at https://dash.cloudflare.com/?to=/:account/turnstile. Add the exact `pages.dev` hostname given by the deployment. Also add `novaworkforce.online` and `www.novaworkforce.online` if you plan to use both.
2. Copy the Turnstile **site key** and **secret key**.
3. In the Pages project, open **Settings > Builds** (environment variables for the build) and add `TURNSTILE_SITE_KEY` with the site key as its value. This key is public and is embedded into the browser console at build time.
4. In **Settings > Variables and Secrets**, add both of the following as encrypted secrets in the **Production** environment:
   - `TURNSTILE_SECRET_KEY`: the Turnstile secret key
   - `GEMINI_API_KEY`: your Google Gemini API key (create one at https://aistudio.google.com/apikey)
5. Save the settings and start a fresh deployment so the site key is included in the build and runtime secrets are available to the Pages Function.
6. Test a small, non-sensitive mission. Review AI outputs yourself. Add usage limits and monitor API spending before inviting unrestricted public traffic; each mission makes several model requests and may incur API charges.

Never put either secret in GitHub, HTML, client-side JavaScript, or a public environment variable.

## 3. Connect novaworkforce.online

Only do this after the `pages.dev` website passes testing.

1. In the Pages project, go to **Custom domains > Set up a domain** and add `novaworkforce.online`.
2. Follow the dashboard's domain and DNS instructions. An apex domain such as `novaworkforce.online` must be added as a zone in the same Cloudflare account, with its nameservers pointed to Cloudflare.
3. Before changing nameservers, check that existing DNS records for email and other services have been imported correctly, especially MX, SPF, DKIM and DMARC records for `hello@novaworkforce.online`.
4. Add `www.novaworkforce.online` only if you intend to use it, then choose one canonical hostname/redirect.
5. Verify HTTPS and repeat the page and AI tests. Keep the previous host available until the new domain is serving correctly.

## Reliability notes

Once deployed, the site is served by Cloudflare and does not depend on your laptop or home Wi-Fi. Git integration also rebuilds and deploys future commits automatically. No provider can promise literal zero outages; keeping the old site available during testing and doing the domain cutover only after verification reduces risk.
