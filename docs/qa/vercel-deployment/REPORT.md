# Vercel deployment — 3 November 2026

The owner authorized deployment to AQURA ITS and separately confirmed adding BetterNegrosIsland to the existing Vercel GitHub App's selected repositories. The four previously selected repositories were preserved.

- Website: https://betternegrosisland.vercel.app
- Project: https://vercel.com/aqura-its/betternegrosisland
- Source: https://github.com/Syntax-error2/BetterNegrosIsland (`main`)
- Initial production deployment: `dpl_47U5sgPedGHd9x5y4PvaHmydxQkJ`, source `37272523957dda2e74fa4aace656ee82f06ea122`.
- Preset: Vite; repository root; `npm run build`; output `dist`.
- Canonical site origin is recorded in `portal.config.ts`; `VITE_SITE_URL` remains an optional public override for future hosts.
- No analytics, Speed Insights, paid upgrade, custom domain purchase or application backend was enabled.

Verification:

- `npm run verify`: PASS, including 67 tests, data validation, pattern triage, lint, production build and deployment configuration checks. Pattern scans do not certify privacy compliance or review linked PDFs.
- The production URL loads the welcome screen without Vercel account authentication. No Terms agreement was accepted on a visitor's behalf during QA.
- `node scripts/check-deployment.mjs https://betternegrosisland.vercel.app`: all 21 HTTP cases passed, plus module loading and immutable snapshot caching. Deep application paths return 200; missing data, assets, development routes, `.env` and unknown routes return 404. Configured security headers and mutable JSON revalidation were checked against the actual production origin.
- Vercel reported Ready and connected the production deployment to GitHub `main`. A follow-up source push tests that automatic code deployment connection.

The included budget snapshot remains `2026-11-02-37334582ca74`. Scheduled API extraction and publication are not enabled. The prepared workflow needs a separate validated-artifact publishing connection; ordinary code builds do not fetch a new budget snapshot.

The public notices identify Vercel, with legal version 7 requiring renewed acknowledgment. A monitored privacy contact, operational rights-request procedure and provider processing/retention review remain unresolved. Hosting is not a certification of privacy, legal, accessibility, geographic or physical-device acceptance.
