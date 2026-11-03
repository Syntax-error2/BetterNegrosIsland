# Privacy, deployment and Negros Island reading audit

Reviewed 3 November 2026. **Engineering checks passed locally; public website launch is not legally/operationally cleared.** The public source repository is `Syntax-error2/BetterNegrosIsland`. Hosting, a real website origin and a monitored portal privacy contact remain unspecified. No public website deployment, automatic refresh activation or legal certification occurred.

## Findings and repairs

| Finding | Result |
| --- | --- |
| BetterGov.PH was being suggested as the privacy contact because it supplies the data | Privacy Notice v`2026-11-03-privacy.5` explicitly distinguishes source provider from portal operator. No rights-handling agreement or contact has been invented. **A working private operator channel remains needed.** |
| Disclaimers could be mistaken for a waiver of privacy obligations | Terms now explicitly preserve legal rights/operator responsibilities and reject unrestricted republication of unrelated personal data. Private identity documents/request details should not be posted in public issues/social comments. Existing proposal/spending, uncertainty and no-allegation notices are retained. |
| Privacy pattern triage covered display fields only | Added recursive inspection of every JSON string under `public/data`, including nested raw records and retained files. Findings use fingerprints and rule names, without copying potentially sensitive matched content. |
| Broad host rewrites could return the app HTML for missing JSON/JS | Shared application-route allowlist generates `_redirects`, Netlify and Vercel configuration. Real 404 document and Cloudflare 404 handling preserve missing-file status. Development fixtures are not rewritten. |
| Vercel had no equivalent `_headers` policy | Shared policy generates equivalent explicit Vercel security/cache headers. CSP restricts scripts/fonts/images and connection destinations; framing, referrers and unnecessary device permissions are restricted. Live Vercel/Netlify behavior remains unverified. |
| Wildcard immutable cache rules applied to missing assets | Local runtime reproduced a year-long immutable header on a missing JS response. Caching now uses exact existing checksummed shard URLs; absent paths revalidate. Mutable manifests/status files revalidate. |
| Snapshot loader accepted arbitrary paths/HTML fallback responses | Only same-origin `/data/*.json` paths without traversal/query are accepted. Fetch omits credentials and referrers and verifies JSON content type. Invalid/missing payloads fail closed. |
| A stale browser tab could go blank after a lazy module failed | Added route error boundary with an explicit Reload current version control. Controlled local missing-chunk test showed the recovery screen; restoring the asset/restarting the runtime and reloading restored the real view. No substitute figures or server errors are exposed. |
| Deployment settings could drift and canonical URLs required source edits | Build generates host policy; drift check added. Node 24 specified. Optional validated HTTPS `VITE_SITE_URL` supports host build settings. One `npm run verify` command and read-only GitHub CI check the project. Cloudflare deploy command verifies before its real deployment step. |

## Privacy scope and limits

Code inspection found local notice-version storage, browser-local search/filter/image/QR/download/clipboard processing and intentional read-only source requests. No accounts, visitor GPS, advertising, fingerprinting or behavioral tracking integration was introduced. Hosting and source providers can still receive ordinary network/request information; no zero-personal-data claim or invented retention period is made.

Full published-data pattern scan: **11 JSON files, 268,663 string values, zero flags.** Existing display-field scan: 866 comparison records and 5,253 historical families, zero flags. The scan does not determine lawful processing, detect every name/identifier, review linked PDFs or certify legal compliance. See `published-data-triage.json`. Production dependency audit reported **zero known vulnerabilities** at audit time; see `npm-production-audit.json`.

The remaining operational decisions are a monitored private privacy/corrections channel, a working rights-response/verification procedure, hosting/processors and their log retention/access/locations, applicable lawful criteria and operator/legal approval. The owner’s reply “it’s from BetterGov” identifies the source, rather than resolving these points. Existing geographic-reference and independent browser/device/screen-reader acceptance boundaries remain documented in `docs/RELEASE.md`.

Primary references: NPC [Data Privacy Act](https://privacy.gov.ph/data-privacy-act/) and [IRR](https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/), especially transparency, legitimate purpose, proportionality, security and rights information including controller contact/retention. This is an engineering/privacy review aid, not a legal opinion.

## Regional reading feature

Added a red “We are not ignorant” banner and `/we-are-not-ignorant`, inspired by the linked [BetterGov.PH national initiative](https://budget.bettergov.ph/hgab/2027/we-are-not-ignorant). The regional text, counts and records are independently assembled from this portal’s dated snapshot. The national project count is not reused as a Negros Island total.

The view requires both a source-confirmed flag and `region_key=NIR`; office/title-only records are excluded. Default categories: **211 House-only, 11 higher, 11 lower**, from the 851 source-confirmed NIR records. Fourteen source-marked unconfirmed change records are excluded by default and can be explicitly included. Unchanged, NEP-only and scope-review records remain available in the full explorer. Province filters use qualified title associations and do not certify locations or provincial monetary allocations. Third/second House readings remain qualified by program. Exact amounts, source references, evidence tools and source caveats use the existing project table.

Browser checks covered uncertainty inclusion (247 matching change records), NIA zero-result recovery, reset, progressive loading from 20 to 40 records, Siquijor filtering and a banner navigation. The snapshot itself was not refreshed or modified.

## Verification

- **60 tests passed**, covering existing financial/source guarantees and new regional selection/conflict/uncertainty, host route policy, and snapshot-path/HTML rejection cases.
- **`npm run verify` passed:** seven shard checksums, record/financial reconciliation, both privacy scans, tests, lint, production build and host-policy drift check. This command is an engineering gate, not legal approval.
- **Local Cloudflare HTTP runtime:** 13 paths plus a real JS module and summary shard checked. Known deep routes return 200; missing JSON/JS/images, `.env`, development fixtures and an unknown page return 404 with security headers. Mutable metadata revalidates; the exact summary shard caches immutably; missing assets do not. See `http-check.json`.
- **Production browser:** regional view recovered after a deliberately missing chunk; default counts reconciled. Six analytics SVG viewports had nonzero dimensions, and an evidence PNG preview rendered under the tightened CSP. No CSP denial was observed in those checks. See `production-*.json` and `missing-chunk-recovery.png`.
- **Regional responsive checks:** 320, 375, 768 and 1440px, without page overflow or clipped titles/buttons. See `regional-responsive.json`.
- **Final desktop/phone axe checks:** zero violations and zero incomplete rules. Decorative text symbols were replaced by aria-hidden SVGs before the final audits. This is not independent WCAG/physical-device certification.

During testing, Windows Wrangler’s asset watcher disabled itself with EPERM after a build replaced `dist/`. The runtime was stopped/restarted against the complete package before final checks. The deliberately withheld generated chunk was restored. No missing test asset was left in the package. Local-only runtime will be stopped after QA; the existing development server remains available.

Cloudflare runtime is the host rehearsal actually exercised. Netlify/Vercel were checked through shared configuration/unit tests and official documentation, not remote deployments. GitHub CI is configured to validate a clean Ubuntu/Node 24 checkout after push; its run status is separate evidence in the repository.
