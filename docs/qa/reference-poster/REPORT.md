# NIR reference poster repair — 3 November 2026

The owner requested removal of the welcome-screen review-status sentence and a close visual match to the national “We are not ignorant” reference, limited to Negros Island Region records.

Implemented a standalone cream newsprint page with Anton headline, red emphasis, original generated halftone illustration, real-record background text, black CSV action, dense numbered project grid and dark source footer. The portal masthead/footer remain on ordinary views and return when following a project link. Filters are available in a disclosure so the initial reading layout stays close to the reference. Titles remain complete links to existing record/evidence tools. The circular return-to-top control is retained.

Removed the specified welcome sentence and its unused style. The Terms and Privacy links, entry acknowledgment and actual legal/operator information are retained. Removing status copy does not resolve the operational conditions in `docs/RELEASE.md` and is not a privacy compliance finding.

## Data and source boundaries

- Snapshot remains `2026-11-02-37334582ca74`, retrieved `2026-11-02T12:01:31.325Z`; all seven data checksums pass. No published source records were edited.
- Default list: 233 records (211 House-only, 11 higher, 11 lower), drawn only from the 851 source-confirmed NIR records. Fourteen source-marked unconfirmed change pairings remain excluded by default; opting in produces 247 records with visible uncertainty flags.
- Province filters remain title associations, not certified project locations. Office-only and place-only regional inferences are excluded from this campaign.
- House stages remain third reading for DPWH and second reading for the other programs. House-only is not a finding of wrongdoing or proof of absence from every NEP document. Proposed amounts are not spending.
- CSV follows active filters and adds snapshot date, exact House reading, source notices, scope caveats and responsible-sharing text to the existing exact amounts, null handling, source links and spreadsheet-formula escaping.
- Provider, operator and national visual inspiration are attributed without an endorsement claim. Font files and illustration are hosted locally. [Asset provenance and full prompt](../../branding/nir-reading-hand-v1.md).

## Verification

- `npm run verify`: PASS (data validation, display-field privacy pattern triage, all published JSON pattern triage, 60 tests, lint, TypeScript/production build and deployment-policy consistency).
- `npm audit --omit=dev`: zero reported vulnerabilities.
- Published-JSON pattern scan: 11 files, 268,663 strings, no pattern flags. This is pattern triage, not legal certification or a review of linked PDFs.
- In-app Chromium browser: 320, 375, 768, 1440 and 1920 px. No horizontal page overflow, clipped heading/button text or broken images. Default 233 cards retained at every width. WCAG text-spacing preview also reflowed at 320/375/768/1920 px without clipping. [Responsive results](responsive.json), [spacing results](text-spacing.json).
- Actual browser downloads parsed and compared against the published source: default 233 rows and Siquijor-title filter 30 rows. All exact values, missing values, source URLs, dates, budget readings and full source notices match. [CSV validation](csv-validation.json).
- NIA filter: explicit no-matching-records state and disabled empty download. This does not claim zero funding. Reset restores the list; including unconfirmed pairings displays 247 cards and 14 uncertainty badges.
- Followed the first project into its actual detail page; ordinary portal navigation, exact record identity and evidence/compare links returned. No browser console errors observed.
- Fresh-origin welcome inspection: specified review line absent; notice links present; entry remains disabled before acknowledgment. No agreement was accepted in that test.
- Axe 4.14: no automated violations in desktop default and mobile with filters/source notices expanded. Four desktop contrast checks require manual review because the decorative text/image underlays overlap the headline; the mobile run also encountered a status line covered by the development audit panel. Decorative text is `aria-hidden`; headline spans have solid paper backgrounds. Primary palette ratios pass their relevant thresholds in [contrast results](contrast.json). These observations do not constitute a full WCAG conformance assessment.
- Browser resource inventory contained no third-party font or illustration requests. Accessibility controls are development-only and excluded by production builds.

## Visual evidence

- [Desktop poster](desktop-1440.png), [wide desktop](desktop-1920.png), [dense record grid](project-grid-1440.png), [phone](mobile-375.png), [welcome](welcome-1440.png).
- [Desktop automated audit](axe-desktop.json), [expanded mobile automated audit](axe-mobile-expanded.json).

Local/browser evidence covers Chromium viewport emulation, not independent browsers or physical devices. Source publication and successful checks are separate from public hosting. No public website deployment was performed as part of this repair.
