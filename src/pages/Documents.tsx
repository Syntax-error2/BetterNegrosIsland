import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TrackerShell, { SnapshotStamp } from "../components/TrackerShell";
import { senateComparisonPath } from "../lib/civic-budget";
import { Await, Disclaimers, External } from "../components/Bits";
import { usePortal, type Async } from "../lib/portal-context";
import { useTrackerIndex, readTracker } from "../lib/tracker-data";
import {
  projectReferences,
  moneyExact,
  type DocumentCatalogue,
  type SourceDocument,
} from "../lib/tracker";
import { currentSnapshot } from "../lib/snapshot-selection";
import { recordPath } from "../lib/evidence";
import { useSnapshot, type Manifest } from "../lib/snapshot";
import { downloadText } from "../lib/csv";

function Fingerprint({
  documents,
  expected,
}: {
  documents: SourceDocument[];
  expected?: SourceDocument;
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section className="document-fingerprint" aria-labelledby="pdf-check-title">
      <h3 id="pdf-check-title">Check a downloaded PDF</h3>
      <p>
        Compare a PDF’s fingerprint with the source library. Your browser reads
        the file locally.
      </p>
      {expected && (
        <p>
          Checking the referenced copy of <strong>{expected.title}</strong>.
        </p>
      )}
      <label className="field">
        <span>Downloaded PDF (up to 100 MB)</span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 100_000_000) {
              setMessage("Choose a PDF smaller than 100 MB.");
              return;
            }
            setBusy(true);
            setMessage("Calculating the local file fingerprint…");
            try {
              const bytes = await file.arrayBuffer();
              const magic = new TextDecoder().decode(bytes.slice(0, 5));
              if (magic !== "%PDF-") throw Error("Choose a PDF file.");
              const hash = [
                ...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
              ]
                .map((v) => v.toString(16).padStart(2, "0"))
                .join("");
              const match = documents.find(
                (document) =>
                  hash === document.sha256 && file.size === document.bytes,
              );
              setMessage(
                match
                  ? expected && expected.key !== match.key
                    ? `Matches ${match.title}. The project reference points to ${expected.title}.`
                    : `Fingerprint and size match ${match.title}.`
                  : "This file’s fingerprint differs from every copy in the library. Check the edition or download the source copy again.",
              );
            } catch {
              setMessage(
                "Could not check this file. Choose a PDF and use a browser with local SHA-256 support.",
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
function Catalogue() {
  const [params] = useSearchParams();
  const { state, retry } = useTrackerIndex(),
    [catalogue, setCatalogue] = useState<Async<DocumentCatalogue>>({
      status: "loading",
    }),
    [attempt, setAttempt] = useState(0),
    [program, setProgram] = useState(""),
    [stage, setStage] = useState("");
  useEffect(() => {
    if (state.status !== "ready") return;
    const controller = new AbortController();
    readTracker<DocumentCatalogue>(
      state.value.documents,
      controller.signal,
    ).then(
      (value) => setCatalogue({ status: "ready", value }),
      (error) => {
        if (!controller.signal.aborted)
          setCatalogue({ status: "error", error });
      },
    );
    return () => controller.abort();
  }, [state, attempt]);
  return (
    <section id="source-library" className="document-catalogue">
      <h2>Source document library</h2>
      <p>
        Catalogue metadata has its own retrieval date and is separate from the
        selected project snapshot. PDF files open at their external source and
        are not embedded or downloaded automatically.
      </p>
      {state.status === "error" ? (
        <>
          <p role="alert">Document catalogue metadata unavailable.</p>
          <button className="button" onClick={retry}>
            Retry catalogue metadata
          </button>
        </>
      ) : state.status === "ready" ? (
        <>
          <p className="tracker-stamp">
            Catalogue retrieved{" "}
            {state.value.documents_retrieved_at.slice(0, 10)}. API build{" "}
            {catalogue.status === "ready"
              ? catalogue.value.meta.built_at.slice(0, 10)
              : "loading"}
            . Data: People’s Budget Coalition × BetterGov.PH.
          </p>
          {catalogue.status === "ready" ? (
            <>
              <Fingerprint
                key={params.get("pdf")}
                documents={catalogue.value.data}
                expected={catalogue.value.data.find(
                  (doc) => doc.pdf_url === params.get("pdf"),
                )}
              />
              <div className="tracker-filters">
                <label className="field">
                  <span>Library program</span>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  >
                    <option value="">All programs</option>
                    {["dpwh", "fmr", "hfep", "nia"].map((p) => (
                      <option key={p} value={p}>
                        {p.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Library stage</span>
                  <select
                    value={stage}
                    onChange={(event) => setStage(event.target.value)}
                  >
                    <option value="">All stages</option>
                    <option value="nep">NEP proposal</option>
                    <option value="2">House second reading</option>
                    <option value="3">House third reading</option>
                  </select>
                </label>
              </div>
              <p>{catalogue.value.meta.note}</p>
              {catalogue.value.data
                .filter(
                  (d) =>
                    (!program || d.used_by.includes(program)) &&
                    (!stage ||
                      stage ===
                        (d.stage === "nep" ? "nep" : String(d.reading))),
                )
                .map((d) => (
                  <article className="source-document" key={d.key}>
                    <p className="tracker-record-meta">
                      {d.stage === "nep"
                        ? "NEP proposal"
                        : `House reading ${d.reading}`}{" "}
                      · {d.used_by.map((p) => p.toUpperCase()).join(", ")}
                    </p>
                    <h3>{d.title}</h3>
                    <p>{d.notes}</p>
                    <dl className="contract-facts">
                      <div>
                        <dt>File pages used</dt>
                        <dd>
                          {d.pages.from}–{d.pages.to}
                        </dd>
                      </div>
                      <div>
                        <dt>Download size</dt>
                        <dd>{(d.bytes / 1_000_000).toFixed(1)} MB</dd>
                      </div>
                    </dl>
                    <p>
                      <External href={d.pdf_url}>Open source PDF</External>
                      {d.source_url && (
                        <>
                          {" "}
                          ·{" "}
                          <External href={d.source_url}>
                            Original publication
                          </External>
                        </>
                      )}
                    </p>
                    <details>
                      <summary>SHA-256 fingerprint</summary>
                      <p className="tracker-hash">{d.sha256}</p>
                    </details>
                  </article>
                ))}
              <Disclaimers items={catalogue.value.disclaimers} />
            </>
          ) : catalogue.status === "error" ? (
            <>
              <p role="alert">The catalogue file could not be verified.</p>
              <button
                className="button"
                onClick={() => setAttempt((n) => n + 1)}
              >
                Retry document library
              </button>
            </>
          ) : (
            <p role="status">Loading document library…</p>
          )}
        </>
      ) : (
        <p role="status">Reading document metadata…</p>
      )}
    </section>
  );
}
export default function Documents() {
  const { scope } = usePortal(),
    manifest = useSnapshot<Manifest>(),
    [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(20);
  const q = params.get("q") ?? "",
    record = params.get("record") ?? "";
  const pinned = Boolean(currentSnapshot().version);
  return (
    <TrackerShell
      title="Project document centre"
      description="Compare the amounts and source pages for each budget reading. Check downloaded PDFs against the source library."
    >
      <SnapshotStamp />
      <nav className="citizen-toolbar" aria-label="Document centre sections">
        <a href="#project-references">Project reference sheets</a>
        <Link to={senateComparisonPath(record) ?? "/budget-stages"}>Senate committee report references</Link>
        <a href="#source-library">
          Source document library and fingerprint checks
        </a>
      </nav>
      <div className="tracker-filters">
        <label className="field">
          <span>Find a project title or source ID</span>
          <input
            type="search"
            value={q}
            maxLength={150}
            onChange={(e) => {
              setLimit(20);
              const next = new URLSearchParams(params);
              if (e.target.value) next.set("q", e.target.value);
              else next.delete("q");
              next.delete("record");
              setParams(next, { replace: true });
            }}
          />
        </label>
        {(q || record) && (
          <button
            className="button"
            onClick={() => {
              setParams({});
              setLimit(20);
            }}
          >
            Show all project references
          </button>
        )}
      </div>
      <Await state={scope} what="project document references">
        {(s) => {
          const rows = s.projects.filter(
            (p) =>
              (!record || p.key === record) &&
              [p.title, p.id].join(" ").toLowerCase().includes(q.toLowerCase()),
          );
          return (
            <section id="project-references">
              <h2>Project reference sheets</h2>
              <p role="status">
                {rows.length} matching records. PDF links retain the source
                file’s page position.
              </p>
              {rows.slice(0, limit).map((p) => {
                const references = projectReferences(p);
                const readings = [
                  { key: "nep", label: "NEP proposal", amount: p.nep_php },
                  {
                    key: "hgab2",
                    label: "House second reading",
                    amount: p.hgab2_php,
                  },
                  {
                    key: "hgab3",
                    label: "House third reading",
                    amount: p.hgab3_php,
                  },
                ];
                return (
                  <article className="document-project" key={p.key}>
                    <p className="tracker-record-meta">
                      {p.dataset.toUpperCase()} · {p.id}
                    </p>
                    <h3>
                      <Link to={recordPath(p)}>{p.title}</Link>
                    </h3>
                    <p>
                      {p.status_label}
                      {p.held ? " · Unconfirmed pairing" : ""}
                    </p>
                    <div className="tracker-stage-grid">
                      {readings.map((reading) => {
                        const ref = references.find(
                          (item) => item.stage === reading.key,
                        );
                        return (
                          <section key={reading.key}>
                            <h4>{reading.label}</h4>
                            <strong className="tracker-amount">
                              {moneyExact(reading.amount)}
                            </strong>
                            <div>
                              {ref ? (
                                <External href={ref.href}>
                                  {ref.page
                                    ? `Open ${reading.label} PDF, page ${ref.page}`
                                    : `Open ${reading.label} PDF`}
                                </External>
                              ) : (
                                "Source page unavailable"
                              )}
                            </div>
                            {ref && !pinned && (
                              <Link
                                to={{
                                  search: `?${new URLSearchParams({ record: p.key, pdf: ref.document })}`,
                                  hash: "#source-library",
                                }}
                              >
                                Check this PDF copy
                              </Link>
                            )}
                          </section>
                        );
                      })}
                    </div>
                    <div className="citizen-toolbar">
                      <button
                        className="button"
                        disabled={manifest.status !== "ready"}
                        onClick={() => {
                          if (manifest.status !== "ready") return;
                          downloadText(
                            "betternegrosisland-reference-sheet.txt",
                            [
                              "BetterNegrosIsland project reference sheet",
                              p.title,
                              p.key,
                              ...readings.map(
                                (reading) =>
                                  `FY2027 ${reading.label}: ${moneyExact(reading.amount)}`,
                              ),
                              "Source classification: " +
                                p.status_label +
                                (p.held ? " (unconfirmed pairing)" : ""),
                              "Snapshot: " + manifest.value.version,
                              "Retrieved: " + manifest.value.retrieved_at,
                              "Source build: " + manifest.value.source_build,
                              "Originating record: " + p.url,
                              ...references.map((r) => r.label + ": " + r.href),
                              "Amounts describe proposals, not spending or completion. Stage amounts must not be added. Classifications do not establish wrongdoing. Title associations are not verified locations. External documents can change. Budget data: BetterGov.PH.",
                              ...s.disclaimers.map(
                                (d) => d.title + " " + d.body + " " + d.url,
                              ),
                            ].join("\n\n"),
                            "text/plain;charset=utf-8",
                          );
                        }}
                      >
                        Download reference sheet
                      </button>
                      <Link
                        to={
                          "/evidence/" +
                          p.dataset +
                          "/" +
                          encodeURIComponent(p.id)
                        }
                      >
                        Create evidence card
                      </Link>
                    </div>
                    {!record && (
                      <Link
                        to={`/documents?${new URLSearchParams({ record: p.key })}`}
                      >
                        Open project reference
                      </Link>
                    )}
                  </article>
                );
              })}
              {!rows.length && (
                <p>
                  No matching reference sheet in this snapshot. Clear the search
                  or open the project explorer.
                </p>
              )}
              {rows.length > limit && (
                <button
                  className="button"
                  onClick={() => setLimit((n) => n + 20)}
                >
                  Show 20 more reference sheets
                </button>
              )}
            </section>
          );
        }}
      </Await>
      {pinned ? (
        <section id="source-library" className="document-catalogue">
          <h2>Document library metadata</h2>
          <p>
            The separately imported catalogue is not archived in this budget
            snapshot. The project links above remain the retained references.{" "}
            <a href="/documents">Open the latest document library</a>.
          </p>
        </section>
      ) : (
        <Catalogue />
      )}
    </TrackerShell>
  );
}
