import { Link } from 'react-router-dom';
import {
  CivicFocus, CivicRecords, CivicResults, CivicSearch, CivicSelect, CivicSource,
} from '../components/CivicRecords';
import { civilDate, matchingText } from '../lib/civic-records';
import { useCivicFilters } from '../lib/use-civic-filters';
import { LOCATIONS, PROVINCES } from '../lib/geography';
import disclosures from '../data/civic/disclosures.json';
import awards from '../data/civic/awards.json';

const categories = [
  ['budget', 'Annual budget'],
  ['investment', 'Annual investment program'],
  ['procurement', 'Annual procurement plan'],
  ['audit', 'Annual audit report'],
] as const;
const levels = [['province', 'Provincial governments'], ['city', 'Cities'], ['municipality', 'Municipalities']] as const;
const provinces = PROVINCES.map((p) => [p.slug, p.name] as const);
const places = [
  ...PROVINCES.map((p) => ({ ...p, province: p.slug, type: 'Province', path: '/provinces/' + p.slug })),
  ...LOCATIONS.map((l) => ({ ...l, path: '/locations/' + l.code })),
];
const sources = new Map<string, typeof disclosures.sources>();
for (const source of disclosures.sources) {
  const entries = sources.get(source.code) ?? [];
  entries.push(source);
  sources.set(source.code, entries);
}
const readDate = civilDate(disclosures.checked);

export default function LocalDisclosures() {
  const { params, change, reset, limit, more } = useCivicFilters('lgu');
  const focus = params.get('lgu');
  const province = params.get('province') ?? '';
  const level = params.get('level') ?? '';
  const coverage = params.get('coverage') === 'indexed' ? 'indexed' : '';
  const doc = params.get('document') ?? '';
  const term = params.get('q') ?? '';
  const rows = places.filter((place) => (!focus || place.code === focus) &&
    (!province || place.province === province) &&
    (!level || place.type.toLowerCase() === level) &&
    (!coverage || sources.has(place.code)) &&
    (!doc || sources.get(place.code)?.some((source) => source.type === doc)) &&
    matchingText(term, place.name, place.code))
    .sort((a, b) => Number(sources.has(b.code)) - Number(sources.has(a.code)) || a.name.localeCompare(b.name));
  return <CivicRecords title="LGU transparency directory"
    description="Find budget, investment, procurement, and audit disclosures published for Negros Island Region’s provincial governments, cities, and municipalities.">
    <p className="tracker-stamp">{LOCATIONS.length} cities and municipalities and {PROVINCES.length} provinces. Indexed source pages checked {readDate}.
      {' '}<CivicSource href={disclosures.auditDirectory}>COA annual audit reports</CivicSource>
      {' · '}<CivicSource href={disclosures.guide}>BetterGov.PH LGU transparency guide</CivicSource>
    </p>
    <div className="civic-callout"><strong>Reading the checklist</strong>
      <p>Each link shows its publishing agency and document year. “No link indexed” means this directory has yet to add a source for that item. Start with the LGU’s disclosure page or the COA archive for more records.</p>
    </div>
    {focus && <CivicFocus to="/local-disclosures">Browse the full regional directory</CivicFocus>}
    <section className="tracker-filters civic-filters" aria-label="Filter local disclosures">
      <CivicSearch label="Place name or PSGC code" value={term} onChange={(v) => change('q', v)} />
      <CivicSelect label="Provincial area" value={province} all="All provincial areas" options={provinces} onChange={(v) => change('province', v)} />
      <CivicSelect label="Government type" value={level} all="All government types" options={levels} onChange={(v) => change('level', v)} />
      <CivicSelect label="Indexed documents" value={coverage} all="All directory entries" options={[[ 'indexed', 'With indexed links' ]]} onChange={(v) => change('coverage', v)} />
      <CivicSelect label="Find a document type" value={doc} all="Any document type" options={categories} onChange={(v) => change('document', v)} />
      {params.size > 0 && <button type="button" className="button" onClick={reset}>Clear filters</button>}
    </section>
    {!rows.length && <p className="state">No directory entries match this selection. Clear the document filter to browse places without indexed links.</p>}
    <div className="civic-record-list">
      {rows.slice(0, limit).map((place) => {
        const entries = sources.get(place.code) ?? [];
        return <article className="civic-record" key={place.code}>
          <div className="civic-record-meta"><span>{place.type} · PSGC {place.code}</span>
            <span className="civic-label">{entries.length} of {categories.length} document types indexed</span></div>
          <h2>{place.name}</h2>
          <dl className="civic-checklist">
            {categories.map(([id, name]) => {
              const source = entries.find((entry) => entry.type === id);
              return <div key={id}><dt>{name}</dt><dd>{source ? <>
                <CivicSource href={source.href}>{source.title} · {source.year}</CivicSource>
                <small>{source.issuer} · Checked {readDate}</small>
                {source.note && <small>{source.note}</small>}
              </> : <small>No link indexed</small>}</dd></div>;
            })}
          </dl>
          <div className="civic-links">
            <Link to={place.path}>Place profile</Link>
            {place.type !== 'Province' && <>
              <Link to={'/lgu-spending?lgu=' + place.code}>Find reported spending</Link>
              <Link to={'/fund-releases?view=assistance&lgu=' + place.code}>Find national project assistance</Link>
            </>}
            {awards.buyers.some((buyer) => buyer.code === place.code) &&
              <Link to={'/procurement?view=bids&lgu=' + place.code}>Browse pilot bids and awards</Link>}
            {!focus && <Link to={'/local-disclosures?lgu=' + place.code}>Open this checklist</Link>}
          </div>
        </article>;
      })}
    </div>
    <CivicResults count={rows.length} noun="directory entries" limit={limit} more={more} />
  </CivicRecords>;
}
