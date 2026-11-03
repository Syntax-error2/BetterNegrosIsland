/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "node:fs";
import { finalize } from "./finalize.ts";
import { validateSnapshot } from "./validate.ts";
import { retryDelay } from './retry.ts';
import { createHash } from "node:crypto";
import { createClient } from "../../src/api/client.ts";
import { PROVINCES, LOCATIONS, localityTerm } from "../../src/lib/geography.ts";
import {
  annotate,
  safeSum,
  validateRows,
  validateProjectSums,
} from "../../src/lib/regional-data.ts";
const base = "https://budget.bettergov.ph";
const root = "public/data";
fs.mkdirSync(root, { recursive: true });
fs.mkdirSync("docs/regional/runs", { recursive: true });
const mode = process.argv[2] ?? "refresh";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let calls = 0;
let expectedBuild:string|null=null;
const request = async <T>(
  route: string,
  params: Record<string, string | number> = {},
): Promise<T> => {
  const url = new URL(route, base);
  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.set(k, String(v)),
  );
  for (let n = 0; n < 4; n++) {
    calls++;
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent":
          "BetterNegrosIsland/0.2 public-budget-ingestion (read-only; conservative refresh)",
      },
      signal: AbortSignal.timeout(30000),
    }).catch(() => null);
    if (res?.ok) {
      await delay(60);
      return (await res.json()) as T;
    }
    if (res && ![429, 500, 502, 503, 504].includes(res.status))
      throw Error(url + " HTTP " + res.status);
    await delay(retryDelay(res?.headers.get('retry-after')??null,n));
  }
  throw Error("Retries exhausted: " + url);
};
// Reuse upstream pagination and integrity checks with bounded, identified transport.

const api = createClient(base);
// Methods below implement the same published offset/cursor protocols with no regional safety truncation.
const coverage: any[] = [];
async function projects(ds: string, params: Record<string, string>) {
  const route = "/api/v1/hgab/2027/datasets/" + ds + "/projects";
  let offset = 0,
    first: any;
  const rows: any[] = [];
  const seen = new Set<number>();
  do {
    if (seen.has(offset)) throw Error("Repeated offset");
    seen.add(offset);
    const page: any = await request(route, { ...params, limit: 200, offset });
    first ??= page;
    if(page.meta?.built_at!==expectedBuild)throw Error('Comparison source build changed during extraction');
    if (
      !Array.isArray(page.data?.rows) ||
      !Number.isSafeInteger(page.data.total) ||
      page.data.total !== first.data.total
    )
      throw Error("Invalid/inconsistent project page");
    rows.push(...page.data.rows);
    const next = page.data.next_offset;
    offset = next == null ? first.data.total : Number(next);
    if (page.data.rows.length === 0 && rows.length < first.data.total)
      throw Error("Empty page before total");
  } while (rows.length < first.data.total);
  if (
    rows.length !== first.data.total ||
    new Set(rows.map((r) => r.id)).size !== rows.length
  )
    throw Error("Project count mismatch");
  validateRows(rows);
  validateProjectSums(rows,first.data.sums);
  coverage.push({
    dataset: ds,
    query: params,
    endpoint: api.href(route, params),
    source: first.data.total,
    retrieved: rows.length,
    accepted: rows.length,
    duplicates: 0,
    rejected: 0,
    remaining: 0,
    status: "COMPLETE FOR QUERY SCOPE",
    source_sums: first.data.sums,
    amount_reconciliation: 'RECONCILED',
  });
  return { rows, first };
}
async function main() {
  if (mode === "validate" || mode === "report") {
    const m = JSON.parse(fs.readFileSync(root + "/manifest.json", "utf8"));
    const result = validateSnapshot(m);
    if (mode === "report") finalize(m);
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  const spec: any = await request("/api/v1/openapi.json");
  fs.writeFileSync("docs/regional/openapi.json", JSON.stringify(spec, null, 2));
  if (mode === "discover") {
    fs.writeFileSync(
      "docs/regional/discovery.json",
      JSON.stringify(
        { at: new Date().toISOString(), paths: spec.paths },
        null,
        2,
      ),
    );
    console.log(Object.keys(spec.paths).join("\n"));
    return;
  }
  const at = new Date().toISOString();
  const overview: any = await request("/api/v1/hgab/2027");
  if(typeof overview.meta?.built_at!=='string'||!Number.isFinite(Date.parse(overview.meta.built_at))||typeof overview.meta?.source_commit!=='string'||!overview.meta.source_commit)
    throw Error('Missing or invalid comparison source revision; candidate cannot be verified');
  expectedBuild=overview.meta.built_at;
  const districtList: any = await request("/api/v1/hgab/2027/districts", {
    region: "NIR",
    limit: 200,
    offset: 0,
  });
  if (districtList.data.total !== districtList.data.districts.length)
    throw Error("District discovery requires additional pages");
  const districts: any[] = [];
  for (const d of districtList.data.districts) {
    districts.push(
      await request("/api/v1/hgab/2027/districts/" + encodeURIComponent(d.id)),
    );
  }
  const offices = [
    ...new Set(
      districts.flatMap((d) =>
        d.data.offices
          .map(
            (o: any) =>
              o.years.find((y: any) => y.fy === 2027 && y.stage === "hgab3")
                ?.matched_label,
          )
          .filter(Boolean),
      ),
    ),
  ];
  const byKey = new Map<string, any>();
  const disclaimers = new Map<string, any>();
  const queries: any[] = [];
  const add = (rows: any[], first: any, reason: any) => {
    for (const d of first.disclaimers ?? []) disclaimers.set(d.id, d);
    for (const row of rows) {
      const key = row.dataset + ":" + row.id;
      let p = byKey.get(key);
      if (!p) {
        p = {
          ...row,
          key,
          reasons: [],
          raw: row,
          retrieved_at: at,
          source_meta: first.meta,
          ...annotate(row),
        };
        byKey.set(key, p);
      }
      if (
        !p.reasons.some(
          (r: any) => r.kind === reason.kind && r.label === reason.label,
        )
      )
        p.reasons.push(reason);
    }
  };
  for (const ds of ["dpwh", "fmr", "hfep", "nia"]) {
    const r = await projects(ds, { region: "NIR" });
    add(r.rows, r.first, { kind: "place", label: "Source region: NIR" });
    console.log(ds, "NIR", r.rows.length);
  }
  for (const office of offices) {
    const r = await projects("dpwh", { office: String(office) });
    add(r.rows, r.first, { kind: "office", label: office });
    queries.push({
      kind: "office",
      label: office,
      dataset: "dpwh",
      params: { office },
      total: r.rows.length,
      kept: r.rows.length,
      truncated: false,
      api: api.href("/datasets/dpwh/projects", { office: String(office) }),
      officeLens: r.first.data.office_lens,
    });
  }
  // Province-qualified titles supplement records without region metadata (especially NIA).
  for (const q of [
    "Negros Occidental",
    "Negros Oriental",
    "Siquijor",
    "Bacolod",
  ])
    for (const ds of ["dpwh", "fmr", "hfep", "nia"]) {
      const r = await projects(ds, { q });
      add(r.rows, r.first, { kind: "place", label: "Title search: " + q });
    }
  const scope = {
    projects: [...byKey.values()],
    queries,
    excluded: [],
    disclaimers: [...disclaimers.values()],
    meta: overview.meta,
  };
  const nepRegions: any = await request("/api/v1/nep/2027/rollups/region", {
    limit: 2000,
  });
  const nepRegion = nepRegions.data.find((r: any) => r.code === "18");
  if (!nepRegion || !/negros/i.test(nepRegion.description))
    throw Error("NEP NIR not verified");
  const nepDepartments: any = await request("/api/v1/nep/2027/rollups/region", {
    code: "18",
    by: "department",
    limit: 2000,
  });
  if (
    safeSum(nepDepartments.data.map((r: any) => r.amount)) !== nepRegion.amount
  )
    throw Error("NEP region department reconciliation failed");
  coverage.push({
    dataset: "NEP region 18",
    endpoint: base + "/api/v1/nep/2027/rollups/region?code=18&by=department",
    source: nepDepartments.data.length,
    retrieved: nepDepartments.data.length,
    accepted: nepDepartments.data.length,
    duplicates: 0,
    rejected: 0,
    remaining: 0,
    status: "COMPLETE FOR QUERY SCOPE",
  });
  const cycle: any = await request("/api/v1/budget-cycle");
  coverage.push({
    dataset: "Budget cycle execution",
    endpoint: base + "/api/v1/budget-cycle",
    source: null,
    retrieved: 0,
    accepted: 0,
    duplicates: 0,
    rejected: 0,
    status: "NOT GEOGRAPHICALLY ATTRIBUTABLE",
    note: "Department/agency series have no supported local geographic filter. No regional disbursement is inferred.",
  });
  const deps: any = await request("/api/v1/gaa/departments");
  const historyRows = new Map<string, any>(),
    historyQueries: any[] = [];
  const searches = [
    ...new Set([
      ...PROVINCES.map((p) => p.name),
      "Bacolod",
      ...LOCATIONS.map(
        (l) =>
          localityTerm(l.name) +
          " " +
          PROVINCES.find((p) => p.slug === l.province)!.name,
      ),
    ]),
  ];
  for (const q of searches) {
    for (let i = 0; i < deps.data.length; i += 3) {
      await Promise.all(
        deps.data.slice(i, i + 3).map(async (d: any) => {
          const route = "/api/v1/gaa/departments/" + d.id + "/programs";
          let cursor: any;
          let first: any;
          const rows: any[] = [];
          const cursors = new Set<string>();
          do {
            const page: any = await request(route, {
              q,
              limit: 500,
              ...(cursor ? { cursor } : {}),
            });
            first ??= page;
            if (!Array.isArray(page.data)) throw Error("Invalid GAA response");
            rows.push(...page.data);
            cursor = page.next_cursor;
            if (cursor && cursors.has(cursor)) throw Error("GAA cursor cycle");
            if (cursor) cursors.add(cursor);
          } while (cursor);
          if (first.meta.matched != null && first.meta.matched !== rows.length)
            throw Error("GAA count mismatch");
          if (new Set(rows.map((r) => r.fam_key)).size !== rows.length)
            throw Error("GAA duplicate key");
          const sum = safeSum(rows.map((r) => r.years?.["2026"]?.amount ?? 0));
          if (
            first.meta.matched_amount != null &&
            sum !== first.meta.matched_amount
          )
            throw Error("GAA 2026 reconciliation failed");
          if (rows.length) {
            historyQueries.push({
              place: q,
              q,
              department_id: d.id,
              department: d.description,
              matched: rows.length,
              fetched: rows.length,
              truncated: false,
              api: api.href(route, { q }),
            });
            for (const r of rows) {
              for (const y of Object.values(r.years) as any[])
                if (!Number.isSafeInteger(y.amount))
                  throw Error("Unsafe historical money");
              const key = "gaa:" + r.fam_key;
              const prior = historyRows.get(key);
              if (prior) {
                if (!prior.reasons.includes(q)) prior.reasons.push(q);
              } else
                historyRows.set(key, {
                  ...r,
                  key,
                  department: d.description,
                  reasons: [q],
                  raw: r,
                  source_meta: first.meta ?? null,
                  retrieved_at: at,
                });
            }
          }
          coverage.push({
            dataset: "GAA 2020–2026",
            query: { q, department: d.id },
            endpoint: api.href(route, { q }),
            source: rows.length,
            retrieved: rows.length,
            accepted: rows.length,
            duplicates: 0,
            rejected: 0,
            remaining: 0,
            status: "COMPLETE FOR QUERY SCOPE",
          });
        }),
      );
    }
    console.log("history", q, historyRows.size);
  }
  const history = {
    rows: [...historyRows.values()],
    queries: historyQueries,
    searched: deps.data.length,
    departments: deps.data,
    excluded: [],
  };
  const hash = createHash("sha256")
    .update(JSON.stringify(scope))
    .digest("hex")
    .slice(0, 12);
  const version = at.slice(0, 10) + "-" + hash;
  const dir = root + "/snapshots/" + version;
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, data] of Object.entries({
    scope,
    overview,
    districts,
    history,
    nep: {
      region: nepRegion,
      departments: nepDepartments.data,
      meta: nepRegions.meta,
    },
    cycle,
  }))
    fs.writeFileSync(dir + "/" + name + ".json", JSON.stringify(data));
  const manifest = {
    version,
    retrieved_at: at,
    source_build: overview.meta.built_at,
    source_commit: overview.meta.source_commit,
    scope: "/data/snapshots/" + version + "/scope.json",
    overview: "/data/snapshots/" + version + "/overview.json",
    districts: "/data/snapshots/" + version + "/districts.json",
    history: "/data/snapshots/" + version + "/history.json",
    nep: "/data/snapshots/" + version + "/nep.json",
    project_count: scope.projects.length,
    history_count: history.rows.length,
    coverage,
    requests: calls,
    limitations: [
      "Complete only for the documented source queries, not the whole government budget.",
      "Historical province-qualified title searches can miss records without geographic names.",
      "PSGC accessible city/municipality lists dated July 2025; latest workbook blocked.",
      "Province/locality matches are title associations, not independently verified physical locations.",
    ],
  };
  fs.writeFileSync(dir + "/manifest.json", JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    "docs/regional/INGESTION_REPORT.md",
    "# Regional ingestion\n\nSnapshot " +
      version +
      "\n\n" +
      scope.projects.length +
      " unique comparison records; " +
      history.rows.length +
      " historical families. " +
      coverage.length +
      " query reports. NEP region reconciled.\n\n" +
      manifest.limitations.join("\n\n"),
  );
  finalize(manifest);
  console.log("PUBLISHED", version, scope.projects.length, history.rows.length);
}
main().catch((e) => {
  fs.writeFileSync(
    "docs/regional/runs/failure-" + Date.now() + ".json",
    JSON.stringify({
      at: new Date().toISOString(),
      error: String(e),
      requests: calls,
    }),
  );
  fs.writeFileSync(
    root + "/refresh-status.json",
    JSON.stringify({
      at: new Date().toISOString(),
      status: "FAILED",
      requests: calls,
      note: "Last successful snapshot preserved.",
    }),
  );
  console.error(e);
  process.exitCode = 1;
});
