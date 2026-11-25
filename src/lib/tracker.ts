import type { ScopedProject } from "./scope";
import { analyticsSelection } from "./analytics-data";
import { csvCell } from "./csv";
import { sourceHref } from "./safe-url";

export interface TrackerFile {
  path: string;
  sha256: string;
  bytes: number;
}
export interface ContractLink {
  year: number;
  line_id: string;
  title: string;
  office: string;
  gaa_php: number | null;
  method: string;
  searched: string;
  title_score: string;
  amount_ratio: string;
  candidates: string;
}
export interface ContractRecord {
  id: string;
  title: string;
  category: string;
  status: string;
  contract_php: number | null;
  contractor: string | null;
  progress_percent: number | null;
  office: string;
  region: string;
  province: string;
  year: number;
  gaa_year: number | null;
  source_of_funds: string;
  start_date: string | null;
  completion_date: string | null;
  url: string;
  links: ContractLink[];
}
export interface TrackerIndex {
  schema: number;
  version: string;
  retrieved_at: string;
  built_at: string;
  notice: string;
  provider: string;
  scope: string;
  linking: string;
  source_page: string;
  source_url: string;
  accepted_links: number;
  source_counts: { contracts: number; links: number };
  shards: Record<string, TrackerFile & { count: number }>;
  documents: TrackerFile;
  documents_retrieved_at: string;
  readme: TrackerFile;
  source_manifest: TrackerFile;
}
export interface SourceDocument {
  key: string;
  title: string;
  stage: string;
  stage_label: string;
  reading: number | null;
  volume: string;
  pages: { from: number; to: number };
  sha256: string;
  bytes: number;
  source_url: string | null;
  notes: string;
  pdf_url: string;
  used_by: string[];
}
export interface DocumentCatalogue {
  meta: { built_at: string; note: string; total: number };
  disclaimers: { id: string; title: string; body: string; url: string }[];
  data: SourceDocument[];
}
export const STAGE_NAMES: Record<string, string> = {
  nep: "NEP proposal",
  hgab2: "House second reading",
  hgab3: "House third reading",
  api: "DPWH listing",
};
export const moneyExact = (value: number | null) =>
  value === null
    ? "Not available"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(value);
export function usableCoordinate(
  p: Pick<ScopedProject, "lat" | "lon">,
): p is typeof p & { lat: number; lon: number } {
  // Geographic plausibility, not a verification that a project is located here.
  return (
    typeof p.lat === "number" &&
    typeof p.lon === "number" &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lon) &&
    p.lat >= 4 &&
    p.lat <= 22 &&
    p.lon >= 116 &&
    p.lon <= 127
  );
}
/** Broad viewing window only, not an administrative boundary test. */
export function inNegrosOverview(p: Pick<ScopedProject, "lat" | "lon">) {
  return (
    usableCoordinate(p) &&
    p.lat >= 8.8 &&
    p.lat <= 11.1 &&
    p.lon >= 122.2 &&
    p.lon <= 123.9
  );
}
export function projectReferences(project: ScopedProject) {
  return Object.entries(project.pdf_url).flatMap(([stage, href]) => {
    if (!href || !sourceHref(href)) return [];
    try {
      const url = new URL(href);
      if (
        url.protocol !== "https:" ||
        url.hostname !== "budget-assets.bettergov.ph"
      )
        return [];
      const page = /^#page=([1-9]\d*)$/.exec(url.hash)?.[1] ?? null;
      url.hash = "";
      return [
        {
          stage,
          label: STAGE_NAMES[stage] ?? stage,
          href,
          document: url.href,
          page,
        },
      ];
    } catch {
      return [];
    }
  });
}
export function filterContracts(
  rows: ContractRecord[],
  filters: {
    q?: string;
    year?: string;
    status?: string;
    linked?: string;
    category?: string;
    sort?: string;
  },
) {
  const terms = (filters.q ?? "")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const matches = rows.filter(
    (r) =>
      (!filters.year || String(r.year) === filters.year) &&
      (!filters.status || r.status === filters.status) &&
      (!filters.category || r.category === filters.category) &&
      (!filters.linked ||
        (filters.linked === "yes"
          ? r.links.length > 0
          : r.links.length === 0)) &&
      terms.every((t) =>
        [
          r.id,
          r.title,
          r.contractor,
          r.office,
          ...r.links.map((link) => `${link.line_id} ${link.title}`),
        ]
          .join(" ")
          .toLowerCase()
          .includes(t),
      ),
  );
  return matches.sort((a, b) => {
    if (filters.sort === "amount") {
      const difference =
        (b.contract_php ?? -Infinity) - (a.contract_php ?? -Infinity);
      if (difference) return difference;
    }
    if (filters.sort === "oldest")
      return a.year - b.year || a.id.localeCompare(b.id);
    return b.year - a.year || a.id.localeCompare(b.id);
  });
}
export function contractsCsv(rows: ContractRecord[], index: TrackerIndex) {
  const header = [
    "contract_id",
    "description",
    "contractor",
    "contract_amount_php",
    "reported_status",
    "reported_progress_percent",
    "dpwh_year",
    "office",
    "source_url",
    "upstream_candidate_gaa_links",
    "source_built_at",
    "retrieved_at",
    "provider",
    "notice",
    "coverage",
    "matching_notice",
  ];
  return (
    [
      header,
      ...rows.map((r) => [
        r.id,
        r.title,
        r.contractor,
        r.contract_php,
        r.status,
        r.progress_percent,
        r.year,
        r.office,
        r.url,
        r.links.length,
        index.built_at,
        index.retrieved_at,
        index.provider,
        index.notice,
        index.scope,
        index.linking,
      ]),
    ]
      .map((row) => row.map((v) => csvCell(v)).join(","))
      .join("\r\n") + "\r\n"
  );
}
export type QuestionKind = "total" | "largest" | "changes" | "documents";
export const QUESTIONS: { id: QuestionKind; label: string }[] = [
  { id: "total", label: "How much is proposed?" },
  { id: "largest", label: "Which projects have the largest amounts?" },
  { id: "changes", label: "Which paired amounts increased or decreased?" },
  { id: "documents", label: "Where can I check the source documents?" },
];
export function questionKind(text: string): QuestionKind | null {
  const s = text.trim().toLowerCase();
  if (
    /\b(spent|spending|paid|completed|corrupt|stolen|ghost|contractor|who requested|who sponsored)\b/.test(
      s,
    )
  )
    return null;
  if (/\b(documents?|pdf|source pages?|verify)\b/.test(s)) return "documents";
  if (
    /\b(change|changed|increase|increased|decrease|decreased|difference)\b/.test(
      s,
    )
  )
    return "changes";
  if (/\b(largest|biggest|highest|top)\b/.test(s)) return "largest";
  if (/\b(how much|total|proposed|proposal|budget|allocation)\b/.test(s))
    return "total";
  return null;
}
export function answerQuestion(
  input: ScopedProject[],
  kind: QuestionKind,
  filters: {
    province?: string;
    program?: string;
    lgu?: string;
    direction?: string;
  },
  stage: "nep" | "house",
) {
  const { rows: selected, summary } = analyticsSelection(input, filters);
  const key = stage === "nep" ? "nep_php" : "house_php";
  let rows = selected;
  if (kind === "changes")
    rows = selected.filter(
      (r) =>
        !r.held &&
        (r.bridge_group === "increased" || r.bridge_group === "decreased") &&
        (!filters.direction || r.bridge_group === filters.direction) &&
        r.nep_php !== null &&
        r.house_php !== null,
    );
  if (kind === "largest")
    rows = selected
      .filter((r) => r[key] !== null)
      .sort((a, b) => b[key]! - a[key]! || a.key.localeCompare(b.key));
  if (kind === "documents")
    rows = selected.filter((r) => projectReferences(r).length > 0);
  const available = summary[stage].rows;
  return {
    rows,
    selected: selected.length,
    available,
    missing: selected.length - available,
    total: available ? summary[stage].php : null,
    stages: summary,
  };
}
