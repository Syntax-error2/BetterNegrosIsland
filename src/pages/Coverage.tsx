import { coverageSource, sourceHref } from "../lib/safe-url";
import { External } from "../components/Bits";
import { useEffect, useState } from "react";
import {
  useSnapshot,
  snapshotJson,
  type Manifest,
  type Coverage as CoverageRow,
} from "../lib/snapshot";
import { useTitle } from "../lib/use-title";
export default function Coverage() {
  const m = useSnapshot<Manifest>();
  const [rows, setRows] = useState<CoverageRow[]>([]);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(100);
  const [refresh, setRefresh] = useState<{ status: string; at: string } | null>(
    null,
  );
  useTitle("Data coverage · BetterNegrosIsland");
  useEffect(() => {
    let live = true;
    snapshotJson<{ status: string; at: string }>(
      "/data/refresh-status.json",
    ).then(
      (s) => {
        if (live) setRefresh(s);
      },
      () => {},
    );
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (m.status !== "ready") return;
    let live = true;
    const c = m.value.coverage;
    (Array.isArray(c)
      ? Promise.resolve(c)
      : snapshotJson<CoverageRow[]>(c)
    ).then(
      (r) => {
        if (live) setRows(r);
      },
      () => {
        if (live) setError(true);
      },
    );
    return () => {
      live = false;
    };
  }, [m]);
  return (
    <main id="main-content" tabIndex={-1} className="page main">
      <p className="eyebrow">COLLECTION LEDGER</p>
      <h1>Know what the data covers.</h1>
      <p>
        Pagination completeness is a property of a query, not proof that every
        public budget record has been collected.
      </p>
      {m.status === "ready" ? (
        <>
          <p className="notice">
            Snapshot {m.value.version} · retrieved {m.value.retrieved_at}.
            Comparison source build {m.value.source_build}.{" "}
            {m.value.project_count} unique comparison records and{" "}
            {m.value.history_count} historical families.
          </p>
          <ul>
            {m.value.limitations.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p>
            Historical source-build metadata was not retained in the first
            extraction. Raw family records, retrieval time, and query endpoints
            are preserved; no comparison build date is substituted for the
            historical source.
          </p>
          {m.value.duplicates_across_queries && (
            <p>
              {m.value.source_confirmed_nir} source-confirmed NIR comparison
              records; {m.value.uncertain_region} supplementary records with
              uncertain regional association. Deduplication removed{" "}
              {m.value.duplicates_across_queries.comparison} repeated
              comparison-query appearances and{" "}
              {m.value.duplicates_across_queries.history} repeated
              historical-query appearances. These are overlaps, not discarded
              unique records.
            </p>
          )}
        </>
      ) : (
        <p role="status">
          {m.status === "error"
            ? "No verified manifest available."
            : "Loading the collection manifest…"}
        </p>
      )}
      {refresh?.status === "FAILED" && (
        <p role="alert">
          The latest refresh failed on {refresh.at}. This page continues to use
          the last successful, validated snapshot.
        </p>
      )}
      <section className="coverage-source-guide" aria-labelledby="coverage-source-heading">
        <h2 id="coverage-source-heading">Read the source, then inspect the collection</h2>
        <p>The public BetterGov.PH pages explain the national datasets. Regional scope here comes from the dated queries below; the source website links do not apply a regional filter.</p>
        <External href="https://budget.bettergov.ph/hgab/2027/overview">Browse the source budget comparison</External>
        <details><summary>Developer access · public API and query ledger</summary><p>The read-only API is intentionally public. Query endpoints below are provided for reproducibility, not as the main reading experience.</p><External href="https://budget.bettergov.ph/docs">API documentation and fair-use guidance</External></details>
      </section>
      <label className="field explorer-search">
        <span>Find a dataset or query</span>
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(100);
          }}
          placeholder="DPWH, Siquijor, GAA…"
        />
      </label>
      <p role="status">
        {error || m.status === "error"
          ? "Query reports unavailable."
          : !rows.length
            ? "Loading query reports…"
            : rows.length + " query reports."}{" "}
        Records appearing in several queries are stored once in each
        deduplicated dataset. Per-query counts must not be added as regional
        totals.
      </p>
      {error && (
        <p role="alert">
          Coverage shard unavailable. No completeness status can be asserted.
        </p>
      )}
      {(error || m.status === "error") && (
        <button className="button" onClick={() => window.location.reload()}>
          Reload verified data
        </button>
      )}
      <div className="coverage-reports">
        {rows
          .filter((r) =>
            JSON.stringify(r).toLowerCase().includes(q.toLowerCase()),
          )
          .slice(0, limit)
          .map((r, i) => (
            <details key={i}>
              <summary>
                <strong>{r.dataset}</strong>
                <span>{r.status}</span>
                <span>
                  {r.accepted} records ·{" "}
                  {Object.values(r.query ?? {}).join(" / ")}
                </span>
              </summary>
              <dl>
                <dt>Fiscal years / retrieval started</dt>
                <dd>
                  {r.fiscal_years?.join(", ") ?? "Not locally attributable"} /{" "}
                  {r.retrieved_at ?? "Not available"}
                </dd>
                <dt>Uncertain regional / unverified locality matches</dt>
                <dd>
                  {r.uncertain_geographic_matches ?? "Not applicable"} /{" "}
                  {r.unverified_locality_matches ?? "Not applicable"}
                </dd>
                <dt>Source / retrieved / accepted</dt>
                <dd>
                  {r.source ?? "Not provided"} / {r.retrieved} / {r.accepted}
                </dd>
                <dt>Within-query duplicates / rejected</dt>
                <dd>
                  {r.duplicates} / {r.rejected}
                </dd>
                <dt>Remaining pages</dt>
                <dd>{r.remaining ?? "Not applicable"}</dd>
                <dt>Geography</dt>
                <dd>
                  {r.query?.region
                    ? "Source regional filter"
                    : "Office or title-query association; locality unverified"}
                </dd>
              </dl>
              {r.note && <p>{r.note}</p>}
              {coverageSource(r.endpoint) && <External href={coverageSource(r.endpoint)!}>Read the national source website</External>}
              <p className="small">General dataset page; this query’s regional or title scope is described above.</p>
              <details className="coverage-api"><summary>Developer · exact API query (JSON)</summary>
                {sourceHref(r.endpoint) ? <External href={r.endpoint}>Open public API response (JSON)</External> : <p>Verified API link unavailable.</p>}
              </details>
            </details>
          ))}
      </div>
      {rows.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(q.toLowerCase()),
      ).length > limit && (
        <button className="button" onClick={() => setLimit((n) => n + 100)}>
          Show 100 more query reports
        </button>
      )}
    </main>
  );
}
