# BetterQuintoDistrito

An independent, nonpartisan citizen budget transparency portal for the **Fifth Congressional District of Negros Occidental**: Himamaylan City, Binalbagan, Hinigaran, Isabela, La Castellana, and Moises Padilla.

**Local review implementation. Public production launch is blocked pending operator details, legal review, and deployment acceptance.** See [the release gate](docs/RELEASE.md).

## Foundation and attribution

Based on [BetterGov.PH’s open-source Transparency Portal](https://github.com/bettergovph/transparency-portal), upstream commit cc65e379e0dfd14ed3020ea2d322cab0403b86c3. The original [MIT license](LICENSE) and copyright are preserved. The original README is retained at [docs/UPSTREAM_README.md](docs/UPSTREAM_README.md).

BetterGov.PH is the original open-source project and primary budget data provider. BetterQuintoDistrito uses its own supplied identity. No official government affiliation, endorsement, or partnership is implied. Source documents and API data retain their original notices; the software license does not remove data restrictions. The attached logo has been retained, with resized derivatives for web delivery; no claim is made about independent trademark authorization.

## Public access and privacy

Free for everyone. No login, registration, database, backend, payments, identity documents, geolocation, or optional analytics. The welcome screen stores only a version acknowledgment in browser local storage and falls back to current-session memory if storage is blocked. Terms and privacy drafts can be read before entry; original deep links are preserved. Material document changes require a version bump in src/lib/legal.ts.

The browser still makes ordinary requests to its static host, budget.bettergov.ph, and external document providers; those services may keep technical logs. The Privacy Notice contains explicit operator TODOs rather than invented identity/contact/retention details. System fonts avoid third-party font requests.

## Supported data

- FY2027 NEP and House Bill 10858: project-level document comparison across DPWH, farm-to-market roads, health facilities, and irrigation where the API returns matches.
- FY2020–2026 GAA: enacted appropriations by office and matching program family; not actual spending.
- Amounts are source integer pesos; null remains missing, never zero. NEP and House totals are compared, never added.
- Shared-office amounts remain whole. Office/name overlap is deduplicated and every inclusion reason is retained. All hand exclusions are published on Methodology.
- Title mentions and supplied coordinates are not independently verified physical locations. No complete district allocation or spending total is claimed.

Read [scope decisions](docs/SCOPE.md), [API integration](docs/api.md), and [verification/limitations](docs/RELEASE.md). Evidence is under docs/evidence, outside the public build; snapshots are review evidence, not a production fallback.

## Install and develop

Use Node 22.12+ (or a supported Node 20.19+ release) and npm. From this checkout:

```sh
npm ci
npm run dev
```

Open http://localhost:5132. The server uses this fixed port. Stop it with Ctrl+C.

React 19, TypeScript, Vite, and React Router are retained from upstream. Runtime requests go directly to the public read-only API; no credentials are required. Budget responses are memoized for the current page. Failed requests can be retried, pages are checked for completeness, and excessive/truncated scopes fail closed. There is no offline dataset/service worker.

## Configuration

portal.config.ts defines identity, the exact verified district/office, six name queries, exclusions, and optional final siteUrl. Do not run the single-LGU setup interactively over this district configuration unless intentionally changing its scope. Inspect identifiers with npm run setup -- --list-districts or --list-offices. The API host defaults to https://budget.bettergov.ph. VITE_API_BASE is an optional build-time override; update the static CSP connect-src if using another host.

## Checks

```sh
npm run check
npm test
npm run lint
npm run build
npm audit
```

The live checker reconciles source queries and historical department-years. The 14 automated tests cover data integrity and failure behavior; browser interaction, viewport geometry, screenshots, and acceptance limits are documented in docs/RELEASE.md. Tests use explicit local fixtures/overrides, never substituted in the portal.

## Routes and features

| Route | Content |
| --- | --- |
| / | Live overview, source stage context, comparison bars and program counts |
| /projects | Search, locality title filter, program/status/office/reason filters, funding bounds, sort, load-more, shareable query strings, CSV |
| /projects/:dataset/:id | Exact source version/PDF page links, matching caveats, inclusion reasons, copy link, print/save PDF |
| /municipalities | Six-LGU coverage directory |
| /municipalities/:slug | Locality title-match profiles and searchable project lists |
| /budget-history | Historical office budgets and 2020–2026 program families, year/department/search filters, CSV |
| /methodology | Source queries, exclusions, definitions, API disclaimers and documents |
| /about | Independent initiative and upstream acknowledgments |
| /terms, /privacy | Versioned review drafts, accessible before acknowledgment |

Legacy /gaa and /districts remain available. Locality slugs: himamaylan, binalbagan, hinigaran, isabela, la-castellana, moises-padilla.

## Static deployment

npm run build produces dist/. No always-on server is required. Cloudflare static Workers is configured in wrangler.jsonc; Vercel and Netlify configuration is retained. See [exact deployment steps](docs/deploy.md). Unknown routes must serve index.html. Add the real siteUrl only when the domain is known, so canonical/social image URLs are correct. No production URL is invented.

Resolve the [release blockers](docs/RELEASE.md) before publishing. The public release should include the source in an operator-owned MIT-licensed repository with upstream attribution; this local checkout has not been pushed to the upstream project.

## Contributing

Open a focused issue or patch in the operator’s eventual public fork (URL pending). Describe the problem, source endpoint/record ID, data stage, inclusion reason, and reproducible evidence. Never submit secrets or personal visitor data. Preserve license notices, source caveats, null values, and deduplication. Scope changes must update docs/SCOPE.md and pass the live checker, tests, lint, and build. Do not infer corruption or responsibility from document comparison alone. Do not add synthetic records to production.

## UI/UX refinement sprint

See [the sprint report](docs/qa/UI_UX_SPRINT.md) for the latest UI changes, issue register, 20-test result, responsive evidence, and release limitations. Earlier evidence is retained.
