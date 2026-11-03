Public-copy redaction: personal operator attribution was removed at the owner’s request. Existing historical findings are unchanged; older commits and screenshots may retain earlier attribution.

# BetterNegrosIsland — master layout, footer, brand and motion review

Review date: **3 November 2026 (Asia/Singapore)**. Existing checkout: `C:\Users\daveh\Downloads\BetterQuintoDistrito`. Local preview: `http://localhost:5132/`. This is implementation and local verification, not public deployment or legal acceptance.

## 1. Executive summary

Implemented a fluid evidence workspace with a compact shared header, wider financial/dashboard surfaces, a consolidated budget/source review panel, a rebuilt four-column navy footer, explicit light/dark logo assets, redesigned welcome and legal-document navigation, and restrained CSS motion. Existing data/API behavior, original MIT license, BetterGov.PH attribution, budget stages, source notices and geographic caveats remain intact. No account, registration, payment, tracking service or new runtime dependency was introduced.

## 2. Screenshot audit and measured changes

The attachment contains its text only; the two screenshots referenced by the brief were not supplied with it. Before evidence was captured from the existing running portal. Paired overview/footer captures use requested viewport widths 390, 768, 1440 and 1920, at a requested height of 1000. IAB captures omit browser chrome/scrollbars, so encoded image dimensions can differ from the requested CSS viewport. An asynchronous capture defect initially produced some stale-width crops; affected files were recaptured and validated (`screenshot-dimensions.json`). This was a capture issue, not CSS clipping.

| Measured desktop property | Before | After |
| --- | ---: | ---: |
| Utility + header height, 1440/1920 viewport | 221.20px | 111.34px |
| Usable overview width at 1920 | 1240px | 1520px |
| Usable overview width at 1440 | 1240px | 1361px |
| Header/navigation bands | Utility + logo row + separate nav | Utility + combined identity/nav/status |
| Footer structure | Brand and long sequential paragraphs | Four grouped columns + evidence disclosure + attribution/operator bar |

The footer is **not claimed to be shorter**: it now exposes substantially more useful links, with readable mobile targets. Its primary improvement is grouping, contrast and scanability. The overview review panel incorporates the former separate metadata strip; its height is determined by truthful content rather than a giant year. Mobile now retains the review panel instead of hiding it.

## 3. Layout and breakpoints

`src/styles/master-layout.css` owns the new shared layout and motion layer. The original table system remains intact.

| Variant | Outer maximum | Usable content at maximum | Usage |
| --- | ---: | ---: | --- |
| Wide | 1584px | 1520px | Overview, projects/locality tables, analytics, budget history, shared chrome |
| Standard | 1416px | 1352px | Directories and detail pages |
| Reading | 880px | 816px, paragraphs bounded to 76ch | Terms, Privacy, methodology, About |

Gutters are fluid 16–32px. The spacing scale retains 4/8/12/16/24/32px and adds 20/40/48/64px. No global overflow-hiding workaround was introduced.

- At 1440+ CSS viewport: single-row logo, seven navigation links and compact collection status.
- At 1120–1439: a deliberate second nav row prevents squeezing.
- Below 1120: an in-flow accessible disclosure menu; no modal overlay or focus trap.
- Below 768: one-column hero and welcome, visible review panel, stacked reading sections; the established table card breakpoint remains unchanged.
- Footer: four columns on wide screens, two on tablet; brand and accountability span mobile rows while Explore/Information remain two readable columns.
- Overview KPIs: four columns on desktop, two below 1120, one below 360. Numbers are unchanged.

## 4. Header, hero and source status

`src/components/Chrome.tsx` replaces the earlier stacked masthead with a compact header. Mobile navigation supports native Tab order, expanded state, Escape-to-close, focus return, and collapse after route selection. Header collection status is explicitly dated; it does not label live detail responses as cached or claim freshness.

`src/pages/RegionalOverview.tsx` uses an approximately 65/35 content/review split, an unfragmented headline and prominent project action. Redundant uppercase banner and disconnected snapshot strip were removed. `src/components/SourceStatus.tsx` distinguishes retrieval **2026-11-02**, source build **2026-10-26**, API provider, 866-record collection scope, four program queries and the static delivery mode. Individual project detail success is explicitly labeled **Live API response**, with its own response build date; the existing failure fallback remains labeled as a dated snapshot.

## 5. Financial summaries

The KPI group has aligned labels, tabular numbers, four balanced desktop cells, compact notes and readable mobile stacking. Non-actionable statistics do not acquire a pointer cursor or lift effect. Published values remain ₱19.67B / ₱21.38B / 866 / 14 in compact overview display. Exact underlying pesos and counts were not recalculated for styling. CSV verification includes real Siquijor HFEP records: NEP ₱16,000,000 and ₱20,000,000, House ₱50,000,000 each, differences ₱34,000,000 and ₱30,000,000. The export contains a header and two records.

## 6. Footer architecture and complete disclaimer

Four explicit groups: Brand, Explore, Information, Legal & accountability. The multicolor landscape is retained, with light wordmark lettering against navy. Group headings, keyboard focus, link targets, separators, source attribution and operator details have distinct roles.

A concise visible caveat states that budget figures are not necessarily spending and classifications do not establish wrongdoing. The **complete original `meta.notice`** is preserved in a native expandable disclosure; all source disclaimer objects remain available on Methodology. Links target real source-document, disclaimer, attribution and operator sections. BetterGov.PH remains identified as the original project and data provider, without implying endorsement or partnership. The MIT license remains directly accessible. The current-year copyright concerns this initiative; original software rights remain governed by the preserved upstream license.

## 7. Brand assets and transparency

Original supplied PNG: **2167×726 RGBA**, all four corner alpha values zero, visible alpha bounds `(16,14,2153,708)`. No opaque rectangular background exists. It contains original edge texture; no vector master was available. The original PNG and archived source copy remain untouched.

`scripts/brand-assets.py` deterministically exports the established logo system. It does not generate artwork or claim vector tracing:

- `public/brand/logo-primary.webp`: proportional 788×264 runtime derivative, **127,220 bytes**. Aspect ratio is identical. Its encoding is lossless relative to the resampled runtime master; it is **not source-pixel-identical** to the full-size PNG.
- `public/brand/logo-light.svg`: **170,382 bytes**, an SVG wrapper embedding that raster. Complementary clip regions preserve the landscape and apply a light fill to the existing wordmark silhouette. No global CSS brightness/invert filter or full-logo opacity trick.
- `public/brand/logo-mark.webp`: source landscape extraction with a mask excluding the adjacent wordmark/banner, not a new emblem.
- `favicon-32.png` (2,384 bytes) and `favicon-180.png` (35,646 bytes): small-format transparent emblem exports; index and manifest references updated.

White, light-gray, deep-navy and near-black composites were visually inspected. No background box, black artifact, missing wordmark characters or stretched proportions were observed. Resampling and the theme treatment are disclosed; an editable professional vector master would still be a useful future asset.

Combined primary/light runtime files total 297,602 bytes, compared with the prior 1,178,220-byte PNG (about 75% fewer raw bytes, before HTTP compression/cache behavior). This is an asset-size measurement, not a Core Web Vitals or deployed performance claim. The original remains available for provenance and sharing metadata.

## 8. Welcome, Terms and Privacy

`src/components/LegalEntry.tsx` uses the genuine transparent brand at the top, a concise welcome/introduction, clearly labeled document links, an evidence caveat and the original acknowledgment language. Entry remains disabled until checked; decline saves no acknowledgment. There are no account fields. Both legal documents remain readable before entry. A locality deep link survives reading both documents, declining and then entering. Returning visits remember only the existing document version.

`src/pages/Legal.tsx` adds a transparent document logo, readable revision/version line, grouped document navigation, rights anchor and return links. Long legal paragraphs are not animated. Interface revision is 3 November; legal-content version remains `2026-11-02-privacy.2` because this pass changes presentation rather than claiming newly approved terms.

Operator details remain **[personal operator attribution removed from this public copy]**, as supplied by the owner. They are not independently verified legal registration information. No privacy contact or submission form was invented. About previously contradicted those supplied details with an “identity missing” TODO; it now accurately distinguishes supplied identity from outstanding procedures.

Processing remains the previously documented minimal local acknowledgment, host-delivered static assets/snapshots, possible host request logs, live detail API requests, and user-opened external sources. No new third-party tracking, font, animation CDN or storage was added. Hosting/provider, lawful criteria, log retention, processor arrangements and a working rights-request procedure remain unresolved. The Privacy Notice explicitly distinguishes notice acknowledgment from blanket processing consent. Review basis includes the [NPC IRR principles of transparency, legitimate purpose, proportionality and retention](https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/); this is not a legal compliance certification.

## 9. Motion and performance choices

Dependencies were inspected; Motion for React was not installed. The [official Motion documentation](https://motion.dev/docs/react) was reviewed. A new library was unnecessary for these bounded interactions.

- One KPI entrance sequence: 8px vertical offset, 300ms, 35ms stagger, no bounce or counters. Text opacity starts at .96 to preserve contrast even during entry.
- 170ms button/background/border feedback, 1px pressed state, visible focus and disabled state.
- Actionable province links may lift 2px on pointer hover; non-clickable KPI cells only change background.
- Filter/context/source disclosures use a brief opacity/transform response, without animating document paragraphs or expensive layout properties.
- Navigation active indicators and in-flow mobile-menu feedback are subtle. No parallax, loop effects, scroll-jacking, blank transition frame or delayed route entrance.
- `prefers-reduced-motion: reduce` disables animations/transitions and transform feedback. The controlled browser preview returned `animation: none`, transition duration `0s`, and all four KPI opacities `1`. The actual OS preference was false and was **not toggled**; this preview is not claimed as native preference-emulation evidence. See `reduced-motion.json` and [MDN’s media-feature reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/prefers-reduced-motion).

Final production main JS: 273.30kB / 83.81kB gzip; Analytics remains 402.21kB / 115.15kB gzip. No new runtime dependency. Build timings are local observations only. Hosted CWV, network throttling and animation frame benchmarks were not measured.

## 10. Accessibility and bugs fixed

18 final axe audits (eight routes at 390/1440, plus first-visit welcome at both widths) returned **zero violations**. Six route/width results retain incomplete color-contrast checks on chart/status content; these are not claimed as cleared by automation. Readable text, explicit semantic groups, native tables/disclosures, keyboard focus, no-motion content and visible disclosure state were also inspected.

Actual issues found and resolved:

1. Initial low-opacity KPI entrance caused 11 transient contrast findings. Raised the starting opacity to .96 and reran the overview audits; original findings are retained in `axe-initial-findings.json`.
2. Source-status generic `div` lacked a valid role for its accessible label. Added a semantic group; repeated audits no longer report it.
3. Page-title focus effect stole focus from newly loaded source/operator anchors. Hash-aware focus and lazy-route observation now preserve target focus and scroll position. Malformed fragments remain inert.
4. About’s operator TODO contradicted owner-provided content. Corrected without inventing a contact.
5. A simple rectangular favicon crop included part of the banner. Replaced with the explicit landscape mask and visually rechecked the 180px output.
6. Some screenshot encodings lagged the requested viewport. Validated JPEG dimensions and recaptured affected evidence.

Eight WCAG text-spacing cases (overview/projects/Terms/Privacy × 320/1440) showed no page overflow or detected clipped headings/amounts/links. Keyboard menu/Escape, native notices, anchors, table actions and returning/deep-linked visits were exercised. No screen-reader, other-browser or physical-device certification is claimed.

## 11. Responsive and application sweep

Widths: **320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1728, 1920**. Fourteen routes × eleven widths = **154 cases**, plus eleven welcome cases = **165**. No detected page horizontal overflow, clipped headings/amounts/actions, broken loaded images or header collisions in those checks. Intentional horizontal scrolling inside large financial tables remains keyboard accessible.

Routes: Overview, Projects, Places, Negros Occidental province, Himamaylan locality, Analytics, Budget History, Data Coverage, Methodology, About, Terms, Privacy, 404 and a real DPWH project detail. Six chart views, represented by 18 plot/legend SVG descendants per width, were checked at eleven widths with no detected label escapes; five expandable table alternatives were opened. See `chart-bounds.json`.

Automated geometry is bounded evidence, not a guarantee that every pixel or every possible dataset state is flawless. The route sweep saved 52 viewport screenshots, in addition to paired overview/footer captures, first-visit welcome, theme composites and expanded disclaimer. Selected desktop/mobile/tablet screenshots were manually inspected. Some fast UI automation reads preceded React’s committed state; settled URLs/results and a fresh-tab export were used for the final filter evidence.

## 12. Actual commands and outcomes

| Command/check | Outcome |
| --- | --- |
| `npm run build` | PASS, final log `build.txt` |
| `npm run lint` | PASS, `lint.txt` |
| `npm test` | 34 passed / 0 failed, `tests.txt` |
| `npm run data:validate` | PASS, 866 projects, 5253 history families, 2578 reports, seven checksums |
| `uv run --with pillow python scripts/brand-assets.py` | PASS, aspect/encoding/alpha assertions and asset report |
| CUA browser geometry/visual/keyboard checks | Artifacts alongside this report |
| Production Vite preview on 127.0.0.1:5134 | Five smoke checks passed; no returned warning/error console entries; temporary server stopped |

Production smoke covered welcome/logo, overview values, six-column projects, Privacy, and absence of the development-only brand route. Development QA controls/fixtures are absent from production JS. The normal localhost:5132 server remains available. No public hosting headers are inferred from Vite preview.

After the final asset-size refinement, the overview/footer and welcome were rechecked at all four screenshot widths, including fresh natural image dimensions and white/navy/near-black composites. `final-asset-recheck.json`, `final-welcome-captures.json` and `built-brand-integrity.json` record the final asset pass; all five exported brand files match the build. `console-final.json` contains no returned warnings/errors. `git diff --check` passes. These asset-only changes preserve the existing source-code build/test results and the exact aspect ratio.

## 13. Data integrity

`integrity-before.json` and `integrity.json` prove that the manifest, seven source shards, original PNG and LICENSE are unchanged; built shards match the same source hashes. No refresh or ingestion was run. Snapshot remains `2026-11-02-37334582ca74`. The source-region/title distinction, duplicate handling, project counts, original regions, exact source references, null/zero handling and comparison logic were not changed.

## 14. Main changed files

- `src/components/Chrome.tsx`, `BrandLogo.tsx`, `SourceStatus.tsx`, `LegalEntry.tsx`, `ScrollToTop.tsx`.
- `src/styles/master-layout.css`; imported last in `src/main.tsx`.
- `src/pages/RegionalOverview.tsx`, `Legal.tsx`, `RegionalMethodology.tsx`, `Identity.tsx`; shared width classes in Home/Analytics/Enacted; live-response label in Project.
- `src/lib/use-title.ts`, `src/App.tsx` (lazy-route focus marker and development-only composite route).
- `scripts/brand-assets.py`, new `public/brand/logo-*` and favicon assets, `index.html`, `public/manifest.webmanifest`.
- Development-only `src/qa/BrandFixture.tsx` and AccessibilityAudit motion-preview controls.

## 15. Before/after evidence

Paired [1920 before overview](before/overview-1920.jpg) / [after overview](after/overview-1920.jpg), [1440 before footer](before/footer-1440.jpg) / [after footer](after/footer-1440.jpg), [390 before overview](before/overview-390.jpg) / [after overview](after/overview-390.jpg). [Welcome desktop](after/welcome-1440.jpg), [welcome mobile](after/welcome-390.jpg), [Privacy desktop](after/privacy-1440.jpg), [four theme composites](after/brand-four-surfaces.jpg). Before welcome evidence exists at 1440 only; no fabricated before legal screenshots were created. Full-page capture was unavailable; the artifacts are viewport captures.

## 16. Skills and design process

See `DESIGN_PLAN.md`: actual skill discovery, loaded files, palette, layout sketch, deliberate design choices and pre-implementation critique. Frontend-design was newly available and used. Sites local workflow and CUA browser guidance supplied local preview/verification. No unrelated video animation skill or uninstalled accessibility skill is claimed. The complete application remains free/open-source and the original project/data attribution is preserved.

## 17. Outstanding verification

- Operator/legal completion, actual hosting provider, rights/correction handling, lawful criteria, retention and processor practices. No contact was added contrary to the owner’s instruction.
- Native browser zoom at 125–400%, native OS reduced-motion preference switching, screen-reader, cross-browser and physical-device acceptance.
- Actual host headers, caching/compression, recovery/failure behavior, network/performance/CWV measurements and exhaustive linked-document privacy review.
- Original logo edge quality and a future editable vector master; derivative provenance is documented rather than claiming a trace is exact.
- Prior latest-PSGC workbook reconciliation remains open; this design sprint does not certify a newer directory or regional budget completeness.

## 18. Readiness recommendation

**Implemented and verified for local owner review.** Production build succeeds and the bounded checks above pass. Public production launch remains pending the explicit hosting, legal/privacy and acceptance work. No Data Privacy Act/WCAG certification, official endorsement, production deployment or owner approval is implied. Older review packages and prior QA reports remain available.

Current review archives are under `release/master-layout/`, generated by `scripts/package-master-review.ps1`; the accompanying validation file records file-by-file archive hashes. They exclude `.git`, node_modules and private environment files. They do not replace the older regional/premium-ui review packages.
