# Regional scope and provenance

BetterNegrosIsland covers the administrative Negros Island Region: Negros Occidental, Negros Oriental and Siquijor. Bacolod is explicitly listed under the Negros Occidental navigation group while retaining separate HUC PSGC code 1830200000. No visitor location is requested.

## Official geography

The source directory is the [PSA PSGC city list](https://psa.gov.ph/classification/psgc/cities/1800000000) and [municipality list](https://psa.gov.ph/classification/psgc/municipalities/1800000000): 19 cities, 44 municipalities, 63 unique codes across three provinces. Names/codes and source/date are retained in `src/data/geography.json`.

The accessible browser listing is dated **31 July 2025**. PSA's later **30 September 2026** workbook was discovered, but its public download returned a Cloudflare 403 challenge. No access control was bypassed. This implementation must not be described as validated against that latest workbook. Obtain the official current release through an authorized public download, compare codes/names/statuses, review discrepancies, then update the directory date and evidence.

Historical source labels from Regions VI and VII remain original. Current PSGC codes are used for directory navigation and separate title associations, without rewriting historical amounts or asserting that old records already used region 18. This is a documented navigation/title crosswalk, not a certified historical geographic allocation crosswalk.

## Budget query scope

- FY2027 House/NEP comparison: all four program endpoints with `region=NIR`, all returned `next_offset` pages at limit 200.
- Eleven NIR legislative district detail pages identify exact implementing office labels; complete whole-office ledgers supplement the regional filter. Whole-office figures stay shared.
- Four source programs are additionally searched for Negros Occidental, Negros Oriental, Siquijor and Bacolod. No manually invented projects.
- GAA FY2020–2026: 38 departments, 67 unique province/Bacolod/province-qualified locality queries, all `next_cursor` pages at limit 500. Search uses the API's actual text capability; no regional filter is invented and the nationwide dataset is not bulk-downloaded.
- NEP FY2027: discover region code 18 from the official API description; collect and reconcile its department rollup independently of the project union.
- Budget-cycle execution: source manifest inspected. Agency/department endpoints have no supported reliable local attribution, so no regional allotment, obligation or disbursement is displayed.

Exact query reports are in the published coverage shard and visible Data coverage page. [Ingestion report](regional/INGESTION_REPORT.md), [source OpenAPI copy](regional/openapi.json), and [30-query amount audit](regional/project-sum-audit.json) record the evidence.

## Attribution and deduplication

Project identity is dataset + source ID; historical identity is source family key. Each unique record appears once even if several queries find it. Inclusion reasons accumulate. Regional confirmation means the source record explicitly uses NIR, not independent verification. Province/locality arrays are word-boundary title associations; they are not physical location certification. Normalized verified province/locality fields remain null.

No shared office total is split among districts or municipalities. Province chart counts can overlap. Bacolod highway titles may name several cities and are not surveyed road segments. Ambiguous Siquijor province references are not automatically assigned to Siquijor municipality.

Comparison records preserve original/raw data, exact version amounts, document URLs/pages, status, implementing office, inclusion reasons, source metadata and retrieval time. Historical families preserve raw years/amounts and query provenance. The first historical extraction did not retain per-query response-envelope build metadata; normalized metadata is explicitly null. Future refreshes preserve it when exposed. Family-level source PDFs/record URLs remain null where not supplied.

No record missing an amount is silently converted to zero. Source-provided zero history entries are preserved; trend funding counts only positive appropriations, with missing positive years shown as gaps. Appropriations are authority to spend. Document comparison candidates do not establish misconduct or actual expenditure.

## Scope limits

Complete query pagination does not mean every government record was exposed or found. Qualified place searches can miss titles lacking a province, renamed families, spelling variants or records without geography. NIA queries returned no matches, which is not a finding of zero irrigation funding. Official locality coverage and budget availability are separate. The full request to collect every relevant publicly available record remains bounded by API capabilities and needs a broader recall audit before any stronger completeness claim.
