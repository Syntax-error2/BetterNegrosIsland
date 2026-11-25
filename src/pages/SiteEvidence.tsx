import { Link } from 'react-router-dom';
import {
  CivicFocus, CivicRecords, CivicResults, CivicSearch, CivicSelect, CivicSource,
} from '../components/CivicRecords';
import { civilDate, matchingText } from '../lib/civic-records';
import { useCivicFilters } from '../lib/use-civic-filters';
import { PROVINCES } from '../lib/geography';
import evidence from '../data/civic/evidence.json';

const offices = [...PROVINCES.map((p) => [p.slug, p.name] as const), ['regional', 'NIR regional offices'] as const];
const progress = (value: number | null) => value === null ? 'Unavailable' : value.toLocaleString('en-PH', { maximumFractionDigits: 2 }) + '%';

export default function SiteEvidence() {
  const { params, change, reset, limit, more } = useCivicFilters();
  const focus = params.get('id');
  const area = params.get('province') ?? '';
  const term = params.get('q') ?? '';
  const rows = evidence.rows.filter((row) => (!focus || row.id === focus) &&
    (!area || row.zone === area) && matchingText(term, row.id, row.title, row.office));
  return <CivicRecords title="Project site evidence"
    description="Compare two dated DPWH readings for selected contracts, then open the matching project in Bisto to check for citizen observations.">
    <p className="tracker-stamp">{evidence.rows.length} exact contract ID matches. Historical build {civilDate(evidence.archiveDate)}.
      {' '}<CivicSource href={evidence.source}>About Bisto</CivicSource>
    </p>
    <div className="civic-callout"><strong>Agency progress and citizen observations</strong>
      <p>The figures below come from published DPWH records on two retrieval dates. Field observations, where available, are shared by users on Bisto. The portal compares the official figures and links to the project so you can examine any observations in context.</p>
    </div>
    {focus && <CivicFocus to="/site-evidence">Browse all matched projects</CivicFocus>}
    <section className="tracker-filters civic-filters" aria-label="Filter project site evidence">
      <CivicSearch label="Contract ID or project title" value={term} onChange={(v) => change('q', v)} />
      <CivicSelect label="DPWH office area" value={area} all="All office areas" options={offices} onChange={(v) => change('province', v)} />
      {params.size > 0 && <button type="button" className="button" onClick={reset}>Clear filters</button>}
    </section>
    {!rows.length && <p className="state">No matching contract is indexed in this sample. Check the historical contract explorer for more records.</p>}
    <div className="civic-record-list">
      {rows.slice(0, limit).map((row) => <article className="civic-record" key={row.id}>
        <div className="civic-record-meta"><span>DPWH {row.id} · {row.office}</span></div>
        <h2>{row.title}</h2>
        <dl className="civic-values civic-values--pair">
          <div><dt>Archived agency reading · {civilDate(evidence.archiveDate)}</dt>
            <dd>{row.archiveStatus || 'Status unavailable'} <span>· {progress(row.archiveProgress)} reported progress</span></dd></div>
          <div><dt>Source retrieved · {civilDate(row.verifiedAt)}</dt>
            <dd>{row.sourceStatus || 'Status unavailable'} <span>· {progress(row.sourceProgress)} reported progress</span></dd></div>
        </dl>
        <div className="civic-links">
          <CivicSource href={row.bisto}>Open {row.id} on Bisto</CivicSource>
          <CivicSource href={row.api}>DPWH source data via BetterGov.PH</CivicSource>
          <Link to={'/contracts?' + new URLSearchParams({ province: row.zone, contract: row.id })}>Archived contract</Link>
          {!focus && <Link to={'/site-evidence?id=' + row.id}>Open this comparison</Link>}
        </div>
      </article>)}
    </div>
    <CivicResults count={rows.length} noun="matched contracts" limit={limit} more={more} />
  </CivicRecords>;
}
