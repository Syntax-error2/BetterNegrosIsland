import { useState } from "react";
import DataChart from "../components/DataChart";
/** Synthetic development cases never replace public source records or enter the production router. */
export default function ChartFixture() {
  const [mounted, setMounted] = useState(true);
  return (
    <main
      id="main-content"
      className="page page--wide main analytics-page"
      tabIndex={-1}
    >
      <h1>SYNTHETIC CHART LAYOUT FIXTURES</h1>
      <p>
        Development-only zero, missing, signed and hidden-container cases. These
        are not budget records.
      </p>
      <div className="chart-grid">
        <DataChart
          title="A / Synthetic zero values"
          rows={[
            { label: "Zero", Amount: 0 },
            { label: "Missing", Amount: null },
          ]}
          keys={["Amount"]}
          horizontal
          note="SYNTHETIC: distinguish genuine zero from missing data."
        />
        <DataChart
          title="B / Synthetic unavailable values"
          rows={[
            { label: "Null", Amount: null },
            { label: "Invalid", Amount: NaN },
          ]}
          keys={["Amount"]}
          horizontal
          note="SYNTHETIC: no valid values; no fabricated bars."
        />
        <DataChart
          title="C / Synthetic signed values"
          rows={[
            { label: "Negative", Amount: -25 },
            { label: "Positive", Amount: 25 },
          ]}
          keys={["Amount"]}
          horizontal
          money={false}
          note="SYNTHETIC: signed axis must include both values and zero."
        />
      </div>
      <button className="button" onClick={() => setMounted((v) => !v)}>
        {mounted
          ? "Unmount hidden-container chart"
          : "Mount hidden-container chart"}
      </button>
      <details className="fixture-hidden">
        <summary>Reveal hidden-container chart</summary>
        {mounted && (
          <DataChart
            title="D / Synthetic hidden-container resize"
            rows={[
              { label: "First", Records: 12 },
              { label: "Second", Records: 5 },
            ]}
            keys={["Records"]}
            horizontal
            money={false}
            note="SYNTHETIC: reveal after mounting and test parent ResizeObserver cleanup."
          />
        )}
      </details>
    </main>
  );
}
