# Citizen tools delivery — 3 November 2026

All four requested additions are implemented in the existing local portal. This is a local feature delivery, not publication or legal/release approval. Existing snapshot, operating data, legal entry, source attribution and privacy boundaries remain.

## What people can do

1. **Shareable evidence cards** — “Share card” in project results, or “Create dated evidence card” on a project detail, opens `/evidence/:dataset/:id`. Choose NEP or House, review the image and download a PNG. The card includes the full project title, exact amount (or explicit unavailable state), actual House reading, FY2027 proposal stage, source identity, dated snapshot/source-build timestamps, attribution, geographic/uncertainty caveats, preserved source notices/restriction URLs and a QR code. Its source URL is both printed and QR-encoded. The card deliberately uses the dated snapshot, separately from live detail responses.
2. **Question shortcuts** — six homepage entry points lead to the community spotlight, grouped version comparison, enacted history, two-record comparison, budget guide and project evidence workflow. The community link scrolls to and focuses the actual selector section. The footer also links to comparison and the guide.
3. **Compare two records** — `/compare` provides two searchable record selectors. Exact NEP values align with NEP and House values with House; second/third House readings are separately disclosed. Full titles, identity, source classification, uncertainty, region, office and trusted evidence actions remain available. No sum across records/versions or implied spending/ranking is generated. Selections live in encoded URL parameters; swap, clear and copy work. Clearing also clears the search fields. Duplicate/unknown identities produce explicit states without silently substituting records. On phones, the native table has its own labeled keyboard-accessible horizontal scroll region.
4. **One-minute budget guide** — `/budget-guide` explains proposal, House version, enacted appropriation and actual spending in five user-controlled steps, ending with a real paired source example. There is no timer, account or stored completion profile. A knowledge check explains why appropriation is not proof of payment. Keyboard navigation moves focus and scroll position to the new step heading. The current example is Bago City Hospital: NEP ₱11,700,000, House ₱50,000,000, second-reading House record. It is selected as a readable paired example, not a funding-importance ranking or misconduct allegation.

## Implementation and data boundaries

The frontend-design skill was reused with the existing navy/blue civic palette, locally served Plus Jakarta Sans, restrained borders, visible focus, full source titles and responsive layout. No image generation, tracking, geolocation, account system, proxy, upload or external card-rendering service was added.

Cards use native canvas and the locally bundled [node-qrcode library](https://github.com/soldair/node-qrcode#readme). Font loading and the supplied transparent logo are resolved before measurement. Text wraps using measured glyph widths, including unbroken URLs; image height grows with the entire title/notices rather than clipping or using ellipses. The QR has a four-module quiet zone, integer modules and error correction M. The renderer license is shipped as `public/QRCODE-LICENSE.txt`. QR decoding/PNG inspection libraries are development dependencies only.

Exports are local Blob downloads. A first data-URL download attempt generated a valid preview but produced no browser download; it was replaced with the already-established local Blob download pattern and verified with actual downloaded files. PNG render errors and unsafe financial input show recovery text rather than substituted values. Exports without a trusted source cannot be generated.

The existing `PortalProvider` loads scope on evidence/comparison routes. QR code code is confined to the lazy evidence route. The guide loads its full project example only when the final step mounts. Existing homepage summary loading and the on-selection community behavior are preserved. No ingestion/refresh ran; all seven original public snapshot checksums match, and the built copies match them too.

Comparison URLs currently contain `localhost`, so they work only on this computer until the portal has an approved public host. The copy status explains this. Card QR codes intentionally point to the verified public BetterGov source and already work independently of local hosting. This distinction prevents advertising an unpublished portal URL as a public evidence destination.

## Actual verification

| Check | Result / evidence |
| --- | --- |
| Unit/integration suite | **55 passed, 0 failed** (`tests.txt`). Five new tests cover 866 records × both stages, exact money/null/zero/unsafe values, preserved notices/provenance, encoded identity links, measured text wrapping, QR decoding and eligible real guide examples. |
| ESLint, TypeScript and production build | PASS (`lint.txt`, `build.txt`). |
| Dependency advisory audit | 0 known vulnerabilities (`dependency-audit.json`); not a penetration test. |
| Snapshot integrity | Seven checksums reconcile; built shards equal the public source (`data-validation.txt` and final integrity assertions). No invented record or amount. |
| Browser responsive sweep | **44 cases passed**: populated comparison, evidence page, final guide example and homepage × 320/360/375/390/430/600/768/1024/1280/1440/1920 (`responsive.json`). Checks include page overflow, clipped primary text, loaded images and existing KPI alignment. |
| Accessibility | **Seven axe audits, zero automated violations**: homepage at 390; comparison/evidence/guide at 390 and 1440 (`accessibility.json`). Native screen-reader, other-engine and physical-device certification is not claimed. |
| Production bundle browser | Six cases (three new routes × 390/1440) passed, with no development audit controls (`production-browser.json`). Final production reset/search and real-example behavior separately checked (`production-final-interactions.json`). |
| Actual PNG exports | Final House example **1080×2626** and missing-NEP example **1080×2508** downloaded successfully. QR decoder run against the actual full PNG pixels recovered the exact canonical source IDs 1918 and 6378 (`export-verification.json`). This is software decode verification, not a physical-camera scan claim. |
| Exact comparison values | DPWH record 1918 NEP/House ₱360,000,000 / ₱360,000,000; HFEP Bago City Hospital ₱11,700,000 / ₱50,000,000. Source readings, titles and identities verified (`comparison-values.json`). |
| Comparison operations | Search, selection, disabled duplicate choices, duplicate deep-link rejection, unknown IDs, swap, reload, copying and clearing tested (`comparison-navigation.json`, `copy-clear.json`, final production interactions). |
| Evidence operations | Real downloads, stage change, missing NEP, held pairing notes, source copy, encoded HFEP ID and project-result entry points tested (`project-entry-points.json`, sample images). |
| Guide and shortcuts | All five steps, keyboard focus, correct quiz feedback, actual example and community-anchor focus tested (`guide-functional.json`, `guide-functional-final.json`, `shortcuts.json`). |
| Explorer regression | New entry actions tested on real HFEP rows at 320/768/1440; no detected page overflow (`project-entry-points.json`). |

Visual review covered the actual exported card, full comparison page, guide phone step and homepage question links. Screenshots include `citizen-shortcuts-1440.png`, `compare-1440.png`, `guide-390.png` and `evidence-page-1440.png`. One full-page evidence screenshot attempt failed; a viewport capture was saved instead. Some browser setup/readiness calls required recovery; incomplete calls are not counted as successful verification.

## Files

New: `src/lib/evidence.ts`, `evidence-image.ts`; `src/pages/EvidenceCard.tsx`, `CompareRecords.tsx`, `BudgetGuide.tsx`; `src/components/CitizenShortcuts.tsx`; `src/styles/citizen-tools.css`; `tests/citizen-tools.test.ts`; QR license and QA artifacts.

Integrated into: app routes, scope loading, project table/detail actions, homepage, community anchor, footer and stylesheet entry. `package.json`/lock add the local QR renderer and development-only decoding tools. Existing earlier uncommitted work is preserved; this report does not claim every checkout difference belongs to this task.

The feature work is complete for local review. Existing operator contact, provider/log-retention decisions, legal acceptance, hosting verification, current PSGC review and independent device/accessibility gates remain before publication. No external message was sent and no site was deployed.
