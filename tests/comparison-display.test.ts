import test from "node:test";
import assert from "node:assert/strict";
import {
  comparablePercent,
  exactDifference,
  sourceDocument,
} from "../src/lib/comparison-display.ts";
test("comparison percentages exclude uncertain, mismatched and absent baselines", () => {
  const paired = {
    held: false,
    bridge_group: "increased" as const,
    nep_php: 100,
    house_php: 150,
  };
  assert.equal(comparablePercent(paired), 50);
  assert.equal(comparablePercent({ ...paired, held: true }), null);
  assert.equal(
    comparablePercent({ ...paired, bridge_group: "scope_review" }),
    null,
  );
  assert.equal(comparablePercent({ ...paired, nep_php: 0 }), null);
  assert.equal(comparablePercent({ ...paired, house_php: null }), null);
});
test("exact financial display keeps full pesos, zero and missing differences distinct", () => {
  assert.equal(exactDifference(0), "₱0");
  assert.equal(exactDifference(null), "Not available");
  assert.equal(exactDifference(1234567890), "+₱1,234,567,890");
  assert.equal(exactDifference(-1234567890), "−₱1,234,567,890");
});
test("document actions choose a safe published URL and never create a dead hash fallback", () => {
  const row = {
    pdf_url: {
      hgab3: "javascript:alert(1)",
      hgab2: null,
      nep: "https://budget-assets.bettergov.ph/nep.pdf#page=8",
      api: null,
    },
    url: "https://budget.bettergov.ph/hgab/2027/dpwh/p/test",
  };
  assert.equal(sourceDocument(row), row.url);
  assert.equal(sourceDocument({...row, url: "https://evil.invalid/"}), "https://budget-assets.bettergov.ph/nep.pdf#page=8");
  assert.equal(
    sourceDocument({
      ...row,
      pdf_url: { ...row.pdf_url, nep: null },
      url: "data:text/html,test",
    }),
    null,
  );
});
