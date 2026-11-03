import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useSnapshot, type Manifest } from '../lib/snapshot';
import { currentSnapshot, snapshotPath } from '../lib/snapshot-selection';
import './snapshot-mode.css';

export function SnapshotGuard({ children }: { children: ReactNode }) {
  const m = useSnapshot<Manifest>();
  const location = useLocation();
  if (['/privacy','/terms','/corrections'].includes(location.pathname)) return children;
  if (!currentSnapshot().version) return children;
  if (m.status === 'loading') return <main id="main-content" tabIndex={-1} className="page main"><p role="status">Opening the requested snapshot…</p></main>;
  if (m.status === 'error' || ['/hearings','/updates'].includes(location.pathname)) return <main id="main-content" tabIndex={-1} className="page page--reading main"><h1>{m.status === 'error' ? 'Snapshot unavailable' : 'This supporting index is not archived'}</h1><p>{m.status === 'error' ? 'The requested snapshot could not be verified. No newer records have been substituted.' : 'The hearing and update indexes describe their own current collections. They are not part of this saved budget snapshot.'}</p><a className="button" href={location.pathname+location.search+location.hash}>Open the latest view</a></main>;
  return children;
}

export default function SnapshotMode() {
  const m = useSnapshot<Manifest>();
  const location = useLocation();
  const [message,setMessage] = useState('');
  const pinned = currentSnapshot().version;
  const liveDetail = !pinned && /^\/projects\/[^/]+\/[^/]+$/.test(location.pathname);
  const path = location.pathname+location.search+location.hash;
  if (m.status !== 'ready' || (!pinned && ['/privacy','/terms','/corrections','/about','/updates','/hearings','/saved'].includes(location.pathname))) return null;
  const exact = snapshotPath(path,m.value.version);
  return <aside className={'snapshot-mode'+(pinned?' is-pinned':'')} aria-label="Snapshot sharing">
    <div className="page snapshot-mode-inner"><p><strong>{pinned?'Saved budget snapshot':'Dated budget snapshot'}</strong><span>Retrieved {m.value.retrieved_at.slice(0,10)}{pinned?' · '+m.value.version:''}</span></p>
      <div className="snapshot-mode-actions"><button type="button" className="link-button" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.origin+exact);setMessage('Exact snapshot link copied. Search terms in the URL are visible to recipients.');}catch{setMessage('Copy is unavailable. Use the exact snapshot link below.');}}}>{liveDetail?'Share archived snapshot':'Share this exact snapshot'}</button>{pinned?<a href={path}>View latest</a>:<a href={exact}>{liveDetail?'Open archived record':'Open saved snapshot'}</a>}</div>
      {message&&<p role="status" className="snapshot-copy-status">{message} <a href={exact}>Exact snapshot link</a></p>}
    </div>
    {pinned&&<p className="page snapshot-mode-note">Budget data is locked to this snapshot. Explanations and notices can evolve; external source websites may change. Historical retention is not guaranteed indefinitely.</p>}
    {liveDetail&&<p className="page snapshot-mode-note">Project details below can be newer than this dated portal snapshot. The archived link uses retained figures and may differ from the live source.</p>}
  </aside>;
}
