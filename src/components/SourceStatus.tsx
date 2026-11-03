import { Link } from "react-router-dom";
import { useSnapshot, type Manifest } from "../lib/snapshot";

/** Static collection metadata. Individual live-detail responses retain their own source date. */
export default function SourceStatus() {
  const snapshot = useSnapshot<Manifest>();
  if (snapshot.status !== "ready") return <p className="source-status-message" role="status">{snapshot.status === "error" ? "Snapshot unavailable. No estimated figures are shown." : "Reading the dated source manifest…"} <Link to="/data-coverage">Inspect data coverage</Link></p>;
  const m = snapshot.value;
  return <div className="source-evidence" role="group" aria-label="Source status">
    <p className="source-mode"><span className="snapshot-indicator" aria-hidden="true" />Dated static snapshot</p>
    <dl><div><dt>Retrieved</dt><dd><time dateTime={m.retrieved_at}>{m.retrieved_at.slice(0,10)}</time></dd></div><div><dt>Source built</dt><dd><time dateTime={m.source_build}>{m.source_build.slice(0,10)}</time></dd></div><div><dt>Coverage</dt><dd>{m.project_count.toLocaleString("en-PH")} comparison records · 4 program queries</dd></div><div><dt>Data provider</dt><dd><a href="https://budget.bettergov.ph/docs" target="_blank" rel="noopener noreferrer">BetterGov.PH Budget API</a></dd></div></dl>
    <Link to="/data-coverage">Inspect collection scope and limitations</Link>
  </div>;
}
