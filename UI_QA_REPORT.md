# BetterNegrosIsland — current UI QA

Current sprint: premium table, responsive, accessibility and privacy remediation. Full findings, root causes, page changes, processing inventory, legal sources and severity-ranked open work are in [the implementation report](docs/qa/premium-ui/REPORT.md).

- Replacement owner-supplied wordmark is used throughout; original artwork is unchanged.
- All financial tables use DataTable. Project results have six separate columns, full amounts and responsive cards.
- Budget snapshot and source calculations are preserved; integrity verification is recorded with the final checks.
- 180 route/fixture viewport cases across ten widths, 10 compatibility checks, 20 reflow-equivalent cases, 60 graph label bounds, 10 repaired tooltip bounds and eight text-spacing cases are recorded separately.
- 28 final browser workflow checks passed, including an isolated unreachable-API test and current legal acknowledgment.
- 14 axe-core page/state audits returned no violations. Incomplete contrast checks remain; 19 sampled computed color pairs meet 4.5:1. This is not a WCAG certification.
- Native zoom was unavailable in the selected in-app browser; reflow equivalents are not reported as native zoom passes.
- Public-record display-field identifier triage returned zero flags for 866 comparison records and 5,253 historical families. Linked PDFs and all possible PII are not cleared by this scan.
- Operator supplied by owner: Aqura Information Technology Solutions / Dave Hermoso, Binalbagan, Negros Occidental. No privacy contact was added. Hosting and legal/privacy completion remain open.

Actual logs: [unit tests](docs/qa/premium-ui/tests.txt), [build](docs/qa/premium-ui/build.txt), [lint](docs/qa/premium-ui/lint.txt), [data validation](docs/qa/premium-ui/data-validation.txt), [dependency audit](docs/qa/premium-ui/npm-audit.json). Earlier QA/design documents remain historical under docs/archive/pre-premium-ui and prior evidence folders.

**Local review candidate. Public-release approval, native zoom/device/screen-reader/host verification, privacy/legal completion and prior geography release gates remain outstanding.**

Final checks: **34/34 automated tests, production build, lint, data validation and privacy triage passed. npm audit reported zero vulnerabilities.** `docs/qa/premium-ui/integrity.json` verifies unchanged source manifest/seven shards, matching built data, unchanged supplied logo pixels and development-tool exclusion from production JS.

## Latest pass — master layout, 3 November 2026

See [the detailed master-layout report](docs/qa/master-layout/REPORT.md) for this later sprint. It records the compact header, 1520px usable wide layout, rebuilt footer, explicit theme assets and favicon, welcome/legal refinement and reduced-motion policy. The original PNG is unchanged; new proportional runtime derivatives are explicitly distinguished from it.

Current evidence: 165 route/state × width cases without detected overflow/clipping, 18 axe audits with zero returned violations (incomplete chart/status contrast checks remain), eight text-spacing cases, chart bounds across eleven widths, keyboard/legal/CSV workflows, and five production-bundle smoke checks. Build/lint/data validation and all 34 existing tests pass. Manifest, seven source shards, original PNG and license match the before hashes. No hosted-performance or compliance certification is inferred; native zoom/OS-motion switching, assistive-technology/device acceptance and hosting/legal work remain open.

## Latest pass — responsive analytics repair

The earlier bounds checks did **not** assert visible positive bar shapes and therefore did not establish correct chart rendering. The [analytics repair report](docs/qa/analytics-repair/REPORT.md) records the reproduced missing-axis-key defect and its correction. B/C/D/F now show the expected 3/3/6/8 nonzero bars; A retains six grouped marks and adds a disclosed program-focus scale. A reusable CUA regression guard checks actual SVG geometry and table parity.

Latest checks: 43 tests pass; build/lint/data validation pass. Eleven-width geometry checks, 15 state/width browser-guard cases, 24 keyboard-tooltip cases, 36 shared-route cases, final production resize assertions and seven final axe audits are recorded. The latter return no violations but retain SVG contrast incomplete items. A transient production resize overflow and a text-spacing endpoint-label escape were found and fixed, with original/final artifacts kept separate. Native zoom shortcuts did not alter IAB metrics and are not claimed as verified zoom. Data/branding/license and release boundaries remain preserved.
