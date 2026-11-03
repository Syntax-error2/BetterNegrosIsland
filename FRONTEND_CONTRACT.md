# BetterNegrosIsland frontend contract

## Scope and data invariants

Retain the React/TypeScript/Vite application, BetterGov.PH API client and static snapshots. No new backend, user database, login, registration, OTP, visitor geolocation, tracking or mandatory personal information. Original MIT license and required data notices remain. BetterNegrosIsland uses the owner-supplied replacement wordmark; BetterGov.PH remains credited as original project and budget provider, without affiliation/endorsement claims.

This UI sprint does not refresh or alter budget data. The existing snapshot is 866 unique comparison records and 5,253 historical families. Scope, deduplication, raw source values, metadata and existing geography caveats remain. Keep NEP, House, enacted GAA and execution separate. Never infer a locality from shared offices or convert missing money to zero.

## Presentation

Use DataTable for financial/project tables: real headers and rows, full content-driven heights, full peso values, aligned figures, independent source actions and keyboard scrolling when legitimately necessary. Mobile uses the same underlying rows as cards. No critical project names behind truncation/tooltip-only disclosure. Exact differences distinguish null, zero and signed changes. Percentages are withheld for held/scope-review pairings or missing/zero baselines; arithmetic is not confirmation of a pairing or spending.

Default explorer prioritizes search and results. Aggregate context is a readable disclosure; advanced filters open when a shared URL contains active filter parameters. Sorting, load-more, CSV and query parameters keep the existing implementation. Regional office query coverage links to the actual ledger; no empty office disclosure is offered.

Charts keep validated selected scope, responsive axes, exact table alternatives and dated source notes. Ranked names stay fully available. Tooltip geometry must fit the viewport; mark and tooltip motion is disabled. Native financial overflow stays inside a labeled, keyboard-focusable region.

## Identity, privacy and security

Responsible operator supplied by owner: **Aqura Information Technology Solutions / Dave Hermoso, Binalbagan, Negros Occidental**. No verified monitored privacy contact has been supplied in the current sprint. Do not invent one; the requested contact and rights-request procedure remain release blockers. Hosting is not selected. Do not invent registration/DPO/contact/retention details or declare legal compliance. Rights-request handling and applicable lawful criteria need operator/legal completion before release.

Acknowledgment version: `2026-11-03-privacy.3`, stored only as a version string under the existing key. It is agreement to Terms and acknowledgment that the Privacy Notice was provided, not blanket processing consent or authentication. Legal pages remain readable before entry. Storage denial uses current-page memory.

HTML metadata and configured hosting headers suppress referrers; external document links use safe schemes and noreferrer/noopener. React text escaping and CSV formula neutralization remain. No automatic external portraits, font service or hosted chart script. Host/API providers may process technical request data. Shared query URLs can enter host logs. No retention or automatic deletion claim without verified provider arrangements.

`data:privacy-review` performs narrow identifier-pattern triage of displayed project/history text and reports opaque record fingerprints without copying matched personal values. It is not exhaustive PII detection or linked-PDF clearance. Review findings before publication.

## Development QA and release

`/__qa/table` is development-only and visibly synthetic. `?__a11y=1` enables a local axe audit/text-spacing control. Both are compiled out of production; no test data replaces public records. Do not mistake an instrumented development overlay for product UI. CUA is used for browser interaction; no browser automation outside it is implied.

Build/test/lint/data/identifier checks, screenshots, bounds assertions and accessibility results must be recorded accurately. Native browser zoom was unavailable in the selected in-app browser; viewport reflow equivalents are separate evidence. No claim of screen-reader, cross-browser, physical-device or WCAG certification. Public hosting, actual HTTP headers/compression, privacy/legal completion, latest PSGC reconciliation and owner acceptance remain release gates.

## Master layout and brand contract — 3 November 2026

Apply `page--wide` to dashboard/financial workspaces, standard `.page` to directories/details and `page--reading`/`.legal-page` to long documents. The `civic-header` menu is an in-flow disclosure, with Escape/focus restoration; it is not a dialog. Preserve anchor targets on lazy routes and do not let title updates steal their keyboard focus.

The four footer groups must retain the complete upstream notice through the native disclosure and Methodology source section. Original MIT attribution and the authorized operator identity must remain visible; no contact or endorsement may be invented. Header metadata describes the dated collection, while successful project details identify their live response separately.

Use the explicit theme assets through `BrandLogo`; do not invert the multicolor mark. Runtime raster derivatives are proportional, not source-pixel-identical or traced vectors. `scripts/brand-assets.py` retains the original PNG and documents asset derivation. `__qa/brand` and the reduced-motion preview are development-only. The latter is not proof of toggling the native OS preference. Current evidence is under `docs/qa/master-layout/`.

## Analytics geometry contract

Both BarChart and its categorical axis must receive the same normalized model containing `axisLabel`. Reject non-finite/coerced values; preserve null versus zero, safe peso precision, original source identities and scope caveats. All six source statuses must remain present without adding held/unconfirmed flags to their count partition. Full labels and exact amounts must remain available outside hover through native tables.

Use the installed Recharts responsive container with a measurable parent and no fixed desktop fallback width. Keep chart wrapper/SVG within their own current container while measurements update. Prefer scoped containment and meaningful chart dimensions over a global overflow-hiding rule. Use supported Left/Right navigation and Escape dismissal, and preserve user reduced motion without value counters.

Run `scripts/qa-analytics-browser.mjs` through the documented CUA tab API for positive geometry, responsive width and exact table assertions. Unit tests alone cannot prove bars rendered. `__qa/charts` and `data-chart-diagnostics` are development-only, compiled out of production. Latest evidence: `docs/qa/analytics-repair/REPORT.md`; native zoom, screen-reader/device/host and legal acceptance remain separately qualified.


## Critical hardening — 3 November 2026

Recharts 3.10.1 uses a zero-size overflow-visible sizing ancestor. Never apply percentage max-width to its measured chart wrapper/SVG: this collapses the SVG viewport despite nonzero path bounds. Contain resize overflow at the actual chart box. Browser guards must assert the SVG viewport matches its parent as well as mark geometry and exact table parity.

Overview, Analytics and expanded Explorer use KpiCard. History retains all seven years, explicit selected header/cell states, sticky desktop project context, final right padding and keyboard Home/End. Source actions use the central HTTPS/exact-host resolver and canonical citizen URLs; exact JSON is labeled developer access. Current evidence: docs/qa/critical-hardening/REPORT.md. Public legal/provider/contact approval remains open.
