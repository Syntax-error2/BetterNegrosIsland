# First-visit cookie notice — 3 November 2026

Added an informational “Cookies & privacy” strip before page content. It does not cover the welcome controls, block reading, enable tracking, or accept Terms. “Got it” remembers dismissal with a single first-party, host-only cookie, `bni_notice=v1`, for up to 180 days. No visitor ID, timestamp, search, saved record or consent profile is stored in that cookie. The configured attributes are `Secure; SameSite=Lax; Path=/`; no Domain attribute broadens its scope. The notice can be reopened from the Privacy Notice, with keyboard focus moved to its heading.

The cookie is written only when the visitor dismisses the notice. If the browser rejects storage, dismissal still works in memory for the current page visit. This is separate from the existing local Terms acknowledgment and optional notebook. The public Privacy Notice documents the cookie and advances to version 8. No advertising, analytics or third-party cookie integration was added.

Validation:

- Full verification: 69 tests PASS, plus data validation, pattern scans, lint, production build and deployment-policy checks.
- Additional tests cover exact cookie matching, expiry/scope attributes, and throwing or silently blocked cookie storage.
- Browser: initial notice visible; dismissal removes it; reloading keeps it hidden; the Terms entry control stays disabled without the Terms checkbox.
- Browser: “Review cookie notice” reopens the strip and moves focus to its heading.
- Responsive measurements at 320, 375, 768 and 1440 CSS pixels show no horizontal overflow or overlap with page content. Both actions are at least 44 CSS pixels high. Desktop/mobile screenshots inspected.

Technical reference: [MDN cookie configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie). This implementation and automated pattern triage do not certify legal/privacy compliance. The existing operator contact and rights-request gaps remain open.
