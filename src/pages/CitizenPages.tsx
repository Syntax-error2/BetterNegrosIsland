import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Await, External } from "../components/Bits";
import { usePortal, type Async } from "../lib/portal-context";
import { useSnapshot, snapshotJson, type Manifest } from "../lib/snapshot";
import { useTitle } from "../lib/use-title";
import { useNotebook } from "../lib/use-notebook";
import { emptyNotebook } from "../lib/notebook";
import {
  TOPICS,
  topicFor,
  qualityFlags,
  QUALITY_LABELS,
  type QualityKind,
  type SnapshotChange,
} from "../lib/citizen-insights";
import type { HearingIndex } from "../lib/hearings";
import ProjectTable from "../components/ProjectTable";
import { downloadText, projectsCsv } from "../lib/csv";
import { phpFull, plural, date } from "../lib/format";
import { recordPath } from "../lib/evidence";

function useReadingData<T>(path: string) {
  const [attempt, retry] = useState(0),
    [state, setState] = useState<Async<T>>({ status: "loading" });
  useEffect(() => {
    let live = true;
    snapshotJson<T>(path).then(
      (value) => {
        if (live) setState({ status: "ready", value });
      },
      () => {
        if (live)
          setState({
            status: "error",
            error: new Error("Reading data unavailable"),
          });
      },
    );
    return () => {
      live = false;
    };
  }, [path, attempt]);
  return { state, retry: () => retry((n) => n + 1) };
}
function Intro({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <header className="reading-page-head">
      <h1>{title}</h1>
      <div className="lede">{children}</div>
    </header>
  );
}

export function Saved() {
  useTitle("Saved items · BetterNegrosIsland");
  const { scope } = usePortal(),
    { value, persistent, update } = useNotebook();
  const [message, setMessage] = useState("");
  const remove = (key: string) =>
    update({ ...value, records: value.records.filter((k) => k !== key) });
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page page--wide main reading-page"
    >
      <Intro title="Your reading list.">
        <p>
          Keep useful records and searches together on this device. No account,
          email alerts or cross-device sync.
        </p>
      </Intro>
      <p className="notice">
        {persistent
          ? "Items are saved in this browser until you remove them or clear browser data."
          : "Browser storage is unavailable. Items remain for this visit only."}{" "}
        A saved record opens the current portal version, not a permanent copy of
        the source. Search terms can appear in a shared URL; use public budget
        terms only.
      </p>
      <section aria-labelledby="saved-search-heading">
        <h2 id="saved-search-heading">Saved searches</h2>
        {value.searches.length ? (
          <ul className="reading-list">
            {value.searches.map((s) => (
              <li key={s.path}>
                <Link to={s.path}>{s.label}</Link>
                <button
                  className="link-button"
                  aria-label={"Remove search " + s.label}
                  onClick={() =>
                    update({
                      ...value,
                      searches: value.searches.filter((v) => v.path !== s.path),
                    })
                  }
                >
                  Remove search
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No saved searches yet. <Link to="/projects">Explore projects</Link>{" "}
            and choose “Save this search”.
          </p>
        )}
      </section>
      <section aria-labelledby="saved-record-heading">
        <h2 id="saved-record-heading">
          Saved records ({value.records.length})
        </h2>
        <Await state={scope} what="saved record references">
          {(s) => {
            const rows = s.projects.filter((p) =>
                value.records.includes(p.key),
              ),
              missing = value.records.filter(
                (k) => !rows.some((p) => p.key === k),
              );
            return (
              <>
                {rows.length > 0 && (
                  <>
                    <button
                      className="button"
                      onClick={() =>
                        downloadText(
                          "betternegrosisland-saved-records.csv",
                          projectsCsv(rows, [
                            [
                              "scope_notice",
                              () =>
                                "Published budget versions, not actual spending. Missing values are not zero. Title associations do not verify physical locations. Classifications do not establish wrongdoing.",
                            ],
                            [
                              "source_notices",
                              () =>
                                s.disclaimers
                                  .map(
                                    (d) => d.title + " " + d.body + " " + d.url,
                                  )
                                  .join(" | "),
                            ],
                          ]),
                        )
                      }
                    >
                      Download saved records (CSV)
                    </button>
                    <ProjectTable
                      rows={rows}
                      programName={(k) => k.toUpperCase()}
                    />
                  </>
                )}
                {missing.map((key) => (
                  <p className="notice" key={key}>
                    Saved reference {key} is not in this snapshot.{" "}
                    <button className="link-button" onClick={() => remove(key)}>
                      Remove unavailable reference
                    </button>
                  </p>
                ))}
                {!value.records.length && (
                  <p>
                    No records saved yet. Use “Save record” beside a project to
                    begin. <Link to="/projects">Find a project</Link>.
                  </p>
                )}
              </>
            );
          }}
        </Await>
      </section>
      {(value.records.length > 0 || value.searches.length > 0) && (
        <details className="reading-explanation">
          <summary>Manage saved items</summary>
          <p>
            This removes only this portal’s reading list and saved searches.
            Your notice acknowledgment stays in place.
          </p>
          <button
            className="button"
            onClick={() => {
              const ok = update(emptyNotebook());
              setMessage(
                ok
                  ? "Saved items removed from this browser."
                  : "Reading list cleared for this visit. Browser storage could not be changed.",
              );
            }}
          >
            Clear all saved items
          </button>
        </details>
      )}
      {message && <p role="status">{message}</p>}
    </main>
  );
}
export function Topics() {
  useTitle("Browse everyday needs · BetterNegrosIsland");
  const { scope } = usePortal();
  return (
    <main id="main-content" tabIndex={-1} className="page main reading-page">
      <Intro title="Start with an everyday need.">
        <p>Browse published projects through their source program labels.</p>
      </Intro>
      <p className="notice">
        Topics are navigation aids, not an assessment of need, impact or project
        quality. They use the dataset and program name, not guesses about a
        title. A record belongs to one topic here.
      </p>
      <Await state={scope} what="topic records">
        {(s) => (
          <div className="reading-topic-list">
            {TOPICS.map((t) => (
              <article key={t.id}>
                <div>
                  <h2>{t.name}</h2>
                  <p>{t.description}</p>
                  <details>
                    <summary>How this topic is selected</summary>
                    <p>
                      {"dataset" in t
                        ? `Source dataset: ${t.dataset.toUpperCase()}.`
                        : "programs" in t
                          ? `DPWH program names containing: ${t.programs.join(", ")}.`
                          : "Remaining DPWH programs, including convergence and support programs."}
                    </p>
                  </details>
                </div>
                <div>
                  <strong>
                    {plural(
                      s.projects.filter((p) => topicFor(p) === t.id).length,
                      "record",
                    )}
                  </strong>
                  {!s.projects.some((p) => topicFor(p) === t.id) && (
                    <p className="fine">
                      No matches in this snapshot; this does not establish an
                      absence of funding.
                    </p>
                  )}
                  <Link className="button" to={"/projects?topic=" + t.id}>
                    Explore {t.name.toLowerCase()}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Await>
    </main>
  );
}
export function DataQuality() {
  useTitle("Data reading notes · BetterNegrosIsland");
  const { scope } = usePortal();
  const [filter, setFilter] = useState<QualityKind | "all">("all"),
    [query, setQuery] = useState(""),
    [limit, setLimit] = useState(25);
  const descriptions: Record<QualityKind, string> = {
    pairing:
      "The source marks the NEP/House pairing as unconfirmed. Do not treat it as an established change.",
    missing:
      "At least one comparison amount is unavailable. This can be an expected one-sided line and is not automatically an error or zero funding.",
    region:
      "The record is associated through title or office evidence, without the source-confirmed NIR flag.",
    scope: "The source classification itself calls for scope review.",
    geography:
      "A source-confirmed NIR record names one of a documented set of provinces outside NIR. This text rule flags a review clue; it does not correct the source or establish the project location.",
  };
  return (
    <main id="main-content" tabIndex={-1} className="page main reading-page">
      <Intro title="Read uncertainty alongside the figures.">
        <p>
          Specific reading notes help you decide what to verify in the original
          documents.
        </p>
      </Intro>
      <p className="notice">
        These are transparent rule-based checks, not fraud indicators,
        confidence scores or an exhaustive data audit. One record can have
        several notes. Counts overlap and must not be added.
      </p>
      <Await state={scope} what="record reading notes">
        {(s) => {
          const rows = s.projects.filter(
            (p) =>
              qualityFlags(p).some((f) => filter === "all" || f === filter) &&
              [p.title, p.id]
                .join(" ")
                .toLowerCase()
                .includes(query.toLowerCase()),
          );
          return (
            <>
              <div className="reading-check-list">
                {(
                  Object.entries(QUALITY_LABELS) as [QualityKind, string][]
                ).map(([key, label]) => (
                  <details key={key}>
                    <summary>
                      {label} ·{" "}
                      {plural(
                        s.projects.filter((p) => qualityFlags(p).includes(key))
                          .length,
                        "record",
                      )}
                    </summary>
                    <p>{descriptions[key]}</p>
                    {key === "geography" && (
                      <p>
                        Named terms checked: Catanduanes, Cagayan, Isabela
                        Province, Camarines, Bulacan, Pampanga, Zambales, Nueva
                        Ecija, Davao, Cebu, Bohol, Iloilo, Guimaras, Capiz,
                        Antique and Aklan. Names alone cannot resolve geography.
                      </p>
                    )}
                  </details>
                ))}
              </div>
              <div className="reading-filter-row">
                <label className="field">
                  <span>Reading note</span>
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value as QualityKind | "all");
                      setLimit(25);
                    }}
                  >
                    <option value="all">Any reading note</option>
                    {Object.entries(QUALITY_LABELS).map(([k, v]) => (
                      <option value={k} key={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Search title or ID</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setLimit(25);
                    }}
                  />
                </label>
              </div>
              <p role="status">
                {plural(rows.length, "matching record")}. Showing{" "}
                {Math.min(rows.length, limit)}.
              </p>
              <ul className="reading-list">
                {rows.slice(0, limit).map((p) => (
                  <li key={p.key}>
                    <Link to={recordPath(p)}>{p.title}</Link>
                    <p>
                      {qualityFlags(p)
                        .map((f) => QUALITY_LABELS[f])
                        .join(" · ")}
                    </p>
                    <span className="fine">
                      {p.dataset.toUpperCase()} · {p.id} · {p.status_label}
                    </span>
                  </li>
                ))}
              </ul>
              {rows.length > limit && (
                <button
                  className="button"
                  onClick={() => setLimit((n) => n + 25)}
                >
                  Show more reading notes
                </button>
              )}
              {!rows.length && (
                <p>
                  No matching records. Try another note or clear the search.
                </p>
              )}
            </>
          );
        }}
      </Await>
    </main>
  );
}
interface Receipts {
  current_version: string;
  notice: string;
  receipts: {
    version: string;
    retrieved_at: string;
    source_build: string;
    records: number;
    history_families: number;
    manifest: string;
    scope: string;
    previous_version: string | null;
    previous_scope: string | null;
    changes: SnapshotChange[] | null;
    counts: { added: number; removed: number; revised: number } | null;
  }[];
}
export function Updates() {
  useTitle("Data updates · BetterNegrosIsland");
  const { state, retry } = useReadingData<Receipts>(
      "/data/update-history.json",
    ),
    manifest = useSnapshot<Manifest>();
  const refresh = useReadingData<{
    status: string;
    at: string;
    version?: string;
  }>("/data/refresh-status.json");
  const [query, setQuery] = useState(""),
    [limit, setLimit] = useState(30);
  return (
    <main id="main-content" tabIndex={-1} className="page main reading-page">
      <Intro title="What changed in the published data?">
        <p>
          A receipt for each retained snapshot, with source dates and changes
          you can inspect.
        </p>
      </Intro>
      <p className="notice">
        Updates compare portal snapshots over time. The NEP-versus-House
        comparison is a separate question.{" "}
        <Link to="/analytics">Compare budget stages</Link>.
      </p>
      <section className="reading-receipt" aria-labelledby="update-status">
        <h2 id="update-status">Latest update receipt</h2>
        {manifest.status === "ready" && (
          <dl className="reading-facts">
            <div>
              <dt>Budget records retrieved</dt>
              <dd>{date(manifest.value.retrieved_at)}</dd>
            </div>
            <div>
              <dt>Comparison source built</dt>
              <dd>{date(manifest.value.source_build)}</dd>
            </div>
            <div>
              <dt>Portal snapshot</dt>
              <dd>{manifest.value.version}</dd>
            </div>
          </dl>
        )}
        {refresh.state.status === "ready" ? (
          <p
            role={refresh.state.value.status === "FAILED" ? "alert" : undefined}
          >
            Latest recorded attempt: {date(refresh.state.value.at)}.{" "}
            {refresh.state.value.status === "FAILED"
              ? "Refresh failed. The last successful snapshot remains available."
              : refresh.state.value.status + "."}{" "}
            This records data preparation, not a website deployment or
            continuous live feed.
          </p>
        ) : (
          <p>
            Refresh-attempt metadata{" "}
            {refresh.state.status === "loading"
              ? "is loading."
              : "is unavailable; the snapshot dates above remain the evidence of retrieval."}
          </p>
        )}
        <Link to="/data-coverage">Inspect collection coverage</Link>
      </section>
      <Await state={state} what="retained snapshot history" retry={retry}>
        {(v) =>
          manifest.status !== "ready" ? (
            <p role="status">
              {manifest.status === "loading"
                ? "Checking the current snapshot…"
                : "Current snapshot version could not be verified. Reload before quoting update history."}
            </p>
          ) : v.current_version !== manifest.value.version ? (
            <p role="alert">
              Update history does not match the current snapshot. Reload before
              quoting changes.
            </p>
          ) : (
            <>
              <p>{v.notice}</p>
              {v.receipts.some((r) => (r.changes?.length ?? 0) > 0) && (
                <label className="field">
                  <span>Find a changed title or source ID</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setLimit(30);
                    }}
                  />
                </label>
              )}
              {v.receipts.map((r) => (
                <section className="reading-receipt" key={r.version}>
                  <h2>
                    {r.previous_version
                      ? "Updated snapshot"
                      : "First retained snapshot"}
                  </h2>
                  <p>
                    {r.version} · retrieved {date(r.retrieved_at)} · source
                    built {date(r.source_build)}
                  </p>
                  <p>
                    {r.records} comparison records and {r.history_families}{" "}
                    historical families.
                  </p>
                  {r.counts ? (
                    <>
                      <p>
                        {r.counts.added} newly listed · {r.counts.revised}{" "}
                        revised · {r.counts.removed} no longer listed in this
                        extraction. Removal does not prove cancellation.
                      </p>
                      <ul className="reading-list">
                        {(r.changes ?? [])
                          .filter((c) =>
                            [c.title, c.id]
                              .join(" ")
                              .toLowerCase()
                              .includes(query.toLowerCase()),
                          )
                          .slice(0, limit)
                          .map((c) => (
                            <li key={c.key}>
                              <strong>{c.kind}</strong> ·{" "}
                              {c.kind === "removed" ? (
                                c.title
                              ) : (
                                <Link
                                  to={
                                    "/projects/" +
                                    c.dataset +
                                    "/" +
                                    encodeURIComponent(c.id)
                                  }
                                >
                                  {c.title}
                                </Link>
                              )}
                              <p>
                                {c.id}
                                {c.fields.length
                                  ? " · Revised: " +
                                    c.fields
                                      .map(
                                        (field) =>
                                          (
                                            ({
                                              nep_php: "NEP amount",
                                              house_php: "House amount",
                                              delta_php: "difference",
                                              status_label: "source status",
                                              bridge_group:
                                                "comparison category",
                                              pdf_url: "source documents",
                                              region_key: "source region",
                                              regionConfirmed: "regional flag",
                                              provinceMatches:
                                                "province title associations",
                                              locationMatches:
                                                "locality title associations",
                                              pap: "subprogram",
                                              held: "pairing uncertainty",
                                              url: "source link",
                                            }) as Record<string, string>
                                          )[field] ??
                                          field.replaceAll("_", " "),
                                      )
                                      .join(", ")
                                  : ""}
                              </p>
                              <dl className="reading-change-values">
                                {(
                                  [
                                    ["Previous", c.before],
                                    ["Current", c.after],
                                  ] as const
                                ).map(([label, v]) => (
                                  <div key={label}>
                                    <dt>{label} snapshot</dt>
                                    <dd>
                                      {v ? (
                                        <>
                                          NEP{" "}
                                          {v.nep_php === null
                                            ? "Not available"
                                            : phpFull(v.nep_php)}{" "}
                                          · House{" "}
                                          {v.house_php === null
                                            ? "Not available"
                                            : phpFull(v.house_php)}{" "}
                                          · {v.status_label}{" "}
                                          <External href={v.url}>
                                            Source record
                                          </External>
                                        </>
                                      ) : (
                                        "Record not listed in this extraction"
                                      )}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </li>
                          ))}
                      </ul>
                      {(r.changes?.filter((c) =>
                        [c.title, c.id]
                          .join(" ")
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                      ).length ?? 0) > limit && (
                        <button
                          className="button"
                          onClick={() => setLimit((n) => n + 30)}
                        >
                          Show more changes
                        </button>
                      )}
                    </>
                  ) : (
                    <p>
                      No earlier verified snapshot is retained. Additions and
                      revisions cannot yet be measured; these records are the
                      starting point, not all newly funded projects.
                    </p>
                  )}
                  <div className="reading-actions">
                    <a href={r.manifest} download>
                      Download this snapshot receipt (JSON)
                    </a>
                    <a href={r.scope} download>
                      Download this snapshot’s records (JSON)
                    </a>
                    {r.previous_scope && (
                      <a href={r.previous_scope} download>
                        Download previous records (JSON)
                      </a>
                    )}
                  </div>
                </section>
              ))}
            </>
          )
        }
      </Await>
    </main>
  );
}
export function Hearings() {
  useTitle("NIR hearing mentions · BetterNegrosIsland");
  const { state, retry } = useReadingData<HearingIndex>("/data/hearings.json");
  const [query, setQuery] = useState(""),
    [term, setTerm] = useState(""),
    [limit, setLimit] = useState(12);
  return (
    <main id="main-content" tabIndex={-1} className="page main reading-page">
      <Intro title="Follow the budget discussion.">
        <p>
          Find source-indexed hearing moments that mention Negros, Siquijor,
          Bacolod or Dumaguete, then open the original timestamp.
        </p>
      </Intro>
      <Await state={state} what="dated hearing index" retry={retry}>
        {(v) => {
          const rows = v.hits.filter(
            (h) =>
              (!term || h.terms.includes(term)) &&
              [h.topic, h.agency, ...h.moments.map((m) => m.said)]
                .join(" ")
                .toLowerCase()
                .includes(query.toLowerCase()),
          );
          return (
            <>
              <p className="notice">{v.notice}</p>
              <p className="fine">
                FY{v.fiscal_year} · index retrieved {v.retrieved_at}. Hearing
                dates are shown on each result. No video loads until you open a
                source link.
              </p>
              <div className="reading-filter-row">
                <label className="field">
                  <span>Geographic search term</span>
                  <select
                    value={term}
                    onChange={(e) => {
                      setTerm(e.target.value);
                      setLimit(12);
                    }}
                  >
                    <option value="">All configured mentions</option>
                    {v.queries.map((q) => (
                      <option key={q.term}>{q.term}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Search topic or indexed text</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setLimit(12);
                    }}
                  />
                </label>
              </div>
              <p role="status">
                {rows.length} matching topics. Showing{" "}
                {Math.min(rows.length, limit)}.
              </p>
              {rows.slice(0, limit).map((h) => (
                <article className="reading-receipt" key={h.id}>
                  <p className="fine">
                    {h.agency} · hearing {date(h.date)} · matches{" "}
                    {h.terms.join(", ")}
                  </p>
                  <h2>{h.topic}</h2>
                  <External href={h.url}>Open source topic and video</External>
                  <details>
                    <summary>
                      {h.moments.length} matching indexed{" "}
                      {h.moments.length === 1 ? "moment" : "moments"}
                    </summary>
                    <p className="fine">
                      Source-provided descriptions below are machine-derived
                      indexing text, not verified verbatim quotations.
                    </p>
                    <ul className="reading-list">
                      {h.moments.map((m, i) => (
                        <li key={m.url + "-" + i}>
                          <External href={m.url}>
                            {m.timestamp} · {m.speaker}
                          </External>
                          <p>{m.said}</p>
                        </li>
                      ))}
                    </ul>
                  </details>
                </article>
              ))}
              {!rows.length && (
                <p>
                  No matching indexed discussions. This is not evidence that the
                  subject was never discussed.
                </p>
              )}
              {rows.length > limit && (
                <button
                  className="button"
                  onClick={() => setLimit((n) => n + 12)}
                >
                  Show more discussions
                </button>
              )}
              <details className="reading-explanation">
                <summary>Search coverage and limitations</summary>
                <ul>
                  {v.queries.map((q) => (
                    <li key={q.term}>
                      {q.term}: {q.returned} source topics returned, up to{" "}
                      {q.limit}.
                      {q.possibly_truncated
                        ? " Search reached the limit; more topics may exist."
                        : ""}
                    </li>
                  ))}
                </ul>
                <p>
                  Only matching moments are retained; unrelated portions of a
                  national hearing are not republished here. These mentions are
                  not automatically connected to a portal project or attributed
                  to its funding decision.
                </p>
                <External href="https://budget.bettergov.ph/docs">
                  Read provider documentation
                </External>
              </details>
            </>
          );
        }}
      </Await>
    </main>
  );
}

// Explanatory translations are explicitly review drafts, separate from source records.
const TERMS = [
  {
    id: "nep",
    name: "NEP · National Expenditure Program",
    en: "The Executive’s proposed national budget. It is a proposal, not a record of spending.",
    fil: "Panukalang pambansang badyet ng Ehekutibo. Panukala ito, hindi tala ng nagastos.",
    hil: "Ginasugyot nga pungsodnon nga badyet sang Ehekutibo. Panugyan ini, indi rekord sang nagasto.",
    ceb: "Gisugyot nga nasodnong badyet sa Ehekutibo. Sugyot kini, dili rekord sa nagasto.",
  },
  {
    id: "house",
    name: "House budget bill",
    en: "The House’s legislative budget version. Check whether the record uses second or third reading.",
    fil: "Bersiyon ng panukalang badyet sa Kamara. Tingnan kung ikalawa o ikatlong pagbasa ang gamit.",
    hil: "Bersiyon sang panukalang badyet sa Kamara. Usisaa kon ikaduha ukon ikatlo nga pagbasa ang ginagamit.",
    ceb: "Bersiyon sa gisugyot nga badyet sa Kamara. Susiha kon ikaduha o ikatulong pagbasa ang gigamit.",
  },
  {
    id: "gaa",
    name: "GAA · General Appropriations Act",
    en: "The enacted annual budget law. An appropriation authorizes spending for specified purposes; it does not prove that payment occurred.",
    fil: "Taunang batas ng badyet na naisabatas. Ang paglalaan ay pahintulot para sa tiyak na layunin; hindi ito patunay ng pagbabayad.",
    hil: "Ang napatuman nga tinuig nga layi sa badyet. Ang alokasyon nagahatag pagtugot sa paggasto para sa ginpat-od nga katuyuan; indi ini pamatuod sang pagbayad.",
    ceb: "Ang nahimong balaod nga tinuig nga badyet. Ang alokasyon nagtugot sa paggasto alang sa gitakdang katuyoan; dili kini pamatuod sa pagbayad.",
  },
  {
    id: "obligations",
    name: "Obligations",
    en: "Government commitments that create a duty to pay under applicable rules. They are a different stage from actual disbursements.",
    fil: "Mga pananagutan ng pamahalaan na nagbubunga ng tungkuling magbayad ayon sa mga tuntunin. Iba ito sa aktuwal na pagbabayad.",
    hil: "Mga obligasyon sang gobyerno nga nagatuga sang katungdanan sa pagbayad suno sa mga pagsulundan. Lain ini sa aktuwal nga pagbayad.",
    ceb: "Mga obligasyon sa gobyerno nga nagmugna og katungdanan sa pagbayad ubos sa mga lagda. Lahi kini sa aktuwal nga pagbayad.",
  },
  {
    id: "disbursements",
    name: "Disbursements",
    en: "Payments recorded at the disbursement stage. The project comparison in this portal does not supply project-level payment or completion evidence.",
    fil: "Mga pagbabayad na naitala sa yugto ng disbursement. Walang patunay ng pagbabayad o pagkumpleto sa antas ng proyekto ang paghahambing dito.",
    hil: "Mga pagbayad nga narehistro sa yugto sang disbursement. Ang pagtanding diri wala nagahatag pamatuod sang pagbayad ukon pagtapos sang kada proyekto.",
    ceb: "Mga bayad nga natala sa yugto sa disbursement. Ang pagtandi dinhi wala maghatag og ebidensiya sa bayad o pagkahuman sa matag proyekto.",
  },
  {
    id: "missing",
    name: "Missing amount",
    en: "An amount unavailable in this comparison. It is not automatically zero or proof that no funding exists.",
    fil: "Halagang hindi makuha sa paghahambing na ito. Hindi ito awtomatikong zero o patunay na walang pondo.",
    hil: "Kantidad nga wala makuha sa sini nga pagtanding. Indi ini awtomatiko nga zero ukon pamatuod nga wala sing pondo.",
    ceb: "Kantidad nga wala makuha sa maong pagtandi. Dili kini awtomatikong zero o pamatuod nga walay pondo.",
  },
  {
    id: "association",
    name: "Title association",
    en: "A place name found in a project title. It helps discovery but does not independently verify the physical location or an exclusive LGU allocation.",
    fil: "Pangalan ng lugar sa pamagat ng proyekto. Gabay ito sa paghahanap, hindi hiwalay na patunay ng lokasyon o pondong para lamang sa isang LGU.",
    hil: "Ngalan sang lugar sa titulo sang proyekto. Bulig ini sa pagpangita, indi independente nga pagpamatuod sang lokasyon ukon alokasyon para lamang sa isa ka LGU.",
    ceb: "Ngalan sa lugar diha sa titulo sa proyekto. Tabang kini sa pagpangita, dili independente nga pagpamatuod sa lokasyon o alokasyon alang lamang sa usa ka LGU.",
  },
];
export function Glossary() {
  useTitle("Budget words, explained · BetterNegrosIsland");
  const [language, setLanguage] = useState<"en" | "fil" | "hil" | "ceb">("en"),
    [query, setQuery] = useState("");
  const rows = TERMS.filter((t) =>
    [t.name, t.en, t[language]]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page page--reading main reading-page"
    >
      <Intro title="Budget words, explained.">
        <p>
          Short explanations you can use while reading a record. Original
          document names and source figures stay unchanged.
        </p>
      </Intro>
      <div className="reading-filter-row">
        <label className="field">
          <span>Explanation language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
          >
            <option value="en">English</option>
            <option value="fil">Filipino · review draft</option>
            <option value="hil">Hiligaynon · review draft</option>
            <option value="ceb">Cebuano · review draft</option>
          </select>
        </label>
        <label className="field">
          <span>Find a term</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {language !== "en" && (
        <p className="notice">
          These explanations are translation drafts awaiting independent
          language review. English is shown alongside them for comparison. They
          do not replace official documents or translate the project data.
        </p>
      )}
      <p role="status">{rows.length} matching terms.</p>
      {rows.map((t) => (
        <section id={t.id} className="reading-glossary-term" key={t.id}>
          <h2>{t.name}</h2>
          <p lang={language}>{t[language]}</p>
          {language !== "en" && (
            <p lang="en" className="fine">
              English: {t.en}
            </p>
          )}
        </section>
      ))}
      {!rows.length && (
        <p>No matching term. Try a shorter word or clear the search.</p>
      )}
      <p>
        <External href="https://budget.bettergov.ph/docs">
          Budget datasets and stage definitions
        </External>
      </p>
      <Link to="/budget-guide">Walk through the one-minute guide</Link>
    </main>
  );
}
