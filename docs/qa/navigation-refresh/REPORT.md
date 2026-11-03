# Navigation and scheduled refresh preparation

Local work verified 3 November 2026. No public deployment, remote repository change, GitHub workflow activation or fresh API extraction was performed. Hosting remains undecided.

## Navigation

Five primary destinations: Overview, Projects, Places, Analytics and Budget history. Guide & sources groups the one-minute guide, two-record comparison, coverage/updates, methodology/sources and initiative information. The source retrieval date remains visible on desktop, accurately labelled as a dated snapshot.

The desktop disclosure has native links, an expanded/collapsed button, outside-click dismissal, Escape dismissal with focus restoration, close-on-focus-leaving and active-section styling. On mobile, resources expand in the navigation flow; selecting a destination closes both disclosures. Decorative SVG icons are hidden from assistive technology.

Nine widths passed actual DOM geometry checks with resources expanded: 320, 375, 768, 1119, 1120, 1280, 1400, 1440 and 1920px. Checked page overflow, clipped text, broken images, header control bounds and existing KPI alignment. See `responsive.json`. Verified resource navigation to Compare, automatic menu closing, active resource state, Escape focus and outside dismissal. Browser viewport was reset after testing.

Final desktop and phone axe audits: **zero violations and zero incomplete rules**. An initial decorative-text caret produced an incomplete non-text contrast check; it was replaced by an aria-hidden SVG and both audits were rerun. These automated checks do not constitute full WCAG or physical-device acceptance. Screenshots: `navigation-header.png`, `navigation-desktop-full.png`, `navigation-phone.png`.

## Refresh preparation

Added `.github/workflows/nir-refresh.yml`: manual dispatch or opt-in daily schedule at 02:23 Philippine time. Read-only repository permissions, one refresh at a time, bounded job duration and seven-day artifact retention. Scheduled jobs require `ENABLE_NIR_REFRESH=true`; no variable was set remotely. Official action versions were verified against their repositories.

Added `npm run data:refresh:candidate`. Extraction runs in an isolated temporary workspace. It retains existing pipeline pagination/reconciliation guards, validates snapshot checksums and provenance and runs personal-information pattern triage before making a separate candidate package. Missing/invalid comparison revision metadata now fails extraction. The last successful candidate pointer is replaced atomically after successful packaging. The current local `public/data` directory is never promoted by this command.

The workflow tests the checked-in reference snapshot before extraction and candidate integrity, evidence cards and community summaries afterward, then builds a site artifact. The host-specific publisher is deliberately absent because the host has not been selected. The pipeline does not promise immediate push events, universal NIR coverage, new-program/year discovery, legal clearance or automatic deployment. Details and activation steps: `docs/AUTOMATIC_DATA_UPDATES.md`.

Mutable manifest/status cache rules and immutable versioned-shard cache rules were added to `_headers`; actual host behavior still needs verification after deployment.

## Verification and boundaries

- **56 unit tests passed**, including simulated extraction, validation and privacy-gate failures that preserve both public data and the previous successful candidate pointer.
- **Build and lint passed.** Native Node CLI syntax checked.
- **Candidate rehearsal passed** with existing snapshot `2026-11-02-37334582ca74`: 866 comparison records, 851 source-confirmed NIR records, 5,253 historical families, 2,578 query reports and seven checksums. Privacy display-field triage returned zero flags; it is not exhaustive source/PDF review.
- Rehearsal made **no extraction API requests**, preserved the original retrieval date and produced a clearly labelled, unpublished package under ignored `release/nir-refresh/`. Candidate/current manifest bytes matched. See `rehearsal.txt`.
- No fresh multi-thousand-request run or GitHub-hosted workflow execution was claimed. Those remain operational checks when enabling the chosen setup. Prior privacy/operator/hosting release decisions remain unresolved.

References: [BetterGov.PH API specification](https://budget.bettergov.ph/api/v1/openapi.json), [GitHub schedule semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), [upload-artifact](https://github.com/actions/upload-artifact).
