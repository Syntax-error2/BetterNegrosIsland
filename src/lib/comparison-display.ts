import type { ScopedProject } from "./scope";
import { percentage } from "./regional-data";
import { phpFull } from "./format";
import { resolveSourceLink } from "./safe-url";
export function comparablePercent(
  p: Pick<ScopedProject, "held" | "bridge_group" | "nep_php" | "house_php">,
): number | null {
  return p.held || p.bridge_group === "scope_review"
    ? null
    : percentage(p.nep_php, p.house_php);
}
export function exactDifference(value: number | null): string {
  return value == null
    ? "Not available"
    : value === 0
      ? "₱0"
      : (value > 0 ? "+" : "−") + phpFull(Math.abs(value));
}
export function sourceDocument(
  p: Pick<ScopedProject, "pdf_url" | "url">,
): string | null {
  return resolveSourceLink(p);
}
