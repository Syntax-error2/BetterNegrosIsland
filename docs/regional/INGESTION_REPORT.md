# Regional ingestion

Snapshot 2026-11-02-37334582ca74; retrieval started 2026-11-02T12:01:31.325Z. Source build 2026-10-26T08:46:14.383Z.

866 unique comparison records (851 source-confirmed NIR); 5253 historical families; 2578 reconciled query reports; 2610 HTTP requests.

| Comparison program | Unique records |
| --- | ---: |
| DPWH | 773 |
| FMR | 38 |
| HFEP | 55 |
| NIA | 0 |

Separate regional NEP: PHP 125626170000; reconciled to department rows. Never add this rollup to comparison projects.

## Validation

Seven SHA-256 shard checks; stable identity/count checks; integer-peso checks; historical years; NEP department sum; source regional attribution; PSGC references; query totals/accepted counts. All 30 project queries were also independently reconciled against live source version sums; see project-sum-audit.json.

## Limitations

Complete only for the documented source queries, not the whole government budget.

Historical province-qualified title searches can miss records without geographic names.

PSGC accessible city/municipality lists dated July 2025; latest workbook blocked.

Province/locality matches are title associations, not independently verified physical locations.

First-run historical records retain raw families and query endpoints but not per-query response-envelope build metadata. This is explicitly null, not inferred from the separate comparison build. Future refreshes retain the original envelope. Province and locality fields remain null unless verified; title association arrays are separate. Official historical VI/VII labels are preserved, without claiming a monetary geographic crosswalk. Execution is not geographically attributable. No NIA matches were returned by the documented queries; this does not prove no irrigation allocations exist.
