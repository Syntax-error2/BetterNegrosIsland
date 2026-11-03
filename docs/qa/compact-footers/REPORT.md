# Compact footers — 3 November 2026

The shared navy footer now uses a short introduction, three small navigation groups, one disclaimer sentence and a compact source credit. Operator details, source restrictions, attribution and license references remain in a native expandable disclosure. The campaign footer now presents a small brand/date row, four links and one disclaimer sentence; its original scope notes and credits remain in a disclosure.

The shared footer reserves space beside the final credit for the floating back-to-top button. Legal documents and budget records were not changed.

Validation:

- `npm run build`: PASS (TypeScript and production build).
- `npm run lint`: PASS.
- `git diff --check`: PASS.
- Browser layout measurements at 320, 375, 768 and 1440 CSS pixels: no horizontal document overflow or clipped footer links in either footer. See `responsive-checks.json` (viewport excludes scrollbar width).
- Desktop screenshots inspected for both footers; mobile screenshot inspected for the shared footer.
- Both disclosures expanded and collapsed successfully; shared disclosure also tested with Enter. Full operator/source text remained available when expanded.

Screenshots are local development previews, not evidence of public deployment or legal/accessibility certification.
