import { lazy, Suspense, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePortal } from "../lib/portal-context";
import { analyticsSelection } from "../lib/analytics-data";
import { moneyExact, usableCoordinate } from "../lib/tracker";
import TrackerShell, {
  ProjectFilters,
  SnapshotStamp,
} from "../components/TrackerShell";
import { Await } from "../components/Bits";
import { recordPath } from "../lib/evidence";
import { senateComparisonPath } from "../lib/civic-budget";
const ProjectMap = lazy(() => import("../components/ProjectMap"));
export default function Tracker() {
  const { scope } = usePortal(),
    [params, setParams] = useSearchParams();
  const [mapEnabled, setMapEnabled] = useState(false),
    [limit, setLimit] = useState(20),
    [group, setGroup] = useState<string[]>([]);
  const selectionPanel = useRef<HTMLElement>(null);
  const province = params.get("province") ?? "",
    program = params.get("program") ?? "",
    lgu = params.get("lgu") ?? "",
    q = params.get("q") ?? "",
    stage = params.get("stage") === "nep" ? "nep" : "house";
  function update(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== "selected" && name !== "stage") {
      next.delete("selected");
      setGroup([]);
    }
    if (name === "province") next.delete("lgu");
    setLimit(20);
    setParams(next, { replace: name === "q" });
  }
  function revealSummary() {
    selectionPanel.current?.focus({ preventScroll: true });
    selectionPanel.current?.scrollIntoView({ block: "nearest" });
  }
  return (
    <TrackerShell
      title="Negros project map"
      description="Find a project by place, inspect its proposal amounts, and open the original budget pages."
    >
      <SnapshotStamp />
      <nav className="citizen-toolbar" aria-label="Map page sections">
        <a href="#project-map">Go to map</a>
        <a href="#matching-projects">Go to record list</a>
        <Link to="/budget-stages">Compare the Senate committee stage</Link>
      </nav>
      <ProjectFilters {...{ province, program, lgu }} onChange={update} />
      <div className="tracker-filters">
        <label className="field">
          <span>Find a title or source ID</span>
          <input
            type="search"
            maxLength={150}
            value={q}
            onChange={(e) => update("q", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Amount shown</span>
          <select
            value={stage}
            onChange={(e) => update("stage", e.target.value)}
          >
            <option value="house">House proposal</option>
            <option value="nep">NEP proposal</option>
          </select>
        </label>
        <label className="field">
          <span>Records in list</span>
          <select
            value={params.get("coordinates") ?? ""}
            onChange={(e) => update("coordinates", e.target.value)}
          >
            <option value="">All matching records</option>
            <option value="mapped">Usable coordinates only</option>
            <option value="unmapped">Without usable coordinates</option>
          </select>
        </label>
        <button
          className="button"
          onClick={() => {
            setParams({});
            setLimit(20);
            setGroup([]);
          }}
        >
          Clear filters
        </button>
      </div>
      <Await state={scope} what="project map records">
        {(s) => {
          const matching = analyticsSelection(s.projects, {
            province,
            program,
            lgu,
          }).rows.filter((p) =>
            [p.title, p.id].join(" ").toLowerCase().includes(q.toLowerCase()),
          );
          const mappable = matching.filter(usableCoordinate),
            shown = matching.filter((p) =>
              params.get("coordinates") === "mapped"
                ? usableCoordinate(p)
                : params.get("coordinates") === "unmapped"
                  ? !usableCoordinate(p)
                  : true,
            );
          const selected = matching.find(
            (p) => p.key === params.get("selected"),
          );
          const committeePath = selected && senateComparisonPath(selected.key);
          const nearby = matching.filter((p) => group.includes(p.key));
          return (
            <>
              <p className="tracker-result-count" role="status">
                <strong>{matching.length}</strong> matching records.{" "}
                <strong>{mappable.length}</strong> have usable source
                coordinates.{" "}
                <strong>{matching.length - mappable.length}</strong> remain in
                the list without pins.
              </p>
              <div id="project-map" className="tracker-map-workspace">
                <section aria-label="Project map">
                  <div className="tracker-map-top">
                    <span>
                      <i style={{ background: "#174a96" }} /> DPWH
                    </span>
                    <span>
                      <i style={{ background: "#246b4a" }} /> FMR
                    </span>
                    <span>
                      <i style={{ background: "#9b4059" }} /> HFEP
                    </span>
                    <span>Numbered markers group nearby projects</span>
                  </div>
                  {mapEnabled ? (
                    <>
                      <button
                        className="link-button"
                        onClick={() => {
                          setMapEnabled(false);
                          setGroup([]);
                        }}
                      >
                        Close street map
                      </button>
                      <Suspense fallback={<p role="status">Opening map…</p>}>
                        <ProjectMap
                          rows={mappable}
                          selected={selected?.key ?? ""}
                          onSelect={(key) => {
                            setGroup([]);
                            update("selected", key);
                            revealSummary();
                          }}
                          onGroup={(keys) => {
                            setGroup(keys);
                            update("selected", "");
                            revealSummary();
                          }}
                        />
                      </Suspense>
                    </>
                  ) : (
                    <div className="tracker-map-start">
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 80 80"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 18 29 10 51 19 72 11V62L51 70 29 61 8 69Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M29 10V61M51 19V70M49 30C49 41 40 48 40 48S31 41 31 30A9 9 0 0 1 49 30Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <h2>A closer look at Negros Island.</h2>
                      <p>
                        Load the street map to explore {mappable.length} source
                        coordinate pairs. OpenStreetMap receives your IP
                        address, website origin and requested map tiles. Your
                        device location is never requested.
                      </p>
                      <button
                        className="button button-primary"
                        disabled={!mappable.length}
                        onClick={() => setMapEnabled(true)}
                      >
                        Load street map
                      </button>
                      <p>The complete record list works without the map.</p>
                    </div>
                  )}
                </section>
                <aside
                  ref={selectionPanel}
                  tabIndex={-1}
                  className="tracker-selection"
                  aria-label="Project selection"
                  aria-live="polite"
                >
                  {selected ? (
                    <>
                      {nearby.length > 1 && (
                        <button
                          className="link-button"
                          type="button"
                          onClick={() => {
                            update("selected", "");
                            revealSummary();
                          }}
                        >
                          Back to {nearby.length} nearby projects
                        </button>
                      )}
                      <p>
                        {selected.dataset.toUpperCase()} · {selected.id}
                      </p>
                      <h2>{selected.title}</h2>
                      {committeePath && <p><Link to={committeePath}>Compare this line with the Senate report</Link></p>}
                      <strong className="tracker-amount">
                        {moneyExact(
                          stage === "house"
                            ? selected.house_php
                            : selected.nep_php,
                        )}
                      </strong>
                      <p>
                        {stage === "house" ? "House" : "NEP"} proposal · FY2027
                      </p>
                      <p>
                        {selected.status_label}
                        {selected.held ? " · Unconfirmed pairing" : ""}
                      </p>
                      <p>
                        {usableCoordinate(selected)
                          ? `${selected.lat}, ${selected.lon}`
                          : "No usable source coordinate pair."}
                      </p>
                      <Link
                        className="button button-primary"
                        to={recordPath(selected)}
                      >
                        Read project record
                      </Link>
                      <Link
                        className="button"
                        to={
                          "/documents?record=" +
                          encodeURIComponent(selected.key)
                        }
                      >
                        Check its documents
                      </Link>
                    </>
                  ) : nearby.length ? (
                    <>
                      <h2>{nearby.length} nearby projects</h2>
                      <p>
                        Choose a record to see its exact published coordinates
                        and proposal amount.
                      </p>
                      <ul className="tracker-nearby">
                        {nearby.map((p) => (
                          <li key={p.key}>
                            <button
                              type="button"
                              className="link-button"
                              onClick={() => {
                                update("selected", p.key);
                                revealSummary();
                              }}
                            >
                              {p.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <h2>Start with a project.</h2>
                      <p>
                        Select a pin or choose “Locate record” in the list. Full
                        titles and exact amounts remain available here.
                      </p>
                      <p>
                        Title associations do not establish a physical location.
                        Pins use published coordinates only; their placement has
                        not been independently checked.
                      </p>
                    </>
                  )}
                </aside>
              </div>
              <section id="matching-projects" className="tracker-records">
                <h2>Matching project records</h2>
                <p>
                  {shown.length} in this list. Budget stages are never added
                  together.
                </p>
                {shown.slice(0, limit).map((p) => (
                  <article
                    className={
                      "tracker-record" +
                      (selected?.key === p.key ? " is-selected" : "")
                    }
                    key={p.key}
                  >
                    <div>
                      <p className="tracker-record-meta">
                        {p.dataset.toUpperCase()} · {p.id} ·{" "}
                        {usableCoordinate(p)
                          ? "Source coordinates available"
                          : "No usable coordinates"}
                      </p>
                      <h3>
                        <Link to={recordPath(p)}>{p.title}</Link>
                      </h3>
                      <p>
                        {p.status_label}
                        {p.held ? " · Unconfirmed match" : ""}
                      </p>
                    </div>
                    <div className="tracker-record-actions">
                      <strong>
                        {moneyExact(
                          stage === "house" ? p.house_php : p.nep_php,
                        )}
                      </strong>
                      <button
                        className="link-button"
                        onClick={() => {
                          setGroup([]);
                          update("selected", p.key);
                          revealSummary();
                        }}
                      >
                        {usableCoordinate(p)
                          ? mapEnabled
                            ? "Locate record"
                            : "Read map record summary"
                          : "Read record summary"}
                      </button>
                      <Link
                        to={"/documents?record=" + encodeURIComponent(p.key)}
                      >
                        Source documents
                      </Link>
                    </div>
                  </article>
                ))}
                {!shown.length && (
                  <p>
                    No records match these filters. Clear filters or include
                    records without coordinates.
                  </p>
                )}
                {shown.length > limit && (
                  <button
                    className="button"
                    onClick={() => setLimit((n) => n + 20)}
                  >
                    Show 20 more records
                  </button>
                )}
              </section>
            </>
          );
        }}
      </Await>
    </TrackerShell>
  );
}
