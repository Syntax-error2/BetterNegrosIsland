# Deploying

**BetterQuintoDistrito is currently for local review.** Resolve the operator/legal/domain and acceptance gates in [RELEASE.md](RELEASE.md) before public deployment. No hosted deployment is claimed. All visitors must be able to read the public portal without a host authentication gate.

The build is static: `npm run build` → `dist/`. Every host needs the same single rule,
because the routes (`/districts`, `/projects/…`, `/about`) are handled in the browser:
**a path that is not a file serves `/index.html`**.

Before deploying, run `npm run check`. It exits non-zero if an office name, district id
or exclusion does not match the API, so it can gate a CI deploy:

```yaml
# .github/workflows/deploy.yml (excerpt)
- run: npm ci
- run: npm run check
- run: npm run build
```

## Cloudflare Workers (static assets)

`wrangler.jsonc` deploys `dist/` as static assets with single-page-application fallback.
No Worker code and no bindings.

```bash
# change "name" in wrangler.jsonc first
npx wrangler login
npm run deploy:cloudflare
```

The Worker name is already `betterquintodistrito`; choose an available account-specific name if it conflicts. This uses your own Cloudflare account. No D1, R2, Worker backend, or payment binding is needed. For Cloudflare Pages instead, use build command `npm run build`, output directory `dist`, and SPA fallback for non-asset routes. Keep `public/_headers`; verify the deployed responses actually apply it. Other hosts may require equivalent host-native header configuration.

Run `npm test` and `npm run lint` in addition to the live check/build before release. Supply the actual operator identity/privacy contact, finalize and approve both legal documents, increment their version if materially changed, and set the final `siteUrl` in `portal.config.ts`. Rebuild after changing it. Canonical URLs are omitted until this value is supplied; the logo's social image becomes an absolute URL when it is set.

After deployment, verify an unauthenticated private/incognito visit, first-visit acknowledgment, an unchanged returning version, a direct `/projects/:dataset/:id` reload, a shared filtered URL, the six locality pages, `/budget-history`, source PDF pages, API errors, mobile navigation, favicon, metadata, and actual provider privacy/logging disclosures. Do not turn on analytics or reporting as part of deployment.

Add a custom domain in the Cloudflare dashboard (Workers → your worker → Domains).

## Vercel

Import the repository. `vercel.json` sets the Vite build, `dist/` and the rewrite to
`index.html`.

## Netlify

Import the repository. `netlify.toml` sets the build and the 200 redirect to
`index.html`.

## GitHub Pages and plain web servers

Serve `dist/`. For the fallback, copy `dist/index.html` to `dist/404.html` (GitHub Pages),
or configure the server (nginx: `try_files $uri /index.html;`).

## Link previews

Set `siteUrl` in `portal.config.ts`. The build writes the portal's name, description and
canonical URL into `index.html`, so link previews show the right portal.

## The API host

The portal reads `https://budget.bettergov.ph` unless `api` is set in the config or
`VITE_API_BASE` is set at build time. The API is CORS-open and edge-cached, so no proxy
is needed.
