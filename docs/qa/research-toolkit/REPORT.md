# Research toolkit — 3 November 2026

Added a research section to the existing Methodology page, including a snapshot-based citation, local TXT download, field guide and six-step verification checklist. Methodology is now readable before entry, with a welcome-page link. No source budget values or dataset coverage were changed, and no new route, participant-data collection, tracker or API refresh was added.

Validation:

- `npm run verify`: PASS, including all 71 tests, data/checksum validation, privacy pattern triage, lint, production build and deployment-policy checks.
- New tests verify exact loaded manifest/checksum preservation, source notices, citation timestamps, unchanged input data, blocked downloads without notices, invalid citation inputs and agreement between field guide and every base CSV column.
- Browser copy test: clipboard text exactly matched the displayed citation.
- Browser download test: actual TXT file contained the expected snapshot ID, scope checksum, source disclaimer and field definitions.
- Field guide expanded/collapsed successfully. Research page was accessible without accepting Terms; other entry behavior was preserved.
- Browser geometry at 320, 375, 768 and 1440 CSS pixels: no horizontal document overflow or clipped actions; action heights at least 44 pixels. Desktop and mobile screenshots inspected. Temporary viewport overrides reset.

Research use and passing technical checks do not constitute independent data validation, peer review, legal/privacy certification, proof of expenditure or a guarantee against claims. Existing operating-review gaps remain explicit.
