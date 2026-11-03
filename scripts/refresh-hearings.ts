import fs from "node:fs";
import {
  HEARING_TERMS,
  normalizeHearingHits,
  type HearingHit,
  type HearingIndex,
} from "../src/lib/hearings";
import { sensitiveTextRules } from "../src/lib/privacy-review";
const hits = new Map<string, HearingHit>(),
  queries: HearingIndex["queries"] = [];
const retrieved_at = new Date().toISOString();
for (const term of HEARING_TERMS) {
  const url = new URL("https://budget.bettergov.ph/api/v1/hearings/search");
  url.search = new URLSearchParams({
    q: term,
    fiscal_year: "2027",
    limit: "100",
  }).toString();
  const r = await fetch(url, {
    headers: {
      "User-Agent":
        "BetterNegrosIsland/1.0 NIR hearing index (github.com/Syntax-error2/BetterNegrosIsland)",
    },
    credentials: "omit",
    referrerPolicy: "no-referrer",
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw Error("Hearing extraction failed; existing index preserved");
  const j = await r.json();
  if (!Array.isArray(j.data) || j.meta?.returned !== j.data.length)
    throw Error("Hearing response count mismatch");
  queries.push({
    term,
    returned: j.data.length,
    limit: 100,
    possibly_truncated: j.data.length >= 100,
  });
  for (const hit of normalizeHearingHits(j.data, term)) {
    if (
      sensitiveTextRules(
        [hit.topic, ...hit.moments.map((m) => m.said)].join(" "),
      ).length
    )
      throw Error("Hearing text needs privacy review; index not replaced");
    const old = hits.get(hit.id);
    if (!old) hits.set(hit.id, hit);
    else {
      old.terms = [...new Set([...old.terms, ...hit.terms])];
      old.moments = [
        ...new Map(
          [...old.moments, ...hit.moments].map((m) => [
            m.url + "|" + m.said,
            m,
          ]),
        ).values(),
      ].sort((a, b) => a.seconds - b.seconds);
    }
  }
}
const index: HearingIndex = {
  retrieved_at,
  fiscal_year: 2027,
  queries,
  hits: [...hits.values()].sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
  ),
  notice:
    "Source-provided machine-derived hearing index, not a verbatim transcript or verified quotation. Geographic keyword matches do not certify NIR scope or link a hearing to a specific project. Verify names, figures and context in the original timestamped video before quoting. Four configured searches only; this is not a complete index of NIR discussions.",
};
fs.writeFileSync(
  "public/data/hearings.next.json",
  JSON.stringify(index, null, 2) + "\n",
);
fs.renameSync("public/data/hearings.next.json", "public/data/hearings.json");
console.log(
  JSON.stringify({
    retrieved_at,
    topics: index.hits.length,
    moments: index.hits.reduce((n, h) => n + h.moments.length, 0),
    queries,
  }),
);
