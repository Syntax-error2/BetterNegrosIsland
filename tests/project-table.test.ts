import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import ProjectTable from "../src/components/ProjectTable.tsx";
import { syntheticRows } from "../src/qa/fixtures.ts";
test("project results preserve full titles, exact values, native headers and escaped source text", () => {
  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(ProjectTable, {
        rows: syntheticRows.map((row, i) => i === 0 ? {...row, url: "https://budget.bettergov.ph/hgab/2027/overview"} : row),
        programName: () => "Synthetic test program",
      }),
    ),
  );
  assert.match(
    html,
    /Project details<\/th>.*Comparison status<\/th>.*NEP<\/th>.*House bill<\/th>.*Difference<\/th>.*Source action<\/th>/,
  );
  assert.match(
    html,
    /Construction of Multi-Purpose Building, Phase II, Barangay San Jose, Binalbagan, Negros Occidental, 10.197508, 122.898621/,
  );
  assert.match(html, /₱9,007,199,254,740,991/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.equal(
    (html.match(/class="source-cell"/g) ?? []).length,
    syntheticRows.length,
  );
});
