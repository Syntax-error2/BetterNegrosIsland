import { Link } from 'react-router-dom';
import {
  CivicFocus, CivicRecords, CivicResults, CivicSearch, CivicSelect, CivicSource,
} from '../components/CivicRecords';
import { civicCsv, civilDate, matchingText } from '../lib/civic-records';
import { useCivicFilters } from '../lib/use-civic-filters';
import { LOCATIONS, PROVINCES } from '../lib/geography';
import { moneyExact } from '../lib/tracker';
import senate from '../data/civic/senate.json';

const stageNames = { nep: 'Executive proposal (NEP)', house: 'House bill', senate: 'Senate committee report' } as const;
const stages = ['nep', 'house', 'senate'] as const;
const outcomes: Record<string, string> = { cut: 'Cut in committee', renamed: 'Title revised', unchanged: 'Labeled unchanged' };
const offices = [...new Set(senate.rows.map((row) => row.office))].sort().map((name) => [name, name] as const);
const provinces = PROVINCES.map((p) => [p.slug, p.name] as const);

export default function BudgetStages() {
  const { params, change, reset, limit, more } = useCivicFilters();
  const term = params.get('q') ?? '';
  const focus = params.get('id');
  const office = params.get('office') ?? '';
  const locality = params.get('lgu') ?? '';
  const province = params.get('province') ?? '';
  const places = LOCATIONS.filter((place) => !province || place.province === province);
  const provinceCodes = new Set(places.map((place) => place.code));
  const status = params.get('status') ?? '';
  // Ranking by magnitude keeps source-backed cuts at the top of the default view.
  const rows = senate.rows.filter((row) =>
    (!focus || row.id === focus) && (!office || row.office === office) &&
    (!locality || row.localities.includes(locality)) && (!province || row.localities.some((code) => provinceCodes.has(code))) &&
    (!status || row.status === status) &&
    matchingText(term, row.id, row.title, row.reportTitle ?? '', row.office)
  ).sort((a, b) => (b.house ?? 0) - (b.senate ?? b.house ?? 0) - ((a.house ?? 0) - (a.senate ?? a.house ?? 0)));
  const cuts = rows.filter((row) => row.status === 'cut').length;
  return <CivicRecords title="FY2027 budget stage tracker"
    description="Follow Negros Island Region’s proposed multi-purpose buildings from the executive proposal to the House bill and the Senate Finance Committee report.">
    <p className="tracker-stamp">
      {senate.rows.length} source lines labeled Negros Island Region. Senate extract dated {civilDate(senate.date)}.
      {' '}<CivicSource href={senate.source}>BetterGov.PH and People’s Budget Coalition comparison</CivicSource>
      {' · '}<CivicSource href={senate.file}>Source CSV</CivicSource>
      {' · '}<CivicSource href="https://budget-transparency-portal.senate.gov.ph/">Senate transparency portal</CivicSource>
    </p>
    <div className="civic-callout">
      <strong>How to read these amounts</strong>
      <p>Each stage describes proposed appropriations. The extract follows House bill lines and shows NEP amounts where BetterGov matched them. A recorded ₱0 is shown as zero. A missing match is labeled “Unavailable”. Bicameral and enacted figures are outside this extract. Place filters use names in source titles and may omit lines without a place match.</p>
    </div>
    {focus && <CivicFocus to="/budget-stages">Browse all stage records</CivicFocus>}
    <section className="tracker-filters civic-filters" aria-label="Filter budget stage records">
      <CivicSearch label="Project title or source line ID" value={term} onChange={(v) => change('q', v)} />
      <CivicSelect label="Provincial title association" value={province} all="All provincial areas" options={provinces} onChange={(v) => change('province', v, ['lgu'])} />
      <CivicSelect label="Locality named in title" value={locality} all="All localities" options={places.map((place) => [place.code, place.name])} onChange={(v) => change('lgu', v)} />
      <CivicSelect label="DPWH office" value={office} all="All offices" options={offices} onChange={(v) => change('office', v)} />
      <CivicSelect label="Committee outcome" value={status} all="All outcomes" options={Object.entries(outcomes)} onChange={(v) => change('status', v)} />
      {params.size > 0 && <button type="button" className="button" onClick={reset}>Clear filters</button>}
    </section>
    <div className="civic-metrics">
      {stages.map((stage) => {
        const available = rows.flatMap((row) => row[stage] === null ? [] : [row[stage]]);
        return <div key={stage}><span>{stageNames[stage]}</span>
          <strong>{available.length ? moneyExact(available.reduce((sum, amount) => sum + amount, 0)) : 'Unavailable'}</strong>
          <small>{available.length} of {rows.length} matching lines with an amount</small>
        </div>;
      })}
    </div>
    <div className="citizen-toolbar">
      <p>{cuts} of {rows.length} matching lines marked cut.</p>
      <button type="button" className="button" disabled={!rows.length} onClick={() => civicCsv('betternegrosisland-fy2027-budget-stages.csv', [
        ['line_id', 'house_title', 'committee_title', 'office', 'nep_php', 'house_php', 'committee_php', 'committee_status', 'report_page', 'report_pdf', 'source_record', 'source_date', 'source_csv'],
        ...rows.map((row) => [row.id, row.title, row.reportTitle, row.office, row.nep, row.house, row.senate, row.status, row.page, row.pdf, row.record, senate.date, senate.file]),
      ])}>Download matching lines</button>
    </div>
    {!rows.length && <p className="state">No stage records match this selection. Try a broader search or clear the filters.</p>}
    <div className="civic-record-list">
      {rows.slice(0, limit).map((row) => <article className="civic-record" key={row.id}>
        <div className="civic-record-meta"><span>{row.id} · {row.office}</span>
          <span className={'civic-label' + (row.status === 'cut' ? ' civic-label--cut' : '')}>{outcomes[row.status] ?? row.status}</span></div>
        <h2>{row.title}</h2>
        {row.reportTitle && row.reportTitle !== row.title && <p>Committee title · {row.reportTitle}</p>}
        <dl className="civic-values">
          {stages.map((stage) => <div key={stage}><dt>{stageNames[stage]}</dt>
            <dd>{row[stage] === null ? 'Unavailable' : moneyExact(row[stage])}</dd></div>)}
        </dl>
        <div className="civic-links">
          <CivicSource href={row.houseRecord}>House bill source record</CivicSource>
          <CivicSource href={row.pdf}>{row.page ? 'Committee report · page ' + row.page : 'Committee report PDF'}</CivicSource>
          <CivicSource href={row.record}>Committee source record</CivicSource>
          {row.linked && <Link to={'/projects/dpwh/' + encodeURIComponent(row.id)}>Portal budget record</Link>}
          {!focus && <Link to={'/budget-stages?id=' + encodeURIComponent(row.id)}>Open this comparison</Link>}
        </div>
      </article>)}
    </div>
    <CivicResults count={rows.length} noun="budget lines" limit={limit} more={more} />
  </CivicRecords>;
}
