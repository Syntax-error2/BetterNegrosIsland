import { useState } from "react";
import axe from "axe-core";
/** Local test control only. No audit library, results or requests are shipped in production. */
export default function AccessibilityAudit() {
  const [result, setResult] = useState<unknown>(null),
    [busy, setBusy] = useState(false);
  const [spacing, setSpacing] = useState(false);
  const [reducedPreview, setReducedPreview] = useState(false);
  return (
    <aside
      data-dev-audit
      data-os-reduced-motion={
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      }
      data-motion-preview={reducedPreview ? "reduced" : "system"}
      aria-label="Development accessibility check"
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        zIndex: 1000,
        background: "white",
        color: "#122b43",
        border: "2px solid #334b60",
        padding: 12,
        maxWidth: "calc(100vw - 24px)",
        maxHeight: "40vh",
        overflow: "auto",
      }}
    >
      {spacing && (
        <style>{`body *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}body p{margin-bottom:2em!important}`}</style>
      )}
      {reducedPreview && (
        <style>{`*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.province-card:hover,.button:active:not(:disabled){transform:none!important}`}</style>
      )}
      <button className="button" onClick={() => setReducedPreview((v) => !v)}>
        {reducedPreview ? "Reset motion preview" : "Preview reduced motion"}
      </button>
      <button className="button" onClick={() => setSpacing((v) => !v)}>
        {spacing ? "Reset text spacing" : "Apply WCAG text spacing"}
      </button>
      <button
        className="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setResult(null);
          try {
            const r = await axe.run(
              { exclude: [["[data-dev-audit]"]] },
              {
                runOnly: {
                  type: "tag",
                  values: [
                    "wcag2a",
                    "wcag2aa",
                    "wcag21a",
                    "wcag21aa",
                    "wcag22aa",
                  ],
                },
              },
            );
            setResult({
              path: location.pathname,
              width: innerWidth,
              environment: {
                height: innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                visualViewportScale: window.visualViewport?.scale ?? null,
              },
              version: axe.version,
              resources: performance
                .getEntriesByType("resource")
                .map((entry) => {
                  const url = new URL(entry.name);
                  url.search = "";
                  url.hash = "";
                  return {
                    url: url.href,
                    type: (entry as PerformanceResourceTiming).initiatorType,
                  };
                }),
              violations: r.violations.map((v) => ({
                id: v.id,
                impact: v.impact,
                help: v.help,
                nodes: v.nodes.map((n) => ({
                  target: n.target,
                  summary: n.failureSummary,
                })),
              })),
              incomplete: r.incomplete.map((v) => ({
                id: v.id,
                nodes: v.nodes.map((n) => ({
                  target: n.target,
                  summary: n.failureSummary,
                })),
              })),
              passes: r.passes.length,
            });
          } catch (e) {
            setResult({ error: String(e) });
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Checking accessibility…" : "Run WCAG audit"}
      </button>
      {result != null && (
        <>
          <p role="status">Audit complete</p>
          <pre
            data-testid="a11y-results"
            style={{
              fontSize: 12,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </>
      )}
    </aside>
  );
}
