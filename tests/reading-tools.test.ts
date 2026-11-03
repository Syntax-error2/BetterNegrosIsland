import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  TOPICS,
  topicFor,
  qualityFlags,
  explainRecord,
  snapshotChanges,
  communitySummary,
} from "../src/lib/citizen-insights";
import {
  emptyNotebook,
  parseNotebook,
  safeSearchPath,
  writeNotebook,
  loadNotebook,
  NOTEBOOK_KEY,
} from "../src/lib/notebook";
import { normalizeHearingHits } from "../src/lib/hearings";
import { buildReadingData } from "../scripts/build-reading-data";
import type { ScopedProject } from "../src/lib/scope";
const manifest = JSON.parse(
  fs.readFileSync("public/data/manifest.json", "utf8"),
);
const rows: ScopedProject[] = JSON.parse(
  fs.readFileSync("public" + manifest.scope, "utf8"),
).projects;
const p = rows[0];

test("topic groups partition the source records by program, without inferring services from a title", () => {
  assert.equal(
    TOPICS.reduce(
      (n, t) => n + rows.filter((p) => topicFor(p) === t.id).length,
      0,
    ),
    rows.length,
  );
  assert.equal(
    topicFor({ ...p, dataset: "hfep", title: "Road bridge" }),
    "health",
  );
  assert.equal(
    topicFor({ ...p, dataset: "dpwh", program: null, title: "Hospital" }),
    "other",
  );
  assert.equal(
    topicFor({
      ...p,
      dataset: "dpwh",
      program: "Local Program",
      title: "Office building",
    }),
    "other",
  );
  assert.equal(communitySummary([...rows, rows[0]]).total, rows.length);
});
test("explanations preserve zero, missing values, exact differences and source-marked uncertainty", () => {
  assert.ok(
    explainRecord({ ...p, nep_php: 0, house_php: 100, held: false }).some(
      (t) => t.includes("₱100") && t.includes("higher"),
    ),
  );
  assert.ok(
    explainRecord({ ...p, nep_php: null, house_php: 100 }).some((t) =>
      t.includes("Missing values are not zero"),
    ),
  );
  assert.ok(
    !explainRecord({ ...p, held: true, nep_php: 0, house_php: 100 }).some((t) =>
      t.includes("higher than"),
    ),
  );
  assert.throws(() => explainRecord({ ...p, nep_php: NaN }), /Unsafe/);
});
test("quality notes flag uncertainty without relabeling source data or classifying missing as zero", () => {
  const example = {
    ...p,
    regionConfirmed: true,
    region_key: "NIR",
    title: "Building in Virac, Catanduanes",
    held: true,
    nep_php: null,
    house_php: 0,
  };
  const before = JSON.stringify(example);
  assert.ok(qualityFlags(example).includes("geography"));
  assert.ok(qualityFlags(example).includes("missing"));
  assert.ok(qualityFlags(example).includes("pairing"));
  assert.equal(JSON.stringify(example), before);
  assert.ok(
    !qualityFlags({
      ...example,
      title: "Building in Isabela, Negros Occidental",
      held: false,
      nep_php: 0,
    }).includes("geography"),
  );
});
test("snapshot comparison separates source changes from retrieval metadata and preserves before/after values", () => {
  assert.deepEqual(
    snapshotChanges([p], [{ ...p, retrieved_at: "new date" }]),
    [],
  );
  const changed = snapshotChanges([p], [{ ...p, house_php: 123 }]);
  assert.equal(changed[0].kind, "revised");
  assert.equal(changed[0].before?.house_php, p.house_php);
  assert.equal(changed[0].after?.house_php, 123);
  const moved = { ...p, key: p.dataset + ":new-id", id: "new-id" };
  const result = snapshotChanges([p], [moved]);
  assert.deepEqual(
    result.map((c) => c.kind),
    ["added", "removed"],
  );
  assert.throws(
    () => snapshotChanges([p, { ...p, house_php: 123 }], []),
    /Conflicting/,
  );
});
test("saved searches cannot become external navigation, retain unknown query fields or exceed limits", () => {
  for (const invalid of [
    "//evil.test/projects",
    "https://evil.test",
    "/projects/../privacy",
    "/projects?x=1#fragment",
    "/projects\\evil",
    "/privacy",
  ])
    assert.equal(safeSearchPath(invalid), null);
  assert.equal(
    safeSearchPath("/projects?q=flood&topic=health&secret=omit"),
    "/projects?q=flood&topic=health",
  );
  const value = parseNotebook(
    JSON.stringify({
      version: 1,
      records: [p.key, p.key, "invalid"],
      searches: [
        { path: "/projects?q=bridge", label: "Bridge" },
        { path: "https://evil.test", label: "Unsafe" },
      ],
    }),
  );
  assert.deepEqual(value.records, [p.key]);
  assert.equal(value.searches.length, 1);
  assert.deepEqual(parseNotebook("{"), emptyNotebook());
  const map = new Map<string, string>();
  const storage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
  writeNotebook(storage, value);
  assert.deepEqual(loadNotebook(storage), value);
  writeNotebook(storage, emptyNotebook());
  assert.ok(!map.has(NOTEBOOK_KEY));
  assert.throws(
    () =>
      writeNotebook(
        {
          setItem() {
            throw Error("blocked");
          },
          removeItem() {
            throw Error("blocked");
          },
        },
        value,
      ),
    /blocked/,
  );
});
test("hearing index requires FY2027, matched geographic moments and trusted timestamped source links", () => {
  const row = {
    hearing: {
      video_id: "abc",
      title: "Hearing",
      agency: "DOH",
      fiscal_year: "2027",
      hearing_date: "2026-09-01",
    },
    topic: {
      index: 1,
      topic: "Hospitals",
      url: "https://budget.bettergov.ph/hearings/abc?t=60",
    },
    matching_moments: [
      {
        seconds: 60,
        timestamp: "1:00",
        speaker: "Agency official",
        said: "Hospital in Negros Occidental",
        url: "https://budget.bettergov.ph/hearings/abc?t=60",
      },
      {
        seconds: 70,
        timestamp: "1:10",
        speaker: "Agency official",
        said: "Other places",
        url: "https://budget.bettergov.ph/hearings/abc?t=70",
      },
    ],
  };
  const result = normalizeHearingHits([row], "Negros");
  assert.equal(result[0].moments.length, 1);
  assert.throws(
    () =>
      normalizeHearingHits(
        [{ ...row, hearing: { ...row.hearing, fiscal_year: "2026" } }],
        "Negros",
      ),
    /schema/,
  );
  assert.throws(
    () =>
      normalizeHearingHits(
        [
          {
            ...row,
            matching_moments: [
              { ...row.matching_moments[0], url: "javascript:alert(1)" },
            ],
          },
        ],
        "Negros",
      ),
    /source/,
  );
  assert.deepEqual(normalizeHearingHits([row], "Siquijor"), []);
});
test("first retained snapshot is a baseline; a corrupt prior scope cannot replace the update index", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bni-reading-test-"));
  try {
    const data = path.join(root, "public/data"),
      dir = path.join(data, "snapshots/baseline");
    fs.mkdirSync(dir, { recursive: true });
    const raw = JSON.stringify({ projects: [p] });
    const m = {
      version: "baseline",
      retrieved_at: "2026-11-01T00:00:00Z",
      source_build: "2026-10-26",
      history_count: 1,
      scope: "/data/snapshots/baseline/scope.json",
      scope_sha256: createHash("sha256").update(raw).digest("hex"),
    };
    fs.writeFileSync(path.join(dir, "scope.json"), raw);
    fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(m));
    fs.writeFileSync(path.join(data, "manifest.json"), JSON.stringify(m));
    const output = buildReadingData(root);
    assert.equal(output.receipts[0].changes, null);
    assert.equal(output.receipts[0].counts, null);
    const before = fs.readFileSync(
      path.join(data, "update-history.json"),
      "utf8",
    );
    fs.writeFileSync(path.join(dir, "scope.json"), "{}");
    assert.throws(() => buildReadingData(root), /checksum/);
    assert.equal(
      fs.readFileSync(path.join(data, "update-history.json"), "utf8"),
      before,
    );
  } finally {
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith("bni-reading-test-"));
    fs.rmSync(root, { recursive: true, force: true });
  }
});
