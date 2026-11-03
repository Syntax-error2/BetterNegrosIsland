# BetterQuintoDistrito scope decisions

Verified locally against the live read-only API on 2 November 2026. These are source associations, not independent site surveys.

## Geographic membership

The six LGUs are Himamaylan City, Binalbagan, Hinigaran, Isabela, La Castellana, and Moises Padilla. The [Provincial Government of Negros Occidental explicitly lists these six Fifth District LGUs](https://www.negros-occ.gov.ph/news/fifth-and-sixth-district-mayors-were-honored-at-the-pasidungog-2021/). This membership reference is historical; the current API district association was checked separately. No precise visitor location is requested or used.

## Live identifiers

- District: `leg:negros-occidental:5th`.
- Region key: `NIR`, as returned by the district API.
- Office ID: `office:negros-occidental-2nd-deo`.
- Published office filter: `Negros Occidental 2nd District Engineering Office`.
- Current source attribution: Tier A, serving this district only. This status is read at runtime; shared offices retain the upstream Tier B warnings and remain undivided if source mapping changes.
- Evidence: `docs/evidence/fifth-district.json`, `districts.json`, `resolved-scope.json`, and `live-check.txt`.
- The 2027 API comparison currently identifies its source build as 26 October 2026. Retrieval and source build are different dates.

## Inclusion categories

| Category | How used | Interpretation |
| --- | --- | --- |
| Congressional association | District card from exact district ID | Office-to-district mapping, not control by a representative |
| Implementing office | All DPWH records returned for the published office filter | Whole office ledger, never divided among LGUs |
| Locality title match | Six configured name searches across DPWH, FMR, HFEP, and NIA | Candidate geographic association, not proven location |
| Source coordinates | Displayed on a project only if supplied | Source-provided coordinates, not independently verified |
| Shared-office coverage | API office lens and tier retained | Whole office amount, not an exclusive district/LGU allocation |
| Uncertain association | Cross-boundary roads and missing region labels retained with caveats | Requires geographic review before claiming an exact district total |

The portal union is deduplicated by dataset and source record ID; every office and locality inclusion reason is preserved. A source record returned by two locality queries appears once in the portal total and once per relevant locality view. Locality views overlap: **do not add their totals or counts together**. Program family deduplication for historical records follows the upstream agency/name key.

## Search choices and limitations

Himamaylan City searches `Himamaylan`; Binalbagan, Hinigaran, La Castellana, and Moises Padilla use their names. Isabela searches `Isabela Negros Occidental` because the unqualified name is used elsewhere. The stricter query can miss titles that omit the province, including an adjacent road title that simply names Isabela. Missing matches are not proof of missing projects.

For 2027, the source region key must be NIR or missing. The source region label is displayed unchanged. Missing-region results (notably irrigation) remain candidates rather than silently disappearing. No legacy VI/VII region label is rewritten to NIR. Older/non-NIR-labelled records outside the office query can consequently be missed. Historical GAA name searches have no API region field and cannot be region-restricted. They retain source descriptions, including historical Region VI/VII wording; title associations require review.

## Reviewed exclusions and retained uncertainties

Three FY2027 records explicitly locate Barangay Binalbagan projects in **Canlaon City, Negros Oriental**. These were excluded using their exact source keys (`10978`, `10981`, `6465`). Eight historical program families explicitly locate namesakes or connecting-road works in Canlaon City or Vallehermoso, Negros Oriental, and were also excluded. The exact keys and individual reasons are in `portal.config.ts`, and the Methodology page publishes all exclusions. No source records or original amounts were edited.

Two FY2027 title-only records under other district offices remain:

- `dpwh:house-reading:313`: Vallehermoso–Canlaon City–La Castellana Road, under Negros Oriental 1st District Engineering Office.
- `dpwh:house-reading:2991`: Antipolo Bridge along Junction Pontevedra–La Castellana Road, under Negros Occidental 4th District Engineering Office.

These are road/corridor mentions of La Castellana; the source does not prove the funded stretch lies inside the Fifth District. They remain visible as uncertain title associations. Historical corridor titles are treated similarly. They prevent presenting the union as an exclusive district allocation. A qualified geographic review is still needed for an exact district-only geographic ledger.

## What the observed totals mean

After exclusions, the checked source union contains **50 FY2027 records**: 47 DPWH, two FMR, one HFEP, and no matching NIA records. This absence is not a claim that no irrigation projects exist. The comparison sums are ₱1,701,067,000 NEP across 33 lines and ₱1,986,067,000 House bill across 50 lines. These are **scoped source comparison totals**, not exclusive district appropriations, spending, releases, or completion. The net document difference includes one-sided records; row-level differences remain null when a version is missing.

Separately, the serving office's named-project ledger has 34 House records and 20 NEP records. Its named-project NEP amount differs from its whole-office NEP amount; the inherited office card keeps that distinction. Office figures are never added to the already deduplicated project union.

There are **538 historical program families** after exclusions. The live checker reconciles 98 matched department-years against API totals, including excluded records when reconciling the original searches. Historical title-search totals and whole-office totals overlap and are displayed separately.
