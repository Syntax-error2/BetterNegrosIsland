import { evidencePath, comparisonPath } from "../lib/evidence";
import { Link } from "react-router-dom";
import type { ScopedProject } from "../lib/scope";
import { phpFull } from "../lib/format";
import { LOCATIONS, PROVINCES } from "../lib/geography";
import {
  comparablePercent,
  exactDifference,
  sourceDocument,
} from "../lib/comparison-display";
import { StatusChip } from "./Bits";
import DataTable from "./DataTable";
export default function ProjectTable({
  rows,
  programName,
}: {
  rows: ScopedProject[];
  programName: (key: ScopedProject["dataset"]) => string;
}) {
  if (!rows.length) return null;
  return (
    <DataTable
      variant="project"
      caption="Projects — published document comparisons, exact pesos"
      columns={[
        { key: "project", label: "Project details", width: "39%" },
        { key: "status", label: "Comparison status", width: "14%" },
        { key: "nep", label: "NEP", width: "12%", numeric: true },
        { key: "house", label: "House bill", width: "12%", numeric: true },
        { key: "difference", label: "Difference", width: "13%", numeric: true },
        { key: "source", label: "Source action", width: "10%" },
      ]}
    >
      {rows.map((p) => {
        const detail =
            "/projects/" + p.dataset + "/" + encodeURIComponent(p.id),
          source = sourceDocument(p),
          percent = comparablePercent(p);
        const places = [
          ...PROVINCES.filter((l) => p.provinceMatches?.includes(l.slug)).map(
            (l) => l.name,
          ),
          ...LOCATIONS.filter((l) => p.locationMatches?.includes(l.code)).map(
            (l) => l.name,
          ),
        ];
        const wide =
          Math.max(phpFull(p.nep_php).length, phpFull(p.house_php).length) > 14;
        return (
          <tr
            role="row"
            key={p.key}
            className={wide ? "wide-money" : undefined}
          >
            <td role="cell" className="project-details-cell">
              <Link className="project-name" to={detail}>
                {p.title}
              </Link>
              <div className="project-metadata">
                <span>
                  {programName(p.dataset)}
                  {p.program ? " · " + p.program : ""}
                </span>
                {p.office && <span>Implementing office: {p.office}</span>}
                {p.region && <span>Published region: {p.region}</span>}
              </div>
              <p className="scope-evidence">
                <span className="evidence-mark" aria-hidden="true">
                  {p.regionConfirmed ? "✓" : "?"}
                </span>
                {p.regionConfirmed
                  ? "Source-confirmed NIR · locality unverified"
                  : "Title / office association · location uncertain"}
              </p>
              {places.length > 0 && (
                <p className="project-place">
                  Title associations: {places.join(" · ")}
                </p>
              )}
              <details className="inclusion-evidence">
                <summary>Why included</summary>
                <ul>
                  {p.reasons.map((r) => (
                    <li key={r.kind + r.label}>
                      {r.kind === "region"
                        ? "Source region"
                        : r.kind === "office"
                          ? "Whole office ledger"
                          : "Title search"}
                      : {r.label}
                    </li>
                  ))}
                </ul>
              </details>
            </td>
            <td role="cell" className="comparison-cell">
              <span className="cell-label" aria-hidden="true">
                Comparison status
              </span>
              <StatusChip
                group={p.bridge_group}
                label={p.status_label}
                held={p.held}
              />
            </td>
            <td role="cell" className="money-cell">
              <span className="cell-label" aria-hidden="true">
                NEP proposal
              </span>
              <span className="money-value">
                {p.nep_php == null ? "Not listed" : phpFull(p.nep_php)}
              </span>
            </td>
            <td role="cell" className="money-cell">
              <span className="cell-label" aria-hidden="true">
                House bill
              </span>
              <span className="money-value money-primary">
                {p.house_php == null ? "Not listed" : phpFull(p.house_php)}
              </span>
            </td>
            <td role="cell" className="money-cell difference-cell">
              <span className="cell-label" aria-hidden="true">
                Difference
              </span>
              <span className="money-value">
                {exactDifference(p.delta_php)}
              </span>
              <span className="percent-value">
                {percent == null
                  ? "Not comparable"
                  : (percent > 0 ? "+" : "") + percent.toFixed(2) + "%"}
              </span>
            </td>
            <td role="cell" className="source-cell">
              <div className="source-actions">
                {source ? (
                  <a
                    className="source-button"
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={"Source reference for " + p.title}
                  >
                    Source ↗
                  </a>
                ) : (
                  <span className="source-unavailable">Source unavailable</span>
                )}
                <Link className="detail-action" to={detail}>
                  Details →
                </Link>
                <Link className="detail-action" aria-label={'Share card for ' + p.title} to={evidencePath(p)}>Share card</Link>
                <Link className="detail-action" aria-label={'Compare ' + p.title} to={comparisonPath(p)}>Compare</Link>
              </div>
            </td>
          </tr>
        );
      })}
    </DataTable>
  );
}
