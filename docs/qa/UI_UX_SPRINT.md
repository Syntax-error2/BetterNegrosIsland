# BetterQuintoDistrito UI/UX refinement sprint

Review date: 2 November 2026. **NOT READY FOR RELEASE.** The frontend refinements below are implemented and locally verified. Operator identity/contact, legal review, domain/host acceptance, geographic uncertainties, and independent accessibility acceptance remain release gates. No deployment or government/BetterGov.PH endorsement is claimed.

## Baseline and scope

Preserved the existing working checkout, React/TypeScript/Vite stack, supplied BetterQuintoDistrito identity, MIT license, BetterGov.PH attribution, configured district/localities, exclusions, source amounts, comparison rules, and API pagination validation. No authentication, database, backend, analytics, synthetic budget records, or geographic totals were added. The local outage fixture returned errors only and never entered the production bundle.

Before changes: `npm test` passed 14 tests; lint and production build passed. Actual baseline desktop screenshot and logs are in `ui-sprint/`. A malformed `/projects#%` URL reproduced a blank page and a `URIError` in the browser console. Other issues were established through source inspection and focused browser verification. The baseline can pass unit tests while still containing these interface defects.

## Design system and page changes

Centralized the active district color/type/layout tokens in `src/styles/theme.css`. Added semantic spacing, control/panel radii, royal-blue brand, focus, warning, transition, and shadow tokens. Expanded the previously compressed district stylesheet into readable source. `refinement.css` contains the focused semantic table, form, feedback, touch-target, and responsive refinements. No new runtime libraries were added. Financial numbers retain tabular alignment and original peso formatting.

| Surface | Implemented refinement |
| --- | --- |
| Shell | Compact brand preserved; project-detail routes retain Explore Projects active state; Escape closes mobile menu and restores focus; page title effects focus the main landmark, including lazily loaded pages |
| Overview | More compact editorial hero, “Understand the budget. Know your district.”; methodology CTA; useful data moves higher; stage/scope caveats and accessible comparison text preserved |
| Explorer | Search promoted above a collapsible filter panel; active count, result announcements, range validation, disabled empty/invalid export, useful-parameter-preserving reset; office detail moved into a disclosure after the results |
| Data table | Native table/caption/thead/tbody/tr/th/td markup, scoped headers, aligned columns, exact peso tooltips, contextual source-link accessible names, hover/focus state; three-column funding comparison within mobile cards |
| Project detail | Request-specific retry enters a new loading state; pending/failed scope membership is no longer described as excluded; actionable public errors; source pages, print and clipboard behavior retained |
| Six LGU profiles | Same shared explorer improvements applied to all six; title matching and uncertain geography notices remain; no district total duplicated as an exclusive LGU allocation |
| Budget history | Safe fragments, meaningful selected-filter reset visibility, readable error messaging; shared request progress now reaches later subscribers without duplicate requests |
| Methodology | Failed historical search notes have a working retry control and consistent public error text; query/exclusion/source disclosures remain intact |
| Terms/Privacy/welcome | Larger mobile reading text and adaptable controls; acknowledgment entry moves focus into main content; decline, drafts, local-only versioning, memory fallback, and preserved legal return links retained |
| Missing route | Actual page heading and main target; corrected explorer link |

## Verified issue register

| ID | Severity / component | Reproduction, actual behavior and cause | Expected / correction | Verification / status |
| --- | --- | --- | --- | --- |
| UI-001 | P1 / explorer, history | Open `/projects#%`; uncaught `decodeURIComponent` effect blanks the page; history uses the same unsafe pattern | Treat malformed fragments as absent; shared guarded `fragmentId` | Reproduced browser crash before; corrected page renders 25 rows afterward; malformed/valid fragment regression tests pass. Fixed |
| UI-002 | P2 / mobile shell | Open menu, focus a nav link, press Escape; no handler or focus return | Close disclosure, return focus to Menu | Browser: expanded=false and focused menu button. Fixed |
| UI-003 | P2 / financial filters | Supply reversed, negative, nonfinite bounds; no explanatory validation | Specific associated error, invalid field semantics, no results/export for invalid bounds | Browser reversed-range alert and disabled export; invalid/zero boundary tests. Fixed |
| UI-004 | P2 / reset | Filter a shared URL with `ref=community`, then Clear filters; all parameters removed | Remove owned explorer filters only | Browser retains `ref`; regression test preserves original input too. Fixed |
| UI-005 | P2 / table | Inspect explorer markup: div/span ARIA table with no native table/caption/header scope | Native structure with retained responsive card layout | Browser DOM: TABLE, five scoped headers, 25/50 rows; viewport review. Fixed |
| UI-006 | P2 / routing/focus | Detail route has no active parent tab; route entry leaves focus on old/disappearing control | Parent active state; main landmark focus on route/title and acknowledgment entry | Source changes, keyboard menu/skip checks, route/landmark matrix. Fixed |
| UI-007 | P2 / history progress | Subscribe to an already-pending memoized history request; only original caller receives progress (including StrictMode remount scenario) | All pending subscribers receive progress with one data request | Regression test: two subscribers, one request, updates [0,1] then [1,1]. Fixed |
| UI-008 | P2 / methodology error | Historical query-note failure renders text with no retry; raw technical message exposed | Consistent public recovery text and local retry attempt | Code path repaired; public-error unit test and separate browser 503/404 checks. Methodology-specific failed-history retry not fault-injected separately. Implemented; scenario coverage partial |
| UI-009 | P2 / project scope | Detail resolves before scope; undefined membership is displayed as not in portal | Distinguish unavailable membership from verified exclusion | Source branch corrected; live detail loads. Controlled delayed-scope scenario not separately injected. Implemented; scenario coverage partial |
| UI-010 | P2 / missing route | Unknown route lacks h1/main target and “See every project” goes to overview | Explicit missing-page heading and correct explorer destination | Browser unknown route and final build. Fixed |
| UI-011 | P2 / API feedback | Generic Await prints arbitrary server error message; retry retains previous detail attempt key | Public recovery text, no internal messages; detail attempt has its own loading key | Actual API 404 and isolated local 503: useful alert, retry, no figures/internal fixture detail; unit coverage. Fixed |
| UI-012 | P3 / overview & payload | Large hero delays useful overview; all secondary pages included in eager bundle | Compact hero and lazy secondary pages | Before/after screenshots and build outputs. Improved; not a CWV claim |
| UI-013 | P2 / async lifecycle | Isolated 503 test logs exposed a rejected district promise from a discarded StrictMode render before effects subscribed | Observe request failures at construction; preserve the same rejected promise for visible error handling | New regression passes; repeated fresh-tab 503/retry has zero browser error logs in `outage-final.json`. Fixed |

No known P0/P1 frontend defect remains from this audit. This is not a claim that every possible bug has been eliminated.

## Executed validation

| Check | Result and evidence |
| --- | --- |
| Baseline tests/lint/build | Passed; 14 tests; `ui-sprint/baseline-*.txt` |
| Final `npm test` | 20 passing tests; six new UI/progress regressions; `ui-sprint/tests.txt` |
| Final `npm run lint` | Passed; `ui-sprint/lint.txt` |
| Type checking and production build | `npm run build` runs `tsc -b && vite build`; passed; `ui-sprint/build.txt` |
| `npm run check` | Live API check passed: 50 FY2027 records, 538 historical families, 98 matched department-year reconciliations. Two documented corridor warnings remain; `ui-sprint/live-check.txt` |
| Browser functional journeys | Welcome disabled/decline/legal-return/deep-entry/refresh; overview/navigation; search/empty/reset; settled FMR+House-only yields one result; range error; load-more to 50; UTF-8 BOM CSV with one result plus header; detail/copy/source-page reference; back/forward/deep refresh; mobile Escape; missing route; malformed fragment; `ui-sprint/functional.json` |
| Source document | API-supplied second-reading volume IB PDF/page 711 link inspected; HTTP HEAD returned 200. The external PDF viewer was not manually reviewed page by page |
| API outage | Separate Vite port 5133 pointed only at local 503 test source on 5134. Useful error/retry, zero budget-summary cards, internal fixture message not displayed; `ui-sprint/outage.json`, followed by the corrected lifecycle check in `ui-sprint/outage-final.json`. Both test services stopped afterward |
| Responsive | 15 populated routes × ten widths = 150 geometry cases, plus ten welcome cases. Widths: 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920. No measured horizontal overflow; one main and h1 on populated routes. Overview landscape 844×390 also had no overflow. `responsive*.json`, `welcome-responsive.json` |
| Visual review | Actual desktop before/after; tablet overview; mobile welcome/explorer screenshots. Visual inspection supplemented geometry; no pixel-baseline automation is claimed |
| Accessibility | Native table structure, scoped headers, main focus, Escape return, live results, associated range errors, labels, reduced motion, mobile controls; rendered-text contrast sampling on overview/explorer/legal pages found no failures. Sampling uses nearest opaque ancestor, not a full WCAG audit |
| Console | Investigated and fixed the baseline malformed-fragment URIError. It remains in the tab’s historical dev log; the late outage cleanup revealed UI-013, which was repaired and rechecked in a fresh tab with zero error logs. Intentional API failures are test evidence, not production outages |

Browser journeys are tool-driven checks against the actual rendered UI, not a newly committed standalone Playwright test suite. Unit/integration regressions use the existing Node/tsx framework. The live API remained read-only; outage tests contained no budget fixtures.

## Performance evidence and limits

Baseline single main JS asset: 349.70 kB raw / 107.04 kB gzip. Refined main entry: approximately 266.91 kB / 82.51 kB gzip. The refactored entry also loads shared chunks (including approximately 47.77 kB / 17.03 kB gzip); the entry-asset reduction alone is **not** the total initial-load reduction. Secondary legal, history, methodology, and detail chunks load on demand. CSS grows from 35.34 kB / 8.00 kB gzip to 39.58 kB / 8.70 kB gzip for the accessibility/responsive refinements. Build logs are the authoritative artifact measurements.

Historical searches can take several seconds because they search 38 departments for each configured place; the first browser wait expired while the page correctly remained loading. A longer bounded wait completed with 538 families. Accurate progress sharing was repaired. No API validation was weakened to shorten this wait.

No measured LCP/INP/CLS, throttled-device performance benchmark, or production traffic result is claimed. Actual browser text zoom, larger OS font settings, physical devices, independent screen readers, and Firefox/Safari/cross-browser acceptance remain unverified. Viewport/reflow checks do not replace those tests. Print/save-PDF remains browser-provided and was not manually accepted. Full outage recovery from failure back to a successful source was not browser-fault-injected; successful retry eviction is covered by existing API unit tests.

## Release decision and delivery

**NOT READY FOR RELEASE.** The local UI sprint is implemented with the verification and partial scenario coverage stated above. Public launch still requires actual operator/privacy/corrections contacts, approved legal documents, real domain and hosting checks, and review of uncertain geographic corridor records described in `../SCOPE.md`. Broader accessibility and browser acceptance remain outstanding. The portal stays free, static, open-source, and without accounts.

Run `npm run dev` and open `http://localhost:5132/` for local review. Existing deployment instructions remain in `../deploy.md`; no deployment was performed. New review packages under `release/ui-sprint/` preserve the earlier release archives. Do not publish either package as legally approved or production-accepted.
