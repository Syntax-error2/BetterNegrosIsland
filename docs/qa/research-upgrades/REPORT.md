# Research workflow upgrades — 4 November 2026

Implemented a maintainer-supplied private email contact and public correction-log page, version-specific budget routes, and validated review-branch preparation for scheduled data updates.

## Executed local checks

- Full `npm run verify`: 76 tests passed; data reconciliation, seven shard checks, display-field privacy pattern triage, published-JSON triage, lint, production build and generated deployment-policy checks passed.
- Isolated refresh rehearsal completed with no API extraction, no current-data replacement and `data_changed=false`. Original retrieval date was preserved.
- Browser: public contact page rendered at desktop and 390×844; no horizontal overflow (390 viewport / 375 document width including scrollbar). Main email action measured approximately 50 px high. No form exists in the rendered page. Mailto href matches the supplied address exactly; no email was sent and delivery was not independently tested.
- Browser: retained methodology route showed the correct version-specific navigation and citation. View latest removed the version prefix. Copy action displayed success and exposed the exact link; clipboard bridge contents were not independently confirmed.
- Browser: an unavailable version rendered “Snapshot unavailable” and explicitly stated that no newer records were substituted.
- Data-reader tests verify archived-file checksum enforcement, unsafe/cross-version request rejection, mutable-index blocking and unavailable-snapshot failure without fallback.
- Fixed financial regression assertions now read the original retained fixture; current-data integrity and community/model checks still follow the current manifest.

## Boundaries

No budget figures were altered by these application changes. Latest project detail remains live; saved snapshot project detail uses archived rows only. Notices, explanations, the contact page and public correction log can evolve. Source websites are external and are not archived by a pinned portal link. Indefinite snapshot retention is not promised.

The contact address was supplied for publication by the maintainer. The site uses mailto and has no request-submission backend. Private correspondence must remain outside the public repository and correction log. Formal controller identification, inbox/provider operations, retention, legal/privacy review and exhaustive source-document review remain unresolved. Pattern triage does not establish legal compliance.

This report does not claim that the website's binding entry terms were accepted during browser QA. Public notices, research methodology and corrections can be read without accepting them. Financial views were covered by data/model and integrity tests; the new archived detail layout was not exercised past the entry terms in this browser session.

The refresh workflow never merges its own candidate. Production publication follows a reviewed merge into main through the existing Vercel integration. CI rehearsal, real extraction, schedule state and production HTTP observations are recorded in the follow-up evidence after execution.
