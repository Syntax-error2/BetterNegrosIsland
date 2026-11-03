# Static deployment

**BetterNegrosIsland is a working local review build. No hosted deployment or public release is claimed.** See [release gates](RELEASE.md) and [current implementation report](regional/IMPLEMENTATION_REPORT.md).

The app builds with `npm ci` then `npm run build` into `dist/`. It needs only static hosting, SPA fallback for non-file paths, and public access without login. No database, worker application logic or always-on backend is required.

Before packaging/deploying:

```sh
npm run data:validate
npm run data:privacy-review
npm test
npm run lint
npm run build
```

Data is already included under `public/data/`. An ordinary build must not trigger thousands of API calls. Run `npm run data:refresh` separately when the source changes, inspect the report, then rebuild. Failed extraction preserves the last successful pointer; publish the status artifact with it to disclose refresh failure.

For scheduled, isolated preparation, see [automatic data updates](AUTOMATIC_DATA_UPDATES.md). The opt-in GitHub workflow prepares a validated site artifact daily; its host-specific publish step is pending the hosting choice. `npm run data:refresh:candidate -- --rehearse` tests preparation using existing data without API extraction or local snapshot promotion.

Set the real `siteUrl` in `portal.config.ts` and rebuild before public release. This produces absolute canonical/Open Graph URLs for the supplied BetterNegrosIsland logo. The local folder name is historical only. Cloudflare's configured static worker name is `betternegrosisland`; choose an available account-specific name if needed. `npm run deploy:cloudflare` performs a real public deployment and has not been run.

Keep `public/_headers` or configure equivalent host-native headers, especially CSP and privacy permissions. Fonts are self-hosted. For Vercel/Netlify use the supplied rewrite configuration. For any host, ensure missing asset/data files return 404 rather than HTML disguised as JSON. Configure short/no-cache lifetime for `/data/manifest.json` and `/data/refresh-status.json`; versioned snapshot shards may be cached long-term. Enable gzip/Brotli through the host. No compression or header behavior is certified until tested on the actual host.

The project and whole historical shards are deferred, not initial-bundle imports. Their uncompressed size remains material; use compression and measure on low-bandwidth connections, with department/year sharding as a follow-up. Never put a hosting authentication gate on the public portal.

After an approved deployment, verify unauthenticated first and returning visits, regional acknowledgment, deep-route reloads, shared filters, all three provinces and representative locality profiles including Bacolod/Siquijor, source PDFs, outage recovery, CSV, mobile menu, favicon, social metadata, HTTP security/cache/compression headers, actual hosting log retention, and privacy contacts.

Operator supplied by owner: Aqura Information Technology Solutions / Dave Hermoso, Binalbagan, Negros Occidental. No privacy contact is published at the owner’s request. Operational rights-request handling, legal/privacy review, the latest PSGC reconciliation, final host/domain selection and independent device/accessibility acceptance remain outstanding. No optional analytics, account system or citizen report submission has been enabled.
