# NOVA Workforce Cloudflare Pages source

This package replaces Apper-hosted website delivery with a standalone static site and a Cloudflare Pages Function. It uses no Apper SDK, no Apper branding, no customer testimonials, no customer counters, no invented performance metrics, no gradients, and no scroll animation.

## Included

- `site/`: website pages, assets, favicon, legal notices, product preview, robots.txt and sitemap.
- `functions/api/run-mission.js`: Cloudflare Pages Function for the mission workflow. It calls Gemini only server-side and requires Turnstile verification.
- `build.mjs`: dependency-free static build script. Output is `dist/`.
- `wrangler.toml`: Pages build directory configuration.

## Important limits

The website is a static front end. The mission endpoint is provided as Cloudflare Pages Function source, but live model execution will not work until the Cloudflare Pages project is deployed and configured with the required secrets and Turnstile public site key. Do not put API keys into HTML, JavaScript, source control, or a `VITE_` variable.

The early-access form opens a prefilled email draft. It does not silently submit or save enquiries in a database.

The mission endpoint uses a Gemini model endpoint. AI output and model-reported checks can be wrong and require human review. Turnstile helps reduce automated abuse; it is not a complete rate-limiting or authentication system. Before opening the console broadly to the public, add appropriate usage limits and abuse monitoring in Cloudflare.

## Build locally

Requires Node.js 20 or newer.

```sh
npm run build
```

The `dist/` directory is ready to serve as a static website. For local Pages Function testing, use Wrangler:

```sh
npx wrangler pages dev dist
```

## Recommended Cloudflare Pages deployment

Use **Git integration** for the source project because the mission endpoint is a Pages Function. Cloudflare documents that you cannot convert a Direct Upload project to Git integration later without creating a new project.

1. Create a new GitHub repository, for example `nova-workforce-cloudflare`.
2. Extract this ZIP and push the contents of this directory to that repository. Keep `functions/`, `site/`, `package.json`, `build.mjs`, and `wrangler.toml` at the repository root.
3. In Cloudflare, open **Workers & Pages**, create a Pages project, and connect the repository.
4. Set the production branch to `main`, build command to `npm run build`, and build output directory to `dist`.
5. Create a Cloudflare Turnstile site for the site domains. Set the public `TURNSTILE_SITE_KEY` as a Pages build environment variable for Production and Preview as appropriate.
6. Add `GEMINI_API_KEY` and `TURNSTILE_SECRET_KEY` under Pages runtime secrets. Never commit their values.
7. Deploy, then test `/`, `/console/`, `/privacy/`, `/terms/`, `/cookies/`, `/security/` and `/about/` on the `pages.dev` address before changing the custom domain.
8. In the Pages project, add `novaworkforce.online` as a custom domain. Also add `www.novaworkforce.online` only if you intend to use it, and choose a canonical redirect. Follow Cloudflare's domain/DNS instructions for the zone. Do not delete the current production records before the new Pages deployment passes checks.

## Required Cloudflare variables

- Build environment variable: `TURNSTILE_SITE_KEY` (public site key; it is embedded into `console/index.html` at build time).
- Runtime secret: `TURNSTILE_SECRET_KEY` (private Turnstile secret).
- Runtime secret: `GEMINI_API_KEY` (private Gemini API key).

The live mission button is intentionally disabled in the console when `TURNSTILE_SITE_KEY` is not configured.

## Pre-launch checklist

- [ ] Deploy from Git integration, not an irreversible Direct Upload project.
- [ ] Set and test Turnstile for the production hostname.
- [ ] Add Gemini and Turnstile secrets in Cloudflare.
- [ ] Test the mission endpoint with a small benign task. Check for a valid result and verify the user-facing error cases.
- [ ] Confirm the early-access mailto flow on a device with an email application configured.
- [ ] Test each legal page from the published domain and review the legal wording for your actual business and jurisdiction.
- [ ] Confirm the favicon on the published domain.
- [ ] Add the custom domain in Cloudflare and verify HTTPS and the chosen canonical hostname.
- [ ] Check that no Apper badge or Apper SDK is loaded on the new domain.
- [ ] Add request limits/abuse monitoring before inviting unrestricted public usage of the AI endpoint.

This package is a technical migration starter, not legal advice or a claim that the production deployment is complete.
