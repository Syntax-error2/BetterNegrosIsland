import { LOCATIONS, PROVINCES, localityTerm } from "./geography";
import type { ProjectRow } from "../api/types";
export function safeSum(values: readonly number[]): number {
  return values.reduce((sum, n) => {
    if (!Number.isSafeInteger(n) || !Number.isSafeInteger(sum + n))
      throw Error("Unsafe peso amount");
    return sum + n;
  }, 0);
}
export function percentage(
  before: number | null,
  after: number | null,
): number | null {
  return before == null || after == null || before === 0
    ? null
    : ((after - before) / before) * 100;
}
export function validateRows(rows: ProjectRow[]) {
  for (const r of rows) {
    if (
      !r.id ||
      !r.title ||
      !["dpwh", "fmr", "hfep", "nia"].includes(r.dataset)
    )
      throw Error("Invalid source record");
    for (const v of [r.nep_php, r.house_php, r.delta_php])
      if (v != null && !Number.isSafeInteger(v))
        throw Error("Unsafe source money");
  }
}
export function validateProjectSums(rows: ProjectRow[], sums: Record<string,number|null>) {
  for(const key of ['nep_php','hgab2_php','hgab3_php'] as const) {
    const values=rows.map(r=>r[key]).filter((v):v is number=>v!=null);
    const actual=values.length?safeSum(values):null;
    if(actual!==sums[key])throw Error('Source version sum mismatch: '+key);
  }
}
export function annotate(row: Pick<ProjectRow, "title" | "region_key">) {
  const text = row.title.toLowerCase();
  const names = (name: string) =>
    new RegExp(
      "(^|[^a-z])" +
        name
          .toLowerCase()
          .replace(/[.*+?^${}()|[\]\\]/g, (char) => "\\" + char) +
        "([^a-z]|$)",
    ).test(text);
  const provinceMatches = PROVINCES.filter((p) =>
    text.includes(p.name.toLowerCase()),
  ).map((p) => p.slug);
  if (
    text.includes("bacolod") &&
    !provinceMatches.includes("negros-occidental")
  )
    provinceMatches.push("negros-occidental");
  const locationMatches = LOCATIONS.filter(
    (l) =>
      names(localityTerm(l.name)) &&
      (l.name !== "Siquijor" ||
        /municipality of siquijor|siquijor,? siquijor/.test(text)) &&
      (provinceMatches.includes(l.province) || row.region_key === "NIR"),
  ).map((l) => l.code);
  return {
    regionConfirmed: row.region_key === "NIR",
    provinceMatches,
    locationMatches,
    geographicConfidence:
      row.region_key === "NIR"
        ? "Source-confirmed region; locality matches remain title-based"
        : "Place-name or office association; location uncertain",
  };
}
