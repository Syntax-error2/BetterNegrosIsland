import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { LOCATIONS, PROVINCES } from '../lib/geography';
import { snapshotJson, type Manifest } from '../lib/snapshot';
import type { ScopeResult } from '../lib/scope';
import type { Async } from '../lib/portal-context';
import { communityProjects } from '../lib/community';
import { count } from '../lib/format';

export default function CommunitySpotlight() {
  const [code, setCode] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [scope, setScope] = useState<Async<ScopeResult>>({ status: 'loading' });
  const id = useId();
  const place = LOCATIONS.find(p => p.code === code);
  const selected = Boolean(place);

  useEffect(() => {
    if (!selected) return;
    let live = true;
    snapshotJson<Manifest>('/data/manifest.json')
      .then(m => snapshotJson<ScopeResult>(m.scope))
      .then(value => { if (live) setScope({ status: 'ready', value }); },
        error => { if (live) setScope({ status: 'error', error: error instanceof Error ? error : new Error('Snapshot unavailable') }); });
    return () => { live = false; };
  }, [selected, attempt]);

  const projects = place && scope.status === 'ready' ? communityProjects(scope.value.projects, place) : [];
  return <section id="community-spotlight" className="community-spotlight" aria-labelledby={id + '-heading'}>
    <div className="community-intro">
      <h2 id={id + '-heading'}>Start with your community.</h2>
      <p>Find the places and projects you recognize. Choose a city or municipality to explore published records that mention it.</p>
      <label htmlFor={id + '-place'}>Your city or municipality</label>
      <select id={id + '-place'} value={code} onChange={e => setCode(e.target.value)} aria-describedby={id + '-caveat'}>
        <option value="">Choose a place</option>
        {PROVINCES.map(province => <optgroup key={province.slug} label={province.name + (province.slug === 'negros-occidental' ? ' · including Bacolod' : '')}>
          {LOCATIONS.filter(p => p.province === province.slug).map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </optgroup>)}
      </select>
      <p id={id + '-caveat'} className="community-caveat">A title association is a clue to explore, not a verified project location or an exclusive local allocation. No location permission or account needed.</p>
      <Link to="/provinces">Browse all 63 cities and municipalities</Link>
    </div>
    <div className="community-results">
      {!place ? <div className="community-start">
        <span className="community-symbol" aria-hidden="true"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></span>
        <h3>A familiar place. A clearer starting point.</h3>
        <p>Choose a community to preview its title-associated records, then follow the evidence in the project explorer.</p>
      </div> : <>
        <h3>{place.name}</h3>
        <p className="community-status" role="status" aria-live="polite">
          {scope.status === 'ready' ? `${count(projects.length)} title-associated ${projects.length === 1 ? 'record' : 'records'} in the dated FY2027 comparison.` : scope.status === 'error' ? 'Project previews are unavailable. No count has been substituted.' : 'Loading the dated project records…'}
        </p>
        {scope.status === 'ready' && projects.length > 0 && <>
          <p className="community-preview-note">A preview in source order, not a ranking by funding or importance.</p>
          <ul className="community-projects">{projects.slice(0, 3).map(p => <li key={p.key}>
            <span>{p.dataset.toUpperCase()} · Published project title</span>
            <Link to={'/projects/' + p.dataset + '/' + encodeURIComponent(p.id)}>{p.title}</Link>
          </li>)}</ul>
        </>}
        {scope.status === 'ready' && projects.length === 0 && <p>No title-associated records were found in this snapshot. This does not mean the community has no funded projects: records may omit its name or fall outside collection coverage.</p>}
        {scope.status === 'error' && <button className="button" onClick={() => { setScope({ status: 'loading' }); setAttempt(n => n + 1); }}>Retry project previews</button>}
        <div className="community-actions"><Link className="button button-primary" to={'/locations/' + place.code}>Explore {place.name}</Link><Link to="/data-coverage">Understand the coverage</Link></div>
      </>}
    </div>
  </section>;
}
