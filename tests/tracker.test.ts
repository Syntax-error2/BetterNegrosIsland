import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import {
  answerQuestion,
  questionKind,
  usableCoordinate,
  inNegrosOverview,
  projectReferences,
  filterContracts,
  contractsCsv,
  moneyExact,
  type TrackerIndex,
  type ContractRecord,
  type DocumentCatalogue,
} from "../src/lib/tracker";
import type { ScopeResult } from "../src/lib/scope";
import { sourceHref } from "../src/lib/safe-url";
import { readTracker } from "../src/lib/tracker-data";
import { parseTrackerQuestion } from "../src/lib/tracker-question";
const index: TrackerIndex = JSON.parse(
  fs.readFileSync("public/data/tracker/index.json", "utf8"),
);
const scope: ScopeResult = JSON.parse(
  fs.readFileSync(
    "public/data/snapshots/2026-11-02-37334582ca74/scope.json",
    "utf8",
  ),
);
const contracts: ContractRecord[] = Object.values(index.shards).flatMap((f) =>
  JSON.parse(fs.readFileSync("public" + f.path, "utf8")),
);
test("typed questions apply named scope and stage without broadening unknown requests", () => {
  const parsed = parseTrackerQuestion(
    "How much is proposed in the NEP for health facilities in Siquijor?",
  );
  assert.ok(!("error" in parsed));
  assert.equal(parsed.province, "siquijor");
  assert.equal(parsed.program, "hfep");
  assert.equal(parsed.stage, "nep");
  const answer = answerQuestion(scope.projects, parsed.kind, parsed, "nep");
  assert.equal(answer.total, 36_000_000);
  assert.equal(answer.stages.house.php, 100_000_000);
  const decreases = parseTrackerQuestion(
    "Which DPWH project amounts decreased in Negros Oriental?",
  );
  assert.ok(!("error" in decreases));
  assert.equal(decreases.direction, "decreased");
  const changes = answerQuestion(scope.projects, "changes", decreases, "house");
  assert.ok(changes.rows.every((row) => row.bridge_group === "decreased"));
  for (const input of [
    "Total for flood control in Siquijor",
    "House proposal total in San Enrique, Negros Oriental",
    "Total for DPWH or HFEP",
    "Total in Siquijor and Negros Oriental",
  ]) {
    assert.ok("error" in parseTrackerQuestion(input), input);
  }
});

test("contract lookup accepts a candidate GAA identity and amount order puts missing amounts last", () => {
  const matching = filterContracts(contracts, {
    q: "gaa:2026:310302100648000",
  });
  assert.ok(matching.some((row) => row.id === "26RJ0018"));
  const sample = matching.find((row) => row.id === "26RJ0018")!;
  const rows = filterContracts(
    [
      { ...sample, id: "missing", contract_php: null },
      sample,
      { ...sample, id: "zero", contract_php: 0 },
    ],
    { sort: "amount" },
  );
  assert.deepEqual(
    rows.map((row) => row.id),
    [sample.id, "zero", "missing"],
  );
});
test("imported tracker files match their checksums; protected snapshot stays intact", () => {
  for (const file of [
    ...Object.values(index.shards),
    index.documents,
    index.source_manifest,
    index.readme,
  ]) {
    const bytes = fs.readFileSync("public" + file.path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256);
    assert.equal(bytes.length, file.bytes);
  }
  const manifest = JSON.parse(
    fs.readFileSync("public/data/manifest.json", "utf8"),
  );
  for (const [path, hash] of Object.entries(manifest.checksums))
    assert.equal(
      createHash("sha256")
        .update(fs.readFileSync("public" + path))
        .digest("hex"),
      hash,
    );
  assert.equal(manifest.version, "2026-11-02-37334582ca74");
  assert.match(index.notice, /not payments/);
  assert.match(index.linking, /may be wrong/);
});
test("regional contracts are unique, source linked, correctly scoped and retain centavos", () => {
  assert.equal(contracts.length, 10878);
  assert.equal(new Set(contracts.map((c) => c.id)).size, contracts.length);
  assert.equal(
    contracts.reduce((n, c) => n + c.links.length, 0),
    4417,
  );
  for (const c of contracts) {
    assert.ok(c.year >= 2016 && c.year <= 2026);
    assert.ok(sourceHref(c.url));
    assert.equal(new URL(c.url).searchParams.get("project"), c.id);
    assert.ok(
      /^(Negros Occidental|Negros Oriental|Bacolod City|Siquijor)\b/i.test(
        c.office,
      ) || /^(NIR|Negros Island Region)$/i.test(c.region),
    );
    for (const link of c.links) {
      assert.ok(link.year >= 2020 && link.year <= 2026);
      assert.ok(link.method);
    }
  }
  assert.ok(
    contracts.some(
      (c) => c.contract_php !== null && !Number.isInteger(c.contract_php),
    ),
  );
  assert.match(moneyExact(4493588.96), /4,493,588.96/);
});
test("contract filters and export keep source context and actual zeros", () => {
  const known = contracts.find(
    (c) => c.contract_php !== null && !Number.isInteger(c.contract_php),
  )!;
  assert.equal(filterContracts(contracts, { q: known.id })[0].id, known.id);
  assert.ok(
    filterContracts(contracts, { linked: "yes" }).every((c) => c.links.length),
  );
  assert.ok(
    filterContracts(contracts, {
      year: "2026",
      status: "For Procurement",
    }).every((c) => c.year === 2026 && c.status === "For Procurement"),
  );
  assert.equal(
    filterContracts(contracts, { q: "no-such-contract-reference" }).length,
    0,
  );
  const csv = contractsCsv([known], index);
  assert.ok(csv.includes(String(known.contract_php)));
  assert.ok(csv.includes(index.notice));
  assert.ok(csv.includes(index.built_at));
  const hostile = { ...known, title: '=HYPERLINK("https://example.invalid")' };
  assert.match(contractsCsv([hostile], index), /'=HYPERLINK/);
});
test("map uses finite source coordinate pairs; references retain PDF pages and stages", () => {
  assert.equal(scope.projects.filter(usableCoordinate).length, 148);
  assert.equal(
    scope.projects.filter((p) => usableCoordinate(p) && !inNegrosOverview(p))
      .length,
    6,
  );
  for (const lat of [null, NaN, Infinity, 0, 80])
    assert.equal(usableCoordinate({ lat, lon: 123 }), false);
  assert.equal(usableCoordinate({ lat: 10, lon: null }), false);
  for (const p of scope.projects) {
    const refs = projectReferences(p);
    assert.ok(refs.length);
    for (const ref of refs) {
      assert.ok(sourceHref(ref.href));
      assert.ok(ref.page);
      assert.ok(!ref.document.includes("#"));
    }
  }
});
test("guided answers reconcile exact stage sums, missing values and duplicate identities", () => {
  const filters = { province: "siquijor", program: "hfep" };
  assert.equal(
    answerQuestion(scope.projects, "total", filters, "house").total,
    100000000,
  );
  assert.equal(
    answerQuestion(scope.projects, "total", filters, "nep").total,
    36000000,
  );
  assert.equal(
    answerQuestion(scope.projects, "total", { program: "nia" }, "house").total,
    null,
  );
  assert.equal(
    answerQuestion([...scope.projects, ...scope.projects], "total", {}, "house")
      .total,
    21378389000,
  );
  const changes = answerQuestion(scope.projects, "changes", {}, "house").rows;
  assert.ok(
    changes.every(
      (p) =>
        !p.held &&
        ["increased", "decreased"].includes(p.bridge_group) &&
        p.nep_php !== null &&
        p.house_php !== null,
    ),
  );
  const largest = answerQuestion(scope.projects, "largest", {}, "house").rows;
  assert.ok(
    largest.every(
      (p, i) => i === 0 || p.house_php! <= largest[i - 1].house_php!,
    ),
  );
});
test("guided parser rejects unsupported outcomes and supports explicit question categories", () => {
  assert.equal(questionKind("How much is proposed?"), "total");
  assert.equal(questionKind("Which are the largest?"), "largest");
  assert.equal(questionKind("Which amounts increased?"), "changes");
  assert.equal(questionKind("Where is the source PDF?"), "documents");
  for (const q of [
    "Who stole the money?",
    "How much was spent?",
    "Is it completed?",
    "Who is the contractor?",
    "What is the weather?",
  ])
    assert.equal(questionKind(q), null);
});
test("PDF catalogue identifies source copies without claiming independent verification", () => {
  const catalogue: DocumentCatalogue = JSON.parse(
    fs.readFileSync("public" + index.documents.path, "utf8"),
  );
  assert.equal(catalogue.data.length, 8);
  for (const doc of catalogue.data) {
    assert.match(doc.sha256, /^[a-f0-9]{64}$/);
    assert.ok(doc.bytes > 0);
    assert.ok(sourceHref(doc.pdf_url));
    assert.ok(doc.pages.from > 0 && doc.pages.to >= doc.pages.from);
  }
});
test("tracker loader rejects unsafe paths and corrupt or HTML data before display", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls++;
      return new Response("[]", {
        headers: { "content-type": "application/json" },
      });
    };
    await assert.rejects(
      readTracker({ path: "/data/../private.json", sha256: "", bytes: 0 }),
      /Unsafe/,
    );
    assert.equal(calls, 0);
    await assert.rejects(
      readTracker({
        path: index.documents.path,
        sha256: "0".repeat(64),
        bytes: 2,
      }),
      /checksum/,
    );
    globalThis.fetch = async () =>
      new Response("<html>not JSON</html>", {
        headers: { "content-type": "text/html" },
      });
    await assert.rejects(readTracker(index.documents), /could not be loaded/);
  } finally {
    globalThis.fetch = original;
  }
});
