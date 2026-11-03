import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Manifest } from '../lib/snapshot';
import { researchCitation, researchNotes, RESEARCH_FIELDS } from '../lib/research';
import { downloadText } from '../lib/csv';
import './research-toolkit.css';

export default function ResearchToolkit({ manifest, origin, sourceNotices }: { manifest: Manifest; origin: string; sourceNotices: readonly string[] }) {
  const [status, setStatus] = useState('');
  let citation: string;
  try { citation = researchCitation(manifest, origin); }
  catch { return <p role="status">Snapshot citation metadata is unavailable. Check data coverage before quoting figures.</p>; }
  return <div className="research-toolkit">
    <h3>Cite the snapshot you used</h3>
    <p className="research-citation">{citation}</p>
    <p className="small">Suggested portal citation; adapt it to your required style. Cite the original agency document and its page or row for each finding.</p>
    <div className="reading-actions">
      <button type="button" className="button button-primary" onClick={async () => {
        try { await navigator.clipboard.writeText(citation); setStatus('Citation copied.'); }
        catch { setStatus('Copy is unavailable. Select the citation text above and copy it manually.'); }
      }}>Copy citation</button>
      <button type="button" className="button" disabled={!sourceNotices.length} onClick={() => {
        try { downloadText('betternegrosisland-research-notes-'+manifest.version.replace(/[^a-zA-Z0-9_-]/g,'_')+'.txt', researchNotes(manifest, origin, sourceNotices), 'text/plain;charset=utf-8'); setStatus('Research notes downloaded with the loaded snapshot metadata and source notices.'); }
        catch { setStatus('Research notes could not be prepared. Check that snapshot metadata and source notices are available.'); }
      }}>Download research notes (TXT)</button>
      <Link to="/data-coverage">View data coverage</Link>
    </div>
    {!sourceNotices.length && <p role="status">Source notices must load before the research notes can be downloaded.</p>}
    {status && <p role="status">{status}</p>}
    <details className="research-fields"><summary>CSV field guide · FY2027 comparison records</summary>
      <p>Amounts are exact nominal PHP; blank amounts are unavailable. Historical and reading-page exports have separate or additional columns. Spreadsheet-safe exports may prefix formula-like text with an apostrophe.</p>
      <dl>{Object.entries(RESEARCH_FIELDS).map(([field, definition]) => <div key={field}><dt><code>{field}</code></dt><dd>{definition}</dd></div>)}</dl>
    </details>
  </div>;
}
