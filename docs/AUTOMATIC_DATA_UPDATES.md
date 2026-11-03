# Automatic data refresh and hosting

This repository includes preparation for automatic refreshes. **No hosted schedule or deployment has been enabled.** The host is undecided. Ordinary frontend builds use the included validated snapshot; uploading the site alone does not turn on API refreshes.

## Prepared workflow

`.github/workflows/nir-refresh.yml` can run manually in GitHub Actions. Setting the repository variable `ENABLE_NIR_REFRESH=true` opts into a daily run at 18:23 UTC (02:23 Philippine time). The workflow must exist on the default branch. GitHub schedules can be delayed and can be disabled after prolonged repository inactivity; this is a polling schedule, not an immediate API webhook.

The job verifies the checked-in application, extracts into an isolated temporary directory, validates complete pagination, identities, exact peso values, source metadata, region/query membership, financial reconciliation and shard checksums, and runs display-field privacy triage. It then tests candidate integrity, community summaries and evidence cards and builds a static site artifact. No repository write token or hosting credential is needed for preparation. Candidate validation failure stops the job before a site artifact is uploaded.

Some existing analytics regression tests intentionally pin the reference snapshot's exact amounts and record counts. The full reference suite runs before extraction; current-candidate tests run after extraction. Do not update expected reference totals merely to conceal a candidate error.

`nir-site-candidate-<run-id>` contains the built site; `nir-refresh-report-<run-id>` records old/new snapshot versions, source dates, counts, additions/removals/changed raw comparison records and privacy triage. Artifacts are retained for seven days. These are review/build artifacts, not a deployment or legal clearance. Hosting/provider and rights-request decisions remain necessary before public release.

## Complete the publishing connection after choosing a host

The final deploy step must upload the **validated artifact**, after the checks succeed, using the selected host's scoped credential stored in its secret manager. Use an atomic site deployment, preserve a rollback release and previously referenced snapshot files, and leave the previous live release in place on extraction, validation or deploy failure. Never trigger publication from a failed job or rebuild from an unrelated checkout. No deployment hook, token or public repository has been fabricated here.

The generated host configuration gives mutable manifest/status files revalidation and exact, existing checksummed shards long-lived immutable caching. Missing paths do not receive a blanket immutable rule. Verify actual HTTP responses after deployment. New page loads read the deployed manifest. An already-open page keeps its loaded snapshot until reloaded, preventing mixed-version figures.

## Coverage and freshness

This refresh follows the existing FY2027 NEP/House comparison programs (DPWH, FMR, HFEP, NIA), NIR source-region/office and qualified place-name queries, the separate FY2027 NEP regional rollup, and FY2020–FY2026 GAA history. New records returned by those queries can be included on the next successful refresh and publication. It does **not** discover every possible NIR expense or automatically add new fiscal years, programs, endpoints or geographic directories. A changed API schema should fail validation and require a code review.

The full extraction makes roughly 2,600 requests and can take several minutes. Respect provider fair-use limits; retries honor cooldowns and bounded timeouts. A single comparison build timestamp is insufficient to skip checks of GAA/NEP data because their endpoints do not all provide equivalent revision markers. This job therefore performs the complete configured refresh, rather than promising detection from one marker.

## Local preparation

```sh
# Rehearse isolation/validation/packaging using existing data; no API extraction:
npm run data:refresh:candidate -- --rehearse

# Perform a real full extraction into a candidate, preserving current public/data:
npm run data:refresh:candidate
```

Successful packages are saved under ignored `release/nir-refresh/`; `latest.json` points only to the last successful candidate. The candidate command never promotes local public data or deploys. Its rehearsal report explicitly retains the original retrieval date and is not represented as a fresh API fetch. Privacy pattern triage is not exhaustive personal-information/PDF review.

References: [GitHub scheduled workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [BetterGov.PH API specification](https://budget.bettergov.ph/api/v1/openapi.json).
