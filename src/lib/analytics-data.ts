import type { BridgeGroup } from "../api/types";
import type { ScopedProject } from "./scope";
import { summarise } from "./scope";
import { PROVINCES } from "./geography";
import { safeSum } from "./regional-data";

export const ANALYTICS_PROGRAMS = ["dpwh", "fmr", "hfep", "nia"] as const;
export const COMPARISON_NAMES: Record<BridgeGroup, string> = {
  increased: "Increased",
  decreased: "Decreased",
  unchanged: "Unchanged",
  house_only: "House bill only",
  nep_only: "NEP only",
  scope_review: "Scope review",
};
export const ANALYTICS_STATUSES: BridgeGroup[] = [
  "increased",
  "decreased",
  "unchanged",
  "house_only",
  "nep_only",
  "scope_review",
];
export interface ChartRow {
  label: string;
  [key: string]: string | number | null;
}
export const chartNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/** One normalized array must feed both category axes and series, including ranked bars. */
export function chartModel(
  rows: ChartRow[],
  keys: string[],
  ranked = false,
): (ChartRow & { axisLabel: string })[] {
  return rows.map((row, index) => ({
    ...row,
    ...Object.fromEntries(keys.map((key) => [key, chartNumber(row[key])])),
    axisLabel: ranked ? "#" + (index + 1) : row.label,
  }));
}
export function chartExtent(rows: ChartRow[], keys: string[]) {
  const values = rows
    .flatMap((row) => keys.map((key) => chartNumber(row[key])))
    .filter((v): v is number => v !== null);
  return {
    hasValues: values.length > 0,
    hasNonzero: values.some((v) => v !== 0),
    minimum: Math.min(0, ...values),
    maximum: Math.max(0, ...values),
  };
}
export function analyticsSelection(
  input: readonly ScopedProject[],
  filters: {
    province?: string;
    program?: string;
    status?: string;
    lgu?: string;
  } = {},
) {
  const unique = new Map<string, ScopedProject>();
  for (const row of input) {
    const identity = row.dataset + ":" + row.id;
    const previous = unique.get(identity);
    if (
      previous &&
      (previous.nep_php !== row.nep_php ||
        previous.house_php !== row.house_php ||
        previous.bridge_group !== row.bridge_group)
    )
      throw Error("Conflicting duplicate source record");
    if (!previous) unique.set(identity, row);
  }
  const rows = [...unique.values()].filter(
    (row) =>
      (!filters.province || row.provinceMatches?.includes(filters.province)) &&
      (!filters.program || row.dataset === filters.program) &&
      (!filters.status || row.bridge_group === filters.status) &&
      (!filters.lgu || row.locationMatches?.includes(filters.lgu)),
  );
  const amount = (rs: ScopedProject[], key: "nep_php" | "house_php") => {
    const values = rs.map((r) => r[key]).filter((v): v is number => v != null);
    return values.length ? safeSum(values) : null;
  };
  const byProgram = ANALYTICS_PROGRAMS.map((program) => {
    const rs = rows.filter((r) => r.dataset === program);
    return {
      label: program.toUpperCase(),
      NEP: amount(rs, "nep_php"),
      House: amount(rs, "house_php"),
    };
  });
  const summary = summarise(rows);
  summary.nep.php = safeSum(byProgram.map((row) => row.NEP ?? 0));
  summary.house.php = safeSum(byProgram.map((row) => row.House ?? 0));
  return {
    rows,
    summary,
    byProgram,
    byProvince: PROVINCES.map((p) => ({
      label: p.name,
      Records: rows.filter((r) => r.provinceMatches?.includes(p.slug)).length,
    })),
    byStatus: ANALYTICS_STATUSES.map((status) => ({
      label: COMPARISON_NAMES[status],
      Records: summary.groups[status].rows,
    })),
  };
}
export function amountRanking(
  rows: readonly ChartRow[],
  key: string,
): ChartRow[] {
  return [...rows].sort(
    (a, b) =>
      (chartNumber(b[key]) ?? -Infinity) - (chartNumber(a[key]) ?? -Infinity) ||
      a.label.localeCompare(b.label),
  );
}
