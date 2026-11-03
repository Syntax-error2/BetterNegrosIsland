# Responsive analytics and invisible-bar remediation

**3 November 2026 · local implementation/review.** Existing BetterNegrosIsland checkout, upstream BetterGov.PH foundation and MIT attribution retained. Normal preview: `http://localhost:5132/analytics`. No public deployment or legal acceptance is implied.

## 1. Root cause and before evidence

Installed chart library: **Recharts 3.10.1**, confirmed from the installed package. The supplied attachment contains the sprint text, but no separate screenshot file. Actual browser baseline screenshots and SVG measurements were captured before editing.

The shared `DataChart` prepared `chartRows` with an `axisLabel` property, but passed **the original `rows`** to `BarChart`. Its horizontal categorical YAxis requested `axisLabel`, which was missing from those input objects. Amount keys were present, numeric and nonzero; containers had measurable dimensions and visible fills. The axes/layout orientation was already conceptually horizontal, so changing a layout flag alone would not repair it.

| View | Before: visible nonzero bar rectangles | After: rectangles matching positive source values |
| --- | ---: | ---: |
| A, grouped NEP/House | 6 | 6 |
| B, program amounts | 0 | 3 |
| C, province associations | 0 | 3 |
| D, document classifications | 0 | 6 |
| F, ranked projects | 0 | 8 |

A had a scale/readability problem rather than an invisible-bar defect. E is a line chart; it is verified by its seven source points, not a bar count. Earlier bounds-only checks did not assert positive bar geometry and missed this bug. This sprint adds that missing rendered-geometry regression guard.

Evidence: [before desktop](before/analytics-1440.jpg), [before phone](before/analytics-390.jpg), `before/geometry.json`. The baseline even shows a valid DPWH tooltip over an empty B plot, confirming that missing financial data was not the cause.

## 2. Data mapping and individual chart repairs

`src/lib/analytics-data.ts` now centralizes strict numeric normalization, source-identity deduplication, scope filters, program/province/status aggregation, ranking and plot extent. Both BarChart and LineChart receive the **same normalized model** that supplies their axes and exact-value tables. Numeric strings, NaN and Infinity are not coerced to invented money. Zero remains zero; missing remains unavailable. Safe-integer sums guard program and whole-selection monetary totals. Conflicting duplicate identities fail closed rather than inflating results.

- **A:** grouped NEP/House comparison retains one zero-based common monetary scale. A labeled per-program focus control offers a recalculated zero-based scale, with that change disclosed. It does not change global counts or silently override active source filters. On narrow cards, grouped horizontal bars replace the miniature vertical plot. No truncated scale, log scale, normalized fake money or unrelated independent scales were introduced.
- **B:** numeric X axis, categorical Y axis, matching `axisLabel`, descending stage-specific amounts, bounded bar thickness and readable compact end labels. NIA remains unavailable where the documented queries found no amounts; it is not a fabricated zero budget. A visible availability note identifies missing categories/stages even while the exact table is collapsed.
- **C:** horizontal integer record counts: Negros Occidental **432**, Negros Oriental **189**, Siquijor **74** in the default union. These are overlapping title associations, not official provincial allocations or verified locations.
- **D:** replaced the single-row six-series stack with one horizontal count series across six shared status names: Increased **11**, Decreased **11**, Unchanged **581**, House bill only **232**, NEP only **27**, Scope review **4**. Total **866**. The **14 unconfirmed pairings** are an overlay within those groups, not extra records or an additional amount to sum. Table and chart names share one constant; original source wording remains available in the project table.
- **F:** the same category fix repairs ranked bars. Rank labels preserve plot space; full titles, exact money, source/evidence links and tooltip content remain available through native disclosures. Its exact-value table now uses the same collapsed disclosure pattern as the other charts, avoiding a long automatically expanded mobile table.
- **E/G/H:** historical line gaps remain missing positive appropriations rather than zero funding. Small-screen year ticks may skip labels to prevent collisions; all source points and years remain in the table and links. G remains an exact year-over-year table; H retains accessible locality links/counts. Their separate scopes were not merged with 2027 totals.

## 3. Responsive chart architecture

The existing supported `ResponsiveContainer` mechanism is reused; no second resize library or chart package was added. A nonzero parent height is explicitly supplied. Resize callbacks retain state only when measured width changes. Parent width measurement responds to viewport changes, revealed hidden containers and remounts; cleanup remains library-owned and was exercised in the browser. A production resize probe also found a transient overflow from the prior desktop-sized initial dimension/stale SVG surface. The hardcoded initial size was removed and the wrapper/SVG are constrained to their component's current width, without hiding global overflow. The repeated production probe passes both immediate and settled containment at five widths (`production-smoke-final.json`); the initial finding is retained separately.

Plot height follows content: horizontal plots use row count × useful row space plus axis margins, with 220px minimum. Default B is 234px, C 220px, D 322px, F 410px; A/E use 300px when vertical. Grouped mobile A allows additional row space for its two series. No fixed desktop plot width or CSS rotation is used.

The analytics grid uses two columns at **1200px and above**, one below. Financial/card children use `min-width:0`; table overflow stays within a labeled keyboard-focusable region. The two-series exact table has a 640px internal minimum with protected monetary columns, not a global page overflow workaround.

Official library references: [BarChart](https://recharts.github.io/en-US/api/BarChart/), [YAxis](https://recharts.github.io/en-US/api/YAxis/), [ResponsiveContainer](https://recharts.github.io/en-US/api/ResponsiveContainer/). Installed keyboard middleware was also inspected: Left/Right are the supported traversal keys even for horizontally drawn bars. Instructions now state those keys and Escape dismissal explicitly.

## 4. Card structure, typography and KPI refinement

`ChartCard.tsx` supplies one heading/description/content/attribution hierarchy. `SourceAttribution` keeps the provider, snapshot retrieval date and **API overview build** date distinct. That date is not presented as independently verified build metadata for every historical extraction. Coverage/source caveats remain linked; repeated large attribution paragraphs and unnecessary single-series legends were removed.

Plus Jakarta Sans is preserved. Chart titles are 20px desktop/19px mobile, descriptions 14px, axis labels and compact metadata 12–13px. Full category/source text remains available when rank labels or adaptive tick selection save space.

Analytics now has a coherent four-part financial summary with tabular, unbroken currency values, exact values available through tables, and correctly labeled selected-record scope. Missing stage amounts read “Not available”, not ₱0. KPIs use four desktop columns, two tablet/phone columns where values fit, and one below 360px. Unavailable-value text uses a readable smaller treatment instead of overflowing a phone cell.

Default global filters use a native, labeled disclosure displaying active-filter count and amount-view stage. Shared filtered URLs expand it; keyboard users can open it with Enter. A compact section index provides direct chart jumps. Scope changes clear an incompatible locality, preserve chart anchors, and support browser back/forward. No personal-data search service or new network call was added.

## 5. Data accuracy and privacy preservation

Unchanged source union: **866** comparison records, **5,253** historical families, snapshot `2026-11-02-37334582ca74`. Exact NEP total **₱19,667,189,000** and House total **₱21,378,389,000** reconcile. The Siquijor/HFEP selection remains two source records: NEP **₱36,000,000**, House **₱100,000,000**. Selecting NEP for B/F uses the NEP amounts without a House fallback.

The manifest, all seven source shards and MIT license match the before hashes; built shards match them. The supplied brand assets and API implementation were not replaced. No ingestion/refresh ran. Budgets remain proposals/appropriations, not spending; classifications do not establish wrongdoing. Provincial and locality associations remain qualified.

No account, registration, visitor identification, behavioral analytics, third-party chart service, external font or new persistent storage was introduced. Debug models are development-only, hidden from product UI, omitted from production and never logged to production console. Terms, Privacy, original attribution and owner-supplied operator details remain intact. No privacy contact was invented or added.

## 6. Automated and browser regression results

| Check | Actual result |
| --- | --- |
| `npm run build` | PASS, TypeScript + Vite; `build.txt` |
| `npm run lint` | PASS; `lint.txt` |
| `npm test` | **43 passed, 0 failed**; `tests.txt` |
| `npm run data:validate` | PASS, seven checksums; `data-validation.txt` |
| New unit/integration checks | Nine tests covering exact source totals/status mapping, province/LGU filtering, duplicate handling, numeric/missing/zero inputs, ranking, precision, percentages and source attribution |
| Default responsive browser checks | Eleven widths × six charts, positive geometry and finite paths checked; `final-responsive-geometry.json` |
| Reusable rendered regression guard | **15 state/width cases × six charts**, all PASS; `browser-guard.json` |
| Expanded table parity | Six widths × six exact-value tables, all match models without clipped money; `table-parity.json` |
| Keyboard tooltips | **24** cases across four widths, visible, in bounds and Escape-dismissable; `tooltip-keyboard.json` |
| Shared application sweep | **36** cases across 12 routes/three widths, no detected page overflow, clipped selected text or broken loaded images; `shared-route-regression.json` |
| Production-bundle browser assertions | Five desktop/phone/tablet resize cases: expected 6/3/3/6/8 bars and seven line dots, unchanged KPIs, no page overflow or returned console warnings/errors; QA diagnostics and fixture route excluded; final bundle rechecked after availability notices (`production-latest-bundle.json`) |

`scripts/qa-analytics-browser.mjs` is executable through the documented CUA tab API. It asserts nonzero measured plot dimensions, one actual visible mark per nonzero input, valid SVG paths, exact table parity and no page overflow. It would fail the original missing-`axisLabel` bug. These are real browser checks, not a claim that an unspecified `npm run e2e` command exists.

The workflow artifacts also record program focus, five-record Himamaylan selection, clearing incompatible locality, two-record Siquijor/HFEP selection, exact stage changes, history back/forward, transfer to the project explorer, and honest empty search/NIA states. The final native filter disclosure was explicitly exercised with the keyboard and a 38-record FMR result.

## 7. Accessibility and interaction evidence

Seven final axe audits (default at 320/360/390/768/1440 plus empty NIA and focused Siquijor/HFEP at 390) returned **zero violations**. SVG/color-contrast incomplete checks remain disclosed. Ten computed foreground/background pairs were inspected; contrast ratios were at least **6.23:1**. That sample is not a full WCAG certification.

Native tables, headers, disclosures, clear control names/descriptions, chart application labels, written series names, direct counts and visible focus provide non-color access. Exact amounts are not hover-only. All six chart tooltips were tested with the actual focusable SVG targets, supported Left/Right keys and Escape.

Two text-spacing cases use line height 1.5, letter spacing .12em, word spacing .16em and paragraph margin 2em. An initial 320px endpoint-label escape was found and fixed by increasing grouped-horizontal axis margin. `text-spacing-final.json` records the corrected pass. `axis-overlaps.json` checks small-screen numeric/year labels. Synthetic zero/missing/signed and hidden-parent/remount cases are isolated at development-only `/__qa/charts`; `fixture-checks.json` distinguishes them from real budget data.

Charts have no reveal/counter animation; Bar/Line transitions are disabled. The existing user reduced-motion policy is preserved. Controlled reduced-motion preview retained all 26 default nonzero bars, no bar animation and no KPI entrance. The OS preference was false and was not changed.

## 8. Viewport, orientation and zoom scope

Requested CSS widths tested: **320, 360, 375, 390, 430, 600, 768, 1024, 1280, 1440, 1920**. Additional phone-emulation cases: 844×390 and 740×360 landscape, 390×844 portrait. Source marks remained present with no detected page overflow or escaped labels.

Native zoom was attempted in the selected IAB using Control+Equal and reset using Control+0. Width **1280**, height **1000**, device pixel ratio **1**, and visual viewport scale **1** were unchanged. Therefore **native browser zoom is not verified**. Reflow widths and text-spacing checks are separate evidence and are not relabeled as 125–400% native zoom. Physical devices, other browser engines and screen-reader acceptance remain unverified.

## 9. Before/after screenshots and review

24 individual-chart viewport captures cover A/B/C/D/F/E at 390/768/1440/1920, plus page-top, focused, empty and synthetic-case screenshots. Encoded widths were checked to avoid stale viewport crops. Selected actual desktop/phone/tablet output was visually inspected.

- [Before: empty B/C/D, desktop](before/analytics-1440.jpg)
- [After: C/D with real counts and ranked bars](after/chart-d-1440.jpg)
- [After: grouped comparison on phone](after/chart-a-390.jpg)
- [After: visible program bars on phone](after/chart-b-390.jpg)
- [Focused FMR comparison on phone](after/focused-fmr-mobile.jpg)
- [Full analytics page, desktop](after/analytics-full-1440.jpg)
- [Full analytics page, phone](after/analytics-full-390.jpg)

Native full-page capture succeeded in this sprint. Capture dimensions exclude browser chrome/scrollbars. `full-page-capture.json`, `screenshot-index.json` and `final-top-captures.json` document the methods/dimensions. No mockup or altered screenshot substitutes for rendered output.

## 10. Exact implementation files

- `src/components/DataChart.tsx`: shared normalized model, axes, adaptive orientation, row-based dimensions, keyboard tooltips and exact tables.
- `src/components/ChartCard.tsx`: reusable card and compact source attribution.
- `src/lib/analytics-data.ts`: filtering, aggregation, safety, ranking, model and shared status labels.
- `src/components/Bits.tsx`: imports the same short status names without removing original source wording.
- `src/pages/Analytics.tsx`: KPI group, source-aware filters, focus mode, status/province charts and section navigation.
- `src/styles/analytics.css`, `src/main.tsx`: scoped responsive styling and import.
- `src/App.tsx`, `src/qa/ChartFixture.tsx`, `src/qa/AccessibilityAudit.tsx`: development-only edge fixtures and environment measurement.
- `tests/analytics.test.ts`, `scripts/qa-analytics-browser.mjs`: data/render regression checks.
- `scripts/package-master-review.ps1`: accepts a validated sprint name for new review archives while retaining older packages.

## 11. Remaining issues and limits

Native zoom, native OS reduced-motion switching, screen-reader/cross-browser/device checks, real low-bandwidth/frame/CWV measurements and exhaustive linked-document review are not claimed as passed. Initial raw probe artifacts remain alongside corrected final results where relevant. Some browser inspection calls timed out during heavy capture; current state was checked and affected steps completed, rather than marking attempts as successful.

Source completeness limits remain: NIA query matches unavailable, title associations can overlap/omit projects, some historical build metadata is incomplete, and the newer PSGC workbook reconciliation was not part of this sprint. No amounts or records were fabricated to fill gaps.

Hosting/provider selection, rights/correction handling, applicable lawful criteria, retention and operator/legal acceptance remain open from the existing release gate. Public production security headers and performance are not inferred from local Vite preview. A professional host/owner acceptance pass is still required.

## 12. Readiness recommendation

**The reproduced invisible-bar defects are repaired and verified in rendered browser geometry.** Build, source data validation, existing regressions and the new bounded chart checks pass. The implementation is ready for local owner review, with the limits above. This is not public launch approval, a Data Privacy Act/WCAG certification or official government/BetterGov.PH endorsement.

The supplied logo, free access, open-source license, source attribution and original API integration remain preserved. Current static/source review archives are under `release/analytics-repair/`; older master/regional/premium packages are retained. Their accompanying validation file records file-by-file integrity checks. `final-integrity.json` also verifies the supplied logo, protected source/built data, production QA-code exclusion, and the continuing local preview. `git diff --check` passed (line-ending notices only).

Skill discovery and pre-build design decisions are in `DESIGN_PLAN.md`. Frontend-design was read/applied, with the previously loaded Sites/local-preview and CUA browser workflow. No uninstalled accessibility, data-visualization or visual-regression skill is claimed.
