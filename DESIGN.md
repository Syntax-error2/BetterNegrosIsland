# BetterNegrosIsland design — premium UI remediation

The primary task is finding a project, reading its full published values and tracing evidence. The explorer now puts search/results ahead of optional aggregate context. Source totals and comparison classifications remain available in a native disclosure; active deep-link filters open their controls automatically. This avoids pushing the actual table more than a screen below the fold.

## Skills and workflow actually loaded

Before coding, inspected project/ancestor AGENTS locations and project `.agents/skills`, user `.agents/skills`, configured `.codex/skills` and plugin skill directories. No applicable AGENTS file or dedicated UI/UX, visual-design, frontend-design, accessibility, browser-testing or visual-regression SKILL.md was found.

Read the complete installed **Sites** SKILL.md at `C:/Users/daveh/.codex/plugins/cache/openai-curated-remote/sites/1.1.2/skills/sites/SKILL.md`, its local preview and presentation-led design references. Applied coherent brand composition, readable real content, task-oriented hierarchy, responsive implementation and actual browser review. Existing checkout/local-only workflow retained; no hosted Site/account gate created. Read **find-skills** for skill discovery; no external skill was installed. Read the installed Computer Use SKILL.md; browser control itself used the documented CUA browser API and its local-development/troubleshooting guidance, not native desktop automation. No unavailable skill is claimed as used.

## Brand and type

The owner supplied a replacement transparent **2167 × 726** wordmark. The original pixels are copied unchanged to `public/brand/bni-regional-wordmark.png`, with a retained original in docs/branding. Header, welcome, footer, favicon, manifest and social metadata reference this asset. White/light surfaces keep its blue/green/yellow artwork readable. No logo was generated or redesigned. The entire wide mark is also the favicon; a dedicated small square master would improve 16px legibility. The 1.18MB original is not claimed to be an optimized small icon.

One self-hosted Plus Jakarta Sans family, weights 400/500/600/700, tabular numbers. Page titles 30–36px, welcome heading up to 48px, section titles 20–24px, body 15–16px, project title 15–16px, exact figures 14–16px, metadata 13px and evidence/captions 12–13px. Financial columns align right on desktop. No extra font service is introduced.

Civic navy, restrained blue, cool white/gray surfaces and quiet amber for uncertainty. Comparison increases/decreases use both words and directional symbols; they do not use a red/green moral judgment. Neutral unchanged and separate uncertainty treatments preserve source meaning.

## Reusable table system

`DataTable` owns native table/column/row/header semantics, restrained spacing, a real caption and conditional keyboard-focusable horizontal scrolling with a visible instruction. It is used for project results, history, source-version amounts and chart alternatives/variance.

Project columns are Project details, Comparison status, NEP, House bill, Difference, Source action. Exact amounts remain visible rather than requiring hover. Full titles, implementing offices and title-based geographic evidence wrap naturally. Heights follow content. Source and Details actions have separate space and adequate targets. Large-number fixtures expand the desktop table inside its scroll container.

At 1099px and below, the same project/history rows become structured cards; no duplicate fetch/filter/sort implementation exists. At 320px, project amounts stack. Exceptionally large values also receive more room. Header semantics remain available to assistive technology even when visually condensed. Monetary text can reflow under user text-spacing overrides.

## Charts and privacy

Ranked bars use numbered categories linked to a full-title table disclosure. Province labels wrap. Narrow-chart tooltips anchor inside the chart, have constrained widths and no movement animation; tables remain the durable alternative. Source, snapshot and stage labels stay explicit.

The public portal has no accounts, visitor GPS, identity forms, analytics or report submission. Remove speculative API preconnects; fonts/charts/logo are self-hosted. Legacy portraits are optional source-credit links rather than automatic external image loads. Privacy Notice names the operator supplied by the owner, adds no privacy contact, and states that hosting/rights procedures/retention/legal review are pending. No compliance certification or publication approval is inferred from engineering checks.

See UI_QA_REPORT.md and docs/qa/premium-ui/REPORT.md for actual results and limits. Previous design notes are preserved under docs/archive/pre-premium-ui.

## Master layout refinement — 3 November 2026

The current shared layout is defined by `src/styles/master-layout.css`: wide/standard/reading outer widths 1584/1416/880px, fluid 16–32px gutters, compact header, an integrated overview source-review panel and a structured navy footer. Use `BrandLogo` with an explicit light/dark theme; the source PNG remains unchanged, while runtime derivatives and the emblem favicon are documented by `scripts/brand-assets.py`. Keep paragraphs readable even when financial tables use the wide container.

Motion is CSS-only: one brief KPI entrance, user-triggered disclosure/press/hover feedback, and a global reduced-motion policy. Text starts at .96 opacity to preserve contrast during the entrance; never animate financial values. Legal paragraphs remain static. Full source notices remain accessible in the footer and Methodology. See [the master-layout report](docs/qa/master-layout/REPORT.md) for current screenshots, measurements and verification limits.

## Responsive analytics repair — 3 November 2026

The current analytics system uses `ChartCard`, compact `SourceAttribution` and one normalized model for both series and axes. Source counts must be represented by actual visible geometry, not merely a valid SVG boundary. Default bars use zero-based scales; per-program comparison focus explicitly discloses its rescaled zero-based view. Six status categories remain a partition; unconfirmed matches are an overlapping flag, never extra records to add.

Charts use one column below 1200px, content-based horizontal heights, integer count ticks and full exact-value table alternatives. Filters are a native disclosure with active scope visible; phone KPIs use two columns where amounts fit and one below 360px. The chart wrapper/SVG have component-local maximum widths during resize. Do not add a fixed desktop initial dimension or conceal body overflow. See [the analytics report](docs/qa/analytics-repair/REPORT.md) for rendered evidence and remaining limits.
