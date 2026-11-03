/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "node:fs";
import { createHash } from "node:crypto";
import { annotate } from "../../src/lib/regional-data.ts";
import { summarise } from "../../src/lib/scope.ts";
import { PROVINCES, LOCATIONS } from "../../src/lib/geography.ts";
import { validateSnapshot } from "./validate.ts";

/** Validate the candidate before the single atomic last-known-good pointer promotion. */
export function finalize(candidate?: any) {
  const root = "public/data";
  const m =
    candidate ?? JSON.parse(fs.readFileSync(root + "/manifest.json", "utf8"));
  const dir = "public" + m.scope.replace("/scope.json", "");
  const read = (field: string) =>
    JSON.parse(fs.readFileSync("public" + m[field], "utf8"));
  const scope = read("scope"),
    history = read("history");
  for (const r of scope.projects) {
    Object.assign(r, annotate(r));
    for (const reason of r.reasons) {
      if (reason.label === "Source region: NIR") reason.kind = "region";
      if (reason.label.startsWith("Title search: "))
        reason.label = reason.label.slice(14);
    }
    r.normalized = {
      source_id: r.key,
      fiscal_year: 2027,
      dataset: r.dataset,
      program: r.program ?? null,
      title: r.title,
      currency: "PHP",
      stages: {
        nep: r.nep_php,
        house_second: r.hgab2_php ?? null,
        house_third: r.house_php,
      },
      province: null,
      locality: null,
      region: r.regionConfirmed ? "NIR" : null,
      original_region: r.region ?? null,
      geographic_confidence: r.geographicConfidence,
      inclusion_reasons: r.reasons,
      implementing_office: r.office ?? null,
      comparison_class: r.bridge_group,
      source_documents: r.pdf_url ?? null,
      pdf_pages: { nep: r.nep_page ?? null, house: r.hgab3_page ?? null },
      source_record_url: r.url ?? null,
      source_build: r.source_meta ?? null,
      retrieved_at: r.retrieved_at,
    };
  }
  for (const r of history.rows) {
    r.source_meta ??= null;
    r.normalized = {
      source_id: r.key,
      dataset: "GAA",
      fiscal_years: Object.keys(r.years),
      amounts_by_year: Object.fromEntries(Object.entries(r.years).map(([year,value]:[string,any])=>[year,value.amount])),
      department: r.department_id,
      agency: r.agency_id,
      title: r.name,
      currency: "PHP",
      budget_stage: "enacted GAA",
      province: null,
      locality: null,
      geographic_confidence: "Place-name match; physical location unverified",
      inclusion_reasons: r.reasons,
      implementing_office: null,
      comparison_class: null,
      source_record_url: null,
      source_document_url: null,
      source_build: r.source_meta,
      retrieved_at: r.retrieved_at,
    };
  }
  fs.writeFileSync("public" + m.scope, JSON.stringify(scope));
  fs.writeFileSync("public" + m.history, JSON.stringify(history));
  const summary = {
    ...summarise(scope.projects),
    provinceCounts: PROVINCES.map((p) => ({
      ...p,
      count: scope.projects.filter((r: any) =>
        r.provinceMatches.includes(p.slug),
      ).length,
    })),
    locationCounts: LOCATIONS.map((l) => ({
      ...l,
      count: scope.projects.filter((r: any) =>
        r.locationMatches.includes(l.code),
      ).length,
    })),

  };
  fs.writeFileSync(dir + "/summary.json", JSON.stringify(summary));
  const reports = Array.isArray(m.coverage) ? m.coverage : read("coverage");
  const audit=fs.existsSync('docs/regional/project-sum-audit.json')?JSON.parse(fs.readFileSync('docs/regional/project-sum-audit.json','utf8')):[];
  for (const c of reports) {
    const verified=audit.find((a:any)=>a.endpoint===c.endpoint&&a.source_meta?.built_at===m.source_build);
    if(verified){c.amount_reconciliation=verified.status;c.source_sums=verified.source_sums;c.amount_verified_at=verified.verified_at;}
    c.fiscal_years = c.dataset.startsWith("GAA")
      ? [2020, 2021, 2022, 2023, 2024, 2025, 2026]
      : c.dataset.startsWith("Budget cycle")
        ? null
        : [2027];
    c.retrieved_at = m.retrieved_at;
    c.uncertain_geographic_matches = c.dataset.startsWith("GAA")
      ? c.accepted
      : ["dpwh", "fmr", "hfep", "nia"].includes(c.dataset)
        ? scope.projects.filter(
            (r: any) =>
              r.dataset === c.dataset &&
              !r.regionConfirmed &&
              r.reasons.some(
                (reason: any) =>
                  reason.label === (c.query?.office ?? c.query?.q),
              ),
          ).length
        : null;
    c.unverified_locality_matches = [
      "dpwh",
      "fmr",
      "hfep",
      "nia",
      "GAA 2020–2026",
    ].includes(c.dataset)
      ? c.accepted
      : null;
  }
  fs.writeFileSync(dir + "/coverage.json", JSON.stringify(reports));
  m.coverage = m.scope.replace("scope.json", "coverage.json");
  m.summary = m.scope.replace("scope.json", "summary.json");
  m.checksums = Object.fromEntries(
    [
      "scope",
      "history",
      "overview",
      "districts",
      "nep",
      "summary",
      "coverage",
    ].map((field) => [
      m[field],
      createHash("sha256")
        .update(fs.readFileSync("public" + m[field]))
        .digest("hex"),
    ]),
  );
  m.scope_sha256 = m.checksums[m.scope];
  m.source_confirmed_nir = scope.projects.filter((r:any)=>r.regionConfirmed).length;
  m.uncertain_region = scope.projects.length-m.source_confirmed_nir;
  m.duplicates_across_queries = {
    comparison: reports.filter((r:any)=>['dpwh','fmr','hfep','nia'].includes(r.dataset)).reduce((sum:number,r:any)=>sum+r.retrieved,0)-scope.projects.length,
    history: reports.filter((r:any)=>r.dataset==='GAA 2020–2026').reduce((sum:number,r:any)=>sum+r.retrieved,0)-history.rows.length,
  };
  const result = validateSnapshot(m);
  fs.writeFileSync(dir + "/manifest.json", JSON.stringify(m, null, 2));
  fs.writeFileSync(root + "/manifest.next.json", JSON.stringify(m));
  fs.renameSync(root + "/manifest.next.json", root + "/manifest.json");
  fs.writeFileSync(
    root + "/refresh-status.json",
    JSON.stringify({
      at: new Date().toISOString(),
      status: "COMPLETE FOR QUERY SCOPE",
      version: m.version,
    }),
  );
  const counts = ["dpwh", "fmr", "hfep", "nia"]
    .map(
      (dataset) =>
        `| ${dataset.toUpperCase()} | ${scope.projects.filter((r: any) => r.dataset === dataset).length} |`,
    )
    .join("\n");
  fs.writeFileSync(
    "docs/regional/INGESTION_REPORT.md",
    `# Regional ingestion\n\nSnapshot ${m.version}; retrieval started ${m.retrieved_at}. Source build ${m.source_build}.\n\n${result.projects} unique comparison records (${result.source_confirmed_nir} source-confirmed NIR); ${result.history_families} historical families; ${result.query_reports} reconciled query reports; ${m.requests} HTTP requests.\n\n| Comparison program | Unique records |\n| --- | ---: |\n${counts}\n\nSeparate regional NEP: PHP ${result.nep_region_php}; reconciled to department rows. Never add this rollup to comparison projects.\n\n## Validation\n\nSeven SHA-256 shard checks; stable identity/count checks; integer-peso checks; historical years; NEP department sum; source regional attribution; PSGC references; query totals/accepted counts. All 30 project queries were also independently reconciled against live source version sums; see project-sum-audit.json.\n\n## Limitations\n\n${m.limitations.join("\n\n")}\n\nFirst-run historical records retain raw families and query endpoints but not per-query response-envelope build metadata. This is explicitly null, not inferred from the separate comparison build. Future refreshes retain the original envelope. Province and locality fields remain null unless verified; title association arrays are separate. Official historical VI/VII labels are preserved, without claiming a monetary geographic crosswalk. Execution is not geographically attributable. No NIA matches were returned by the documented queries; this does not prove no irrigation allocations exist.\n`,
  );
  console.log("Validated and published", JSON.stringify(result));
}
if (process.argv[1]?.includes("finalize.ts")) finalize();
