import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNotebook } from "../lib/use-notebook";
import { safeSearchPath } from "../lib/notebook";
import {
  explainRecord,
  qualityFlags,
  QUALITY_LABELS,
  TOPICS,
} from "../lib/citizen-insights";
import type { ScopedProject } from "../lib/scope";
export function SaveRecord({ project }: { project: ScopedProject }) {
  const { value, persistent, update } = useNotebook();
  const saved = value.records.includes(project.key);
  const [message, setMessage] = useState("");
  return (
    <span className="save-control">
      <button
        type="button"
        className="button button-quiet"
        aria-pressed={saved}
        aria-label={
          saved
            ? "Saved record: " + project.title + ". Select to remove."
            : "Save record: " + project.title
        }
        onClick={() => {
          if (!saved && value.records.length >= 100) {
            setMessage(
              "Your list holds up to 100 records. Remove one in Saved items first.",
            );
            return;
          }
          const ok = update({
            ...value,
            records: saved
              ? value.records.filter((k) => k !== project.key)
              : [...value.records, project.key],
          });
          setMessage(
            saved
              ? "Removed from saved items."
              : ok
                ? "Saved on this device."
                : "Saved for this visit only; browser storage is unavailable.",
          );
        }}
      >
        {saved ? "Saved" : "Save record"}
      </button>
      {message && (
        <span role="status" className="fine">
          {message}
        </span>
      )}
      {!persistent && !message && <span className="fine">This visit only</span>}
    </span>
  );
}
export function SaveSearch({ community }: { community?: string }) {
  const [sharing, setSharing] = useState(false);
  const location = useLocation(),
    { value, update } = useNotebook();
  const path = safeSearchPath(location.pathname + location.search);
  const saved = value.searches.some((s) => s.path === path);
  const [message, setMessage] = useState("");
  if (!path) return null;
  const params = new URLSearchParams(location.search);
  const label = [
    community ? community + " records" : "Project search",
    ...[
      "q",
      "program",
      "topic",
      "status",
      "province",
      "lgu",
      "min",
      "max",
      "stage",
      "office",
      "why",
      "sort",
    ].flatMap((k) => {
      const v = params.get(k);
      return v
        ? [
            k === "topic"
              ? (TOPICS.find((t) => t.id === v)?.name ?? v)
              : k + ": " + v,
          ]
        : [];
    }),
  ]
    .join(" · ")
    .slice(0, 160);
  return (
    <div className="reading-actions">
      <button
        className="button button-quiet"
        aria-pressed={saved}
        onClick={() => {
          if (!saved && value.searches.length >= 30) {
            setMessage(
              "Your list holds up to 30 searches. Remove one in Saved items first.",
            );
            return;
          }
          const ok = update({
            ...value,
            searches: saved
              ? value.searches.filter((s) => s.path !== path)
              : [...value.searches, { path, label }],
          });
          setMessage(
            saved
              ? "Search removed."
              : ok
                ? "Search saved on this device."
                : "Saved for this visit only; browser storage is unavailable.",
          );
        }}
      >
        {saved ? "Unsave this search" : "Save this search"}
      </button>
      <button
        className="button button-quiet"
        onClick={async () => {
          setSharing(true);
          try {
            await navigator.clipboard.writeText(window.location.origin + path);
            setMessage(
              "Search link copied. Anyone opening it can see the included search terms.",
            );
          } catch {
            setMessage(
              "Could not copy. Use the page address to share this search.",
            );
          }
        }}
      >
        Copy search link
      </button>
      <Link to="/saved">View saved items</Link>
      {message && <span role="status">{message}</span>}
      {sharing && (
        <label className="shared-search-url">
          <span>Share this search URL</span>
          <input
            type="url"
            readOnly
            value={window.location.origin + path}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
      )}
    </div>
  );
}
export function RecordExplanation({ project }: { project: ScopedProject }) {
  const flags = qualityFlags(project);
  return (
    <details className="reading-explanation">
      <summary>Explain this snapshot record</summary>
      <p className="fine">
        Based on the dated portal snapshot; current source details below may
        differ.{" "}
        {project.retrieved_at
          ? "Snapshot retrieved " + project.retrieved_at + "."
          : "Inspect Data coverage for the snapshot date."}
      </p>
      {explainRecord(project).map((p) => (
        <p key={p}>{p}</p>
      ))}
      {flags.length > 0 && (
        <p>
          Reading notes: {flags.map((f) => QUALITY_LABELS[f]).join(" · ")}.{" "}
          <Link to="/data-quality">Understand these notes</Link>.
        </p>
      )}
      <Link to="/glossary">Look up a budget term</Link>
    </details>
  );
}
