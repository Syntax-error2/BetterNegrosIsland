Public-copy redaction: personal operator attribution was removed at the owner’s request. Existing historical findings are unchanged; older commits and screenshots may retain earlier attribution.

# Static deployment

**BetterNegrosIsland is hosted at https://betternegrosisland.vercel.app through the AQURA ITS Vercel project, connected to Syntax-error2/BetterNegrosIsland. The owner authorized deployment on 3 November 2026. Hosting does not resolve the outstanding privacy/legal and independent QA items.** See [release gates](RELEASE.md) and [current implementation report](regional/IMPLEMENTATION_REPORT.md).

Use Node 24 (see `.nvmrc`). Install with `npm ci` and run `npm run verify`; deploy the resulting `dist/` directory. Only static hosting is needed: no database, Worker application logic or always-on backend. Route fallbacks are restricted to real application paths, so missing JSON, JavaScript, images and development fixtures return 404.

Before packaging/deploying:

```sh
npm ci
npm run verify
npm audit --omit=dev
```

Data is already included under `public/data/`. An ordinary build must not trigger thousands of API calls. Run `npm run data:refresh` separately when the source changes, inspect the report, then rebuild. Failed extraction preserves the last successful pointer; publish the status artifact with it to disclose refresh failure.

For scheduled, isolated preparation, see [automatic data updates](AUTOMATIC_DATA_UPDATES.md). The opt-in GitHub workflow prepares a validated site artifact daily; its Vercel publish step remains unconfigured. `npm run data:refresh:candidate -- --rehearse` tests preparation using existing data without API extraction or local snapshot promotion.

Set `VITE_SITE_URL` in the host's build environment to the real HTTPS website origin (or set `siteUrl` in `portal.config.ts`) before the final build. It must contain no path, credentials, query or fragment. This produces absolute canonical/Open Graph URLs for the supplied logo. `VITE_*` values are public build settings: never put secrets in them. Cloudflare's static Worker name is `betternegrosisland`; choose an available account-specific name if needed. `npm run deploy:cloudflare` verifies, builds and performs a real deployment; it has not been run.

`npm run build` generates Cloudflare/Netlify `_headers` and `_redirects`, plus equivalent Vercel headers/rewrites, from `scripts/deployment-policy.mjs`. Edit that policy rather than generated files; `npm run deployment:check` detects drift. Keep `404.html`, `_headers` and `_redirects` in the upload. Netlify uses `netlify.toml`; Vercel uses `vercel.json`; Cloudflare Workers uses `wrangler.jsonc` with explicit route rewrites and 404 handling. Cloudflare Pages can use the same `dist/` files.

Mutable manifest/status files revalidate. Only exact, existing checksummed snapshot URLs receive immutable caching: wildcard rules can otherwise cache a missing asset for a year. Fonts are self-hosted and no third-party analytics were added. Security headers restrict script/font/image origins, framing and device permissions. Verify actual HTTPS, headers, compression and provider practices after selecting the host; local checks do not certify the remote host.

Local Cloudflare runtime rehearsal (no deployment):

```sh
npx wrangler dev --local --ip 127.0.0.1 --port 5134
# From another terminal:
node scripts/check-deployment.mjs http://127.0.0.1:5134
```

Build before starting this runtime. On Windows, stop/restart Wrangler after rebuilding `dist/`; directory replacement can disable its asset watcher with EPERM. The production app includes a recovery screen for failed lazy-page loads after a deployment; Reload current version requests the latest document and preserves the address/query string.

The project and whole historical shards are deferred, not initial-bundle imports. Their uncompressed size remains material; use compression and measure on low-bandwidth connections, with department/year sharding as a follow-up. Never put a hosting authentication gate on the public portal.

After an approved deployment, verify unauthenticated first and returning visits, regional acknowledgment, deep-route reloads, shared filters, all three provinces and representative locality profiles including Bacolod/Siquijor, source PDFs, outage recovery, CSV, mobile menu, favicon, social metadata, HTTP security/cache/compression headers, actual hosting log retention, and privacy contacts.

Operator supplied by owner: [personal operator attribution removed from this public copy]. A monitored portal privacy contact has not been supplied; BetterGov.PH is the data source, not an appointed portal privacy handler. Operational rights-request handling, lawful criteria, host logging/retention, legal/privacy review, latest PSGC reconciliation, provider processing review and independent device/accessibility acceptance remain outstanding. No optional analytics, account system or citizen report submission has been enabled.
