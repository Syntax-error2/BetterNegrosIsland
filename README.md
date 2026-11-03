# BetterNegrosIsland

**Negros Island Region Transparency Portal**

Open Data. A Stronger Negros Island.

An independent, free, open-source civic budget portal covering Negros Occidental (including Bacolod in regional navigation), Negros Oriental, and Siquijor. No login, registration, user database, tracking analytics, or always-on application backend.

**Working local review build. Public launch is not approved.** See [the implementation report](docs/regional/IMPLEMENTATION_REPORT.md), [QA report](UI_QA_REPORT.md), and [release gate](docs/RELEASE.md).

The latest [critical hardening report](docs/qa/critical-hardening/REPORT.md) documents the SVG viewport-collapse fix, shared KPI cards, history repair, trusted source links and actual QA limits. The [processing inventory](docs/qa/critical-hardening/PRIVACY_PROCESSING.md) records unresolved operator decisions.

The preceding 3 November 2026 [analytics repair report](docs/qa/analytics-repair/REPORT.md) contains the latest chart root-cause analysis, rendered geometry/table checks, screenshots and verification limits. The [master layout, footer, brand and motion report](docs/qa/master-layout/REPORT.md) preserves the preceding layout evidence. The normal review preview remains on port 5132.

## Foundation and identity

Built from [BetterGov.PH's open-source Transparency Portal](https://github.com/bettergovph/transparency-portal), upstream commit `cc65e379e0dfd14ed3020ea2d322cab0403b86c3`. The original [MIT license](LICENSE) and copyright are preserved. [Original upstream README](docs/UPSTREAM_README.md).

**Powered by BetterGov.PH Budget Data.** BetterGov.PH is the original project and budget data provider. BetterNegrosIsland uses the supplied regional logo and its own identity. No official government affiliation, endorsement, or partnership is implied. Source records retain the upstream notices and restrictions; the software license does not override data terms. The predecessor district portal and its evidence are retained under `docs/archive/pre-regional`, `docs/qa`, and existing release archives for migration history only.

## Citizen tools

The homepage question shortcuts lead to Community Spotlight, analytics, historical appropriations, `/compare`, and `/budget-guide`. Project results offer “Share card” and “Compare”; `/evidence/:dataset/:id` creates a dated PNG with a public source QR code locally in the browser. Comparison selections survive in the URL. Shared links use the current website origin. [Implementation and actual QA](docs/qa/citizen-tools/REPORT.md).

## Run locally

Use Node 24 (see `.nvmrc`) and npm for the recommended deployment setup:

```sh
npm ci
npm run dev
```

Open [the local portal](http://localhost:5132/). Port 5132 is fixed; Vite fails instead of silently changing it. The current development server has been left running for review. Stop it with Ctrl+C in its terminal.

React, TypeScript, Vite, React Router, the original API client and static hosting foundation are retained. Recharts is loaded with Analytics. Plus Jakarta Sans is served locally under its bundled font license. Welcome acknowledgment stores only a version string in browser storage; blocked storage permits current-session entry. Terms and Privacy Notice remain review drafts. The operator supplied by the owner is Aqura Information Technology Solutions / Dave Hermoso, Binalbagan, Negros Occidental. A monitored portal privacy contact has not been supplied; BetterGov.PH supplies the data, and no arrangement appointing it to handle this portal’s privacy requests has been verified. The website is hosted on Vercel; provider processing review, rights handling and legal review remain pending.

Run `npm run verify` for data validation, privacy pattern scans, tests, lint, build and deployment-policy checks. [Deployment instructions](docs/deploy.md) describe the optional HTTPS `VITE_SITE_URL`, host configuration and a local HTTP rehearsal. Passing checks do not provide legal clearance or deploy the website.

The red banner opens `/we-are-not-ignorant`, an independently prepared Negros Island reading view using source-confirmed NIR changes only, with unconfirmed pairings excluded by default. [Privacy/deployment and regional feature audit](docs/qa/deployment-privacy/REPORT.md).

## What the snapshot contains

The snapshot retrieved on **2 November 2026** has **866 unique FY2027 comparison records** (773 DPWH, 38 farm-to-market roads, 55 health facilities, no NIA records returned by the documented queries), **5,253 GAA historical families**, and **2,578 query ledger entries**. Of the comparison records, 851 explicitly have source region NIR; 15 are supplementary uncertain office/title associations. Pagination is complete **for the documented queries**, not the whole government budget.

A separate NEP region-18 rollup reconciles to PHP 125,626,170,000 for FY2027. It has a broader coding scope than the comparison projects and is never added to them. Execution endpoints do not support reliable local attribution; no regional disbursement is inferred.

The directory contains 63 unique official PSGC codes: 19 cities and 44 municipalities. Its accessible PSA lists are dated 31 July 2025. The later September 2026 workbook download was blocked by the source website; current-release validation remains outstanding. Bacolod keeps its separate HUC code. Historical VI/VII classifications remain original; title associations are documented separately and are not a certified monetary crosswalk. Directory coverage does not establish budget completeness.

[Coverage and source decisions](docs/SCOPE.md) · [Ingestion report](docs/regional/INGESTION_REPORT.md) · [API documentation](https://budget.bettergov.ph/docs) · [PSA geography](https://psa.gov.ph/classification/psgc/municipalities/1800000000)

## Data ingestion and checks

```sh
npm run data:discover   # public OpenAPI paths, no bulk extraction
npm run data:fetch      # full conservative regional extraction
npm run data:validate   # offline published-shard checks
npm run data:report     # validate and regenerate the readable report
npm run data:refresh    # extraction, validation and snapshot promotion
npm test
npm run data:privacy-review
npm run lint
npm run build
```

`data:fetch` and `data:refresh` intentionally run the same complete transaction. Historical collection searches 38 departments with 67 province/Bacolod/province-qualified locality queries, all cursors. A refresh makes about 2,610 requests and can take several minutes. Run manually when a new source build is published; do not run repeatedly during development. An opt-in daily candidate workflow is prepared but has not been enabled or connected to hosting; see [automatic data updates](docs/AUTOMATIC_DATA_UPDATES.md). `npm run data:refresh:candidate -- --rehearse` checks isolated preparation with existing data and no extraction. A failure preserves the current public snapshot.

The 30 project query sums can be independently audited against one-row source responses with `npx tsx scripts/data-ingestion/audit-sums.ts`. It refuses a changed source build. The legacy inherited live checker remains available as `npm run check:legacy-live`; it is not the regional snapshot gate. `npm run check` runs the offline regional validator.

Static JSON is outside the JS bundle. The overview loads a small manifest, summary and source metadata; projects, coverage and historical families load on demand. Whole history and project shards remain relatively large before hosting compression; further department/year shards and real low-bandwidth measurements are follow-up work. Individual details retain the live API integration and show a clearly dated cached comparison when the API is unavailable.

## Routes

| Route | Content |
| --- | --- |
| `/` | Regional editorial overview, dated comparison, three provinces |
| `/projects` | Search, title-association geography, program/status/stage/office filters, amount bounds, sort, load-more, exact CSV |
| `/projects/:dataset/:id` | Live source identity, versions, PDF pages, uncertainty, dated outage fallback |
| `/provinces` | All 63 cities and municipalities, searchable |
| `/provinces/:slug` | Negros Occidental, Negros Oriental, Siquijor directories |
| `/locations/:psgcCode` | PSGC locality profile and associated projects |
| `/analytics` | Eight scoped views; URL filters, exact tables, historical year/department controls |
| `/budget-history` | GAA 2020–2026, historical office budgets, query families and export |
| `/data-coverage` | Reconciled query reports, uncertainty and collection boundaries |
| `/methodology`, `/about` | Definitions, source attribution and independent identity |
| `/terms`, `/privacy` | Versioned notices available before entry |

Legacy `/municipalities`, locality slugs, `/districts` and `/gaa` remain compatible where a clear destination exists. The checkout folder retains its predecessor name for continuity.

## Deployment

`npm run build` creates a static `dist/`; it includes the verified data artifacts and public license. Configure SPA fallback, public access without a host login, compression and the supplied security headers. Configure the actual `siteUrl` before generating production canonical/social URLs. [Deployment instructions](docs/deploy.md).

The public source repository is connected to the AQURA ITS Vercel project at https://betternegrosisland.vercel.app. The owner authorized deployment on 3 November 2026; this does not certify the outstanding legal/privacy or independent QA items. Operator legal/privacy completion, latest PSGC validation, hosting acceptance, native zoom and independent accessibility/device QA remain open.

## Current UI/privacy sprint

First-visit “Cookies & privacy” notice: one host-only cookie remembers dismissal for up to 180 days after “Got it”. It contains a shared version value, not a visitor identifier. No advertising or analytics cookies were added. Visitors can reopen the notice from Privacy Notice. [Implementation and verification](docs/qa/cookie-notice/REPORT.md).

The new transparent wordmark is used throughout. Project results use a six-column native table with exact amounts and separate source actions; mobile cards share the same rows. All financial tables use the reusable DataTable. Advanced filters and aggregate context are progressive disclosures, while active shared filters are preserved. See [the current remediation report](docs/qa/premium-ui/REPORT.md), [QA](UI_QA_REPORT.md), [design](DESIGN.md), and [frontend contract](FRONTEND_CONTRACT.md). Development-only extreme fixtures and local axe controls are excluded from production. Existing budget snapshot artifacts remain unchanged.
