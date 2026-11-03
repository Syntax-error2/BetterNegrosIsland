import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortal } from '../lib/portal-context';
import { useSnapshot,type Manifest } from '../lib/snapshot';
import { Await,External } from '../components/Bits';
import ProjectTable from '../components/ProjectTable';
import ResponsibleUse from '../components/ResponsibleUse';
import { CHANGE_GROUPS,regionalChanges } from '../lib/regional-changes';
import { PROVINCES } from '../lib/geography';
import { useTitle } from '../lib/use-title';

export default function RegionalChanges(){
  const {scope}=usePortal();
  const manifest=useSnapshot<Manifest>();
  const [filters,setFilters]=useState({province:'',program:'',group:'',query:'',includeUnconfirmed:false});
  const [limit,setLimit]=useState(20);
  const change=(next:Partial<typeof filters>)=>{setFilters(previous=>({...previous,...next}));setLimit(20);};
  useTitle('We are not ignorant · Negros Island budget changes');
  return <main id="main-content" tabIndex={-1} className="page page--wide main regional-changes">
    <p><Link to="/">Back to overview</Link></p>
    <header className="changes-intro"><p className="eyebrow">Negros Island Region · FY2027 proposal comparison</p><h1>We are not ignorant.</h1><p className="changes-lede">Read the changes. Ask better questions.</p><p>Published budget versions give our communities a starting point for scrutiny. Follow each figure to its source, understand what changed, and keep the limits of the evidence in view.</p></header>
    <p className="notice"><strong>Evidence, not an allegation.</strong> House-only and changed amounts describe comparisons between published proposals. They do not establish spending, illegality, corruption or responsibility by any official. An absent line in a comparison does not prove that it was hidden or absent from every source document.</p>
    <Await state={scope} what="source-confirmed Negros Island budget records">{s=>{
      const view=regionalChanges(s.projects,filters);
      return <>
        <div className="changes-scope"><h2>One region. A defined set of records.</h2><p>This view starts with {view.regionalRecords.toLocaleString('en-PH')} records carrying the source’s NIR region flag. Office-only and place-name-only associations are excluded here. Province filters narrow titles associated with a place; they do not verify physical locations or create provincial budget totals.</p><p>House amounts use third reading for DPWH and second reading for FMR, HFEP and NIA. Keep the program and reading attached when comparing records.</p><p>{manifest.status==='ready'?<>Snapshot retrieved <time dateTime={manifest.value.retrieved_at}>{manifest.value.retrieved_at}</time>; comparison source built {manifest.value.source_build}.</>:'Snapshot dates are loading or unavailable; inspect coverage before quoting.'} <Link to="/data-coverage">Inspect data coverage</Link>.</p></div>
        <dl className="changes-counts">{view.counts.map(c=><div key={c.key}><dt>{c.label}</dt><dd>{c.count.toLocaleString('en-PH')}</dd></div>)}</dl>
        <p className="fine">Category counts follow the province, program, search and pairing choices below, before the category filter. Default view excludes source-marked unconfirmed pairings; {view.excludedUnconfirmed} such change records exist in the full source-confirmed NIR set. Records classified as unchanged, NEP-only or scope review remain available in <Link to="/projects">the full project explorer</Link>.</p>
        <section className="changes-filters" aria-label="Filter Negros Island budget changes">
          <label>Title or source ID<input type="search" value={filters.query} onChange={e=>change({query:e.target.value})} placeholder="Bridge, hospital, source ID…"/></label>
          <label>Province title association<select value={filters.province} onChange={e=>change({province:e.target.value})}><option value="">All NIR records</option>{PROVINCES.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
          <label>Program<select value={filters.program} onChange={e=>change({program:e.target.value})}><option value="">All four programs</option>{['dpwh','fmr','hfep','nia'].map(v=><option key={v} value={v}>{v.toUpperCase()}</option>)}</select></label>
          <label>Comparison category<select value={filters.group} onChange={e=>change({group:e.target.value})}><option value="">All three change categories</option>{CHANGE_GROUPS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
          <label className="changes-pairing"><input type="checkbox" checked={filters.includeUnconfirmed} onChange={e=>change({includeUnconfirmed:e.target.checked})}/>Include source-marked unconfirmed pairings</label>
          <button className="button" onClick={()=>{setFilters({province:'',program:'',group:'',query:'',includeUnconfirmed:false});setLimit(20);}}>Reset filters</button>
        </section>
        <p role="status">{view.rows.length.toLocaleString('en-PH')} matching records. Showing {Math.min(limit,view.rows.length)}. Ordered by comparison category, then published amount; this order does not rank need, impact or wrongdoing.</p>
        {view.rows.length?<><ProjectTable rows={view.rows.slice(0,limit)} programName={key=>key.toUpperCase()}/>{limit<view.rows.length&&<button className="button" onClick={()=>setLimit(n=>n+20)}>Show 20 more records</button>}</>:<p className="state">No matching records in this snapshot. Try another filter; this does not establish an absence of funding.</p>}
      </>;
    }}</Await>
    <section className="changes-questions"><h2>Questions worth taking to the documents.</h2><ol><li>Which proposal version contains this line, and what does its source page show?</li><li>Are the scope, implementing office and House reading comparable?</li><li>What separate evidence establishes release, payment, delivery or completion?</li></ol><p>Discuss public evidence without publishing unrelated personal data or making unsupported allegations. <Link to="/budget-guide">Learn to read a budget figure</Link>.</p></section>
    <p className="fine">Inspired by BetterGov.PH’s <External href="https://budget.bettergov.ph/hgab/2027/we-are-not-ignorant">national reading initiative</External>. This independently prepared regional view uses this portal’s dated snapshot and coverage rules. It does not claim the national project count as a Negros Island total or imply an endorsement.</p>
    <ResponsibleUse/>
  </main>;
}
