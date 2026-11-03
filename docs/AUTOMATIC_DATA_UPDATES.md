# Reviewed data updates and snapshot research links

The live site uses the existing GitHub-to-Vercel integration. Ordinary builds use checked-in validated data and make no budget API extraction. The refresh workflow prepares reviewed candidates; it never merges its own data into main.

## Daily preparation, followed by human review

`.github/workflows/nir-refresh.yml` supports manual dispatch and an opt-in daily schedule at 18:23 UTC (02:23 Philippine time). Set repository variable `ENABLE_NIR_REFRESH=true` to enable scheduling. GitHub can delay schedules or disable them after prolonged inactivity; this is polling, not an immediate API webhook.

Manual dispatch defaults to `rehearse=true`: existing data is validated and packaged without API extraction or a review branch. A real run uses `rehearse=false`. The job extracts into an isolated temporary directory, validates pagination, source metadata, identities, exact amounts, geographic evidence, reconciliation and seven shard checksums. It performs display-field privacy triage, a full published-JSON scan, all tests, lint and production build checks. Failure stops branch preparation and leaves main and the live site untouched.

All seven budget collections are fingerprinted, ignoring collection timestamps only. Source metadata, notices, geography, coverage and financial changes remain significant. An unchanged collection creates no review branch. A changed candidate creates `codex/nir-data-review-<collection-fingerprint>` with data, generated hosting policies and `docs/data-refresh/candidate.json` only. The Actions run summary contains a compare link to create a pull request. If an identical candidate branch already exists, it is preserved rather than overwritten; remove a rejected candidate branch if a new review of the same data is needed. The job uses a scoped repository contents-write token through the GitHub credential helper, not a stored Vercel credential or personal access token. It does not need permission to create or approve pull requests.

Review the candidate report, full data diff, privacy triage and source documents. Comparison additions/removals/counts do not summarize all historical, NEP, source-notice or coverage changes. Open and review the pull request, wait for its verification checks and merge it into main only after review. The existing Vercel Git integration builds that merged commit. Check the production deployment and HTTP behavior before treating it as published. Remove obsolete candidate branches after review. No workflow auto-merge is configured.

A failed extraction does not create a failure status in the live data: use GitHub Actions for run status. The portal dates describe its last published snapshot, not the latest attempted collection. Candidate reports and built site artifacts are retained in Actions for seven days. No failed job deploys a partial artifact.

## Coverage and API use

The configured extraction covers FY2027 DPWH, FMR, HFEP and NIA comparison programs; source-region, office and qualified place-name queries; the separate FY2027 NEP regional rollup; and FY2020–FY2026 GAA searches. It does not discover every NIR expense or add new fiscal years, programs, endpoints or geographic directories automatically. Schema changes should fail validation and require review.

A complete extraction makes roughly 2,600 requests and may take several minutes. Transport uses bounded retries, cooldowns and timeouts. A single comparison source-build timestamp cannot prove that GAA or NEP endpoints are unchanged. The job therefore collects the configured scope rather than assuming one timestamp covers all data. The small hearing index is separately refreshed during real CI runs and checked before candidate packaging.

Fixed regression assertions use the retained 2026-11-02 snapshot. Current-data integrity and reconciliation tests continue to read the current manifest. Do not change fixed reference totals to conceal a candidate failure.

## Saved research links

Choose **Share this exact snapshot** or **Open saved snapshot** on a budget view. A route such as `/snapshots/2026-11-02-37334582ca74/projects?...` preserves the budget version and filters. Internal portal navigation retains this prefix. **View latest** deliberately starts a new page load outside the prefix.

The reader verifies the selected manifest identity, seven exact file references and SHA-256 checksums. A missing, corrupt or unretained snapshot fails explicitly; newer data is never substituted. Saved project details use archived rows and do not request live API detail. NEP, historical appropriations, comparisons, charts and evidence cards use the selected retained files. Research citations include a version-specific link.

Explanatory text, legal notices, the contact page and public correction log may evolve. External source pages are not frozen. Hearing and update indexes are not archived within a budget snapshot; pinned routes explain this and link to their latest view. Saved-item record IDs are interpreted within the selected view. Saved search paths retain their snapshot prefix when present. Keep local exports and source documents where lawful; indefinite online retention is not promised.

Historical shard bytes and manifests must not be overwritten under an existing version. When a privacy restriction requires withdrawal, remove the affected retained version, remove immutable cache policy entries, consider host/cache/deployment/Git-history exposure, and leave old links explicitly unavailable. Do not silently replace a withdrawn record with newer data. See [private request handling](CORRECTIONS.md).

## Local preparation

```sh
npm run data:refresh:candidate -- --rehearse
npm run data:refresh:candidate
```

Successful packages are stored in ignored `release/nir-refresh/`; `latest.json` advances only after successful preparation. The command never replaces local current data or deploys. Rehearsals retain the original retrieval date. Production builds verify retained shards and produce the public data-update receipts without contacting the API.

The hosting policy uses revalidation for current manifests/status/corrections and immutable caching only for exact verified retained files. Missing assets or JSON remain 404. Legal/privacy review, inbox operations and provider arrangements are separate from technical checks.

References: [GitHub scheduled workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [GitHub token permissions](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token), [BetterGov.PH API specification](https://budget.bettergov.ph/api/v1/openapi.json).
