import { Link } from 'react-router-dom';
import { CivicFocus, CivicRecords, CivicResults, CivicSearch, CivicSelect, CivicSource } from '../components/CivicRecords';
import { civilDate, matchingText } from '../lib/civic-records';
import { useCivicFilters } from '../lib/use-civic-filters';
import { moneyExact } from '../lib/tracker';
import { PROVINCES } from '../lib/geography';
import { projectTimelinePath } from '../lib/project-timeline';
import observations from '../data/civic/evidence.json';
import timeline from '../data/civic/project-timelines.json';

const areas = [...PROVINCES.map((place) => [place.slug, place.name] as const), ['regional', 'NIR regional offices'] as const];
const byId = new Map(timeline.rows.map((row) => [row.id, row]));
const progress = (status: string, percent: number | null) =>
  [status || 'Status unavailable', percent === null ? 'Progress unavailable' : percent + '% reported progress'].join(' · ');

type Evidence = (typeof observations.rows)[number];
type Lifecycle = (typeof timeline.rows)[number];
type Event = { date: string; label: string; description: string; href: string | null };

function TimelineRecord({ evidence, lifecycle }: { evidence: Evidence; lifecycle: Lifecycle }) {
  const archiveUrl = '/contracts?' + new URLSearchParams({ province: evidence.zone, contract: evidence.id });
  const events: Event[] = [
    { date: observations.archiveDate, label: 'Archived DPWH reading', description: progress(evidence.archiveStatus, evidence.archiveProgress), href: null },
    { date: evidence.verifiedAt, label: 'DPWH reading retrieved', description: progress(evidence.sourceStatus, evidence.sourceProgress), href: evidence.api },
  ];
  if (lifecycle.advertisement) events.push({ date: lifecycle.advertisement, label: 'Advertisement date published',
    description: 'Approved budget for the contract (ABC) · ' + moneyExact(lifecycle.abc), href: lifecycle.advertisementPdf || evidence.api });
  if (lifecycle.deadline) events.push({ date: lifecycle.deadline, label: 'Published bid submission deadline',
    description: 'The deadline recorded by the source.', href: evidence.api });
  if (lifecycle.award) events.push({ date: lifecycle.award, label: lifecycle.awardDocument ? 'Award date with a listed notice' : 'Award date field',
    description: lifecycle.awardAmount === null ? 'Award amount unavailable in this record.' : 'Source award amount · ' + moneyExact(lifecycle.awardAmount),
    href: lifecycle.awardDocument || evidence.api });
  if (lifecycle.effectivity) events.push({ date: lifecycle.effectivity, label: 'Contract effectivity date',
    description: 'Listed contract amount · ' + moneyExact(lifecycle.contractAmount), href: lifecycle.contractDocument || evidence.api });
  if (lifecycle.started && lifecycle.started !== lifecycle.effectivity) events.push({ date: lifecycle.started, label: 'Reported start date',
    description: 'Start date recorded by DPWH.', href: evidence.api });
  if (lifecycle.completed) events.push({ date: lifecycle.completed, label: 'Reported completion date',
    description: 'Completion date recorded by DPWH.', href: evidence.api });
  events.sort((a, b) => a.date.localeCompare(b.date));

  return <section className="record-workspace" aria-label={'Timeline for ' + evidence.id}>
    <div className="civic-record timeline-record">
      <p className="tracker-record-meta">DPWH {evidence.id} · {evidence.office}</p>
      <h2>{evidence.title}</h2>
      <div className="civic-links">
        <Link to={archiveUrl}>Historical contract</Link>
        <Link to={'/site-evidence?id=' + evidence.id}>Compare progress readings</Link>
        <CivicSource href={evidence.bisto}>Project on Bisto</CivicSource>
      </div>
      <ol className="project-events" aria-label="Dated project records">
        {events.map((event) => <li key={event.label}>
          <time dateTime={event.date}>{civilDate(event.date)}</time>
          <div><h3>{event.label}</h3><p>{event.description}</p>
            {event.href && <CivicSource href={event.href}>{event.href === evidence.api ? 'DPWH record via BetterGov.PH' : 'Document listed in the DPWH record'}</CivicSource>}
          </div>
        </li>)}
      </ol>
    </div>
    <aside className="civic-record timeline-coverage">
      <h2>Source coverage</h2>
      <dl>
        <div><dt>Budget appropriation</dt><dd>{lifecycle.budget.length ? 'Upstream candidate links' : 'No appropriation link indexed'}
          {lifecycle.budget.length > 0 && <ul>{lifecycle.budget.map((candidate, index) => <li key={candidate.id + index}>
            FY {candidate.year} · {candidate.title} · {moneyExact(candidate.amount)}
          </li>)}</ul>}
          {lifecycle.budget.length > 0 && <><p>Compare candidate lines in the contract record. The source marks these as possible matches.</p><Link to={archiveUrl}>Review matching details</Link></>}
        </dd></div>
        <div><dt>Award notice</dt><dd>{lifecycle.awardDocument ? <CivicSource href={lifecycle.awardDocument}>Open the listed notice</CivicSource> : 'No notice linked in the source record'}</dd></div>
        <div><dt>Contract agreement</dt><dd>{lifecycle.contractDocument ? <CivicSource href={lifecycle.contractDocument}>Open the listed agreement</CivicSource> : 'No agreement linked in the source record'}</dd></div>
        <div><dt>Citizen observations</dt><dd>Bisto listed {lifecycle.bistoReports} public reports when checked {civilDate(timeline.bistoChecked)}.
          {' '}<CivicSource href={evidence.bisto}>View observations on Bisto</CivicSource></dd></div>
      </dl>
    </aside>
  </section>;
}

export default function ProjectTimeline() {
  const { params, change, reset, limit, more } = useCivicFilters();
  const id = params.get('id');
  const query = params.get('q') ?? '';
  const area = params.get('province') ?? '';
  const active = observations.rows.find((row) => row.id === id);
  const lifecycle = active ? byId.get(active.id) : undefined;
  const rows = observations.rows.filter((row) =>
    (!area || area === row.zone) && matchingText(query, row.id, row.title, row.office));
  return <CivicRecords title="Project timeline"
    description="Trace selected regional DPWH contracts through dated procurement records, contract milestones, and reported progress.">
    <p className="tracker-stamp">Contract and procurement fields checked {civilDate(timeline.checked)}. {timeline.rows.length} contracts matched by exact ID.
      {' '}<CivicSource href="https://transparency.dpwh.gov.ph/">DPWH Transparency Portal</CivicSource>
    </p>
    {id && <CivicFocus to="/project-timeline">Browse all project timelines</CivicFocus>}
    {active && lifecycle ? <TimelineRecord evidence={active} lifecycle={lifecycle} /> : <>
      {id && <p className="state">This contract has no timeline in the pilot. Choose a listed project below.</p>}
      <section className="tracker-filters civic-filters" aria-label="Find a project timeline">
        <CivicSearch label="Contract ID, project, or office" value={query} onChange={(value) => change('q', value)} />
        <CivicSelect label="DPWH office area" value={area} all="All areas" options={areas} onChange={(value) => change('province', value)} />
        {(area || query) && <button className="button" type="button" onClick={reset}>Clear filters</button>}
      </section>
      <div className="civic-record-list">
        {rows.slice(0, limit).map((row) => <article className="civic-record" key={row.id}>
          <p className="tracker-record-meta">{row.id} · {row.office}</p>
          <h2>{row.title}</h2>
          <div className="civic-links"><Link to={projectTimelinePath(row.id)}>Open timeline for {row.id}</Link></div>
        </article>)}
      </div>
      <CivicResults count={rows.length} noun="project timelines" limit={limit} more={more} />
    </>}
  </CivicRecords>;
}
