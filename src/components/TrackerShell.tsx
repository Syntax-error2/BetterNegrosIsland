import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useSnapshot, type Manifest } from "../lib/snapshot";
import { LOCATIONS, PROVINCES } from "../lib/geography";
import { useTitle } from "../lib/use-title";
import { civicRoutes } from "../lib/civic-routes";

const TRACKER_TOOLS = [
  ["/tracker", "Project map"],
  ["/contracts", "Contracts"],
  ["/documents", "Document centre"],
  ["/ask", "Ask BetterNegros"],
];
export default function TrackerShell({
  title,
  description,
  civic = false,
  children,
}: {
  title: string;
  description: string;
  civic?: boolean;
  children: ReactNode;
}) {
  useTitle(title + " · BetterNegrosIsland");
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page page--wide main tracker-page"
    >
      <nav className={"tracker-tools" + (civic ? " tracker-tools--records" : "")} aria-label={civic ? "Public records tools" : "Project tracker tools"}>
        {(civic ? civicRoutes : TRACKER_TOOLS).map(([to, label]) => (
          <NavLink key={to} to={to}>
            {label}
          </NavLink>
        ))}
        <NavLink to={civic ? "/tracker" : "/budget-stages"}>{civic ? "Project map" : "More public records"}</NavLink>
      </nav>
      <header className="tracker-heading">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </main>
  );
}
export function SnapshotStamp() {
  const manifest = useSnapshot<Manifest>();
  return (
    <p className="tracker-stamp">
      {manifest.status === "ready" ? (
        <>
          Proposal snapshot retrieved {manifest.value.retrieved_at.slice(0, 10)}
          . FY2027 NEP and House proposals; amounts are not spending. Budget
          data: BetterGov.PH.{" "}
          <NavLink to="/data-coverage">Read coverage</NavLink>.
        </>
      ) : manifest.status === "loading" ? (
        "Reading snapshot dates…"
      ) : (
        "Snapshot date unavailable."
      )}
    </p>
  );
}
export function ProjectFilters({
  province,
  program,
  lgu,
  onChange,
}: {
  province: string;
  program: string;
  lgu: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="tracker-filters">
      <label className="field">
        <span>Province title association</span>
        <select
          value={province}
          onChange={(e) => onChange("province", e.target.value)}
        >
          <option value="">All provinces</option>
          {PROVINCES.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Locality title association</span>
        <select value={lgu} onChange={(e) => onChange("lgu", e.target.value)}>
          <option value="">All localities</option>
          {LOCATIONS.filter((l) => !province || l.province === province).map(
            (l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ),
          )}
        </select>
      </label>
      <label className="field">
        <span>Source program</span>
        <select
          value={program}
          onChange={(e) => onChange("program", e.target.value)}
        >
          <option value="">All programs</option>
          {["dpwh", "fmr", "hfep", "nia"].map((p) => (
            <option key={p} value={p}>
              {p.toUpperCase()}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
