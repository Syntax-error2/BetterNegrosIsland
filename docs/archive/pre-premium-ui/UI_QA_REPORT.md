# BetterNegrosIsland — UI and engineering QA

Date: 2 November 2026. Scope: the local Windows checkout and Chromium-based in-app browser, not a production deployment or physical-device certification.

## Skills actually loaded

Installed Sites skill: `C:/Users/daveh/.codex/plugins/cache/openai-curated-remote/sites/1.1.2/skills/sites/SKILL.md`, with its presentation-led design and local-preview references. Applied to hierarchy, typography, content progression, design tokens, responsive implementation and browser review. Dedicated UI/UX, visual-design, frontend-design and visual-QA skills were absent from inspected project/user/configured skill directories; no use of those missing skills is claimed. Visualize was inspected but excludes repository components and was not applied. See DESIGN.md and FRONTEND_CONTRACT.md.

## Executed checks

| Check | Result / evidence |
| --- | --- |
| TypeScript and Vite production build | PASS; `docs/regional/build.txt` |
| ESLint | PASS; `docs/regional/lint.txt` |
| Automated unit/integrity tests | 29 passed, 0 failed; `docs/regional/tests.txt` |
| Published data validation | PASS; seven SHA-256 shard checks plus identity/count/money/provenance/geography/NEP/query reconciliation; `docs/regional/validation.txt` |
| Additional live source amount audit | All 30 project queries: count and NEP/second-/third-reading sums reconciled against unchanged source build; `docs/regional/project-sum-audit.json` |
| Route/viewport geometry | 112 checks: 15 routes × 7 widths plus welcome × 7. No final page overflow or broken image findings; `docs/regional/responsive-geometry.json` |
| npm dependency audit | 0 reported vulnerabilities; `docs/regional/npm-audit.json` |
| Browser workflows | 16 final recorded checks pass; `docs/regional/browser-workflows.json` |
| Browser console | No errors/warnings in the final normal-flow tab inspection; isolated outage tab intentionally produced a failed API request |
| Sample original PDF endpoints | Two HTTP 200, application/pdf; `docs/regional/document-links.json`. Not an audit of every external link/PDF page |

Widths: 320, 375, 390, 768, 1024, 1440 and 1920 CSS pixels. Core routes: overview, projects, analytics, province directory, all three province profiles, Bacolod and Lazi locality profiles, history, coverage, methodology, about, terms and privacy. Data-loaded history and analytics were awaited in the final route matrix. Geometry checks establish document fit, not universal visual/accessibility correctness.

## Functional evidence

- Welcome entry disabled until acknowledgment; decline leaves no saved acknowledgment. Terms readable before entry, keyboard return works, a requested filtered deep link survives entry, and returning visitor uses the current regional version.
- Mobile menu closes on Escape and restores focus. Semantic landmarks, skip link, labeled native controls and existing focus treatment retained.
- Siquijor/HFEP analytics and explorer both show two unique source records. Exact comparison table: NEP PHP 36,000,000, House PHP 100,000,000. Missing other programs show Not available.
- Actual CSV download has UTF-8 BOM, one header and two data rows, exact pesos and source/provenance columns. Captured `siquijor-hfep-export.csv`.
- Live HFEP infrastructure detail shows PHP 16,000,000 NEP and PHP 50,000,000 House, original source identity and document page URLs. Separate medical-equipment record remains separate.
- A temporary isolated dev server on port 5133 used an unreachable API override. The app displayed the retry action and the last verified cached comparison with its actual date, scope and source links. That test server/tab was stopped; normal port 5132 was kept running.
- Bacolod directory search isolated the HUC entry. Historical year 2026 shows 602 of 5,253 families and a shareable year URL.
- Coverage pagination expands 100 to 200 reports. Searching Budget cycle displays NOT GEOGRAPHICALLY ATTRIBUTABLE.
- Arrow keys on the comparison chart expose actual PHP values, delta, percent and snapshot/source note. Recorded tooltip: `keyboard-tooltip.json`. The 2024–2026 historical range has three exact annual values; table alternatives are native expandable content.

## Visual review and fixes

Reviewed desktop overview/analytics/explorer, narrow About, welcome, province/locality composition and saved responsive evidence. Typography uses self-hosted Plus Jakarta Sans with coherent scale and tabular numerals; SVG series use restrained blue/teal and written labels. Graph D uses a segmented count bar and a compact two-column table. Motion is disabled for marks and reduced-motion styling remains. No proprietary boundary map or invented coordinates were introduced.

| Severity | Reproduction / cause | Remediation / verification |
| --- | --- | --- |
| High | Rejected project request prevented viewing available cached comparison during API outage | Added explicit dated fallback with original amount/source links; isolated unreachable-API browser test passed |
| Medium | Locality profile heading assumed Negros Occidental for Lazi/Siquijor | Derive province/type/code from PSGC entry; all three provinces and Lazi/Bacolod checked |
| Medium | Narrow About heading overflowed at 320px because regional brand was unbreakable | Added a semantic word-break opportunity; 320px screenshot and final matrix pass |
| Medium | Footer referenced predecessor favicon path | New supplied logo derivative used; final matrix has no broken images |
| Medium | Region inclusion reasons were described as title matches in tooltip/filter/export | Explicit source-region wording in all three representations; inspected regional project/CSV source |
| Medium | Refresh could expose a pointer before normalization finished | Candidate finalization/validation precedes single pointer promotion; corrupt checksums and count disagreements fail closed in tests. Full process-kill/filesystem fault injection remains untested |
| Low | Empty comparisons could append percent to Not available; count axes could show fractional records | Conditional percent formatting, integer count axes, exact-value tables; browser tooltip/table checks |
| Low | Legacy office hash could target content inside closed disclosure | Open enclosing native details before scrolling; legacy route retained. Full anchor/key-path regression remains a follow-up |

Previously implemented district-sprint fixes (malformed fragments, funding range validation, query reset preserving unrelated parameters, promise observation, menu focus and safe CSV) remain covered by the automated suite. Their older evidence remains historical, not a substitute for current regional QA.

## Performance observations

The overview does not fetch the full project/history shards. Current manifest is about 2.1KB, summary 9KB and source overview 38.5KB before compression. Project shard ~6.39MB and history ~10.87MB are deferred; locally measured gzip sizes are ~162KB and ~369KB respectively. This is a compression calculation, not evidence that a real host serves these encodings. See `payload-sizes.json`.

Current production bundle measurements are in build.txt: entry roughly 266KB / 82KB gzip, separate router/shared chunk about 39KB / 14KB gzip, deferred Analytics about 402KB / 115KB gzip, CSS about 48KB / 10KB gzip. Four local Latin WOFF2 faces total about 49KB. No Lighthouse, Web Vitals, physical low-end-device CPU or real-network benchmark is claimed. Further project/history partitioning and measured slow-network tests remain useful.

## Known limits and next work

1. Public launch remains blocked on real operator/privacy contact, legal review, approved host/domain and acceptance.
2. Latest PSA workbook was blocked; accessible July 2025 lists are dated openly. Reconcile against an authorized current official download before claiming current-release validation.
3. Title-based geography is not verified physical location. Historical VI/VII labels are preserved, but no authoritative monetary crosswalk or exhaustive search-recall audit was completed.
4. Source execution cannot be assigned locally. No NIA matches were returned by the documented queries; zero matches are not zero funding.
5. First-run GAA envelope build metadata and family-level PDFs/URLs are absent where unsupported/not captured. Nulls are explicit; do not infer them from comparison metadata.
6. Project Explorer is the FY2027 comparison universe. Historical fiscal-year/source browsing is a separate view; a unified multi-source/multi-year project explorer is not implemented.
7. No physical iOS/Android, Firefox/Safari, assistive-technology, contrast-tool or formal WCAG certification. Run independent keyboard/screen-reader/device and owner acceptance checks.
8. No automated hosted schedule, production compression/security/cache-header acceptance, domain social preview, remote fork or deployment has been performed.

Verdict: suitable for local review and static packaging, with these disclosed limitations. Not approved for public production release.
