import type { ScopedProject } from "../lib/scope";
import { BRIDGE_GROUPS } from "../api/types";
export const syntheticRows: ScopedProject[] = BRIDGE_GROUPS.map((group, i) => {
  const nep = group === "house_only" ? null : 1234567890;
  const house =
    group === "nep_only"
      ? null
      : group === "unchanged"
        ? nep
        : group === "decreased"
          ? 500000000
          : group === "scope_review"
            ? Number.MAX_SAFE_INTEGER
            : 2345678901;
  return {
    id: "qa-" + i,
    key: "qa:" + i,
    dataset: "dpwh",
    title:
      i === 0
        ? "Construction of Multi-Purpose Building, Phase II, Barangay San Jose, Binalbagan, Negros Occidental, 10.197508, 122.898621"
        : i === 1
          ? "SYNTHETIC <img src=x onerror=alert(1)> — text escaping and a very long title without truncation"
          : "SYNTHETIC financial layout case " + (i + 1),
    program: "Synthetic test program",
    office: "Synthetic shared engineering office — not a government record",
    region: "TEST",
    bridge_group: group,
    status_label: "Synthetic " + group,
    held: i === 2,
    nep_php: nep,
    house_php: house,
    delta_php:
      nep == null || house == null || group === "scope_review"
        ? null
        : house - nep,
    pap: null,
    region_key: null,
    office_kind: null,
    zone: "synthetic",
    trace: "synthetic",
    group_label: "Synthetic " + group,
    hgab2_php: null,
    hgab3_php: house,
    api_php: null,
    nep_page: null,
    hgab2_page: null,
    hgab3_page: null,
    flags: [],
    lon: null,
    lat: null,
    api_url: "https://example.invalid/synthetic-layout-source",
    pdf_url: { hgab3: "https://example.invalid/synthetic-layout-source" },
    url: "https://example.invalid/synthetic-layout-source",
    reasons: [
      {
        kind: "place",
        label: "Synthetic test geography — not a verified location",
      },
    ],
    regionConfirmed: false,
    provinceMatches: [],
    locationMatches: [],
  } satisfies ScopedProject;
});
