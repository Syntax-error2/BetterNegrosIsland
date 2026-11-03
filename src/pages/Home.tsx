import { communityProjects } from "../lib/community";
import KpiCard from "../components/KpiCard";
import ProjectTable from "../components/ProjectTable";
import { LOCATIONS, PROVINCES } from "../lib/geography";
import { clearProjectFilters, fundingError, PROJECT_FILTERS } from "../lib/ui";
import { fragmentId } from "../lib/ui";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import type {
  BridgeGroup,
  DatasetInfo,
  Disclaimer,
  GroupInfo,
} from "../api/types";
import { BRIDGE_GROUPS } from "../api/types";
import { shortNameOf, type DatasetKey } from "../config";
import { Await, Disclaimers } from "../components/Bits";
import { PageHead } from "../components/Chrome";
import OfficesSection from "../components/OfficesSection";
import { projectsCsv, downloadText } from "../lib/csv";
import { count, php, phpDelta, plural } from "../lib/format";
import { usePortal } from "../lib/portal-context";
import {
  summarise,
  type ScopedProject,
  type ScopeResult,
  type Summary,
} from "../lib/scope";
import { useTitle } from "../lib/use-title";

const PAGE = 25;

type Sort = "house" | "nep" | "change" | "title";
const SORTS: Record<
  Sort,
  { label: string; cmp: (a: ScopedProject, b: ScopedProject) => number }
> = {
  house: {
    label: "House bill amount",
    cmp: (a, b) => (b.house_php ?? -1) - (a.house_php ?? -1),
  },
  nep: {
    label: "NEP amount",
    cmp: (a, b) => (b.nep_php ?? -1) - (a.nep_php ?? -1),
  },
  change: {
    label: "Size of change",
    cmp: (a, b) => Math.abs(b.delta_php ?? 0) - Math.abs(a.delta_php ?? 0),
  },
  title: { label: "Name", cmp: (a, b) => a.title.localeCompare(b.title) },
};

export default function Home({ locality }: { locality?: string }) {
  const { scope, overview } = usePortal();
  const place = LOCATIONS.find((l) => l.name === locality);
  const province = PROVINCES.find((p) => p.slug === place?.province);
  useTitle(
    locality
      ? `${locality} · BetterNegrosIsland`
      : "Explore published FY2027 projects · BetterNegrosIsland",
  );
  const datasets =
    overview.status === "ready" ? overview.value.data.datasets : [];
  return (
    <main id="main-content" tabIndex={-1} className="page page--wide main">
      {locality && (
        <div className="locality-intro">
          <p className="eyebrow">
            LOCALITY PROFILE · {province?.name.toUpperCase()}
          </p>
          <h1>{locality}</h1>
          <p>
            {place?.type} · PSGC {place?.code}.{" "}
            <Link to={"/provinces/" + province?.slug}>
              View province directory →
            </Link>
          </p>
          <p>
            Published project titles associated with this locality. Name matches
            are not verified physical locations or complete LGU allocations.
          </p>
          {place?.code === "1830200000" && (
            <p className="notice">
              Bacolod is a separately coded highly urbanized city. This
              directory groups it with Negros Occidental for regional
              navigation.
            </p>
          )}
          {locality === "Isabela" && (
            <p className="notice">
              Isabela searches require “Negros Occidental” to avoid namesakes.
              Titles omitting the province may be missed.
            </p>
          )}
        </div>
      )}
      <Await state={scope} what="projects">
        {(s) => <Projects scope={s} datasets={datasets} locality={locality} />}
      </Await>
    </main>
  );
}

/** Group wording from the API (label, sub, help), falling back to the row's own label. */
type GroupWords = Pick<GroupInfo, "label" | "sub" | "help">;

function groupInfo(
  datasets: DatasetInfo[],
  rows: ScopedProject[],
): Record<BridgeGroup, GroupWords> {
  const fromApi = datasets[0]?.bridge.groups;
  const out = {} as Record<BridgeGroup, GroupWords>;
  for (const g of BRIDGE_GROUPS) {
    out[g] = fromApi?.[g] ?? {
      label: rows.find((r) => r.bridge_group === g)?.group_label ?? g,
      sub: "",
      help: "",
    };
  }
  return out;
}

function Projects({
  scope,
  datasets,
  locality,
}: {
  scope: ScopeResult;
  datasets: DatasetInfo[];
  locality?: string;
}) {
  const { config, districts } = usePortal();
  const { hash } = useLocation();

  // #offices and #projects links land on their section once it has rendered.
  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(fragmentId(hash));
    const disclosure = target?.closest("details");
    if (disclosure) disclosure.open = true;
    target?.scrollIntoView({ block: "start" });
  }, [hash, districts.status]);

  // The disclaimers of every response on this page: the project lists' and the districts'.
  const disclaimers = useMemo(() => {
    const byId = new Map<string, Disclaimer>(
      scope.disclaimers.map((d) => [d.id, d]),
    );
    if (districts.status === "ready")
      for (const env of districts.value)
        for (const d of env.disclaimers) if (!byId.has(d.id)) byId.set(d.id, d);
    return [...byId.values()];
  }, [scope.disclaimers, districts]);
  const name = shortNameOf(config);
  const all = useMemo(
    () =>
      locality
        ? communityProjects(scope.projects, LOCATIONS.find(l => l.name === locality) ?? {code: "", name: locality})
        : scope.projects,
    [scope.projects, locality],
  );
  const summary = useMemo(() => summarise(all), [all]);
  const groups = useMemo(() => groupInfo(datasets, all), [datasets, all]);
  const programName = (k: DatasetKey) =>
    datasets.find((d) => d.key === k)?.short ?? k.toUpperCase();

  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const program = (params.get("program") ?? "") as DatasetKey | "";
  const status = (params.get("status") ?? "") as BridgeGroup | "";
  const why = params.get("why") ?? "";
  const office = params.get("office") ?? "";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const lgu = params.get("lgu") ?? "";
  const province = params.get("province") ?? "";
  const stage = params.get("stage") === "nep" ? "nep" : "house";
  const rangeError = fundingError(min, max);
  const [filtersOpen, setFiltersOpen] = useState(() =>
    PROJECT_FILTERS.some((key) => key !== "q" && params.has(key)),
  );
  const sort =
    (params.get("sort") as Sort) in SORTS
      ? (params.get("sort") as Sort)
      : "house";
  const [shown, setShown] = useState(PAGE);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setShown(PAGE);
  };

  // DPWH offices among the rows, largest first, for the Office filter.
  const offices = useMemo(() => {
    const n = new Map<string, number>();
    for (const p of all)
      if (p.office) n.set(p.office, (n.get(p.office) ?? 0) + 1);
    return [...n.entries()].sort(
      (a, b) =>
        b[1] - a[1] || a[0].localeCompare(b[0], "en", { numeric: true }),
    );
  }, [all]);

  const reasons = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of all)
      for (const r of p.reasons)
        seen.set(
          `${r.kind}:${r.label}`,
          r.kind === "office"
            ? `Office: ${shortOffice(r.label)}`
            : r.kind === "region"
              ? "Source-confirmed NIR region"
              : `Title names ${r.label}`,
        );
    return [...seen.entries()];
  }, [all]);

  const filtered = useMemo(() => {
    if (rangeError) return [];
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const rows = all.filter((p) => {
      const amount = stage === "nep" ? p.nep_php : p.house_php;
      if (province && !p.provinceMatches?.includes(province)) return false;
      if (min && (amount == null || amount < Number(min))) return false;
      if (max && (amount == null || amount > Number(max))) return false;
      if (
        lgu &&
        !p.locationMatches?.includes(lgu) &&
        !p.reasons.some((r) => r.kind === "place" && r.label === lgu)
      )
        return false;
      if (program && p.dataset !== program) return false;
      if (status && p.bridge_group !== status) return false;
      if (why && !p.reasons.some((r) => `${r.kind}:${r.label}` === why))
        return false;
      if (office && p.office !== office) return false;
      if (words.length) {
        const hay = [p.title, p.program, p.pap, p.office, p.region]
          .join(" ")
          .toLowerCase();
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    return rows.sort(
      (a, b) => SORTS[sort].cmp(a, b) || a.title.localeCompare(b.title),
    );
  }, [
    all,
    q,
    program,
    status,
    why,
    office,
    sort,
    min,
    max,
    lgu,
    rangeError,
    province,
    stage,
  ]);
  const filteredSummary = useMemo(() => summarise(filtered), [filtered]);
  const narrowed = Boolean(
    q ||
      program ||
      status ||
      why ||
      office ||
      min ||
      max ||
      lgu ||
      province ||
      params.has("stage") ||
      params.has("sort"),
  );

  return (
    <>
      <PageHead
        titleLevel={locality ? 2 : 1}
        eyebrow={
          <>
            FY 2027<span className="sep">·</span>NEP and House Bill 10858
            <span className="sep">·</span>
            {name}
          </>
        }
        title={
          locality
            ? `Explore title matches for ${locality}`
            : "Follow the projects. Examine the evidence."
        }
      >
        <p className="fine">
          Records include source-confirmed NIR entries and supplementary
          office/title associations; not a complete regional allocation.
          Locality mentions are not verified project locations.
        </p>
      </PageHead>

      <details className="explorer-context">
        <summary>
          Source scope and comparison totals · {count(all.length)} records
        </summary>
        <Lede summary={summary} />
        <Stats summary={summary} programName={programName} />

        <section className="section" aria-labelledby="groups-h">
          <h2 id="groups-h" className="section-h">
            How the published versions compare
          </h2>
          <div className="groups" role="group" aria-label="Filter by status">
            {BRIDGE_GROUPS.map((g) => {
              const cell = summary.groups[g];
              const info = groups[g];
              const active = status === g;
              return (
                <button
                  key={g}
                  type="button"
                  className={`group-tile${active ? " active" : ""}`}
                  disabled={!cell.rows}
                  aria-pressed={active}
                  title={info.help}
                  onClick={() => setParam("status", active ? "" : g)}
                >
                  <span className="group-label">
                    <span className={`status-dot g-${g}`} aria-hidden="true" />
                    {info.label}
                  </span>
                  {info.sub && <span className="label">{info.sub}</span>}
                  <span className="group-count num">{count(cell.rows)}</span>
                  <span className="group-php num">{groupAmount(g, cell)}</span>
                </button>
              );
            })}
          </div>
        </section>
      </details>

      <section className="section" id="projects" aria-labelledby="list-h">
        <div className="list-head">
          <h2 id="list-h" className="section-h">
            {narrowed
              ? `${count(filtered.length)} of ${plural(all.length, "project")}`
              : `Every project (${count(all.length)})`}
          </h2>
          <button
            type="button"
            className="button button-quiet"
            disabled={!filtered.length || Boolean(rangeError)}
            onClick={() =>
              downloadText(
                `${config.id}-fy2027-projects.csv`,
                projectsCsv(filtered),
              )
            }
          >
            Download CSV{narrowed ? ` (${count(filtered.length)})` : ""}
          </button>
        </div>

        <div className="explorer-search">
          {" "}
          <label className="field field-grow">
            <span className="label">Search</span>
            <input
              type="search"
              value={q}
              placeholder="Barangay, road, school, office…"
              onChange={(e) => setParam("q", e.target.value)}
            />
          </label>
          <p className="fine">
            Search works within the loaded source records; changing filters
            makes no new API request.
          </p>
        </div>
        <details
          className="filter-panel"
          open={filtersOpen}
          onToggle={(e) => setFiltersOpen(e.currentTarget.open)}
        >
          <summary>
            Refine results{" "}
            <span className="filter-count">
              {PROJECT_FILTERS.filter((key) => params.has(key)).length} active
            </span>
          </summary>
          <div className="toolbar">
            <label className="field">
              <span className="label">Province title association</span>
              <select
                value={province}
                onChange={(e) => setParam("province", e.target.value)}
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
              <span className="label">Funding filter stage</span>
              <select
                value={stage}
                onChange={(e) => setParam("stage", e.target.value)}
              >
                <option value="house">House bill 2027</option>
                <option value="nep">NEP proposal 2027</option>
              </select>
            </label>
            {!locality && (
              <label className="field">
                <span className="label">Locality title match</span>
                <select
                  value={lgu}
                  onChange={(e) => setParam("lgu", e.target.value)}
                >
                  <option value="">All localities / office coverage</option>
                  {LOCATIONS.filter(
                    (l) => !province || l.province === province,
                  ).map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="field">
              <span className="label">Minimum pesos</span>
              <input
                type="number"
                min="0"
                aria-invalid={Boolean(rangeError)}
                aria-describedby={rangeError ? "funding-error" : undefined}
                value={min}
                onChange={(e) => setParam("min", e.target.value)}
                placeholder="No minimum"
              />
            </label>
            <label className="field">
              <span className="label">Maximum pesos</span>
              <input
                type="number"
                min="0"
                aria-invalid={Boolean(rangeError)}
                aria-describedby={rangeError ? "funding-error" : undefined}
                value={max}
                onChange={(e) => setParam("max", e.target.value)}
                placeholder="No maximum"
              />
            </label>
            <label className="field">
              <span className="label">Program</span>
              <select
                value={program}
                onChange={(e) => setParam("program", e.target.value)}
              >
                <option value="">All programs</option>
                {(Object.keys(summary.byDataset) as DatasetKey[]).map((k) => (
                  <option key={k} value={k}>
                    {programName(k)} ({count(summary.byDataset[k]!.rows)})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="label">Status</span>
              <select
                value={status}
                onChange={(e) => setParam("status", e.target.value)}
              >
                <option value="">Any status</option>
                {BRIDGE_GROUPS.filter((g) => summary.groups[g].rows).map(
                  (g) => (
                    <option key={g} value={g}>
                      {groups[g].label} ({count(summary.groups[g].rows)})
                    </option>
                  ),
                )}
              </select>
            </label>
            {offices.length > 1 && (
              <label className="field">
                <span className="label">DPWH office</span>
                <select
                  value={office}
                  onChange={(e) => setParam("office", e.target.value)}
                >
                  <option value="">Any office</option>
                  {offices.map(([o, n]) => (
                    <option key={o} value={o}>
                      {shortOffice(o)} ({count(n)})
                    </option>
                  ))}
                </select>
              </label>
            )}
            {reasons.length > 1 && (
              <label className="field">
                <span className="label">Listed because</span>
                <select
                  value={why}
                  onChange={(e) => setParam("why", e.target.value)}
                >
                  <option value="">Any reason</option>
                  {reasons.map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="field">
              <span className="label">Sort by</span>
              <select
                value={sort}
                onChange={(e) =>
                  setParam(
                    "sort",
                    e.target.value === "house" ? "" : e.target.value,
                  )
                }
              >
                {(Object.keys(SORTS) as Sort[]).map((k) => (
                  <option key={k} value={k}>
                    {SORTS[k].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>
        {rangeError && (
          <p id="funding-error" className="field-error" role="alert">
            {rangeError}
          </p>
        )}

        {narrowed && (
          <p className="filter-sums">
            These {count(filtered.length)}: NEP {php(filteredSummary.nep.php)}{" "}
            on {count(filteredSummary.nep.rows)}
            <span className="sep">·</span>House bill{" "}
            {php(filteredSummary.house.php)} on{" "}
            {count(filteredSummary.house.rows)}
            <span className="sep">·</span>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setParams(clearProjectFilters(params), { replace: true });
                setShown(PAGE);
              }}
            >
              Clear filters
            </button>
          </p>
        )}

        <p className="results-status" role="status" aria-live="polite">
          {count(filtered.length)} matching records. Showing{" "}
          {count(Math.min(shown, filtered.length))}.
        </p>
        <ProjectTable
          rows={filtered.slice(0, shown)}
          programName={programName}
        />

        {filtered.length === 0 && (
          <p className="state">
            No project matches. Check the funding range, try fewer words, or
            clear the filters.
          </p>
        )}
        {filtered.length > shown && (
          <div className="more">
            <span className="muted">
              Showing {count(shown)} of {count(filtered.length)}
            </span>
            <button
              type="button"
              className="button"
              onClick={() => setShown((n) => n + PAGE)}
            >
              Show {count(Math.min(PAGE, filtered.length - shown))} more
            </button>
            <button
              type="button"
              className="button button-quiet"
              onClick={() => setShown(filtered.length)}
            >
              Show all
            </button>
          </div>
        )}

        <p className="fine">
          Amounts are exact pesos, as each document publishes them. “Not listed”
          means no amount is available in that version. Percentages are omitted
          for held pairings, scope reviews, and missing or zero baselines. A
          mathematical comparison does not confirm a pairing. The NEP and House
          bill are compared, never added.
        </p>
      </section>

      {!locality &&
      (config.scope.offices?.length || config.scope.districts?.length) ? (
        <details className="coverage-panel">
          <summary>Office coverage and district associations</summary>
          <OfficesSection />
        </details>
      ) : !locality ? (
        <p>
          <Link to="/data-coverage">
            Inspect implementing-office query coverage →
          </Link>
        </p>
      ) : null}
      <Disclaimers items={disclaimers} compact />
    </>
  );
}

/** "Bohol 1st District Engineering Office" → "Bohol 1st DEO", for tight spaces. */
function shortOffice(office: string): string {
  return office.replace(/ District Engineering Office$/, " DEO");
}

function groupAmount(
  g: BridgeGroup,
  c: { nep_php: number; house_php: number; rows: number },
): string {
  if (!c.rows) return "—";
  switch (g) {
    case "nep_only":
      return php(c.nep_php);
    case "increased":
    case "decreased":
    case "scope_review":
      return phpDelta(c.house_php - c.nep_php);
    default:
      return php(c.house_php);
  }
}

function Lede({ summary }: { summary: Summary }) {
  const added = summary.groups.house_only.rows;
  const dropped = summary.groups.nep_only.rows;
  return (
    <p>
      The NEP lists {count(summary.nep.rows)} of them, for{" "}
      {php(summary.nep.php)}; the House bill lists {count(summary.house.rows)},
      for {php(summary.house.php)}.{" "}
      {added || dropped ? (
        <>
          {plural(added, "project is", "projects are")} in the House bill only
          and {count(dropped)} in the NEP only: candidates to check, not
          confirmed changes.
        </>
      ) : (
        <>Every project is in both.</>
      )}
    </p>
  );
}

function Stats({
  summary,
  programName,
}: {
  summary: Summary;
  programName: (k: DatasetKey) => string;
}) {
  const programs = (
    Object.entries(summary.byDataset) as [DatasetKey, { rows: number }][]
  )
    .sort((a, b) => b[1].rows - a[1].rows)
    .map(([k, c]) => `${programName(k)} ${count(c.rows)}`)
    .join(" · ");
  return (
    <dl className="stats overview-kpis">
      <KpiCard explanation="records" label="Unique comparison records" value={count(summary.rows)} note={programs || "No records in this selection"} />
      <KpiCard explanation="nep" label="NEP proposal" value={summary.nep.rows ? php(summary.nep.php) : "Not available"} unavailable={!summary.nep.rows} note={<>{plural(summary.nep.rows, "project")} · the budget the President submits</>} />
      <KpiCard explanation="house" label="House bill · same record union" value={summary.house.rows ? php(summary.house.php) : "Not available"} unavailable={!summary.house.rows} note={<>{plural(summary.house.rows, "project")} · compared with NEP, never added</>} />
      <KpiCard explanation="houseOnly" label="House bill only · included above" value={count(summary.groups.house_only.rows)} note={<>{php(summary.groups.house_only.house_php)} · insertion candidates, not confirmed insertions</>} />
    </dl>
  );
}
