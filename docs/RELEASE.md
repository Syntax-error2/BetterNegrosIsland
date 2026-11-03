# Release assessment — BetterNegrosIsland

**Verdict: working local/static review candidate; public production release remains NO-GO.**

The regional build implements the supplied identity, three provinces, 63-code official-source directory, static ingestion, analytics with exact tables, source evidence, accessible controls and versioned welcome. The source API integration and original MIT license are retained. No login, registration or application backend was introduced.

Current evidence and unresolved work: [implementation report](regional/IMPLEMENTATION_REPORT.md), [UI QA](../UI_QA_REPORT.md), [ingestion report](regional/INGESTION_REPORT.md), [scope](SCOPE.md), [deployment](deploy.md).

Public-release blockers:

1. Operator identified by owner: Aqura Information Technology Solutions / Dave Hermoso, Binalbagan, Negros Occidental. A monitored portal privacy contact has not been supplied. BetterGov.PH is the budget data provider; no agreement appointing it as this portal’s privacy/rights handler has been verified. Finalize rights-request procedures, hosting/logging/retention, applicable lawful criteria and legal review before launch.
2. Reconcile the 63-code directory against the latest PSA workbook. The available July 2025 listing is explicitly dated; the September 2026 download was blocked.
3. Obtain owner acceptance for the regional design, data boundaries and historical title crosswalk. No independent geographic certification or exhaustive source-recall audit has occurred.
4. Configure an approved host/domain/siteUrl; verify public access, deep-link fallback, security/cache/compression headers and external social preview metadata.
5. Run independent device/browser, screen-reader and slow-network QA. Current browser evidence is desktop Chromium emulation through the in-app browser, not physical-device or WCAG certification.

Additional engineering work: split large project/history shards where useful; improve source metadata and historical PDF links where APIs support them; audit place-name search recall and historical comparability. Retained prior district release archives are historical and are not this regional release.

The source is publicly available at [Syntax-error2/BetterNegrosIsland](https://github.com/Syntax-error2/BetterNegrosIsland). Source publication is separate from website deployment, official endorsement, legal acceptance or public-launch clearance. No hosted website deployment has been performed.

Latest UI/privacy remediation: [report](qa/premium-ui/REPORT.md). Successful engineering checks do not resolve the remaining release gates.

Latest 3 November audit: [privacy/deployment and regional reading report](qa/deployment-privacy/REPORT.md). Sixty tests, full published-JSON pattern triage and local Cloudflare HTTP/runtime checks support engineering review. Shared routing/security configuration, a real 404 page, missing-chunk recovery, a single verification command and CI checks reduce deployment failure risks. The source-confirmed NIR reading feature is separately qualified and does not claim wrongdoing or spending. These checks do not replace the unresolved operator/provider decisions above.


3 November 2026 critical hardening: see [implementation and issue register](qa/critical-hardening/REPORT.md) and [processing inventory / operator decisions](qa/critical-hardening/PRIVACY_PROCESSING.md). Footer status copy was removed at the owner’s request; this does not satisfy the monitored privacy-contact, rights-handling, provider, legal-approval or hosting gates. The repaired local UI is a review candidate only.
