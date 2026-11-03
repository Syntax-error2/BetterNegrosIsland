/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "node:fs";
import { createHash } from "node:crypto";
import { safeSum, validateRows, validateProjectSums } from "../../src/lib/regional-data.ts";
import { LOCATIONS } from "../../src/lib/geography.ts";
export function validateSnapshot(m: any) {
  const read = (field: string) =>
    JSON.parse(fs.readFileSync("public" + m[field], "utf8"));
  for (const [url, expected] of Object.entries(m.checksums ?? {})) {
    if (
      createHash("sha256")
        .update(fs.readFileSync("public" + url))
        .digest("hex") !== expected
    )
      throw Error("Checksum mismatch: " + url);
  }
  const s = read("scope"),
    h = read("history"),
    n = read("nep");
  validateRows(s.projects);
  if (
    s.projects.length !== m.project_count ||
    new Set(s.projects.map((p: any) => p.key)).size !== s.projects.length
  )
    throw Error("Project identity/count mismatch");
  if (
    h.rows.length !== m.history_count ||
    new Set(h.rows.map((r: any) => r.fam_key)).size !== h.rows.length
  )
    throw Error("Historical identity/count mismatch");
  for (const row of s.projects) {
    if (!row.raw || !row.retrieved_at || !row.source_meta)
      throw Error("Missing project provenance");
    if (row.regionConfirmed !== (row.region_key === "NIR"))
      throw Error("Incorrect regional attribution");
    for (const code of row.locationMatches ?? [])
      if (!LOCATIONS.some((l) => l.code === code))
        throw Error("Unknown PSGC code");
  }
  for (const row of h.rows) {
    if (!row.raw || !row.retrieved_at)
      throw Error("Missing historical provenance");
    for (const [year, value] of Object.entries(row.years) as [string, any][]) {
      if (
        !/^202[0-6]$/.test(year) ||
        !Number.isSafeInteger(value.amount) ||
        !Number.isSafeInteger(value.count)
      )
        throw Error("Invalid historical amount/year");
    }
  }
  if (safeSum(n.departments.map((r: any) => r.amount)) !== n.region.amount)
    throw Error("NEP regional reconciliation failed");
  const coverage = Array.isArray(m.coverage) ? m.coverage : read("coverage");
  for(const c of coverage.filter((r:any)=>['dpwh','fmr','hfep','nia'].includes(r.dataset))) {
    const rows=s.projects.filter((r:any)=>r.dataset===c.dataset&&(c.query.region?r.region_key==='NIR':r.reasons.some((reason:any)=>reason.label===(c.query.office??c.query.q))));
    if(rows.length!==c.accepted)throw Error('Query membership mismatch');
    validateProjectSums(rows,c.source_sums??{});
  }
  for (const c of coverage)
    if (
      c.status === "COMPLETE FOR QUERY SCOPE" &&
      (c.source !== c.retrieved ||
        c.retrieved !== c.accepted ||
        c.rejected !== 0 ||
        c.remaining !== 0)
    )
      throw Error("Incomplete query promoted as complete");
  if (new Set(LOCATIONS.map((l) => l.code)).size !== 63)
    throw Error("Directory code mismatch");
  return {
    version: m.version,
    projects: s.projects.length,
    source_confirmed_nir: s.projects.filter((r: any) => r.regionConfirmed)
      .length,
    history_families: h.rows.length,
    query_reports: coverage.length,
    nep_region_php: n.region.amount,
    checksums: Object.keys(m.checksums ?? {}).length,
  };
}
