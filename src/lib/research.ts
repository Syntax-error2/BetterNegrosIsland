import type { Manifest } from './snapshot';

export const RESEARCH_FIELDS: Record<string, string> = {
  program: 'Source dataset: DPWH, FMR, HFEP or NIA. This is not an inferred service category.',
  id: 'Original record ID. Combine with program to identify a row; a similar title is not proof of the same project.',
  title: 'Published project title, preserved from the source. It may contain errors or incomplete geography.',
  program_line: 'Published program classification; not an independently verified outcome.',
  sub_line: 'Published PAP/subprogram classification, where available.',
  dpwh_office: 'Source implementing-office label, where available. It does not establish legislative sponsorship.',
  region: 'Source region label, where available. Do not infer a province or municipality from office coverage.',
  status: 'Original document-comparison wording. It is not a finding of irregularity or wrongdoing.',
  group: 'Portal comparison group: house_only, nep_only, increased, decreased, unchanged or scope_review.',
  unconfirmed_match: 'yes means the source marked the pairing unconfirmed. no is not independent verification.',
  nep_php: 'FY2027 executive proposal, exact nominal Philippine pesos. Blank means unavailable, not zero.',
  house_bill_php: 'FY2027 House proposal, exact nominal Philippine pesos. DPWH uses third reading; FMR, HFEP and NIA use second reading. Blank means unavailable.',
  change_php: 'Source-reported comparison difference in nominal PHP. Check pairing, stage and missing-line conventions before interpreting it; it is not spending.',
  nep_pdf: 'Source NEP PDF reference, where supplied. Verify the relevant page and row before citing a figure.',
  house_bill_pdf: 'Source House PDF reference for the applicable reading, where supplied.',
  why_listed_here: 'Recorded source-region, office or title-query inclusion reasons. Multiple reasons are not additional records.',
  geographic_confidence: 'Portal geographic evidence category; not independent confirmation of physical project location.',
  title_associated_psgc_codes: 'Semicolon-separated locality codes associated through title matching. Associations can overlap; do not sum overlapping groups.',
  retrieved_at: 'Stored retrieval timestamp, where available. It is not a project completion or spending date.',
  url: 'BetterGov source record URL. A live source page can change after the stored snapshot.',
};

export function researchCitation(m: Manifest, origin: string): string {
  const site = new URL(origin);
  if (site.protocol !== 'https:' && !(site.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(site.hostname))) {
    throw Error('A public HTTPS origin or local preview is required.');
  }
  if (!m.version || !Number.isFinite(Date.parse(m.retrieved_at))) throw Error('Snapshot citation metadata is unavailable.');
  return `BetterNegrosIsland. Negros Island Region budget document portal [Snapshot ${m.version}; FY2027 NEP/House comparison and FY2020–2026 GAA title-search records]. Budget data: BetterGov.PH. Retrieved by the portal: ${m.retrieved_at}. Source build: ${m.source_build}. ${new URL('/methodology#research', site.origin).href}`;
}

export function researchNotes(m: Manifest, origin: string, sourceNotices: readonly string[]): string {
  if (!sourceNotices.length) throw Error('Source notices must load before exporting research notes.');
  const citation = researchCitation(m, origin);
  return [
    'BetterNegrosIsland — research notes',
    '', 'SUGGESTED PORTAL CITATION', citation,
    'Adapt the citation to your required style. Separately cite the originating agency, document title, fiscal year, budget stage, page/row and URL for each finding. No DOI or archival permanence is claimed.',
    '', 'REPRODUCIBILITY CHECKLIST',
    '1. Record your research question, unit of analysis and exact filters, query terms and exclusions.',
    '2. Retain the exported rows, this snapshot metadata, source PDFs and their retrieval/access dates where lawful. Shared filter URLs may resolve against a later snapshot.',
    '3. Compare the same budget stage and House reading. Keep nominal PHP, missing values and uncertainty flags distinct. Never add NEP and House versions.',
    '4. Deduplicate by program plus source ID; inspect uncertain pairings. Document a sensitivity analysis with and without uncertain/title-only matches.',
    '5. Verify findings against the original document. Geographic title matches and shared offices do not prove physical location or sponsorship.',
    '6. Report descriptive associations, not causal effects, actual spending, completion or wrongdoing. Cross-year nominal appropriations are not inflation-adjusted or necessarily comparable.',
    '', 'SCOPE AND REUSE LIMITS',
    ...m.limitations,
    'The collection is not a complete census of all NIR funding. Historical title searches and comparison programs have different coverage. Source-confirmed NIR is distinct from title/office association.',
    'Research purpose does not override privacy duties, source restrictions or third-party rights. Review source titles/PDFs for unrelated personal information before sharing. Do not upload participant data or private identifiers to portal searches or public issues.',
    'The portal is not a peer-reviewed dataset, audit finding, legal clearance, procurement record or record of expenditure. Independent verification remains necessary.',
    '', 'PRESERVED SOURCE NOTICES', ...sourceNotices,
    '', 'CSV FIELD GUIDE (FY2027 comparison export; extra fields may accompany other views)',
    ...Object.entries(RESEARCH_FIELDS).map(([key, definition]) => `${key}: ${definition}`),
    '', 'EXACT LOADED SNAPSHOT MANIFEST',
    'Keep the manifest with the referenced files; verify SHA-256 checksums when available. A mutable manifest URL is not an immutable archive.',
    JSON.stringify(m, null, 2), '',
  ].join('\n');
}
