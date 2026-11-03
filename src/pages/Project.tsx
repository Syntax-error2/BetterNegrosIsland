import { evidencePath, comparisonPath } from "../lib/evidence";
import { exactDifference } from "../lib/comparison-display";
import DataTable from "../components/DataTable";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { Envelope, ProjectDetail, Version } from "../api/types";
import { DATASET_KEYS, shortNameOf, type DatasetKey } from "../config";
import {
  Await,
  Disclaimers,
  External,
  ReasonTags,
  StatusChip,
} from "../components/Bits";
import { date, phpFull } from "../lib/format";
import { usePortal, type Async } from "../lib/portal-context";
import { projectKey } from "../lib/scope";
import { reportHref } from "../lib/report";
import { useTitle } from "../lib/use-title";

const VERSIONS: Version[] = ["nep", "hgab2", "hgab3", "api"];
const FALLBACK_VERSION_LABELS: Record<Version, string> = {
  nep: "NEP",
  hgab2: "House bill, second reading",
  hgab3: "House bill, third reading",
  api: "DPWH transparency website listing",
};

export default function Project() {
  const { dataset = "", id = "" } = useParams();
  const { client, scope } = usePortal();
  const [attempt, setAttempt] = useState(0);
  const valid = (DATASET_KEYS as readonly string[]).includes(dataset);
  const [state, setState] = useState<{
    key: string;
    value: Async<Envelope<ProjectDetail>>;
  } | null>(null);
  const key = `${dataset}/${id}/${attempt}`;

  useEffect(() => {
    if (!valid) return;
    let live = true;
    client.project(dataset as DatasetKey, id).then(
      (value) => live && setState({ key, value: { status: "ready", value } }),
      (error) =>
        live &&
        setState({
          key,
          value: {
            status: "error",
            error: error instanceof Error ? error : new Error(String(error)),
          },
        }),
    );
    return () => {
      live = false;
    };
  }, [client, dataset, id, key, valid, attempt]);

  if (!valid) {
    return (
      <main id="main-content" tabIndex={-1} className="page main">
        <p className="state">
          There is no program called “{dataset}”.{" "}
          <Link to="/projects">Back to every project</Link>
        </p>
      </main>
    );
  }
  const current: Async<Envelope<ProjectDetail>> =
    state?.key === key ? state.value : { status: "loading" };
  const cached =
    scope.status === "ready"
      ? scope.value.projects.find((p) => p.dataset === dataset && p.id === id)
      : undefined;
  return (
    <main id="main-content" tabIndex={-1} className="page main">
      <p className="crumbs">
        <Link to="/projects">← Every project</Link>
      </p>
      {cached && <nav className="citizen-toolbar" aria-label="Tools for the dated snapshot record"><Link className="button" to={evidencePath(cached)}>Create dated evidence card</Link><Link className="button" to={comparisonPath(cached)}>Compare snapshot records</Link></nav>}
      <Await
        state={current}
        what="the project"
        retry={() => setAttempt((n) => n + 1)}
      >
        {(env) => <ProjectView env={env} />}
      </Await>
      {current.status === "error" && cached && (
        <section className="chart-panel">
          <p className="notice">
            The live detail is unavailable. This is the last verified comparison
            snapshot, retrieved{" "}
            {cached.retrieved_at ?? "on the date shown in Data coverage"}.
            Current source details may differ.
          </p>
          <h1>{cached.title}</h1>
          <p>
            {cached.dataset.toUpperCase()} · {cached.geographicConfidence}
          </p>
          <dl>
            <dt>NEP proposal</dt>
            <dd>
              {cached.nep_php == null
                ? "Not available"
                : phpFull(cached.nep_php)}
            </dd>
            <dt>House bill</dt>
            <dd>
              {cached.house_php == null
                ? "Not available"
                : phpFull(cached.house_php)}
            </dd>
            <dt>Source classification</dt>
            <dd>{cached.status_label}</dd>
          </dl>
          <ReasonTags reasons={cached.reasons} />
          <p>
            {cached.pdf_url.nep && (
              <External href={cached.pdf_url.nep}>Published NEP page</External>
            )}{" "}
            {cached.pdf_url.hgab3 && (
              <External href={cached.pdf_url.hgab3}>
                Published House page
              </External>
            )}
          </p>
        </section>
      )}
    </main>
  );
}

function ProjectView({ env }: { env: Envelope<ProjectDetail> }) {
  const { config, overview, scope, client } = usePortal();
  const location = useLocation();
  const p = env.data;
  const [copyStatus, setCopyStatus] = useState("");
  useTitle(`${p.title} · ${shortNameOf(config)}`);

  const ov = overview.status === "ready" ? overview.value.data : null;
  const program = ov?.datasets.find((d) => d.key === p.dataset);
  const versionLabel = (v: Version) =>
    ov?.record_versions.find((r) => r.key === v)?.label ??
    FALLBACK_VERSION_LABELS[v];
  const inScope =
    scope.status === "ready"
      ? scope.value.projects.find((x) => x.key === projectKey(p.dataset, p.id))
      : undefined;
  const versions = VERSIONS.filter((v) => v !== "api" || p.dataset === "dpwh");
  const report = reportHref(
    config,
    p,
    window.location.origin + location.pathname,
  );

  let apiReference: string | null = null;
  try { apiReference = client.href(p.api_url); } catch { /* Untrusted or unsupported source paths stay unavailable. */ }

  const details: [string, string | null][] = [
    ["Program", program?.label ?? p.dataset.toUpperCase()],
    ["Program line", p.program],
    ["Sub-line", p.pap],
    ["DPWH office", p.office],
    ["Region", p.region],
    [
      "Verified project locality",
      p.lat != null && p.lon != null
        ? "Coordinates supplied by source; not independently verified"
        : "Not available in the current source data.",
    ],
    ["How the two versions were matched", p.labels.match?.label ?? null],
    ["Between the House readings", p.labels.reading?.label ?? null],
    ["DPWH transparency website", p.labels.dpwh_site?.label ?? null],
    [
      "Length",
      p.length_m != null
        ? `${Math.round(p.length_m).toLocaleString("en-US")} m`
        : null,
    ],
  ];

  return (
    <article className="project">
      <p className="eyebrow">
        {program?.short ?? p.dataset.toUpperCase()}
        <span className="sep">·</span>FY 2027
        {p.office && (
          <>
            <span className="sep">·</span>
            {p.office}
          </>
        )}
      </p>
      <h1 className="project-h">{p.title}</h1>
      <div className="project-status">
        <StatusChip
          group={p.bridge_group}
          label={p.status_label}
          held={p.held}
        />
        {p.labels.status.help && (
          <p className="muted">{p.labels.status.help}</p>
        )}
      </div>

      <div className="project-actions">
        <button
          className="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              setCopyStatus("Project link copied.");
            } catch {
              setCopyStatus(
                "Copy the address from your browser to share this project.",
              );
            }
          }}
        >
          Copy Project Link
        </button>
        <button className="button button-quiet" onClick={() => window.print()}>
          Print / Save PDF Summary
        </button>
        <span role="status">{copyStatus}</span>
      </div>
      <p className="fine">
        Live API response · Source built {date(env.meta.built_at)} · Source record: {p.dataset}:
        {p.id} · Contractor, implementation progress, and disbursements: Not
        available in the current source data.
      </p>
      <div className="project-grid">
        <section aria-labelledby="amounts-h">
          <h2 id="amounts-h" className="section-h">
            Amount in each version, with the page it is on
          </h2>
          <DataTable
            caption="Published project amounts and original source pages"
            columns={[
              { key: "stage", label: "Budget version" },
              { key: "amount", label: "Exact pesos", numeric: true },
              { key: "source", label: "Source page" },
            ]}
          >
            {versions.map((v) => {
              const amount = p[`${v}_php` as const];
              const pdf = p.pdf_url[v];
              const page = v === "api" ? null : p[`${v}_page` as const];
              return (
                <tr key={v}>
                  <th scope="row">{versionLabel(v)}</th>
                  <td className="num r" title={phpFull(amount)}>
                    {amount == null ? (
                      <span className="muted">not listed</span>
                    ) : (
                      phpFull(amount)
                    )}
                  </td>
                  <td className="r">
                    {pdf ? (
                      <External href={pdf}>
                        {page ? `Page ${page}` : "Open the document"}
                      </External>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr className="amounts-total">
              <th scope="row">Change, House bill against the NEP</th>
              <td className="num r">{exactDifference(p.delta_php)}</td>
              <td />
            </tr>
          </DataTable>
          <p className="fine">
            The NEP and the House bill are two versions of one budget, so the
            amounts are compared, never added. Open the page to check the figure
            against the document itself.
          </p>

          {p.labels.flags.length > 0 && (
            <>
              <h3 className="sub-h">Notes on this line</h3>
              <ul className="flags">
                {p.labels.flags.map((f) => (
                  <li key={f.code}>
                    {f.label}
                    {f.help ? <span className="muted"> {f.help}</span> : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <aside className="project-side">
          <dl className="details">
            {details.map(([k, v]) => (
              <div key={k}>
                <dt className="label">{k}</dt>
                <dd>{v ?? "Not available in the current source data."}</dd>
              </div>
            ))}
            {p.lat != null && p.lon != null && (
              <div>
                <dt className="label">Coordinates in the document</dt>
                <dd>
                  <External
                    href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=15/${p.lat}/${p.lon}`}
                  >
                    {p.lat.toFixed(5)}, {p.lon.toFixed(5)} on the map
                  </External>
                </dd>
              </div>
            )}
            <div>
              <dt className="label">Why it is in this portal</dt>
              <dd>
                {inScope ? (
                  <ReasonTags reasons={inScope.reasons} />
                ) : (
                  <span className="muted">
                    {scope.status === "ready"
                      ? "It is not among this portal’s projects; it is shown because you followed a link to it."
                      : "Scope membership is not yet available. It has not been ruled out of this portal."}
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <div className="report">
            <p className="label">Seen this project on the ground?</p>
            {report ? (
              <a className="button button-primary" href={report}>
                Report on this project ↗
              </a>
            ) : (
              <p className="small">
                Citizen reports will go to one place for every portal,
                budget.bettergov.ph. Reporting is not open yet.
              </p>
            )}
          </div>

          <p className="small links">
            <External href={p.url}>
              This project on budget.bettergov.ph
            </External>
            <br />
            {apiReference && <External href={apiReference}>
              Developer · API record (JSON)
            </External>}
          </p>
        </aside>
      </div>

      <Disclaimers items={env.disclaimers} />
    </article>
  );
}
