# Community Spotlight and figure explanations — 3 November 2026

Implemented the two recommended citizen-facing additions in the existing local portal. No publishing, new financial data, account, geolocation, tracking, storage or external service was added. Existing release gates remain unchanged.

- **Community Spotlight:** homepage place selector covering the 63 existing directory entries, grouped by province with Bacolod explicitly included in regional navigation. A selection shows the exact annotated record count and up to three source-order title previews, with links to individual evidence, the locality explorer and collection coverage. A zero match is explained as limited snapshot coverage, not absent funding. The initial homepage retains its small summary load: the full project shard is fetched only on selection, through the existing snapshot cache. A pre-selection browser resource audit found no scope-shard request.
- **Explain this figure:** native keyboard-operable disclosures in shared KPI cards on Overview, Analytics and Explorer. Plain-language explanations cover NEP, House bill, source identities, uncertain pairings and House-only candidates. They retain null/zero, non-additivity, overlapping geography and proposal-versus-spending distinctions, with a methodology link. Shared grid tracks keep values and footnotes aligned when help opens; mobile explanations expand in normal document flow.
- **Locality correction:** integration tests found that the old locality filter's fallback collection reason treated province-level “Siquijor” queries as municipality matches (83 records instead of 16 annotated matches). Both Spotlight and locality pages now use the same explicit `locationMatches` annotations. All 63 community counts reconcile with the published summary. Source shards were not changed. Matching record identities, original financial amounts and nulls are retained.

## Verification

- `npm test`: 50 passed, 0 failed. Two new tests reconcile all directory counts and reject shared-office/province-reason false matches. Logs: `../critical-hardening/community-tests.txt`.
- ESLint, TypeScript/production build and offline snapshot validation passed. Logs: `../critical-hardening/community-lint.txt`, `community-build.txt`, `community-data-validation.txt`.
- Browser: Siquijor shows 16 records, three previews and a locality page with 16 rows; Binalbagan shows 10; Enrique Villanueva shows a qualified zero-match state. Native selector has 63 entries plus its placeholder. Keyboard selection/disclosure and locality navigation were exercised.
- Six selected-homepage responsive widths passed: 320, 390, 600, 768, 1024, 1440 (`responsive.json`). Expanded explanations passed layout/overflow/KPI alignment checks at 320, 390, 600, 768, 1440 (`expanded-help-responsive.json`).
- Two final axe audits (initial homepage at 1440, selected community with expanded help at 320) returned zero violations and no incomplete checks (`accessibility-final.json`). An initial visible-label/accessibility-name mismatch was found and corrected; initial results are preserved in `accessibility.json`. This is not a screen-reader or WCAG certification.
- Analytics SVG viewport, nonzero marks and exact chart/table parity still pass at 320 and 1440 (`chart-regression.json`).
- Screenshots: `community-1440.png`, `community-390.png`, `figure-help-1440.png`. Final layouts were visually reviewed.

Files: `CommunitySpotlight.tsx`, `FigureHelp.tsx`, shared `KpiCard.tsx`, `src/lib/community.ts`, Overview/Analytics/Home integration, `hardening.css`, and `tests/community.test.ts`. Frontend design guidance and the documented CUA browser workflow were reused. No translations, share-card generation or spending/progress tracking is represented as implemented.
