import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSnapshot, type Manifest } from '../lib/snapshot';
import type { ScopeResult } from '../lib/scope';
import { Await } from '../components/Bits';
import { phpFull } from '../lib/format';
import { evidencePath, houseReading, recordPath, guideExample } from '../lib/evidence';
import { useTitle } from '../lib/use-title';

const STEPS=[
  {title:'A proposal asks for funding.',term:'NEP · National Expenditure Program',text:'The Executive submits a proposed budget. A published NEP amount describes what this version proposes. It is not a payment or a record of work completed.',takeaway:'Proposed amount ≠ money spent.'},
  {title:'The House has its own version.',term:'House bill · a legislative budget version',text:'The House considers the proposal and publishes its bill. Compare a record’s NEP amount with its House amount. Never add them: they are versions of one budget. A one-sided line or uncertain match needs source checking.',takeaway:'Compare versions; do not combine them.'},
  {title:'An appropriation authorizes spending.',term:'GAA · General Appropriations Act',text:'An enacted appropriation provides legal authority to spend. This portal’s GAA history covers FY2020–FY2026, a separate scope from the FY2027 proposal comparison. Historical families are not automatically the same projects as current proposal records.',takeaway:'Keep the fiscal year and budget stage attached to every figure.'},
  {title:'Actual spending needs separate evidence.',term:'Payment, delivery and completion require their own records',text:'A proposal or appropriation does not prove that money was released or paid, that work happened, or that an official controlled the project. This regional snapshot does not establish locally attributable actual spending.',takeaway:'When spending evidence is unavailable, say “not established”—not zero.'},
  {title:'Now read a real record.',term:'Use the same questions on the published evidence',text:'Check the title, version, amount, date and source. Then read the caveats before sharing a conclusion.',takeaway:'Follow the figure back to its source.'},
];

function RealExample(){
  const scope=useSnapshot<ScopeResult>('scope');
  const m=useSnapshot<Manifest>();
  return <Await state={scope} what="a real dated example">{s=>{
    const p=guideExample(s.projects);
    return p?<section className="guide-example"><h3>{p.title}</h3><p>{p.dataset.toUpperCase()} · dated comparison{m.status==='ready'?' retrieved '+m.value.retrieved_at:''}</p><dl className="citizen-facts"><dt>FY2027 NEP proposal</dt><dd>{phpFull(p.nep_php)}</dd><dt>FY2027 {houseReading(p.dataset)}</dt><dd>{phpFull(p.house_php)}</dd></dl><p>Both numbers are proposed versions, not money spent. Title associations do not independently verify physical locations. This is a reading example, not a ranking or an allegation.</p><div className="citizen-toolbar"><Link className="button button-primary" to={recordPath(p)}>Inspect the real record</Link><Link to={evidencePath(p)}>Make an evidence card</Link></div></section>:<p>No suitable paired example is available in this snapshot. <Link to="/projects">Explore the available records</Link>.</p>;
  }}</Await>;
}

export default function BudgetGuide(){
  const [step,setStep]=useState(0),[answer,setAnswer]=useState('');
  const heading=useRef<HTMLHeadingElement>(null);
  const go=(n:number)=>{setStep(n);requestAnimationFrame(()=>heading.current?.focus({preventScroll:true}));};
  useTitle('A one-minute budget guide · BetterNegrosIsland');
  return <main id="main-content" tabIndex={-1} className="page page--reading main budget-guide">
    <p><Link to="/">Back to overview</Link></p><h1>A one-minute budget guide.</h1><p>About a minute to read. Move at your own pace—there is no timer or sign-up.</p>
    <nav className="guide-steps" aria-label="Budget guide steps">{['Proposal','House bill','Appropriation','Spending','Real example'].map((label,i)=><button key={label} type="button" aria-current={i===step?'step':undefined} onClick={()=>go(i)}>{i+1}. {label}</button>)}</nav>
    <section className="guide-panel" aria-labelledby="guide-heading"><p className="guide-progress" role="status">Step {step+1} of {STEPS.length}</p><div className="guide-copy-grid">{STEPS.map((content,i)=><div key={content.title} className={'guide-copy'+(i===step?' is-current':'')} aria-hidden={i!==step} inert={i!==step}><h2 id={i===step?'guide-heading':undefined} ref={i===step?heading:undefined} tabIndex={-1}>{content.title}</h2><p className="guide-term">{content.term}</p><p>{content.text}</p><p className="guide-takeaway">{content.takeaway}</p></div>)}</div></section>
    <div className="guide-navigation"><button className="button" disabled={step===0} onClick={()=>go(step-1)}>Previous</button>{step<4?<button className="button button-primary" onClick={()=>go(step+1)}>Next step</button>:<Link className="button button-primary" to="/projects">Explore the project records</Link>}</div>
    {step===3&&<fieldset className="guide-question"><legend>Quick check: does a published appropriation prove actual payment?</legend>{[['yes','Yes, it proves payment'],['no','No, payment needs separate evidence']].map(([value,label])=><label key={value}><input type="radio" name="spending-check" checked={answer===value} onChange={()=>setAnswer(value)}/>{label}</label>)}{answer&&<p role="status">{answer==='no'?'Correct. An appropriation authorizes spending; payment needs separate evidence.':'An appropriation alone does not prove payment. Check separate spending and delivery records.'}</p>}</fieldset>}
    {step===4&&<RealExample/>}
    <p className="fine"><Link to="/methodology">Read the full methodology and source limitations</Link></p>
  </main>;
}
