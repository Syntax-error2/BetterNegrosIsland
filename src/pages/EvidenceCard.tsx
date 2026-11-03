import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { usePortal } from '../lib/portal-context';
import { useSnapshot, type Manifest } from '../lib/snapshot';
import { Await, External } from '../components/Bits';
import { evidenceModel, recordPath } from '../lib/evidence';
import { buildEvidencePng } from '../lib/evidence-image';
import { useTitle } from '../lib/use-title';
import ResponsibleUse from '../components/ResponsibleUse';

export default function EvidenceCard() {
  const { dataset, id } = useParams();
  const { scope } = usePortal();
  const manifest = useSnapshot<Manifest>();
  const [params, setParams] = useSearchParams();
  const stage = params.get('stage') === 'nep' ? 'nep' : 'house';
  const p = scope.status === 'ready' ? scope.value.projects.find(p => p.dataset === dataset && p.id === id) : undefined;
  const {model, modelError} = useMemo(() => {
    try { return {model:p && manifest.status === 'ready' && scope.status === 'ready' ? evidenceModel(p, stage, manifest.value, scope.value) : null, modelError:''}; }
    catch { return {model:null, modelError:'This source record cannot be safely rendered. No estimated or rounded replacement has been generated.'}; }
  }, [p, stage, manifest, scope]);
  const key = model ? `${dataset}/${id}/${stage}/${model.retrieved}` : '';
  const [render, setRender] = useState<{key:string; url?:string; error?:string}>({key:''});
  const [copy, setCopy] = useState('');
  useTitle('Share project evidence · BetterNegrosIsland');
  useEffect(() => {
    if (!model) return;
    let live = true;
    buildEvidencePng(model).then(url => { if (live) setRender({key, url}); }, () => { if (live) setRender({key, error:'The image could not be generated. Try again by reloading, or use the text and source reference below.'}); });
    return () => { live = false; };
  }, [model, key]);
  const ready = render.key === key && Boolean(render.url);
  const downloadImage = () => {
    if (!ready || !render.url || !model) return;
    const bytes = Uint8Array.from(atob(render.url.split(',')[1]), c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], {type:'image/png'}));
    const link = document.createElement('a');
    link.href = url; link.download = model.filename;
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  return <main id="main-content" tabIndex={-1} className="page page--wide main evidence-page">
    <p><Link to="/projects">Back to project explorer</Link></p>
    <h1>Evidence you can share.</h1>
    <p>A dated record with its source and limitations attached. The image is created in your browser. Review it before sharing.</p>
    <Await state={scope} what="the dated comparison records">{() => !p ? <p role="status">This record is not in the verified snapshot. <Link to="/projects">Find a published record</Link>.</p> : model ? <>
      <div className="citizen-toolbar evidence-toolbar">
        <label className="field"><span>Budget version on the card</span><select value={stage} onChange={e => { setParams({stage:e.target.value}); setCopy(''); }}><option value="house">House bill proposal</option><option value="nep">NEP proposal</option></select></label>
        {ready ? <button className="button button-primary" onClick={downloadImage}>Download evidence card (PNG)</button> : <span role="status">{render.key === key && render.error ? render.error : 'Preparing the image…'}</span>}
        <button className="button" disabled={!model.source} onClick={async () => { try { await navigator.clipboard.writeText(model.source!); setCopy('Source link copied.'); } catch { setCopy('Copy is unavailable. Select the source URL below and copy it manually.'); } }}>Copy source link</button>
      </div>
      {copy && <p role="status">{copy}</p>}
      <ResponsibleUse />
      <div className="evidence-layout">
        <article className="evidence-text"><h2>{model.title}</h2><dl className="citizen-facts"><dt>FY2027 budget version</dt><dd>{model.stage}</dd><dt>Published amount</dt><dd>{model.amount}</dd><dt>Snapshot retrieved</dt><dd>{model.retrieved}</dd><dt>Source record</dt><dd>{model.dataset} · {model.recordId}</dd></dl>
          <p>{model.source ? <External href={model.source}>Read the source reference</External> : 'Verified source unavailable.'}</p>
          {model.source && <p className="source-url">{model.source}</p>}
          <p>The QR code opens this same source reference, rather than a localhost or unpublished portal URL.</p>
          <details className="citizen-disclosure"><summary>Read every note included on the image</summary>{model.notes.map((note,i) => <p key={i}>{note}</p>)}</details>
          <Link to={recordPath(p)}>Inspect this project</Link>
        </article>
        <div className="evidence-preview">{ready && <img src={render.url} alt={'Downloadable evidence card for ' + model.title + '. All figures, source details and notes are provided in text alongside the image.'} />}</div>
      </div>
    </> : <p role="status">{modelError || (manifest.status === 'error' ? 'Snapshot metadata unavailable. No undated card will be generated.' : 'Reading the snapshot date…')}</p>}</Await>
  </main>;
}
