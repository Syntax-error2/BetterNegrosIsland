# Local implementation and release gate

Review date: 2 November 2026, Asia/Singapore. Decision: **NO-GO for public production launch; suitable for local review.** No production deployment, operator approval, public fork, legal approval, or government endorsement has occurred.

## Architecture and changes

The original React 19 / TypeScript / Vite / React Router static application remains the foundation. No backend, database, authentication service, analytics, payment, or account system was added. The upstream MIT `LICENSE` remains unchanged. Upstream commit: `cc65e379e0dfd14ed3020ea2d322cab0403b86c3`. Original README is retained in `docs/UPSTREAM_README.md`.

- `portal.config.ts`: district, exact serving office, six locality queries, and documented exclusions.
- `src/components/Chrome.tsx`, `src/styles/district.css`: BetterQuintoDistrito navigation, footer attribution, civic design, responsive menu, focus styling, print styles, and reduced motion.
- `src/components/LegalEntry.tsx`, `src/lib/legal.ts`, `src/pages/Legal.tsx`: versioned browser-only acknowledgment, memory fallback, decline, reset, public draft documents, preserved deep-link return paths.
- `src/pages/Overview.tsx`, `Localities.tsx`, `Identity.tsx`: live overview, six-LGU directory/profiles, independent identity.
- `src/pages/Home.tsx`: inherited explorer expanded with locality and funding bounds, 25-record load-more, source links, and mobile cards.
- `src/pages/Project.tsx`: inherited document comparisons and inclusion reasons, source metadata, clipboard feedback, print/save-PDF, and request-specific retry.
- `src/api/client.ts`, `src/lib/scope.ts`, `src/lib/gaa.ts`: timeout, bounded request concurrency, pagination checks, duplicate/cursor detection, fail-closed truncation, and existing historical reconciliation.
- `src/lib/csv.ts`, `src/lib/safe-url.ts`: formula-safe CSV text and HTTP(S) source-link validation.
- `public/brand/`: optimized supplied logo and PNG favicon. Original full-resolution supplied asset retained in `docs/branding/`.
- `index.html`, `vite.config.ts`: branded metadata and social image; no invented canonical domain; external fonts removed.
- Hosting: existing Cloudflare/Vercel/Netlify SPA configuration retained, Worker renamed, baseline static security headers added.
- `package.json`: test command and patched minimatch override for the development dependency chain. Runtime architecture unchanged.

## Routes

`/`, `/projects`, `/projects/:dataset/:id`, `/municipalities`, and six locality slugs: `himamaylan`, `binalbagan`, `hinigaran`, `isabela`, `la-castellana`, `moises-padilla`. Also `/budget-history`, `/methodology`, `/about`, `/terms`, `/privacy`. Legacy `/gaa` and `/districts` remain supported. Filters live in query strings.

## Executed verification

| Command / check | Observed result |
| --- | --- |
| `npm ci` | Installed upstream dependency lock |
| `npm run check` | Passed live API checks, 50 FY2027 records, 538 historical families, 98 department-year reconciliations; two retained corridor warnings |
| `npm test` | 14 passing tests covering null/zero, six classifications, pagination loss/cycles, failure retry, deduplication, shared-office metadata, region filtering, both CSV exports, safe URLs, storage/versioning, historical stages, configuration |
| `npm run lint` | Passed |
| `npm run build` | Passed TypeScript and Vite production build to `dist/` |
| `npm audit` | Zero reported vulnerabilities after patched development dependency override |
| `npm audit --omit=dev` | Zero reported runtime vulnerabilities |
| Browser interaction | Draft decline/checkbox/entry, legal access, deep-link preservation, refresh persistence, mobile menu, program/funding filters, empty/reset, load-more, CSV download, project details, clipboard feedback, PDF page links, history year filter |
| Layout geometry | Six main routes × 360/390/768/1280/1440 widths; welcome and project detail also checked at all five widths; final geometry in evidence files |

Browser tests used the actual local application and live API. Unit test overrides are synthetic, confined to `tests/`, and never supplied to the portal. Exported project CSV was downloaded through the UI. The live API was read only. No actual implementation/disbursement data was invented.

Evidence lives in `docs/evidence/`: API snapshots, checker/build/lint/test/audit logs, responsive geometry JSON, and welcome/overview/project screenshots. The browser developer server restarted during dependency/config changes; the stale preview tab was replaced after confirming HTTP 200. That interruption was not an API data failure.

## Remaining launch blockers and verification limits

1. **Actual operator:** legal name/address, corrections contact, privacy contact, and response procedure are unknown. Prominent TODOs remain. Supply them; do not invent addresses.
2. **Legal approval:** Terms and Privacy Notice are review drafts. Confirm controller/processors, lawful bases, actual host/API technical logs, retention, and international processing with the operator. Sources for review are the Philippine Data Privacy Act and NPC guidance linked on the Privacy page; no legal compliance certification is claimed.
3. **Geography:** two FY2027 corridor matches and other historical corridor/unknown-location matches require review before claiming an exclusive geographic district total. Title matches are incomplete; strict Isabela query can miss legitimate records. See `SCOPE.md`.
4. **Domain/hosting:** select the real public domain and update `siteUrl` for absolute social/canonical metadata. Confirm host security headers, SPA fallback, API connectivity/CORS, public access without login, and provider privacy disclosures on the chosen deployment.
5. **Accessibility:** keyboard skip focus, headings/landmarks, labels, reduced-motion CSS, contrast sampling, mobile controls, and browser geometry have been inspected. No complete WCAG certification, physical-device acceptance, independent screen-reader user testing, or comprehensive cross-browser audit is claimed. Print/save-PDF is implemented through the browser dialog; a printed PDF was not manually accepted.
6. **Reliability/performance:** no load test, throttled slow-network benchmark, production uptime observation, penetration test, or offline data service was performed. API failures remain explicit; the portal does not substitute stale or fabricated figures. HTTP caching is left to the static host/API; the app memoizes requests for the current page only. No service worker or persistent budget cache is claimed.
7. **Source publication:** this checkout is MIT-licensed and contains source; a separately owned public GitHub fork has not been created or pushed. Establish the actual fork URL before announcing a public open-source release; retain BetterGov.PH attribution and license.

## Deployment after the blockers are resolved

See `docs/deploy.md`. Run `npm ci`, `npm run check`, `npm test`, `npm run lint`, `npm run build`. Cloudflare static Worker deployment: authenticate in your own Cloudflare account, then `npm run deploy:cloudflare`. No database/bindings are needed. Vercel and Netlify use the retained repository configuration. The output is a static `dist/` directory. Validate public deep links and the actual notices after deployment.
