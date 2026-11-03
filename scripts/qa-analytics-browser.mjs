import assert from "node:assert/strict";

/** Run through the documented CUA tab API, never through a separate browser driver.
 * const qa = await import("file:///C:/.../scripts/qa-analytics-browser.mjs");
 * qa.assertAnalytics(await qa.inspectAnalytics(tab));
 * The diagnostic input is development-only; the SVG/table checks inspect actual rendered DOM.
 */
export async function inspectAnalytics(tab) {
  return tab.playwright.evaluate(() => ({
    width: innerWidth,
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    charts: [...document.querySelectorAll(".analytics-card")].map((card) => {
      const model = JSON.parse(
        card.querySelector("[data-chart-diagnostics]").textContent,
      );
      const box = card.querySelector(".chart-box")?.getBoundingClientRect();
      const svg = card.querySelector('svg.recharts-surface')?.getBoundingClientRect();
      const money = model.money;
      const expected = model.rows.map((row) =>
        model.keys.map((key) =>
          row[key] === null
            ? "Not available"
            : (money ? "₱" : "") + Number(row[key]).toLocaleString("en-US"),
        ),
      );
      const actual = [
        ...card.querySelectorAll('details[class*="chart-series-"] tbody tr'),
      ].map((row) =>
        [...row.querySelectorAll("td")].map((cell) => cell.textContent),
      );
      return {
        title: model.title,
        line: model.line,
        hasNonzero: model.extent.hasNonzero,
        width: model.width,
        box: box ? { width: box.width, height: box.height } : null,
        svg: svg ? { width: svg.width, height: svg.height } : null,
        expectedMarks: model.rows.reduce(
          (sum, row) =>
            sum +
            model.keys.filter(
              (key) => typeof row[key] === "number" && row[key] !== 0,
            ).length,
          0,
        ),
        bars: [...card.querySelectorAll(".recharts-bar-rectangle")].filter(
          (mark) => {
            const rect = mark.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          },
        ).length,
        dots: card.querySelectorAll(".recharts-line-dot").length,
        invalidPaths: [...card.querySelectorAll("path")].filter((path) =>
          /NaN|Infinity/.test(path.getAttribute("d") || ""),
        ).length,
        tableMatches:
          model.rows.length === 0
            ? actual.length === 1 &&
              actual[0][0] === "No records in this selection."
            : JSON.stringify(expected) === JSON.stringify(actual),
        dataTablePresent: !!card.querySelector(
          'details[class*="chart-series-"] table',
        ),
      };
    }),
  }));
}
export function assertAnalytics(report, expectedCharts = 6) {
  assert.ok(
    report.scroll <= report.client + 1,
    "Analytics page overflows horizontally",
  );
  assert.equal(report.charts.length, expectedCharts, "Missing chart cards");
  for (const chart of report.charts) {
    assert.equal(chart.invalidPaths, 0, chart.title + ": non-finite SVG path");
    assert.ok(
      chart.dataTablePresent,
      chart.title + ": missing exact-value alternative",
    );
    assert.ok(chart.tableMatches, chart.title + ": chart/table value mismatch");
    if (chart.hasNonzero) {
      assert.ok(
        chart.box?.width > 0 && chart.box?.height > 0,
        chart.title + ": zero chart dimensions",
      );
      assert.ok(
        chart.svg?.width > 0 && chart.svg?.height > 0,
        chart.title + ': SVG viewport is collapsed despite nonzero path geometry',
      );
      assert.ok(Math.abs(chart.svg.width - chart.box.width) <= 1,
        chart.title + ': SVG viewport does not match its visible container');
      assert.ok(
        Math.abs(chart.width - chart.box.width) <= 1,
        chart.title + ": stale responsive measurement",
      );
      assert.equal(
        chart.line ? chart.dots : chart.bars,
        chart.expectedMarks,
        chart.title + ": source values lack visible geometry",
      );
    } else
      assert.equal(
        chart.bars,
        0,
        chart.title + ": fabricated zero/missing-data bars",
      );
  }
  return { width: report.width, charts: report.charts.length, status: "PASS" };
}
