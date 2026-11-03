import { useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePortal } from '../lib/portal-context';
import { useSnapshot, type Manifest } from '../lib/snapshot';
import type { ScopedProject } from '../lib/scope';
import { Await, External } from '../components/Bits';
import { phpFull } from '../lib/format';
import { evidencePath, houseReading, recordPath } from '../lib/evidence';
import { resolveSourceLink } from '../lib/safe-url';
import DataTable from '../components/DataTable';
import { useTitle } from '../lib/use-title';
import ResponsibleUse from '../components/ResponsibleUse';

function RecordPicker({label, rows, value, other, onChange}:{label:string; rows:ScopedProject[]; value:string; other:string; onChange:(v:string)=>void}) {
  const [q, setQ] = useState('');
  const id=useId();
  const matches=rows.filter(p => `${p.title} ${p.dataset} ${p.id}`.toLowerCase().includes(q.trim().toLowerCase()));
  const selected=rows.find(p=>p.key===value);
  const shown=matches.slice(0,30);
  const options=selected && !shown.includes(selected) ? [selected,...shown] : shown;
  return <fieldset className="record-picker"><legend>{label}</legend>
    <label htmlFor={id+'-search'}>Find a record by title, program or ID</label>
    <input id={id+'-search'} type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Bridge, hospital, barangay…" aria-describedby={id+'-hint'} />
    <div className="record-selection">{selected?<><p><strong>Selected:</strong> {selected.title}</p><button type="button" onClick={()=>onChange('')} aria-label={'Clear '+label.toLowerCase()}>Clear selection</button></>:<p>No record selected. Choose a result below.</p>}</div>
    <p id={id+'-hint'} role="status">{matches.length} search matches. Showing {options.length} results, including any selected record. Search to narrow the list. The record selected on the other side is unavailable here.</p>
    <div className="record-results" role="group" aria-label={'Choose '+label.toLowerCase()} aria-describedby={id+'-hint'}>
      {options.map(p=><label className={'record-result'+(p.key===value?' is-selected':'')} key={p.key}><input type="radio" name={id+'-record'} value={p.key} checked={p.key===value} disabled={p.key===other} onChange={()=>onChange(p.key)} /><span><strong>{p.title}</strong><small>{p.dataset.toUpperCase()} · {p.id}{p.key===other?' · Selected on the other side':''}</small></span></label>)}
      {!options.length&&<p>No matching records. Try a shorter title, program or source ID.</p>}
    </div>
  </fieldset>;
}

export default function CompareRecords() {
  const {scope}=usePortal();
  const m=useSnapshot<Manifest>();
  const [params,setParams]=useSearchParams();
  const left=params.get('left')??'', right=params.get('right')??'';
  const rows=scope.status==='ready'?scope.value.projects:[];
  const a=rows.find(p=>p.key===left), b=rows.find(p=>p.key===right);
  const duplicate=Boolean(a&&b&&a.key===b.key);
  const [copy,setCopy]=useState('');
  const [reset,setReset]=useState(0);
  const set=(key:string,value:string)=>{const next=new URLSearchParams(params);if(value)next.set(key,value);else next.delete(key);setParams(next);setCopy('');};
  useTitle('Compare two source records · BetterNegrosIsland');
  const fields:{label:string; read:(p:ScopedProject)=>string}[]=[
    {label:'Source program',read:p=>p.dataset.toUpperCase()},
    {label:'FY2027 NEP · Executive proposal',read:p=>p.nep_php===null?'Not available in this version':phpFull(p.nep_php)},
    {label:'FY2027 House bill · published amount',read:p=>p.house_php===null?'Not available in this version':phpFull(p.house_php)},
    {label:'House reading used',read:p=>houseReading(p.dataset)},
    {label:'Source classification',read:p=>p.status_label},
    {label:'Pairing review',read:p=>p.held?'Source-marked unconfirmed pairing':'Not marked unconfirmed by source; not independent verification'},
    {label:'Published source region',read:p=>p.region??'Not provided'},
    {label:'Implementing office',read:p=>p.office??'Not provided'},
    {label:'Record identity',read:p=>p.dataset+':'+p.id},
  ];
  return <main id="main-content" tabIndex={-1} className="page page--wide main compare-page">
    <p><Link to="/projects">Back to project explorer</Link></p><h1>Two records. The same questions.</h1>
    <p>Compare exact amounts at matching budget stages. Different programs, scopes and House readings may limit a direct comparison. These are source records, not a ranking of community needs or project value.</p>
    <Await state={scope} what="the dated comparison snapshot">{()=> <>
      <div className="record-pickers"><RecordPicker key={'first-'+reset} label="First record" rows={rows} value={a?left:''} other={right} onChange={v=>set('left',v)}/><RecordPicker key={'second-'+reset} label="Second record" rows={rows} value={b?right:''} other={left} onChange={v=>set('right',v)}/></div>
      {((left&&!a)||(right&&!b))&&<p role="status" className="notice">A linked record is not in this snapshot. Choose an available record; no replacement has been silently selected.</p>}
      {duplicate&&<p role="alert" className="notice">Choose two different records to compare.</p>}
      {a&&b&&!duplicate?<>
        <p className="notice">Dated FY2027 comparison{m.status==='ready'?' · retrieved '+m.value.retrieved_at: ' · retrieval metadata unavailable'}. Missing is not zero. Versions are never added. Title associations do not verify physical locations; shared-office amounts remain undivided. Classifications alone do not establish wrongdoing.</p>
        <div className="citizen-toolbar"><button className="button" onClick={()=>{const n=new URLSearchParams(params);n.set('left',right);n.set('right',left);setParams(n);setCopy('');}}>Swap records</button><button className="button" onClick={()=>{setParams({});setCopy('');setReset(n=>n+1);}}>Clear comparison</button><button className="button" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopy('Comparison link copied.');}catch{setCopy('Copy is unavailable. Copy the page address from your browser.');}}}>Copy comparison link</button></div>
        {copy&&<p role="status">{copy} {window.location.hostname==='localhost'?'This local preview address works only on this computer. The individual source links are public.':''}</p>}
        <DataTable caption="Two source records compared at the same budget stages" unitNote="Exact PHP; proposals, not spending. Scroll horizontally on narrow screens to compare both full records." columns={[{key:'field',label:'What to compare',width:'220px'},{key:'first',label:'First record',width:'400px'},{key:'second',label:'Second record',width:'400px'}]}>
          <tr><th scope="row">Published project title</th><td><Link to={recordPath(a)}>{a.title}</Link></td><td><Link to={recordPath(b)}>{b.title}</Link></td></tr>
          {fields.map(f=><tr key={f.label}><th scope="row">{f.label}</th>{[a,b].map(p=><td key={p.key} className={f.label.includes('amount')||f.label.includes('proposal')?'comparison-amount':undefined}>{f.read(p)}</td>)}</tr>)}
          <tr><th scope="row">Evidence and sources</th>{[a,b].map(p=><td key={p.key}><div className="compare-source-actions">{resolveSourceLink(p)?<External href={resolveSourceLink(p)!}>Read source reference</External>:<span>Verified source unavailable</span>}<Link to={evidencePath(p)}>Create evidence card</Link></div></td>)}</tr>
        </DataTable>
        <details className="citizen-disclosure"><summary>Preserved source notices</summary>{scope.status==='ready'&&scope.value.disclaimers.map(d=><p key={d.id}><strong>{d.title}</strong> {d.body}</p>)}</details>
      </>:!duplicate&&<p className="comparison-empty" role="status">Choose {a||b?'one more record':'two records'} to begin. You can also choose “Compare” beside a project in the explorer.</p>}
    </>}</Await>
    <ResponsibleUse />
  </main>;
}
