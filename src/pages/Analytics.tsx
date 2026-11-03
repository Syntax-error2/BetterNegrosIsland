import KpiCard from "../components/KpiCard";
import { exactDifference } from "../lib/comparison-display";
import DataTable from "../components/DataTable";
import { useId, useMemo } from "react";
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { usePortal } from "../lib/portal-context";
import { useSnapshot, type Manifest } from "../lib/snapshot";
import { PROVINCES, LOCATIONS } from "../lib/geography";
import { safeSum, percentage, annotate } from "../lib/regional-data";
import {
  ANALYTICS_PROGRAMS,
  ANALYTICS_STATUSES,
  COMPARISON_NAMES,
  analyticsSelection,
  amountRanking,
} from "../lib/analytics-data";
import { SourceAttribution } from "../components/ChartCard";
import { php, phpFull, count } from "../lib/format";
import type { GaaResult } from "../lib/gaa";
import { Await, External } from "../components/Bits";
import DataChart from "../components/DataChart";
import { useTitle } from "../lib/use-title";
export default function Analytics() {
  const { scope } = usePortal();
  const m = useSnapshot<Manifest>();
  const history = useSnapshot<GaaResult>("history");
  const nep = useSnapshot<{ region: { amount: number; base_amount: number } }>(
    "nep",
  );
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const focusId = useId();
  const province = params.get("province") ?? "",
    program = params.get("program") ?? "",
    status = params.get("status") ?? "",
    lgu = params.get("lgu") ?? "",
    stage = params.get("stage") === "nep" ? "nep" : "house",
    dept = params.get("dept") ?? "";
  const set = (k: string, v: string) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    if (
      k === "province" &&
      lgu &&
      !LOCATIONS.some(
        (location) => location.code === lgu && (!v || location.province === v),
      )
    )
      n.delete("lgu");
    navigate(
      { search: n.toString(), hash: location.hash },
      { preventScrollReset: true },
    );
  };
  useTitle("Budget analytics · BetterNegrosIsland");
  const selection = useMemo(
    () =>
      analyticsSelection(scope.status === "ready" ? scope.value.projects : [], {
        province,
        program,
        status,
        lgu,
      }),
    [scope, province, program, status, lgu],
  );
  const { rows, summary, byProgram } = selection;
  const programs = ANALYTICS_PROGRAMS;
  const comparisonFocus = params.get("comparison") ?? "";
  const comparisonRows = comparisonFocus
    ? byProgram.filter((row) => row.label === comparisonFocus.toUpperCase())
    : byProgram;
  const historicalRows = useMemo(
    () =>
      history.status === "ready"
        ? history.value.rows.map((r) => ({
            ...r,
            geography: annotate({ title: r.name, region_key: null }),
          }))
        : [],
    [history],
  );
  const hist = historicalRows.filter(
    (r) =>
      (!dept || r.department_id === dept) &&
      (!province || r.geography.provinceMatches.includes(province)) &&
      (!lgu || r.geography.locationMatches.includes(lgu)),
  );
  const from = params.get("from") ?? "2020",
    to = params.get("to") ?? "2026";
  const ranked = [...rows]
    .filter((r) => (stage === "nep" ? r.nep_php : r.house_php) != null)
    .sort(
      (a, b) =>
        (stage === "nep" ? b.nep_php! : b.house_php!) -
        (stage === "nep" ? a.nep_php! : a.house_php!),
    )
    .slice(0, 8);
  const trend = Array.from({ length: 7 }, (_, i) => {
    const y = String(2020 + i);
    const values = hist
      .map((r) => r.years[y]?.amount)
      .filter((v): v is number => v != null && v > 0);
    return { label: y, GAA: values.length ? safeSum(values) : null };
  }).filter((r) => r.label >= from && r.label <= to);
  const note =
    "Same selected source-record union, including one-sided lines. Published proposals, not spending. Zero-based PHP scale.";
  const statuses = ANALYTICS_STATUSES;
  const activeFilters = [province, program, status, lgu].filter(Boolean).length;
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page page--wide main analytics-page"
    >
      <div className="page-head">
        <p className="eyebrow">The regional evidence desk</p>
        <h1>Budget analytics.</h1>
        <p>
          Explore comparisons with their source scope intact. Use
          keyboard-accessible controls and the data tables beneath every graph.
        </p>
      </div>
      <SourceAttribution />
      <details className="analytics-index">
        <summary>Jump to an analysis</summary>
        <nav aria-label="Analytics sections">
          {[
            ["a", "Compare versions"],
            ["b", "Programs"],
            ["c", "Provinces"],
            ["d", "Classifications"],
            ["f", "Ranked projects"],
            ["e", "Historical trend"],
            ["g", "Yearly change"],
            ["h", "Locality coverage"],
          ].map(([key, label]) => (
            <a key={key} href={"#chart-" + key}>
              {label}
            </a>
          ))}
        </nav>
      </details>
      <details
        className="analytics-filter-disclosure"
        open={activeFilters > 0 || stage === "nep" ? true : undefined}
      >
        <summary>
          Filters · {activeFilters ? activeFilters + " active" : "All records"}{" "}
          · {stage === "nep" ? "NEP" : "House bill"} amount view
        </summary>
        <div className="toolbar analytics-filters">
          <label className="field">
            <span>Province title association</span>
            <select
              value={province}
              onChange={(e) => set("province", e.target.value)}
            >
              <option value="">All associations</option>
              {PROVINCES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Locality title association</span>
            <select value={lgu} onChange={(e) => set("lgu", e.target.value)}>
              <option value="">All localities</option>
              {LOCATIONS.filter(
                (l) => !province || l.province === province,
              ).map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Program</span>
            <select
              value={program}
              onChange={(e) => set("program", e.target.value)}
            >
              <option value="">All four source programs</option>
              {programs.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Comparison status</span>
            <select
              value={status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {COMPARISON_NAMES[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Program and project amount stage</span>
            <select
              value={stage}
              onChange={(e) => set("stage", e.target.value)}
            >
              <option value="house">2027 House bill</option>
              <option value="nep">2027 NEP</option>
            </select>
          </label>
        </div>
      </details>
      <p>
        <Link to={"/projects?" + params.toString()}>
          Open these project filters →
        </Link>{" "}
        · <Link to="/data-coverage">Data scope and provenance</Link>
      </p>
      <Await state={scope} what="the dated project snapshot">
        {() => (
          <>
            <p className="notice">
              {rows.length} unique source records in this selection.
              Province/locality filters use title associations. Counts across
              provinces can overlap. No provincial monetary allocation is
              inferred. Project classifications are not evidence of misconduct.
            </p>
            <dl className="stats overview-kpis analytics-kpis">
              <KpiCard explanation="nep" label="NEP proposal · selected records" value={summary.nep.rows ? php(summary.nep.php) : "Not available"} unavailable={!summary.nep.rows} exact={summary.nep.rows ? phpFull(summary.nep.php) : undefined} note={<>{count(summary.nep.rows)} lines with a published amount</>} />
              <KpiCard explanation="house" label="House bill · same record union" value={summary.house.rows ? php(summary.house.php) : "Not available"} unavailable={!summary.house.rows} exact={summary.house.rows ? phpFull(summary.house.php) : undefined} note={<>{count(summary.house.rows)} lines with a published amount</>} />
              <KpiCard explanation="records" label="Unique comparison records" value={count(rows.length)} note="Source identities counted once" />
              <KpiCard explanation="unconfirmed" label="Unconfirmed pairings" value={count(summary.unconfirmed)} note="Included in the classification counts" />
            </dl>
            <div className="comparison-controls"><label className="field chart-focus">
                    <span id={focusId + "-label"}>Comparison focus · Chart A</span>
                    <select
                      value={comparisonFocus}
                      aria-labelledby={focusId + "-label"}
                      aria-describedby={focusId + "-description"}
                      onChange={(e) => set("comparison", e.target.value)}
                    >
                      <option value="">All programs · one common scale</option>
                      {programs.map((p) => (
                        <option key={p} value={p}>
                          {p.toUpperCase()} only · focused scale
                        </option>
                      ))}
                    </select>
                    <small id={focusId + "-description"}>
                      {comparisonFocus
                        ? "Focused on " +
                          comparisonFocus.toUpperCase() +
                          ". This zero-based scale is recalculated for the selected program."
                        : "The common zero-based scale preserves the relative size of each program. Focus on a smaller program to inspect it."}
                    </small>
                  </label></div>
            <div className="chart-grid">
              <DataChart
                title="A / NEP versus House bill"
                rows={comparisonRows}
                keys={["NEP", "House"]}
                adaptive
                note={note}
              />
              <DataChart
                title={
                  "B / Proposed amounts by program · " + stage.toUpperCase()
                }
                rows={amountRanking(
                  byProgram.map((r) => ({
                    label: r.label,
                    Amount: stage === "nep" ? r.NEP : r.House,
                  })),
                  "Amount",
                )}
                keys={["Amount"]}
                horizontal
                note={note}
              />
              <DataChart
                title="C / Province title associations"
                rows={selection.byProvince}
                keys={["Records"]}
                horizontal
                money={false}
                note="Counts of title-associated records. Overlapping associations; not verified provincial allocations."
              />
              <DataChart
                title="D / Document comparison classifications"
                rows={selection.byStatus}
                keys={["Records"]}
                money={false}
                horizontal
                note={
                  "One original comparison group per source identity. House-only and NEP-only remain candidates for verification; " +
                  summary.unconfirmed +
                  " unconfirmed pairings overlap these groups, not extra records."
                }
              />
              <DataChart
                title={
                  "F / Largest published projects · " + stage.toUpperCase()
                }
                rows={ranked.map((r) => ({
                  label: r.title,
                  Amount: stage === "nep" ? r.nep_php : r.house_php,
                }))}
                keys={["Amount"]}
                horizontal
                ranked
                note="Rank is amount, not importance. Exact titles and amounts are in the table. Open the filtered explorer for source documents and program/location caveats."
              >
                <details className="chart-table">
                  <summary>Inspect ranked project evidence</summary>
                  <ol>
                    {ranked.map((r) => (
                      <li key={r.key}>
                        <Link
                          to={
                            "/projects/" +
                            r.dataset +
                            "/" +
                            encodeURIComponent(r.id)
                          }
                        >
                          {r.title}
                        </Link>
                        <p>
                          {r.dataset.toUpperCase()} ·{" "}
                          {r.regionConfirmed
                            ? "Source-confirmed NIR; locality unverified"
                            : "Geography uncertain"}{" "}
                          ·{" "}
                          {(
                            stage === "nep" ? r.pdf_url?.nep : r.pdf_url?.hgab3
                          ) ? (
                            <External href={(stage === "nep" ? r.pdf_url?.nep : r.pdf_url?.hgab3) ?? ""}>Published source document</External>
                          ) : (
                            "No document URL provided"
                          )}
                        </p>
                      </li>
                    ))}
                  </ol>
                </details>
              </DataChart>
              <section className="chart-panel comparison-reading">
                <h2>Comparison reading notes</h2>
                <p>
                  Version sums are compared, never added. Missing document lines
                  remain missing. The arithmetic difference across this
                  selection is {phpFull(summary.house.php - summary.nep.php)}.
                </p>
                <p>
                  Percentage change on the aggregate document union:{" "}
                  {percentage(summary.nep.php, summary.house.php) == null
                    ? "Not available"
                    : percentage(summary.nep.php, summary.house.php)!.toFixed(
                        2,
                      ) + "%"}
                  . This includes one-sided records and is not an execution
                  rate.
                </p>
                <p>
                  {summary.unconfirmed} source-marked unconfirmed pairings.
                  Budget changes cannot establish who requested or controlled a
                  project.
                </p>
              </section>
            </div>
          </>
        )}
      </Await>
      <section className="history-controls">
        <h2>Historical enacted appropriations</h2>
        <p>
          GAA 2020–2026 only. These title-search families are a separate scope
          from the 2027 project comparison. Program/status filters above apply
          to 2027 charts only. Province/locality filters use historical title
          text; they can omit records lacking those names.
        </p>
        <label className="field">
          <span>Historical department</span>
          <select value={dept} onChange={(e) => set("dept", e.target.value)}>
            <option value="">All departments</option>
            {history.status === "ready" &&
              history.value.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.description}
                </option>
              ))}
          </select>
        </label>
        <div className="toolbar">
          <label className="field">
            <span>Trend from year</span>
            <select value={from} onChange={(e) => set("from", e.target.value)}>
              {Array.from({ length: 7 }, (_, i) => (
                <option key={i}>{2020 + i}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Trend through year</span>
            <select value={to} onChange={(e) => set("to", e.target.value)}>
              {Array.from({ length: 7 }, (_, i) => (
                <option key={i}>{2020 + i}</option>
              ))}
            </select>
          </label>
        </div>
        {from > to && (
          <p role="alert">Choose an end year on or after the start year.</p>
        )}
        <div className="year-links">
          {trend.map((r) => (
            <Link key={r.label} to={"/budget-history?year=" + r.label}>
              {r.label} ↗
            </Link>
          ))}
        </div>
      </section>
      {history.status === "ready" ? (
        <div className="chart-grid">
          <DataChart
            title="E / Historical GAA title-search trend"
            rows={trend}
            keys={["GAA"]}
            line
            note="Same selected historical families across years; missing positive appropriations produce gaps, not fabricated zero funding. Authority to spend, not spending."
          />
          <section className="chart-panel" id="chart-g">
            <h2>G / Year-over-year variance</h2>
            <p>
              Source: BetterGov.PH GAA · snapshot{" "}
              {m.status === "ready"
                ? m.value.retrieved_at.slice(0, 10)
                : "unavailable"}
            </p>
            <p>
              Same family selection, enacted GAA stage only. Positive/negative
              values are arithmetic changes.
            </p>
            <DataTable
              caption="Historical GAA year-over-year changes"
              columns={[
                { key: "year", label: "Year", width: "80px" },
                {
                  key: "change",
                  label: "Difference",
                  numeric: true,
                  width: "180px",
                },
                {
                  key: "percent",
                  label: "Change %",
                  numeric: true,
                  width: "120px",
                },
              ]}
            >
              {trend.slice(1).map((r, i) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td className="money-cell">
                    {r.GAA == null || trend[i].GAA == null
                      ? "Not available"
                      : exactDifference(r.GAA - trend[i].GAA!)}
                  </td>
                  <td className="money-cell">
                    {percentage(trend[i].GAA, r.GAA)?.toFixed(2) ?? "—"}
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>
        </div>
      ) : (
        <p role="status">
          {history.status === "error"
            ? "Historical snapshot unavailable. No trend has been estimated."
            : "Loading the historical shard…"}
        </p>
      )}
      <section className="chart-panel" id="chart-h">
        <h2>H / Locality coverage matrix</h2>
        <p>
          Directory: PSA PSGC · Budget title matches: BetterGov.PH · snapshot{" "}
          {m.status === "ready"
            ? m.value.retrieved_at.slice(0, 10)
            : "unavailable"}
        </p>
        <p>
          PSGC directory codes with project title matches. A match is not a
          surveyed location; unmatched places may still have funded projects.
          Source-confirmed NIR records with no locality match remain in the
          regional list.
        </p>
        <div className="coverage-matrix">
          {LOCATIONS.filter((l) => !province || l.province === province).map(
            (l) => (
              <Link key={l.code} to={"/locations/" + l.code}>
                <strong>{l.name}</strong>
                <span>
                  {
                    rows.filter((r) => r.locationMatches?.includes(l.code))
                      .length
                  }{" "}
                  title matches
                </span>
              </Link>
            ),
          )}
        </div>
      </section>
      {nep.status === "ready" && (
        <p className="notice">
          Separate NEP source-confirmed region 18 rollup:{" "}
          {phpFull(nep.value.region.amount)} proposed FY2027; FY2026 baseline{" "}
          {phpFull(nep.value.region.base_amount)}. This broader regional coding
          is not the project-comparison denominator and is never combined with
          it.
        </p>
      )}
    </main>
  );
}
