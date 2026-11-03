import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { snapshotChanges } from "../src/lib/citizen-insights";
import type { ScopedProject } from "../src/lib/scope";

/** Build only from retained, checksum-verified snapshots. Never calls the API. */
export function buildReadingData(root = process.cwd()) {
  const data = path.join(root, "public/data");
  const current = JSON.parse(
    fs.readFileSync(path.join(data, "manifest.json"), "utf8"),
  );
  const snapshots = fs
    .readdirSync(path.join(data, "snapshots"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      const file = path.join(data, "snapshots", d.name, "manifest.json");
      if (!fs.existsSync(file)) return [];
      const m = JSON.parse(fs.readFileSync(file, "utf8"));
      if (
        !/^\/data\/snapshots\/[a-zA-Z0-9_.-]+\/scope\.json$/.test(m.scope) ||
        m.version !== d.name ||
        m.scope !== "/data/snapshots/" + d.name + "/scope.json"
      )
        throw Error("Invalid retained snapshot");
      const raw = fs.readFileSync(path.join(root, "public" + m.scope));
      if (
        createHash("sha256").update(raw).digest("hex") !==
        (m.checksums?.[m.scope] ?? m.scope_sha256)
      )
        throw Error("Retained snapshot checksum mismatch");
      return [
        { m, rows: JSON.parse(raw.toString()).projects as ScopedProject[] },
      ];
    })
    .filter((v) => v.m.retrieved_at <= current.retrieved_at)
    .sort(
      (a, b) =>
        a.m.retrieved_at.localeCompare(b.m.retrieved_at) ||
        a.m.version.localeCompare(b.m.version),
    );
  if (!snapshots.some((v) => v.m.version === current.version))
    throw Error("Current snapshot not retained");
  const output = {
    current_version: current.version,
    notice:
      "Updates compare retained portal snapshots. They are not differences between NEP and House budget stages. No earlier change history is inferred.",
    receipts: snapshots
      .map(({ m, rows }, i) => {
        const previous = snapshots[i - 1];
        const changes = previous ? snapshotChanges(previous.rows, rows) : null;
        return {
          version: m.version,
          retrieved_at: m.retrieved_at,
          source_build: m.source_build,
          records: rows.length,
          history_families: m.history_count,
          manifest: "/data/snapshots/" + m.version + "/manifest.json",
          scope: m.scope,
          previous_version: previous?.m.version ?? null,
          previous_scope: previous?.m.scope ?? null,
          changes,
          counts: changes
            ? {
                added: changes.filter((c) => c.kind === "added").length,
                removed: changes.filter((c) => c.kind === "removed").length,
                revised: changes.filter((c) => c.kind === "revised").length,
              }
            : null,
        };
      })
      .reverse(),
  };
  const destination = path.join(data, "update-history.json"),
    text = JSON.stringify(output, null, 2) + "\n";
  if (
    !fs.existsSync(destination) ||
    fs.readFileSync(destination, "utf8") !== text
  )
    fs.writeFileSync(destination, text);
  return output;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  console.log("Reading receipts:", buildReadingData().receipts.length);
