import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TrackerShell from "../components/TrackerShell";
import { useTrackerIndex, readTracker } from "../lib/tracker-data";
import {
  filterContracts,
  moneyExact,
  contractsCsv,
  type ContractRecord,
  type TrackerIndex,
} from "../lib/tracker";
import type { Async } from "../lib/portal-context";
import { External } from "../components/Bits";
import { downloadText } from "../lib/csv";
import DataTable from "../components/DataTable";
import evidence from "../data/civic/evidence.json";
import { projectTimelinePath } from "../lib/project-timeline";

const evidenceIds = new Set(evidence.rows.map((row) => row.id));

function Ledger({ index }: { index: TrackerIndex }) {
  const [params, setParams] = useSearchParams(),
    [data, setData] = useState<Async<ContractRecord[]>>({ status: "loading" }),
    [loadedKey, setLoadedKey] = useState(""),
    [attempt, setAttempt] = useState(0),
    [limit, setLimit] = useState(25);
  const province = params.get("province") ?? "negros-occidental",
    q = params.get("q") ?? "",
    year = params.get("year") ?? "",
    status = params.get("status") ?? "",
    linked = params.get("linked") ?? "",
    category = params.get("category") ?? "",
    sort = params.get("sort") ?? "";
  const dataKey =
    province === "all" || Object.hasOwn(index.shards, province)
      ? province
      : "invalid";
  useEffect(() => {
    const controller = new AbortController();
    const shards =
      dataKey === "all"
        ? Object.values(index.shards)
        : dataKey === "invalid"
          ? []
          : [index.shards[dataKey]];
    Promise.all(
      shards.map(async (file) => {
        const rows = await readTracker<ContractRecord[]>(
          file,
          controller.signal,
        );
        if (rows.length !== file.count)
          throw Error("Contract selection mismatch");
        return rows;
      }),
    )
      .then((values) => {
        const rows = values.flat();
        if (
          !shards.length ||
          new Set(rows.map((row) => row.id)).size !== rows.length
        )
          throw Error("Contract selection mismatch");
        if (!controller.signal.aborted) {
          setLoadedKey(dataKey);
          setData({ status: "ready", value: rows });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setLoadedKey(dataKey);
          setData({ status: "error", error });
        }
      });
    return () => controller.abort();
  }, [dataKey, index, attempt]);
  function change(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name === "province") next.delete("category");
    next.delete("contract");
    setLimit(25);
    setParams(next, { replace: name === "q" });
  }
  const current: Async<ContractRecord[]> =
    loadedKey === dataKey ? data : { status: "loading" };
  const ready = current.status === "ready" ? current.value : [],
    matches = filterContracts(ready, {
      q,
      year,
      status,
      linked,
      category,
      sort,
    }),
    record = params.get("contract"),
    rows = record ? matches.filter((row) => row.id === record) : matches;
  const cents = rows.reduce(
      (sum, r) =>
        sum +
        (r.contract_php === null
          ? 0n
          : BigInt(Math.round(r.contract_php * 100))),
      0n,
    ),
    total = Number(cents) / 100;
  return (
    <>
      <div className="tracker-filters">
        <label className="field">
          <span>DPWH office association</span>
          <select
            value={province}
            onChange={(e) => change("province", e.target.value)}
          >
            {[
              ["all", "All Negros Island offices"],
              ["negros-occidental", "Negros Occidental & Bacolod"],
              ["negros-oriental", "Negros Oriental"],
              ["siquijor", "Siquijor"],
              ["regional", "NIR regional offices"],
            ].map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Contract, contractor, or candidate GAA line</span>
          <input
            type="search"
            maxLength={150}
            value={q}
            onChange={(e) => change("q", e.target.value)}
          />
        </label>
        <label className="field">
          <span>DPWH contract year</span>
          <select value={year} onChange={(e) => change("year", e.target.value)}>
            <option value="">All years</option>
            {Array.from({ length: 11 }, (_, i) => 2026 - i).map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Reported status</span>
          <select
            value={status}
            onChange={(e) => change("status", e.target.value)}
          >
            <option value="">All statuses</option>
            {[...new Set(ready.map((r) => r.status))].sort().map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Upstream GAA candidate links</span>
          <select
            value={linked}
            onChange={(e) => change("linked", e.target.value)}
          >
            <option value="">With or without links</option>
            <option value="yes">With candidate links</option>
            <option value="no">Without candidate links</option>
          </select>
        </label>
        <label className="field">
          <span>Source category</span>
          <select
            value={category}
            onChange={(event) => change("category", event.target.value)}
          >
            <option value="">All categories</option>
            {[...new Set(ready.map((row) => row.category).filter(Boolean))]
              .sort()
              .map((value) => (
                <option key={value}>{value}</option>
              ))}
          </select>
        </label>
        <label className="field">
          <span>Sort contracts</span>
          <select
            value={sort}
            onChange={(event) => change("sort", event.target.value)}
          >
            <option value="">Newest contract year</option>
            <option value="oldest">Oldest contract year</option>
            <option value="amount">Largest listed amount</option>
          </select>
        </label>
        <button
          className="button"
          onClick={() => {
            setParams({});
            setLimit(25);
          }}
        >
          Clear contract filters
        </button>
      </div>
      {current.status === "loading" ? (
        <p role="status">Loading historical contracts…</p>
      ) : current.status === "error" ? (
        <div role="alert">
          <p>
            Contracts could not be verified. No older or estimated rows are
            substituted.
          </p>
          <button className="button" onClick={() => setAttempt((n) => n + 1)}>
            Retry contracts
          </button>
        </div>
      ) : (
        <>
          <div className="tracker-ledger-summary">
            <p role="status">
              <strong>{rows.length.toLocaleString()}</strong> matching contracts
              <br />
              <span>
                {rows.filter((r) => r.links.length).length} have upstream
                candidate GAA links.
              </span>
            </p>
            <p>
              <strong>
                {rows.some((r) => r.contract_php !== null)
                  ? moneyExact(total)
                  : "Not available"}
              </strong>
              <br />
              <span>
                Sum of listed contract amounts; not payments. Each contract
                counted once.
              </span>
            </p>
            <button
              className="button"
              disabled={!rows.length}
              onClick={() =>
                downloadText(
                  "betternegrosisland-contracts.csv",
                  contractsCsv(rows, index),
                )
              }
            >
              Export matching contracts
            </button>
          </div>
          {record && (
            <p>
              <Link to={`/contracts?province=${encodeURIComponent(province)}`}>
                Browse all contracts in this office selection
              </Link>
            </p>
          )}
          <p className="notice">
            Status and progress are as published in the source build dated{" "}
            {index.built_at.slice(0, 10)}. They are not a current site
            inspection. A planned completion date does not establish actual
            completion. Payment fields are not displayed because source zeros do
            not reliably establish payment status.
          </p>
          <div className="contract-ledger">
            {rows.slice(0, limit).map((r) => (
              <article className="contract-record" key={r.id}>
                <header>
                  <div>
                    <p className="tracker-record-meta">
                      {r.id} · DPWH year {r.year} · {r.office}
                    </p>
                    <h2>{r.title}</h2>
                    <p>
                      {r.contractor ?? "Contractor not supplied in this source"}
                    </p>
                  </div>
                  <strong className="tracker-amount">
                    {moneyExact(r.contract_php)}
                  </strong>
                </header>
                <dl className="contract-facts">
                  <div>
                    <dt>Reported status</dt>
                    <dd>{r.status || "Not supplied"}</dd>
                  </div>
                  <div>
                    <dt>Reported physical progress</dt>
                    <dd>
                      {r.progress_percent === null
                        ? "Not supplied"
                        : r.progress_percent + "%"}
                    </dd>
                  </div>
                  <div>
                    <dt>Listed start date</dt>
                    <dd>{r.start_date ?? "Not supplied"}</dd>
                  </div>
                  <div>
                    <dt>Listed completion date</dt>
                    <dd>{r.completion_date ?? "Not supplied"}</dd>
                  </div>
                </dl>
                <p>
                  <External href={r.url}>DPWH source contract</External>
{evidenceIds.has(r.id) && <> · <Link to={projectTimelinePath(r.id)}>Open project timeline</Link> · <Link to={"/site-evidence?id=" + r.id}>Compare dated progress and open Bisto</Link></>}
                  {!record && (
                    <>
                      {" "}
                      ·{" "}
                      <Link
                        to={`/contracts?${new URLSearchParams({ province: r.province, contract: r.id })}`}
                      >
                        Open contract reference
                      </Link>
                    </>
                  )}
                </p>
                <details open={record ? true : undefined}>
                  <summary>
                    {r.links.length
                      ? `${r.links.length} candidate historical GAA link${r.links.length === 1 ? "" : "s"}`
                      : "No upstream GAA link in this extraction"}
                  </summary>
                  <p>{index.linking}</p>
                  {r.links.length > 0 ? (
                    <DataTable
                      caption={"Candidate GAA lines for " + r.id}
                      columns={[
                        { key: "line", label: "Historical GAA line" },
                        {
                          key: "amount",
                          label: "GAA appropriation",
                          numeric: true,
                        },
                        { key: "method", label: "Upstream matching method" },
                      ]}
                    >
                      {r.links.map((l, i) => (
                        <tr key={l.year + ":" + l.line_id + ":" + i}>
                          <th scope="row">
                            FY{l.year} · {l.line_id}
                            <br />
                            {l.title}
                            <br />
                            <small>{l.office}</small>
                          </th>
                          <td className="money-cell">
                            {moneyExact(l.gaa_php)}
                          </td>
                          <td>
                            {l.method}
                            <br />
                            Search scope: {l.searched}
                            <br />
                            Title score: {l.title_score || "not supplied"}
                            <br />
                            Candidates: {l.candidates || "not supplied"}
                          </td>
                        </tr>
                      ))}
                    </DataTable>
                  ) : (
                    <p>
                      This does not establish absence of funding or a missing
                      official record.
                    </p>
                  )}
                  <p>
                    <External href={index.source_page}>
                      Review provider methodology and downloads
                    </External>
                  </p>
                </details>
              </article>
            ))}
          </div>
          {!rows.length && (
            <p>
              No matching contracts in this retained office selection. Clear
              filters or choose another office association.
            </p>
          )}
          {rows.length > limit && (
            <button className="button" onClick={() => setLimit((n) => n + 25)}>
              Show 25 more contracts
            </button>
          )}
        </>
      )}
    </>
  );
}
export default function Contracts() {
  const { state, retry } = useTrackerIndex();
  return (
    <TrackerShell
      title="Historical contract explorer"
      description="Find published DPWH contracts, contractors, and candidate links to historical GAA appropriations across Negros Island offices."
    >
      {state.status === "ready" ? (
        <>
          <p className="tracker-stamp">
            Source built {state.value.built_at.slice(0, 10)}; imported{" "}
            {state.value.retrieved_at.slice(0, 10)}. {state.value.provider}.
            This collection is separate from the FY2027 proposal snapshot.
          </p>
          <details className="tracker-source-notes">
            <summary>Coverage, matching limits and source notice</summary>
            <p>{state.value.scope}</p>
            <p>{state.value.linking}</p>
            <p>{state.value.notice}</p>
            <p>
              <External href={state.value.source_page}>
                Provider data and methodology
              </External>{" "}
              · <a href={state.value.readme.path}>Download source README</a> ·{" "}
              <a href={state.value.source_manifest.path}>
                Source manifest and checksums
              </a>
            </p>
          </details>
          <Ledger index={state.value} />
        </>
      ) : state.status === "error" ? (
        <div role="alert">
          <p>
            The contract collection could not be loaded.{" "}
            <Link to="/projects">The budget explorer</Link> remains available.
          </p>
          <button className="button" onClick={retry}>
            Retry collection
          </button>
        </div>
      ) : (
        <p role="status">Reading contract collection metadata…</p>
      )}
    </TrackerShell>
  );
}
