# Analytics repair design plan — 3 November 2026

Purpose: compare public budget stages and source-record associations without implying spending, completeness or wrongdoing. Preserve the established Plus Jakarta Sans typography, supplied identity and public access.

Palette: navy #133b9c (NEP), teal #08786b (House), ink #122b43, muted text #4e6375, rule #d7e0e8, surface #ffffff. Pair color with written series names, direct category labels and exact table values.

Layout: `[page heading + compact snapshot/source] [wrapping global filters] [four KPI cells] [A comparison + focus control | B program amounts] [C province counts | D six status counts] [F ranked projects] [historical E/G] [coverage H]`. Two columns only above 1200px; narrower cards become full-width, not miniature desktop plots. Category counts determine horizontal plot height. Mobile comparison uses grouped horizontal bars; focused program selection uses an explicitly recalculated zero-based scale.

Pre-build critique: do not add independent small-multiple scales, decorative charts, tiny legends, padded all-equal card heights or number counters. Replace the six-series one-row status stack with one count series across six named categories. Use one reusable ChartCard and compact SourceAttribution. Tables remain available for zero and missing data, not only when the plot has positive bars.

Root cause confirmed in source and browser: Recharts 3.10.1. `chartRows` contains `axisLabel`, but BarChart receives `rows`; horizontal YAxis requests an absent key. B/C/D/F all have zero positive rectangles despite valid data; A has six. Previous bounds-only checks did not assert bar geometry and missed this defect. This sprint must assert positive data against actual visible SVG rectangles and exact table contents after resize/filter changes.

Skills: frontend-design SKILL.md read and applied; existing Sites/local-preview and CUA browser documentation apply to the local repo workflow. Discovery found no project/ancestor AGENTS.md or project skill, nor dedicated installed web accessibility, responsive chart or browser visual-regression skill. The inline visualization skill is not an implementation substitute for repairing this repository. Installed version and official Recharts BarChart/YAxis/ResponsiveContainer documentation inspected. No motion package or chart dependency replacement is needed.

The brief references a screenshot but its attachment directory contains text only. Current browser baselines are the evidence; no missing screenshot is fabricated.
