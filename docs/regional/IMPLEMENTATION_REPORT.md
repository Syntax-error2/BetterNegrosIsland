# BetterNegrosIsland — implementation and release report

2 November 2026 · Existing React/TypeScript/Vite repository · Local/static review candidate

The former district portal now runs as **BetterNegrosIsland — Negros Island Region Transparency Portal**, with the supplied regional logo, regional directories, a repeatable public-data ingestion pipeline, dated static snapshots and eight analytics views. The original API client, source-document references, source notices and MIT license remain. This is a substantial working implementation with explicit incomplete items; the entire requested definition of done is not claimed.

**Review URL:** http://localhost:5132/  
**Verdict:** local review and static packaging ready; public production release remains NO-GO pending the gates below. No production deployment, remote fork, owner acceptance or official endorsement occurred. Changes remain in the existing working tree.

## 1. Foundation, migration and skills

Foundation: [BetterGov.PH Transparency Portal](https://github.com/bettergovph/transparency-portal), inspected upstream commit `cc65e379e0dfd14ed3020ea2d322cab0403b86c3`. Original LICENSE is unchanged; public build includes its copy. The upstream README is retained. Earlier district documents/code/assets are archived as migration history; prior release archives remain intact.

Brand migration covers configuration/package/deployment name, shell/footer/welcome, document titles, favicon, manifest, Open Graph/Twitter image metadata, legal notices, source UI, README and current docs. Old district routes have compatible regional destinations. The checkout directory keeps its predecessor name to preserve workspace continuity. The supplied logo is used directly, with web-sized derivatives; no BetterGov.PH logo replaces the product identity. Attribution reads **Powered by BetterGov.PH Budget Data** and independent/unofficial status remains explicit.

Before frontend implementation, inspected project AGENTS.md/.agents locations, user skills, configured Codex and plugin directories. Dedicated UI/UX, visual-design, frontend-design and visual-QA skills were not installed. Loaded the complete installed **Sites** skill and its presentation-led design/local-preview references as the available equivalent; applied its typography/composition, coherent visual direction, content hierarchy, real-content and browser review guidance. No missing skill is claimed as used. Inspected Visualize but did not apply it because it excludes repository page components. See DESIGN.md, FRONTEND_CONTRACT.md and UI_QA_REPORT.md for exact skill paths and choices.

## 2. Typography and design

Self-hosted Plus Jakarta Sans replaces the prior typography: four Latin weights, system fallback, bundled open font license, tabular numerals, deliberate heading/body/table scales and restrained tracking. Cool paper, white data surfaces, navy/royal blue and teal reflect the supplied identity. Borders, alignment and useful data density provide structure. The overview is an editorial summary followed by real comparison figures and province navigation. No fabricated metrics, decorative map precision, government seal, login or paid gate was introduced.

Only Recharts was installed for visualization. Its React/SVG integration, keyboard accessibility layer, responsive containers and explicit native-table alternatives fit the existing app. ECharts/Visx were considered for integration/maintenance tradeoffs; no measured three-library benchmark is claimed. Analytics is a deferred route chunk. Mark animation is disabled and reduced-motion styling remains.

## 3. Geography

Three provinces and 63 city/municipality entries are represented with official-source 10-digit PSGC identifiers: **19 cities, 44 municipalities**. Bacolod retains separate HUC code `1830200000`; regional navigation groups it with Negros Occidental. Siquijor has all six municipalities and is explicitly part of the administrative region.

Source: [PSA city list](https://psa.gov.ph/classification/psgc/cities/1800000000), [municipality list](https://psa.gov.ph/classification/psgc/municipalities/1800000000) and province directory. The accessible lists are dated **31 July 2025**. The newer September 2026 workbook was discovered but its download returned Cloudflare 403; no challenge was bypassed. The directory is therefore official-source verified against the accessible listing, **not validated against the latest workbook**.

Historical Regions VI/VII classifications remain original. Current navigation codes and title associations form a documented, limited crosswalk; no historical amount is relabeled as a certified NIR/local allocation. Province/locality fields remain null when not verified, with title-association arrays separate. A directory entry never establishes budget completeness.

## 4. Collected data and exact totals

Snapshot `2026-11-02-37334582ca74`; extraction began `2026-11-02T12:01:31.325Z`. Comparison source built `2026-10-26T08:46:14.383Z`.

| Source | Records / result |
| --- | ---: |
| DPWH comparison union | 773 |
| Farm-to-market roads comparison union | 38 |
| Health facilities comparison union | 55 |
| Irrigation comparison queries | 0 matches returned |
| Unique comparison total | **866** |
| Explicit source region NIR within comparison | **851** |
| Supplementary uncertain region associations | **15** |
| GAA FY2020–2026 unique families | **5,253** |
| Query completeness reports | **2,578** |
| API requests in extraction run | **2,610** |
| Separate FY2027 NEP region-18 rollup | **PHP 125,626,170,000** |
| Its separately published FY2026 baseline | **PHP 129,934,149,000** |

The separate NEP rollup reconciles to 25 department rows. It has a broader source-coding scope than the four-program project union and is never combined with it.

For the comparison union, NEP has 634 amount-bearing lines totaling **PHP 19,667,189,000**; House has 838 amount-bearing lines totaling **PHP 21,378,389,000**. Arithmetic difference: **PHP 1,711,200,000**. These versions are compared, never added. Fourteen source-marked unconfirmed pairings remain visible.

Deduplication removes 1,533 repeated comparison-query appearances and 501 repeated historical-query appearances without discarding unique records. Stable keys are dataset + source ID and historical family key. Shared offices remain whole; none of their budgets is divided among districts. Sixty-four comparison records have no locality title match and remain in the regional list.

## 5. Ingestion, provenance and reliability

Actual commands: `data:discover`, `data:fetch`, `data:validate`, `data:report`, `data:refresh`. Discovery preserves OpenAPI. Fetch/refresh perform the same complete conservative transaction. Current report/validation commands were run successfully. A full refresh makes about 2,610 requests and should be run manually when source data changes; no schedule has been enabled.

- Four program `region=NIR` filters; every returned `next_offset`, limit 200.
- Eleven NIR district details discover whole office ledgers. Province/Bacolod queries supplement records without useful region metadata.
- Historical GAA: 38 departments × 67 unique province/Bacolod/province-qualified locality queries, every `next_cursor`, limit 500. No nationwide bulk GAA copy.
- Timeout, descriptive User-Agent, conservative delay, at most three simultaneous GAA requests, bounded retries and source cooldown handling. Numeric and HTTP-date Retry-After values are handled; a long server cooldown aborts instead of retrying prematurely.
- First extraction reconciled source counts and GAA FY2026 matched amounts. A subsequent independent audit reconciled all 30 comparison-query record counts and NEP/second-/third-reading sums against the unchanged source build.
- Offline validation checks seven shard hashes, stable identities/counts, safe integer money, raw/retrieval/source provenance, PSGC references, source regional flags, NEP department total, query membership/counts and persisted project version sums.
- A new candidate is finalized/validated before pointer promotion. Errors record failure and preserve the previous successful pointer. Full process-kill/filesystem fault injection has not been run.

The completed extraction preceded later validator/retry/provenance hardening. Those changes passed offline checks and unit tests; another full 2,610-request extraction was intentionally not repeated during UI work. A first routine future refresh should be reviewed with its report before publication.

Every comparison record preserves its raw source row, exact stage amounts, source ID, source document URLs/page references, source record URL, implementing office, status, metadata and retrieval time. A normalized envelope makes the mapping explicit. Historical families preserve original amounts by year, raw rows, stable family keys, search reasons and retrieval time. Missing values are null; source-provided historical zero entries remain original.

First-run GAA response-envelope build metadata was not retained and is explicitly null. No comparison build date is substituted. Family-level PDF/record URLs remain null where not supplied; department/query links remain available. Future extraction retains the original historical envelope where exposed.

## 6. Analytics and interactions

| View | Implemented behavior and boundary |
| --- | --- |
| A | Grouped NEP/House bars over the same selected record union; exact amounts, difference, valid percentage, source/snapshot note and table |
| B | Descending proposed program totals using the selected 2027 stage |
| C | Three-province title-associated record counts; no invented provincial monetary allocations; associations may overlap |
| D | Segmented horizontal count bar for six source comparison classes with two-column table; classifications do not establish misconduct |
| E | GAA title-family line trend, 2020–2026, department/geography and year-range controls; missing positive appropriations form gaps |
| F | Eight highest published amounts in the selected scope/stage, exact title table and expandable program/source evidence; rank is not priority |
| G | Same-family, enacted-stage year-over-year variance table; missing/zero baseline percentages remain unavailable |
| H | PSGC locality matrix with explicitly unverified title matches; no invented coordinates or boundary licensing claim |

Province/locality/program/status/stage controls use shareable URLs and transfer applicable filters to the explorer. Historical department/year controls are separate because 2027 program classes are not the historical universe. All chart views include source notes and table access. The complete source-confirmed regional NEP rollup is separately labeled below Analytics.

## 7. Page-by-page outcome

| Page | Change |
| --- | --- |
| Welcome | New logo/name/subtitle/tagline; three-province introduction; current legal version; public/no-account promise; decline/read-before-entry/return paths |
| Overview | Compact editorial summary, dated provenance, real comparison metrics, three province entry points, explicit scope caveats |
| Projects | All 866 deduplicated records; search, province/locality title filters, program/status/office/reason/stage, funding bounds, sort/load-more, CSV |
| Project detail | Existing live integration, exact source identity/amounts/PDF pages/uncertainty; clearly dated cached comparison if live request fails |
| Provinces | Searchable 63-entry directory and all required province routes with official codes and listing-date caveat |
| Localities | PSGC-based profile, correct province/type/code, Bacolod HUC note, associated searchable projects |
| Analytics | Six SVG charts plus variance table and coverage matrix; shared filters, keyboard tooltips, exact native tables |
| History | Dated static families replace repeated visitor-time extraction; GAA years/department/search, office context and CSV retained |
| Coverage | Batched/searchable query ledger, years/date/counts/overlaps/uncertainty, completeness and execution limits, failed-refresh disclosure |
| Methodology/About | Current identity, sources, definitions, geography/classification limits, independent status and attribution |
| Terms/Privacy | Regional branding/version and actual static/API/self-hosted-font practices; operator/legal TODOs remain explicit |

The unified multi-source/multi-year project explorer requested in the brief is **not implemented**: Project Explorer is the FY2027 comparison universe; historical browsing uses its dedicated page. No unsupported execution/local project data is merged to simulate it.

## 8. Bugs and validation

See [UI_QA_REPORT.md](../../UI_QA_REPORT.md) for reproduction, severity, fixes and limits. Fixed during regional QA: wrong province heading, obsolete footer logo path, 320px About overflow, source-region reasons mislabeled as title matches, missing/null percentage formatting, fractional count ticks, dense classification table layout, outage loss of available snapshot, and candidate pointer sequencing. Legacy malformed-fragment/filter/CSV/promise/menu fixes remain covered. Not every conceivable fault is certified fixed.

Final recorded results:

- **29 automated tests passed; 0 failed.**
- **TypeScript/Vite build, ESLint, published data validation and report command passed.**
- **npm audit: 0 vulnerabilities reported.**
- **112 route/viewport checks**, including welcome, across all seven requested widths; no final document overflow/broken image findings.
- **16 final browser workflow checks passed**, including acknowledgment/return/deep link/menu, filtered charts/explorer, actual CSV download, live detail, isolated API outage, directory search, history year/range, coverage paging/search and keyboard tooltip.
- Two sample PDF endpoints returned HTTP 200/application/pdf. All source PDFs/pages have not been exhaustively opened.
- Final normal browser tab inspection had no console errors/warnings. The isolated outage deliberately caused a failed API request and was stopped afterward.

Evidence files live in this directory: tests/lint/build/validation/report logs, browser-workflows.json, responsive-geometry.json, keyboard-tooltip.json, document-links.json, amount audit, exact exported CSV, snapshot metrics and screenshots. These are local evidence, not production/device acceptance.

## 9. Performance and static packaging

Overview uses a ~2.1KB manifest, ~9KB summary and ~38.5KB source overview before compression. No full project or history JSON is imported into the initial bundle. Deferred project/history files are ~6.39MB/~10.87MB raw, with locally calculated gzip sizes ~162KB/~369KB. Real host encoding and device parsing remain unmeasured. Further department/year/province partitioning is useful follow-up work.

Current production output: entry ~266KB / 82KB gzip; shared router chunk ~39KB / 14KB gzip; deferred Analytics ~402KB / 115KB gzip; CSS ~48KB / 10KB gzip. Four Latin WOFF2 faces total ~49KB. No Lighthouse/Core Web Vitals or physical low-end-phone benchmark is claimed.

Static output is `dist/`, including snapshot data, logo, manifest and license. Existing hosting configuration supports SPA deployment without a database or application server. The normal local server remains running at port 5132. Review ZIPs, package hashes and ZIP validation are under `release/regional/`. Earlier archives remain unchanged.

## 10. Production gates and exact next work

1. **Latest official geography:** obtain the September 2026/current PSA release through an authorized download, compare all codes/names/types/province and HUC membership against geography.json, preserve source evidence, update listing date and tests. Do not claim current-release certification until this is done.
2. **Operator/legal:** actual operator supplies legal identity, privacy contact, processors/hosting/logging/retention and contact procedures; obtain legal review, finalize notices and bump version for material changes. Do not invent these details.
3. **Coverage recall and crosswalk:** audit legacy VI/VII office/place spellings and records lacking qualified names; record additional supported queries and ambiguous cases. Review title associations manually before introducing any local monetary totals. Retain missing execution as not geographically attributable.
4. **Routine refresh:** run the current `data:refresh` once when appropriate, review source build/sums/counts/error report, compare stable-ID differences and promote only a valid extraction. Investigate historical family PDF/build metadata endpoints where supported.
5. **Performance/source exploration:** split high-volume history/project shards and measure slow-network/low-end-phone behavior. Define a source/year-aware explorer without mixing appropriations, proposals and execution.
6. **Independent acceptance:** physical iOS/Android, Firefox/Safari, screen readers, contrast audit and genuine owner acceptance. Current Chromium viewport checks are not those results.
7. **Hosting:** select approved public host/domain, set siteUrl, rebuild, then verify unauthenticated access, SPA deep links, security/cache/compression headers, social previews, privacy practices and source links. No deployment is authorized or claimed by this report.

This preserves a usable, reviewable regional portal while making the remaining work concrete. It is not a claim that every regional government budget record has been collected or that public-release gates have been satisfied.
