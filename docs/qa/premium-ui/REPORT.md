Public-copy redaction: personal operator attribution was removed at the owner’s request. Existing historical findings are unchanged; older commits and screenshots may retain earlier attribution.

# Premium UI/UX and privacy remediation — implementation report

Local review candidate, 2 November 2026. The supplied replacement logo and the remediation brief were implemented in the existing portal. Budget records, geographic scope and source calculation logic were retained. This report distinguishes engineering results from legal compliance, native browser/device verification and deployment approval.

## A. Audit and screenshot findings

The supplied image in this turn is the replacement logo. No separate owner table screenshot was attached; the current application was therefore inspected directly rather than making assumptions from a cropped image. Baseline screenshots cover 21 route/alias/fallback examples in `baseline/`.

At 1440px, the existing project grid had five columns: approximately 649 / 170 / 105 / 105 / 105 pixels. Change and Source shared the final narrow cell; source actions competed with differences. Values were abbreviated, with exact values available only through hover titles. Evidence tags were 9px in the active stylesheet. Row heights were content-driven in inspected rows: **no fixed-height row clipping was established**. A viewport screenshot's lower boundary was not treated as proof of a clipped row.

The inherited history used div-based table roles, with separate mobile header visibility rules. Financial tables had different styling and sizing. Optional summary/status/filter blocks pushed project results deep below the first screen. A regional office disclosure could expand to no content because an inherited district-only guard returned null.

## B. Applied structure and design

`DataTable` now owns native headers/rows/caption, colgroups, consistent spacing, numeric alignment and a labeled keyboard-focusable scrolling region only when needed. Project results, historical families, version amounts and all chart alternatives/variance use it.

Project columns: **Project details · Comparison status · NEP · House bill · Difference · Source action**. Full titles wrap; row heights follow content. Program, implementing office, original region and explicitly unverified title associations remain readable. Source and Details have dedicated actions. Exact pesos are visible, null/zero differ, and percentages are withheld for held/scope-review pairings or unavailable/zero baselines. Arithmetic does not certify the pairing.

At <=1099px the same project/history rows become cards without duplicated data-fetch/filter/sort logic. At 320px project amounts stack. Very large values enlarge the desktop table within its scroll frame; keyboard access reaches the final actions. User text-spacing overrides can reflow monetary values instead of clipping them.

The explorer defaults to search/results with aggregate context in an expandable disclosure. Advanced filters open when a shared URL has active filter parameters. The first table moved from roughly 1425px down the baseline page to about 811px in the reviewed desktop layout. Full context and status shortcuts remain available. The empty office disclosure was replaced with an actual coverage-ledger link; legacy `/districts` leads to that ledger.

One self-hosted Plus Jakarta Sans family remains; 15–16px project/body text, 14–16px full financial figures, 13px metadata and 12–13px evidence/labels. Tabular numerals, restrained surfaces, neutral unchanged status and explicit arrow/word comparison states replace cramped mixed treatments. Increases/decreases are not findings of wrongdoing.

## C. Replacement branding

Owner-supplied transparent PNG: 2167 × 726, 1,178,220 bytes. Its pixels are retained unchanged. Header, welcome, footer, favicon, application manifest and Open Graph/Twitter references use `brand/bni-regional-wordmark.png`. The previous logo assets and release evidence remain historical. No logo was generated or redesigned.

The entire wide mark serves as favicon; a purpose-made small square asset would improve 16px legibility. The original PNG is not claimed to be a bandwidth-optimized icon. Hosting caching/compression and optional owner-approved optimized derivatives remain follow-up work.

## D. Page outcomes

| Page | Remediation |
| --- | --- |
| Overview | Replacement brand, coherent global type, source-date context and an explicit reload action on summary failure |
| Projects | Six-column exact-value table, mobile cards, separate actions, improved context/filter hierarchy, readable scope evidence |
| Project detail | Shared native financial table, exact signed difference, safe original source links; dated outage fallback retained |
| Analytics | Shared exact-value tables; wrapped province labels; numbered ranked bars with expanded full-title table; narrow tooltip anchoring and disabled movement animation; source/date notes |
| History | Native eight-column exact-peso table and responsive year cards; existing year/department/search/CSV behavior retained |
| Province/locality profiles | Shared shell/type and reconstructed project rows; existing PSGC/title-association limits preserved |
| Coverage | Readable ledger, real office query destination, explicit unavailable-report state/reload rather than contradictory perpetual loading |
| Methodology/About | Consistent typography; About names the owner-supplied operator and preserves independent status/BetterGov.PH attribution |
| Welcome/Terms/Privacy | Replacement logo; precise acknowledgment wording; updated version; operator named; hosting/rights/retention decisions remain explicit |

## E. Severity-ranked issue register

| Severity | Finding / root cause | Fix / verification |
| --- | --- | --- |
| High | At 320px, comparison tooltip extended to ~338px while the document client width was 305px; page-only overflow checks missed it | Anchor narrow tooltips inside the chart, constrain width and disable movement animation. All ten final tooltip-bound checks pass |
| Medium | Five-column layout mixed Difference and Source; abbreviated values and tiny evidence text hindered financial reading | Six-column native table, full pesos, separate controls and deliberate type scale. Source/model/browser/SSR checks pass |
| Medium | Very large numbers need more than fixed normal columns | Expand genuinely wide desktop table inside accessible overflow; mobile amounts get more room. Extreme safe-integer fixture and horizontal keyboard checks pass |
| Medium | Table implementations and mobile semantics differed | Shared native table system, preserved headers/roles, common card layouts. Browser axe/geometry/interaction checks recorded |
| Medium | Legacy regional office disclosure was empty under the district-only display guard | Show source coverage link instead; legacy destination reaches real ledger. Browser regression passed; no budget scope rule changed |
| Medium | Prior privacy text still lacked the operator; notice acknowledgment could be mistaken for general consent | Owner-supplied identity and explicit notice-only wording, legal version bump; no privacy contact added. Browser legal/deep-link/return tests passed |
| Medium | Speculative API preconnect was unnecessary for snapshot-only pages; inherited optional portrait embedding could contact external hosts | Removed preconnect, use optional source-credit links instead of automatic portraits, add HTML no-referrer and retain safe links. Sample request-origin evidence recorded |
| Low | Ranked title axes truncated long names; province labels needed wrapping | Numeric rank labels with expanded complete-name table and wrapped province labels. Sixty chart-container label checks pass |
| Low | Count-table helper text could wrongly imply PHP; error/loading text could conflict | Explicit count units and clear unavailable/reload states. Inspected/build-checked; missing-host-shard fault injection is not claimed |
| Low | Too much optional context preceded results | Progressive disclosures preserve context while bringing rows earlier. New disclosure/filter interaction and layout checks passed |

The lower edge of a viewport capture remains a capture boundary. No row clipping fix is claimed without evidence of actual clipping. Retained pre-sprint images are not substituted for current results.

## F. Browser and accessibility evidence

| Check | Recorded result |
| --- | --- |
| Core route/fixture viewport matrix | 180 cases: 18 routes/states × 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920px; no recorded page overflow, clipped title/money/action or broken image findings |
| Compatibility/fallback routes | 10 checks at 375/1440px; all fit and reached meaningful destinations |
| Reflow equivalents | 20 checks for nominal 100/125/150/200/400% at width equivalents 1280/1024/853/640/320; no recorded overflow/clipping. **Not native zoom evidence** |
| Graph labels | Six SVG graphs × ten widths; tick labels stayed within chart bounds |
| Repaired tooltip bounds | Ten widths; no viewport escape or clipped tooltip content width |
| WCAG text spacing | Eight key-page cases at 320/1440, with 1.5 line height, .12em letter spacing, .16em word spacing and 2em paragraph spacing; no recorded title/money/action loss or page overflow |
| Browser workflows | 28 final checks pass, covering search, geography/program/status/stage/year filters, sort, pagination, exact CSV, source/detail links, back/forward, chart synchronization, menu, empty state, API outage and acknowledgment |
| axe-core | 14 recorded page/state audits using local axe 4.14.0, WCAG 2 A/AA, 2.1 A/AA and 2.2 AA tags; no violations returned in recorded audits |
| Contrast sampling | 19 computed foreground/nearest opaque-background pairs meet 4.5:1 normal-text threshold |

Axe reported incomplete contrast checks, including decorative non-text characters. Computed-color sampling helps investigate these; it is not a complete non-text/graph/photographic contrast audit. Native keyboard zoom did not change the in-app viewport/DPR; it was reset. True 125–400% zoom, physical devices, Safari/Firefox and assistive-technology behavior remain unverified. No WCAG certification is claimed.

Synthetic fixtures are conspicuously labeled, development-only and excluded from production. They include the owner's long Binalbagan example, large safe-integer values, nulls, zero, comparison classes and HTML-like text. They never replace government records. The new SSR regression verifies full text/values, six headers, independent source cells, escaping and safe external-link attributes.

Relevant machine records: responsive-geometry.json, compatibility-routes.json, reflow-equivalents.json, chart-bounds.json, tooltip-bounds-final.json, text-spacing.json, axe-results.json, contrast-ratios.json and browser-workflows.json. Final screenshots are in `final/`; source CSV capture is `export-siquijor-hfep.csv`.

## G. Verified processing inventory

| Processing | Verified implementation / limits |
| --- | --- |
| Acknowledgment | One current-version string, browser-local; no portal backend transmission. Blocked-storage behavior covered by unit test; current draft entry/decline/returning/deep-link tested in browser |
| Static assets/snapshots | Host requests can reveal IP, time, headers, path/query. Host not selected; processors, location and retention cannot be verified yet |
| Live detail | Sampled detail makes one expected BetterGov.PH API fetch; provider gets ordinary request information. No local acknowledgment in the request URL/body |
| Filters | Local computation over static data; shared/reloaded URLs can be present in host logs. Privacy Notice warns against entering personal information |
| Fonts/charts/logo | Self-hosted in application; no external font service or hosted chart script. Sample overview resources had only localhost origin |
| External PDFs/maps/credits | Contact separate providers when followed; safe links and no-referrer behavior configured. Source photos no longer auto-embed |
| Public records | Display-field identifier triage scanned 866 comparisons and 5,253 families: zero pattern flags in this snapshot. This is not comprehensive PII detection, legal clearance of public data or linked-PDF review |
| Development testing | Local-only audit/fixtures; no remote monitoring service. Vite/HMR is development infrastructure, not production tracking. These tools compile out of the production application |

No login, registration, passwords, OTP, email/phone form, visitor GPS, residence/ID verification, payment, advertising tracker or behavioral monitoring was added. No tracking integration was found in the application source or sampled resources; an exhaustive audit of every dependency/provider behavior is not claimed. Development dependency axe runs locally. Dependency vulnerability audit is recorded separately.

## H. Data Privacy Act engineering review

Reviewed against official NPC sources: [RA 10173](https://privacy.gov.ph/data-privacy-act-/), [IRR](https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/), [right to be informed](https://privacy.gov.ph/the-right-to-be-informed/) and the [current issuances index](https://privacy.gov.ph/pips-and-pics/advisories-circulars/), including Circular 2023-04 on consent. Some direct NPC fetches returned 403 in this environment; official indexed text and accessible official references were used. No access control was bypassed.

The engineering approach minimizes collection and explains real technical processing. The notice separates agreement to Terms/receipt of information from consent to personal-data processing. No optional consent-based processing was added. If introduced later, it needs its own defined purpose, appropriate lawful criterion and, when applicable, specific consent/withdrawal controls. No arbitrary retention period or automatic deletion was invented.

**Operator supplied by owner:** [personal operator attribution removed from this public copy]. **No privacy contact is published, as explicitly requested.** No contact address, DPO identity, legal registration or hosting provider was invented.

Public-release decisions still needed: operational rights-request/correction procedure, appropriate lawful criteria, hosting/processor arrangements, technical-log retention, international processing assessment where applicable, publication safeguards and legal review. The absence of a published portal privacy contact/procedure is disclosed; it is not silently marked compliant. This is an engineering review, not a legal certification.

## I. Security and reliability

React escapes public text; fixture markup remains text. Document actions reject unsafe schemes and do not substitute a dead hash when no safe source exists. Existing CSV formula neutralization remains and new exact exports were downloaded/checked. External links use noopener/noreferrer. HTML suppresses referrers; configured static CSP adds explicit self-hosted font/manifest and no-frame restrictions. Actual host enforcement, TLS/logging/cache/compression are not verified until a host is selected. Inline style allowance remains necessary for the current chart/layout implementation and is not hidden in a claimed strict-CSP certification.

The isolated test server used an unreachable API override; live detail showed retry plus the correctly dated cached comparison and original source links. The test server was stopped; the main localhost:5132 preview remains running. Normal static snapshot values were not fabricated in error states.

## J. Verification and data preservation

Final build/lint/unit/data/privacy/audit results and integrity comparison are recorded alongside this report. The protected data invariant is the same manifest version and identical seven snapshot shard hashes, not merely similar displayed totals. No ingestion refresh was run during this UI sprint.

Two original PDF endpoints were checked: HTTP 200/application/pdf. URLs/page fragments were checked from live detail and source actions. Every PDF/page has not been exhaustively opened or reconciled anew. Existing comparison query audits and source caveats remain in docs/regional.

## K. Remaining work by severity and readiness

**Release blockers:** legal/privacy completion (including rights-request handling while no portal contact is published), selected host/provider/retention and actual security/cache/compression verification, genuine owner acceptance. Prior latest-PSGC workbook reconciliation remains open; this UI sprint did not certify a newer directory.

**Medium verification gaps:** native 125–400% zoom, screen-reader/cross-browser and physical device acceptance; exhaustive private-identifier/linked-PDF review; host missing-shard/failure and HTTP-header acceptance; real low-bandwidth performance measurements. Recorded axe/color/reflow tests do not replace them.

**Low follow-up:** optimized/dedicated small favicon artwork from the owner, optional optimized logo derivatives, further large snapshot partitioning and cleanup of superseded CSS once independent regression coverage is established.

**Verdict:** implemented and working for local review/static packaging, with the above explicit limits. **Public production release is not yet approved. No Data Privacy Act or WCAG compliance certification is claimed.**
## Final engineering check outcomes

- Production TypeScript/Vite build: PASS (`build.txt`).
- ESLint: PASS (`lint.txt`).
- Automated unit/integrity/render tests: **34 passed, 0 failed** (`tests.txt`).
- Published data validation: PASS (`data-validation.txt`).
- Privacy display-field triage: 0 pattern flags (`privacy-source-triage.json`).
- npm dependency audit: **0 vulnerabilities reported** (`npm-audit.json`).
- Integrity: original manifest and all seven protected source shards unchanged; built data matches those hashes. Replacement PNG matches the retained original, with no text/EXIF metadata chunks. QA markers/route/library UI are absent from production JS (`integrity.json`).

The build emitted a plugin timing diagnostic under parallel check load; it completed successfully. Timing diagnostics are not a deployed performance measurement. Final review ZIPs and member/hash checks are under `release/premium-ui/`; older regional archives remain intact.
Final post-refinement recheck: 30 additional explorer/extreme-fixture/analytics cases across the same ten widths passed after the final layout changes (`final-layout-recheck.json`).
