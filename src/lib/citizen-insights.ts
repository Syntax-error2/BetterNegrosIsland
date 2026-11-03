import type { ScopedProject } from "./scope";
import { phpFull } from "./format";
import { houseReading } from "./evidence";
import { analyticsSelection } from "./analytics-data";

export const TOPICS = [
  {
    id: "roads",
    name: "Roads and bridges",
    description: "DPWH transport and road programs.",
    programs: ["Asset Preservation", "Network Development", "Bridge"],
  },
  {
    id: "flood",
    name: "Flood protection",
    description: "DPWH Flood Management Program records.",
    programs: ["Flood Management"],
  },
  {
    id: "health",
    name: "Health facilities",
    description: "Health Facilities Enhancement Program records.",
    dataset: "hfep",
  },
  {
    id: "farm",
    name: "Farm access",
    description: "Farm-to-market road program records.",
    dataset: "fmr",
  },
  {
    id: "irrigation",
    name: "Irrigation",
    description: "National Irrigation Administration records, where available.",
    dataset: "nia",
  },
  {
    id: "other",
    name: "Other infrastructure",
    description: "DPWH programs outside the named topic groups.",
  },
] as const;
export function topicFor(p: ScopedProject): string {
  const direct = TOPICS.find((t) => "dataset" in t && t.dataset === p.dataset);
  if (direct) return direct.id;
  return (
    TOPICS.find(
      (t) =>
        "programs" in t &&
        p.dataset === "dpwh" &&
        t.programs.some((v) => (p.program ?? "").includes(v)),
    )?.id ?? "other"
  );
}
export const QUALITY_LABELS = {
  pairing: "Unconfirmed pairing",
  missing: "Amount unavailable",
  region: "Regional association uncertain",
  scope: "Source marks scope review",
  geography: "Geographic label needs review",
};
export type QualityKind = keyof typeof QUALITY_LABELS;
export function qualityFlags(p: ScopedProject): QualityKind[] {
  const flags: QualityKind[] = [];
  if (p.held) flags.push("pairing");
  if (p.nep_php === null || p.house_php === null) flags.push("missing");
  if (!p.regionConfirmed || p.region_key !== "NIR") flags.push("region");
  if (p.bridge_group === "scope_review") flags.push("scope");
  // Named out-of-region provinces are a review clue, never an automatic correction.
  if (
    p.regionConfirmed &&
    /\b(Catanduanes|Cagayan|Isabela Province|Camarines|Bulacan|Pampanga|Zambales|Nueva Ecija|Davao|Cebu|Bohol|Iloilo|Guimaras|Capiz|Antique|Aklan)\b/i.test(
      p.title,
    )
  )
    flags.push("geography");
  return flags;
}
export function explainRecord(p: ScopedProject): string[] {
  if (
    [p.nep_php, p.house_php].some((v) => v !== null && !Number.isSafeInteger(v))
  )
    throw Error("Unsafe source amount");
  const amount = (n: number | null) =>
    n === null ? "no available amount" : phpFull(n);
  const text = [
    `This dated record lists ${amount(p.nep_php)} in the NEP proposal and ${amount(p.house_php)} in the ${houseReading(p.dataset)}.`,
  ];
  if (p.held)
    text.push(
      "The source marks this pairing as unconfirmed. Treat the two lines as a candidate comparison.",
    );
  else if(p.bridge_group==='scope_review')text.push('The source marks this record for scope review. The available amounts may describe different scopes, so no paired change is asserted here.');
  else if (p.nep_php !== null && p.house_php !== null) {
    if (!Number.isSafeInteger(p.nep_php) || !Number.isSafeInteger(p.house_php))
      throw Error("Unsafe source amount");
    const delta = p.house_php - p.nep_php;
    if (!Number.isSafeInteger(delta)) throw Error("Unsafe difference");
    text.push(
      delta === 0
        ? "The two available amounts are equal."
        : `The House amount is ${phpFull(Math.abs(delta))} ${delta > 0 ? "higher" : "lower"} than the paired NEP amount.`,
    );
  } else
    text.push(
      "A one-sided or unavailable amount does not establish that funding was absent from every source document. Missing values are not zero.",
    );
  text.push(
    p.regionConfirmed && p.region_key === "NIR"
      ? "The source labels this record NIR. Its physical project location has not been independently verified."
      : "This record is included through a title or office association. Regional and physical location remain uncertain.",
  );
  text.push(
    "These are published budget versions, not proof of payment, completion, who requested a project or wrongdoing.",
  );
  return text;
}
export function communitySummary(rows: ScopedProject[]) {
  const selected = analyticsSelection(rows).rows;
  return {
    total: selected.length,
    programs: TOPICS.map((t) => ({
      ...t,
      count: selected.filter((p) => topicFor(p) === t.id).length,
    })),
    groups: [...new Set(selected.map((p) => p.bridge_group))].map((group) => ({
      group,
      label: selected.find((p) => p.bridge_group === group)!.group_label,
      count: selected.filter((p) => p.bridge_group === group).length,
    })),
    flagged: selected.filter((p) => qualityFlags(p).length > 0).length,
  };
}
export const CHANGE_FIELDS = [
  "title",
  "program",
  "pap",
  "office",
  "region",
  "region_key",
  "nep_php",
  "house_php",
  "delta_php",
  "bridge_group",
  "status_label",
  "held",
  "pdf_url",
  "url",
  "regionConfirmed",
  "provinceMatches",
  "locationMatches",
] as const;
export type ChangeState = Pick<
  ScopedProject,
  "title" | "nep_php" | "house_php" | "status_label" | "url"
>;
export interface SnapshotChange {
  key: string;
  title: string;
  dataset: string;
  id: string;
  kind: "added" | "removed" | "revised";
  fields: string[];
  before: ChangeState | null;
  after: ChangeState | null;
}
export function snapshotChanges(
  before: ScopedProject[],
  after: ScopedProject[],
) {
  const oldRows = analyticsSelection(before).rows,
    newRows = analyticsSelection(after).rows;
  const oldMap = new Map(oldRows.map((p) => [p.key, p])),
    newMap = new Map(newRows.map((p) => [p.key, p]));
  const state = (p: ScopedProject): ChangeState => ({
    title: p.title,
    nep_php: p.nep_php,
    house_php: p.house_php,
    status_label: p.status_label,
    url: p.url,
  });
  const changes: SnapshotChange[] = [
    ...newRows
      .filter((p) => !oldMap.has(p.key))
      .map((p) => ({
        key: p.key,
        title: p.title,
        dataset: p.dataset,
        id: p.id,
        kind: "added" as const,
        fields: [] as string[],
        before: null,
        after: state(p),
      })),
    ...oldRows
      .filter((p) => !newMap.has(p.key))
      .map((p) => ({
        key: p.key,
        title: p.title,
        dataset: p.dataset,
        id: p.id,
        kind: "removed" as const,
        fields: [] as string[],
        before: state(p),
        after: null,
      })),
    ...newRows
      .filter((p) => oldMap.has(p.key))
      .flatMap((p) => {
        const old = oldMap.get(p.key)!;
        const fields = CHANGE_FIELDS.filter(
          (k) => JSON.stringify(old[k]) !== JSON.stringify(p[k]),
        );
        return fields.length
          ? [
              {
                key: p.key,
                title: p.title,
                dataset: p.dataset,
                id: p.id,
                kind: "revised" as const,
                fields: [...fields],
                before: state(old),
                after: state(p),
              },
            ]
          : [];
      }),
  ];
  return changes;
}
