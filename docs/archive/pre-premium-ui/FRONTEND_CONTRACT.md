# BetterNegrosIsland frontend/data contract

## Public access and identity

Static React/TypeScript/Vite application. No accounts, database, paid access, visitor location, optional analytics, or always-on backend. BetterNegrosIsland is the product; “Powered by BetterGov.PH Budget Data” and original MIT attribution remain. The local folder retains its predecessor name for checkout continuity only. Legal drafts remain unapproved and require actual operator details. New regional legal version/storage key require a fresh acknowledgment. Legal links preserve a return path, and storage denial permits current-session memory entry.

## Geography

`src/data/geography.json` contains 63 unique 10-digit codes from the official PSA browser lists: 19 cities, 44 municipalities. Three province groupings, with Bacolod explicitly retaining HUC code 1830200000. Listings themselves are dated 31 July 2025. The September 2026 release exists; its workbook returned a web challenge and its newer rows were not imported. Never silently relabel the list as a verified 2026 workbook. Source URLs/date and this limitation appear in the directory/coverage pages.

NIR source region key and current NEP code 18 are distinct from PSGC codes. Historical VI/VII labels remain unchanged. Province-title matches and locality-title matches are candidate associations, not physical location certification. Siquijor province is not automatically a match to the namesake municipality. Unknown locality remains unknown. Province counts overlap and are not additive; provincial allocation totals are intentionally withheld.

## Snapshot flow

`npm run data:discover` inspects/saves the API specification. `data:fetch` and `data:refresh` run the conservative collector; `data:validate` and `data:report` read the published manifest and validate the comparison shard. All scripts are implemented in `scripts/data-ingestion/`.

The collector follows HGAB offsets at 200 rows, GAA cursors at 500 rows, verifies source counts, checks duplicate identities, validates exact safe integer amounts, uses bounded transient retry/backoff and a descriptive User-Agent, and writes failures separately. District discovery is verified against its returned total; if it ever exceeds the single requested 200-row discovery window, the run fails instead of silently truncating. Four NIR project program queries are supplemented by discovered whole office ledgers and province/Bacolod searches. Historical extraction searches every department using province names, Bacolod, and province-qualified official locality names. This cannot find every record lacking those words. No nationwide GAA bulk copy is downloaded.

NEP region 18 is discovered from the source rollup and reconciled with its department breakdown. It is a broader separate dataset than the four-program project comparison and is never added to it. Budget-cycle coverage is discovered, but local execution values are not supported by those department/agency endpoints. The UI marks this NOT GEOGRAPHICALLY ATTRIBUTABLE.

Records retain raw source fields, source IDs, inclusion reasons, date, geo annotation, and applicable source envelope metadata. Missing amounts remain null. No percentage exists with a null/zero baseline. Exact sum operations reject unsafe integers. Refresh run IDs may differ by retrieval time; repeated extraction preserves stable record identities and deduplication, not byte-identical timestamped files.

Immutable snapshot files live under `public/data/snapshots/<version>/`. The public pointer is published only after extraction checks succeed. A failure report does not replace last known good data. Finalization generates a small manifest and summary, coverage ledger, and project shard checksum. Initial overview loads the small summary/metadata; project/analytics/history routes load their relevant shards. The complete historical file is deferred until requested; further year/province sharding is a possible performance improvement, not a current capability claim. Manual refresh is implemented; no unattended schedule has been enabled.

## UI state and source freshness

Snapshot dates remain visible. Project details may request a newer live record; their own source build must be used before comparing with snapshot figures. Lookup errors never create placeholder amounts. Applicable province/locality/program/status/stage filters live in query strings and chart-to-explorer links. The project funding bounds use the explicitly selected 2027 stage. Historical controls operate on their own GAA family scope and do not pretend 2027 program classes map to all historical departments.

All graphs have responsive SVG marks and expandable exact-value tables. Tooltips do not replace those tables. Reduced motion is honored. Semantic project rows, labels, main landmarks, skip links, visible focus, and mobile menu Escape behavior remain required. The coverage ledger renders reports in batches; search and “show more” must remain functional.

## Release gate

Successful lint/build/tests and complete pagination for query scope do not establish full budget completeness, legal approval, verified physical locations, deployment acceptance, screen-reader certification, or official affiliation. Open launch blockers must stay visible in the current QA report.
