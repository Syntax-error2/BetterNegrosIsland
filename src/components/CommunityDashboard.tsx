import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSnapshot, snapshotJson, type Manifest } from "../lib/snapshot";
import { type SnapshotChange, communitySummary } from "../lib/citizen-insights";
import { recordPath } from "../lib/evidence";
import type { ScopedProject } from "../lib/scope";
export function CommunityDashboard({
  rows,
  code,
}: {
  rows: ScopedProject[];
  code: string;
}) {
  const manifest = useSnapshot<Manifest>();
  const [copied, setCopied] = useState("");
  const { programs, groups } = communitySummary(rows);
  return (
    <section
      className="community-dashboard"
      aria-label="Community reading summary"
    >
      <div className="reading-split">
        <div>
          <h2>A starting point for your community.</h2>
          <p>
            {rows.length} title-associated comparison records. Categories below
            count records, not unique construction sites or spending.
          </p>
          <div className="reading-actions">
            <button className="button" onClick={() => window.print()}>
              Print community summary
            </button>
            <button
              className="button button-quiet"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    location.origin + "/locations/" + code,
                  );
                  setCopied("Community link copied.");
                } catch {
                  setCopied(
                    "Could not copy. Use this page’s address to share.",
                  );
                }
              }}
            >
              Copy community link
            </button>
          </div>
          {copied && <p role="status">{copied}</p>}
        </div>
        <div>
          <h3>By everyday need</h3>
          <ul className="reading-count-list">
            {programs.map((t) => (
              <li key={t.id}>
                <Link to={"/locations/" + code + "?topic=" + t.id}>
                  {t.name}
                </Link>
                <strong>{t.count}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>By source comparison</h3>
          <ul className="reading-count-list">
            {groups.map((g) => (
              <li key={g.group}>
                <Link to={"/locations/" + code + "?status=" + g.group}>
                  {g.label}
                </Link>
                <strong>{g.count}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="fine">
        {manifest.status === "ready"
          ? `Snapshot retrieved ${manifest.value.retrieved_at}.`
          : "Snapshot date unavailable."}{" "}
        Physical locations and exclusive LGU allocations remain unverified.{" "}
        <Link to="/data-quality">Read uncertainty notes</Link>.
      </p>
      <CommunityRecent rows={rows} />
      <Link to="/updates">See changes between retained snapshots</Link>
    </section>
  );
}

function CommunityRecent({ rows }: { rows: ScopedProject[] }) {
  const [state, setState] = useState<{
    changes: SnapshotChange[] | null;
    retrieved_at: string;
  } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    snapshotJson<{
      receipts: { changes: SnapshotChange[] | null; retrieved_at: string }[];
    }>("/data/update-history.json").then(
      (v) => {
        if (live) setState(v.receipts[0] ?? null);
      },
      () => {
        if (live) setFailed(true);
      },
    );
    return () => {
      live = false;
    };
  }, []);
  const changes =
    state?.changes?.filter((c) => rows.some((p) => p.key === c.key)) ?? [];
  return (
    <div className="community-recent">
      <h3>Latest recorded updates</h3>
      {failed ? (
        <p>
          Update history is unavailable. The current records below remain
          accessible.
        </p>
      ) : !state ? (
        <p>Loading update history…</p>
      ) : state.changes === null ? (
        <p>
          This is the first retained snapshot. Earlier changes cannot yet be
          measured.
        </p>
      ) : changes.length ? (
        <>
          <p>
            {changes.length} currently associated records changed in the
            snapshot retrieved {state.retrieved_at}.
          </p>
          <ul>
            {changes.slice(0, 5).map((c) => (
              <li key={c.key}>
                {c.kind} ·{" "}
                <Link
                  to={recordPath({
                    dataset: c.dataset as ScopedProject["dataset"],
                    id: c.id,
                  })}
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>
          No changes to the currently associated records were found in the
          latest snapshot comparison. Previously associated or removed records
          remain in the full update history.
        </p>
      )}
    </div>
  );
}
