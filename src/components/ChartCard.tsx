import { useId, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSnapshot, type Manifest } from "../lib/snapshot";

export function SourceAttribution({
  stage = "2027 proposal comparison",
}: {
  stage?: string;
}) {
  const snapshot = useSnapshot<Manifest>();
  return (
    <p className="chart-attribution">
      BetterGov.PH · {stage}
      <br />
      {snapshot.status === "ready" ? (
        <>
          Static snapshot{" "}
          <time dateTime={snapshot.value.retrieved_at}>
            {snapshot.value.retrieved_at.slice(0, 10)}
          </time>{" "}
          · API overview built{" "}
          <time dateTime={snapshot.value.source_build}>
            {snapshot.value.source_build.slice(0, 10)}
          </time>
        </>
      ) : (
        "Snapshot metadata unavailable or loading"
      )}{" "}
      · <Link to="/data-coverage">Coverage</Link>
    </p>
  );
}
export default function ChartCard({
  title,
  description,
  stage,
  wide = false,
  children,
}: {
  title: string;
  description: string;
  stage?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      id={"chart-" + title.charAt(0).toLowerCase()}
      className={"chart-panel analytics-card" + (wide ? " ranked-chart" : "")}
      aria-labelledby={id}
    >
      <header className="chart-card-heading">
        <h2 id={id}>{title}</h2>
        <p className="chart-scope">{description}</p>
      </header>
      {children}
      <SourceAttribution stage={stage} />
    </section>
  );
}
