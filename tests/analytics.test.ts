import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  analyticsSelection,
  chartModel,
  chartExtent,
  chartNumber,
  amountRanking,
  ANALYTICS_STATUSES,
  COMPARISON_NAMES,
} from "../src/lib/analytics-data";
import type { ScopedProject } from "../src/lib/scope";
import { percentage } from "../src/lib/regional-data";
import { phpFull } from "../src/lib/format";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { SourceAttribution } from "../src/components/ChartCard";

const manifest = JSON.parse(readFileSync("public/data/manifest.json", "utf8"));
const source = JSON.parse(readFileSync("public" + manifest.scope, "utf8"));
const projects: ScopedProject[] = source.projects;
test("analytics source union reconciles exact version amounts and all six classifications", () => {
  const a = analyticsSelection(projects);
  assert.equal(a.rows.length, 866);
  assert.equal(a.summary.nep.php, 19667189000);
  assert.equal(a.summary.house.php, 21378389000);
  assert.deepEqual(
    a.byStatus.map((r) => r.Records),
    [11, 11, 581, 232, 27, 4],
  );
  assert.equal(
    a.byStatus.reduce((sum, r) => sum + r.Records, 0),
    866,
  );
  assert.equal(a.summary.unconfirmed, 14);
  assert.deepEqual(
    a.byStatus.map((r) => r.label),
    ANALYTICS_STATUSES.map((s) => COMPARISON_NAMES[s]),
  );
});
test("program mapping preserves missing NIA amounts and province counts remain title associations", () => {
  const a = analyticsSelection(projects);
  assert.deepEqual(
    a.byProgram.map((r) => r.label),
    ["DPWH", "FMR", "HFEP", "NIA"],
  );
  assert.deepEqual(a.byProgram[3], { label: "NIA", NEP: null, House: null });
  assert.deepEqual(
    a.byProvince.map((r) => r.Records),
    [432, 189, 74],
  );
  assert.equal(
    a.byProgram.reduce((sum, r) => sum + (r.House ?? 0), 0),
    a.summary.house.php,
  );
});
test("geographic and program filters preserve exact Siquijor hospital amounts and original identities", () => {
  const a = analyticsSelection(projects, {
    province: "siquijor",
    program: "hfep",
  });
  assert.equal(a.rows.length, 2);
  assert.equal(a.summary.nep.php, 36000000);
  assert.equal(a.summary.house.php, 100000000);
  assert.ok(a.rows.every((r) => projects.includes(r)));
  assert.equal(
    analyticsSelection(projects, { lgu: "1804510000" }).rows.length,
    5,
  );
});
test("duplicate identities cannot inflate the analytics union; conflicting duplicates fail closed", () => {
  assert.equal(analyticsSelection([...projects, projects[0]]).rows.length, 866);
  assert.throws(
    () => analyticsSelection([projects[0], { ...projects[0], house_php: 1 }]),
    /Conflicting duplicate/,
  );
});
test("chart normalization supplies every category key for bars and ranks without mutating source", () => {
  const rows = [
    { label: "Full source title", Amount: 1234567890123 },
    { label: "Zero", Amount: 0 },
    { label: "Missing", Amount: null },
  ];
  const regular = chartModel(rows, ["Amount"]);
  const ranked = chartModel(rows, ["Amount"], true);
  assert.deepEqual(
    regular.map((r) => r.axisLabel),
    rows.map((r) => r.label),
  );
  assert.deepEqual(
    ranked.map((r) => r.axisLabel),
    ["#1", "#2", "#3"],
  );
  assert.equal(ranked[0].Amount, 1234567890123);
  assert.equal(phpFull(ranked[0].Amount as number), "₱1,234,567,890,123");
  assert.equal("axisLabel" in rows[0], false);
});
test("non-numeric and non-finite chart inputs remain missing; genuine zero and negative values survive", () => {
  for (const value of [null, undefined, "100", "₱100", NaN, Infinity])
    assert.equal(chartNumber(value), null);
  assert.equal(chartNumber(0), 0);
  assert.equal(chartNumber(-25), -25);
  assert.deepEqual(chartExtent([{ label: "A", Amount: null }], ["Amount"]), {
    hasValues: false,
    hasNonzero: false,
    minimum: 0,
    maximum: 0,
  });
  assert.deepEqual(chartExtent([{ label: "A", Amount: 0 }], ["Amount"]), {
    hasValues: true,
    hasNonzero: false,
    minimum: 0,
    maximum: 0,
  });
  assert.equal(
    chartExtent([{ label: "A", Amount: -25 }], ["Amount"]).minimum,
    -25,
  );
});
test("ranking keeps zero above missing and budget percentage never uses absent or zero denominators", () => {
  assert.deepEqual(
    amountRanking(
      [
        { label: "Missing", Amount: null },
        { label: "Small", Amount: 20 },
        { label: "Large", Amount: 100 },
        { label: "Zero", Amount: 0 },
      ],
      "Amount",
    ).map((r) => r.label),
    ["Large", "Small", "Zero", "Missing"],
  );
  assert.equal(percentage(0, 100), null);
  assert.equal(percentage(null, 100), null);
  assert.equal(percentage(100, 0), -100);
});
test("empty filter results preserve categories without manufacturing amounts or counts", () => {
  const a = analyticsSelection(projects, { program: "nia" });
  assert.equal(a.rows.length, 0);
  assert.ok(a.byProgram.every((r) => r.NEP === null && r.House === null));
  assert.ok(a.byProvince.every((r) => r.Records === 0));
  assert.equal(a.byStatus.length, 6);
  assert.ok(a.byStatus.every((r) => r.Records === 0));
  assert.throws(
    () =>
      analyticsSelection([
        { ...projects[0], nep_php: Number.MAX_SAFE_INTEGER + 1 },
      ]),
    /Unsafe peso/,
  );
  assert.throws(
    () =>
      analyticsSelection([
        {
          ...projects[0],
          dataset: "dpwh",
          id: "large-a",
          nep_php: Number.MAX_SAFE_INTEGER,
        },
        { ...projects[0], dataset: "hfep", id: "large-b", nep_php: 1 },
      ]),
    /Unsafe peso/,
  );
});
test("shared chart attribution names the real provider, stage and coverage route without fake freshness", () => {
  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(SourceAttribution, {
        stage: "Historical GAA appropriations",
      }),
    ),
  );
  assert.match(html, /BetterGov\.PH/);
  assert.match(html, /Historical GAA appropriations/);
  assert.match(html, /href="\/data-coverage"/);
  assert.match(html, /metadata unavailable or loading/);
  assert.doesNotMatch(html, /Up to date|Live snapshot/);
});
