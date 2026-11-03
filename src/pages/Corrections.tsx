import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CORRECTIONS_EMAIL, correctionMailto, correctionLog, type CorrectionEntry } from '../lib/corrections';
import { snapshotJson } from '../lib/snapshot';
import { useTitle } from '../lib/use-title';

export default function Corrections(){
  useTitle('Corrections & privacy requests · BetterNegrosIsland');
  const [entries,setEntries]=useState<CorrectionEntry[]|null>(null);
  const [error,setError]=useState(false);
  useEffect(()=>{let live=true;snapshotJson<unknown>('/data/corrections.json').then(correctionLog).then(v=>{if(live)setEntries(v);},()=>{if(live)setError(true);});return()=>{live=false;};},[]);
  return <main id="main-content" tabIndex={-1} className="page page--reading main legal-page">
    <Link to="/">← Overview</Link><p className="eyebrow">Help keep the record accurate</p><h1>Corrections & privacy requests</h1>
    <p>Found a source error, a misleading presentation, or personal information that needs review? Contact the project privately.</p>
    <section className="chart-panel" aria-labelledby="contact-heading"><h2 id="contact-heading">Email the maintainers</h2><p><a className="button button-primary" href={correctionMailto}>Email a correction or privacy request</a></p><p><a href={'mailto:'+CORRECTIONS_EMAIL}>{CORRECTIONS_EMAIL}</a></p><p>This opens your email app. The website has no submission form and does not send a report for you. If no app opens, copy the address into your email service.</p>
      <h3>Include only what is needed</h3><ul><li>The affected portal page, record ID and snapshot version, if available.</li><li>A short explanation of the issue and the correction or privacy action requested.</li><li>A published source link supporting a data correction, if available.</li></ul>
      <p>Do not send identity documents, health information, passwords or sensitive attachments with an initial request. Avoid repeating the personal information you want removed. Do not post private requests in public GitHub issues.</p>
      <p>Your email service and the project inbox provider process the message and sender information you choose to send. Delivery, response times and resolution are not guaranteed by this page. A published contact is not legal or privacy certification. Read the <Link to="/privacy#privacy-rights">Privacy Notice</Link>.</p>
    </section>
    <section aria-labelledby="correction-log"><h2 id="correction-log">Public correction log</h2><p>Reviewed changes are recorded here with a source reference. Private requests and requester details are not published. This log describes portal corrections; the <Link to="/updates">data update history</Link> describes snapshot changes.</p>
      {error?<p role="alert">The correction log could not be loaded. The email contact above remains available.</p>:entries===null?<p role="status">Loading the correction log…</p>:entries.length===0?<p className="notice">No published correction entries yet. This does not indicate whether private requests have been received.</p>:<ol>{entries.map((e,i)=><li key={i}><h3>{e.date} · {e.record}</h3><p>{e.summary}</p><p>Snapshot: {e.version}. <a href={e.source} target="_blank" rel="noopener noreferrer">Source reference</a></p></li>)}</ol>}
    </section>
  </main>;
}
