# Migration notes

- Removed dependency on Apper's client runtime and edge function SDK.
- Created a static site that can build with Node.js alone.
- Added native Cloudflare Pages Function at `functions/api/run-mission.js`.
- Ported the multi-stage Gemini workflow to use Cloudflare runtime secrets.
- Added a Turnstile check before the Gemini function can incur model costs.
- No API secret is included in the package.
- Live Cloudflare deployment and custom domain attachment have not been performed from this environment.
