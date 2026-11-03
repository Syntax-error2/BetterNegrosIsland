import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortal } from '../lib/portal-context';
import { useSnapshot,type Manifest } from '../lib/snapshot';
import { Await,External } from '../components/Bits';
import BrandLogo from '../components/BrandLogo';
import { CHANGE_GROUPS,regionalChanges } from '../lib/regional-changes';
import { PROVINCES } from '../lib/geography';
import { useTitle } from '../lib/use-title';
import { phpFull } from '../lib/format';
import { exactDifference } from '../lib/comparison-display';
import { houseReading,recordPath } from '../lib/evidence';
import { projectsCsv,downloadText } from '../lib/csv';
import { PORTAL_REPOSITORY_URL } from '../lib/links';
import type { ScopedProject } from '../lib/scope';

const tag=(p:ScopedProject)=>p.bridge_group==='house_only'?'House only':p.bridge_group==='increased'?'Increased':'Decreased';
const money=(v:number|null)=>v===null?'Not available':phpFull(v);

function ReadingRecord({p,number}:{p:ScopedProject;number:number}){
  return <li className={'campaign-item is-'+p.bridge_group}>
    <div className="campaign-record-head"><span className="campaign-number" aria-hidden="true">{number}</span><span className="campaign-tag" title={p.status_label}>{tag(p)}</span>
      {p.bridge_group==='house_only'?<strong className="campaign-amount">{money(p.house_php)}</strong>:<span className="campaign-comparison"><span>NEP {money(p.nep_php)}</span><span> → House {money(p.house_php)}</span><span className="campaign-difference">({exactDifference(p.delta_php)})</span></span>}
      {p.held&&<span className="campaign-unconfirmed">Unconfirmed pairing</span>}
    </div>
    <Link className="campaign-title" to={recordPath(p)}>{p.title}</Link>
    <span className="campaign-meta">{p.dataset.toUpperCase()}{p.program?' · '+p.program:''} · NIR{p.office?' · '+p.office:''}</span>
    <span className="campaign-meta">{houseReading(p.dataset)}</span>
  </li>;
}

export default function RegionalChanges(){
  const {scope}=usePortal();
  const manifest=useSnapshot<Manifest>();
  const [filters,setFilters]=useState({province:'',program:'',group:'',query:'',includeUnconfirmed:false});
  useTitle('We are not ignorant · Negros Island budget changes');
  return <main id="main-content" tabIndex={-1} className="campaign-page">
    <a className="skip-link" href="#campaign-records">Skip to NIR project records</a>
    <Await state={scope} what="source-confirmed Negros Island budget records">{s=>{
      const full=regionalChanges(s.projects),view=regionalChanges(s.projects,filters);
      const wall=full.rows.slice(0,160).map((p,i)=>`${i+1} ${tag(p).toUpperCase()} ${money(p.house_php)} ${p.title}`).join(' ■ ');
      const chunks=Array.from({length:Math.ceil(view.rows.length/60)},(_,i)=>view.rows.slice(i*60,(i+1)*60));
      const change=(next:Partial<typeof filters>)=>setFilters(previous=>({...previous,...next}));
      const download=()=>{
        if(manifest.status!=='ready')return;
        downloadText(`betternegrosisland-nir-changes-${manifest.value.retrieved_at.slice(0,10)}.csv`,projectsCsv(view.rows,[
          ['snapshot_retrieved',()=>manifest.value.retrieved_at],['house_reading',p=>houseReading(p.dataset)],
          ['scope_notice',()=> 'Source-confirmed NIR only. Title associations do not verify locality. Proposals are not spending. Comparisons do not establish wrongdoing. Unconfirmed pairings retain their flags.'],
          ['source_notices',()=>s.disclaimers.map(d=>d.title+' '+d.body+' '+d.url).join(' | ')],
          ['sharing_notice',()=> 'Keep source dates, stages and limitations. Do not add or republish unrelated personal identifiers, private contact details or sensitive personal information.'],
        ]));
      };
      return <>
        <header className="campaign-poster">
          <div className="campaign-wordwall" aria-hidden="true">{wall}</div>
          <img className="campaign-art" src="/campaign/nir-reading-hand-v1.webp" width="1024" height="1536" alt="" aria-hidden="true" decoding="async"/>
          <div className="campaign-head">
            <div className="campaign-brand-row"><Link className="campaign-logo" to="/" aria-label="BetterNegrosIsland — overview"><BrandLogo/></Link><Link className="campaign-home" to="/">Back to overview</Link></div>
            <h1 className="campaign-headline" aria-label="We are not ignorant"><span>We are</span><span className="is-red">Not</span><span>Ignorant</span></h1>
            <p className="campaign-sub"><strong>{full.rows.length.toLocaleString('en-PH')} House-only and adjusted project records in the FY2027 NIR snapshot.</strong><br/>Read the proposals. Follow the sources.</p>
            <p className="campaign-intro">DPWH, farm-to-market roads, health facilities and irrigation. House-only first, then increases, then decreases; largest published amounts first within each category. Source-confirmed NIR only. {full.excludedUnconfirmed} unconfirmed change records are excluded by default.</p>
            <button className="campaign-download" disabled={manifest.status!=='ready'||!view.rows.length} onClick={download}>Download the NIR list (CSV)</button>
            <p className="campaign-caption">CSV follows the active filters. Figures describe proposed versions, not spending or findings of wrongdoing.</p>
          </div>
        </header>
        <section id="campaign-records" className="campaign-records" aria-label="Negros Island project reading list">
          <div className="campaign-list-tools"><p role="status">{view.rows.length.toLocaleString('en-PH')} NIR records in this view. Follow a project title for its sources and evidence tools.</p><details className="campaign-filter-disclosure"><summary>Filter the NIR list</summary>
            <div className="campaign-filters">
              <label><span>Title or source ID</span><input type="search" value={filters.query} onChange={e=>change({query:e.target.value})} placeholder="Bridge, hospital, source ID…"/></label>
              <label><span>Province title association</span><select value={filters.province} onChange={e=>change({province:e.target.value})}><option value="">All NIR records</option>{PROVINCES.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
              <label><span>Program</span><select value={filters.program} onChange={e=>change({program:e.target.value})}><option value="">All four programs</option>{['dpwh','fmr','hfep','nia'].map(v=><option key={v} value={v}>{v.toUpperCase()}</option>)}</select></label>
              <label><span>Comparison category</span><select value={filters.group} onChange={e=>change({group:e.target.value})}><option value="">All three categories</option>{CHANGE_GROUPS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
              <label className="campaign-pairing"><input type="checkbox" checked={filters.includeUnconfirmed} onChange={e=>change({includeUnconfirmed:e.target.checked})}/>Include source-marked unconfirmed pairings</label>
              <button className="campaign-reset" onClick={()=>setFilters({province:'',program:'',group:'',query:'',includeUnconfirmed:false})}>Reset filters</button>
            </div><p className="campaign-filter-counts">{view.counts.map(c=>`${c.label}: ${c.count}`).join(' · ')}. Counts follow all choices except the category filter. Province filters are title associations, not verified locations or provincial allocations.</p>
          </details></div>
          {view.rows.length?chunks.map((rows,chunk)=><ol className="campaign-grid" start={chunk*60+1} key={chunk} role="list">{rows.map((p,i)=><ReadingRecord key={p.key} p={p} number={chunk*60+i+1}/>)}</ol>):<p className="campaign-empty" role="status">No matching records in this snapshot. Try another filter; this does not establish an absence of funding.</p>}
        </section>
        <footer className="campaign-footer"><Link className="campaign-footer-logo" to="/" aria-label="BetterNegrosIsland — overview"><BrandLogo theme="dark" lazy/></Link>
          <p className="campaign-footer-title">Negros Island Region · FY2027 budget reading list</p>
          <p>Based on {view.regionalRecords} records carrying the source’s NIR flag. Office-only and place-name-only records are excluded here. House-only means a line in this comparison’s House version without a paired NEP line; it does not establish that the line was absent from every source document. Matches are candidates, not findings. House amounts use third reading for DPWH and second reading for FMR, HFEP and NIA. The records do not establish who requested a project, actual spending or wrongdoing.</p>
          <p>{manifest.status==='ready'?<>Snapshot retrieved {manifest.value.retrieved_at}. Source built {manifest.value.source_build}.</>:'Snapshot dates are unavailable; inspect coverage before quoting.'} Unchanged, NEP-only and scope-review records remain in the full explorer.</p>
          <nav aria-label="Regional reading references"><Link to="/projects">Full explorer</Link><Link to="/data-coverage">Coverage</Link><Link to="/methodology#data-disclaimer">Full data disclaimer</Link><Link to="/privacy">Privacy Notice</Link><Link to="/terms">Terms of Use</Link><External href={PORTAL_REPOSITORY_URL}>Open-source repository</External></nav>
          <details className="campaign-notices"><summary>Source notices and responsible sharing</summary><p>Public availability does not remove privacy responsibilities. Do not add or republish unrelated identifiers, private contact details or sensitive personal information. A comparison classification alone does not establish an irregularity or wrongdoing.</p>{s.disclaimers.map(d=><p key={d.id}><strong>{d.title}</strong> {d.body} <External href={d.url}>Source notice</External></p>)}</details>
          <p className="campaign-attribution">Budget data powered by BetterGov.PH. Regional presentation by BetterNegrosIsland, an independent, nonpartisan initiative operated by Aqura Information Technology Solutions / Dave Hermoso, Binalbagan, Negros Occidental. Visual direction inspired by the <External href="https://budget.bettergov.ph/hgab/2027/we-are-not-ignorant">national reading initiative</External>; no endorsement is implied. Illustration generated for this portal.</p>
        </footer>
      </>;
    }}</Await>
  </main>;
}
