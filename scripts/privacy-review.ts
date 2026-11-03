import fs from "node:fs";
import { createHash } from "node:crypto";
import { sensitiveTextRules } from "../src/lib/privacy-review.ts";
const manifest = JSON.parse(
  fs.readFileSync("public/data/manifest.json", "utf8"),
);
const scope = JSON.parse(fs.readFileSync("public" + manifest.scope, "utf8"));
const history = JSON.parse(
  fs.readFileSync("public" + manifest.history, "utf8"),
);
const flags: {
  record_fingerprint: string;
  dataset: string;
  field: string;
  rules: string[];
}[] = [];
for (const [dataset, rows] of [
  ["comparison", scope.projects],
  ["history", history.rows],
] as const) {
  for (const row of rows)
    for (const field of ["title", "name", "program", "office", "department"]) {
      const text = row[field];
      if (typeof text !== "string") continue;
      const rules = sensitiveTextRules(text);
      if (rules.length)
        flags.push({
          record_fingerprint: createHash("sha256")
            .update(row.key)
            .digest("hex")
            .slice(0, 16),
          dataset,
          field,
          rules,
        });
    }
}
const report = {
  snapshot: manifest.version,
  reviewed_at: new Date().toISOString(),
  comparison_records: scope.projects.length,
  history_families: history.rows.length,
  flag_count: flags.length,
  flags,
  limitations:
    "Pattern triage of display fields only. Not a full personal-data assessment or review of linked PDFs. Raw potentially sensitive matches are intentionally not copied to this report.",
};
fs.mkdirSync("docs/qa/premium-ui", { recursive: true });
fs.writeFileSync(
  "docs/qa/premium-ui/privacy-source-triage.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (flags.length) process.exitCode = 1;
