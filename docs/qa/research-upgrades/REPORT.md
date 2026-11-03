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

## Hosted workflow and production evidence

- Application commit `f08b969` passed GitHub verification and Vercel production deployment. Production HTTP checks passed all 26 cases, including corrections and prefixed research routes; all seven retained production shards matched their SHA-256 checksums. See `live-http.json` and `live-integrity.json`.
- CI rehearsal [41704053039](https://github.com/Syntax-error2/BetterNegrosIsland/actions/runs/41704053039) passed with no API extraction, no review branch and `data_changed=false`. The original retrieval date remained unchanged; see `ci-rehearsal.json`.
- Fresh extraction [41704347161](https://github.com/Syntax-error2/BetterNegrosIsland/actions/runs/41704347161) passed in 9m17s, including all release checks, scoped-token branch push and artifact uploads. Candidate version `2026-11-03-088db307802f` has 866 comparison records, with 0 raw comparison additions, removals or revisions. The broader collection fingerprint changed; the full diff still requires review. See `fresh-candidate.json`.
- [Draft data pull request #1](https://github.com/Syntax-error2/BetterNegrosIsland/pull/1) was created for review, not merged. The live budget pointer remains on `2026-11-02-37334582ca74`.
- Repository variable `ENABLE_NIR_REFRESH=true` was set and read back. The configured daily preparation time is 18:23 UTC / 02:23 Philippine time. Schedule execution can be delayed by GitHub. A reviewed merge is still required for data publication.
- Production browser: saved methodology displayed the correct version and citation. At 390×844 it had no horizontal overflow; sharing targets were 44 px high, and Tab moved focus from the share action to View latest with a visible focus indicator. Temporary viewport overrides were reset. Contact page console had no captured errors or warnings.
- Follow-up QA found and fixed direct Terms visits leaving source notices in a loading state. Terms now request the retained scope; a browser check confirmed both upstream source disclaimers rendered without accepting the entry terms. Latest live project details also label their sharing action as an archived snapshot, so newer API details are not misrepresented as retained figures. Archived details include the originating source reference and comparison build date.
