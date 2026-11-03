import { publicError } from "../lib/ui";
import { safeHref } from "../lib/safe-url";
import type { ReactNode } from "react";
import type { BridgeGroup, Disclaimer } from "../api/types";
import type { Async } from "../lib/portal-context";
import { usePortal } from "../lib/portal-context";
import { COMPARISON_NAMES } from "../lib/analytics-data";
import type { Reason } from "../lib/scope";

/** The plain status, as the API words it, with the group's colour. */
export function StatusChip({
  group,
  label,
  held,
}: {
  group: BridgeGroup;
  label: string;
  held?: boolean;
}) {
  const names = COMPARISON_NAMES;
  const symbols: Record<BridgeGroup, string> = {
    house_only: "+",
    nep_only: "−",
    increased: "↑",
    decreased: "↓",
    unchanged: "=",
    scope_review: "?",
  };
  return (
    <span
      className={
        "comparison-status status-" + group + (held ? " is-uncertain" : "")
      }
    >
      <span aria-hidden="true" className="status-symbol">
        {held ? "?" : symbols[group]}
      </span>
      <span>
        {held ? "Uncertain match" : names[group]}
        {held && <small>{names[group]}</small>}
        <span className="sr-only">
          . Source wording: {label}. Document comparison only.
        </span>
      </span>
    </span>
  );
}

export function ReasonTags({ reasons }: { reasons: Reason[] }) {
  return (
    <span className="reasons">
      {reasons.map((r) => (
        <span
          key={r.kind + r.label}
          className={`tag ${r.kind === "office" ? "tag-office" : "tag-place"}`}
          title={
            r.kind === "office"
              ? `Listed under ${r.label}`
              : r.kind === "region"
                ? "The API record explicitly uses the NIR region key"
                : `The title names ${r.label}`
          }
        >
          {r.kind === "office"
            ? "DPWH office"
            : r.kind === "region"
              ? r.label
              : `names ${r.label}`}
        </span>
      ))}
    </span>
  );
}

/** The API's disclaimers, verbatim: printed from the response, so the wording cannot drift. */
export function Disclaimers({
  items,
  compact,
}: {
  items: Disclaimer[];
  compact?: boolean;
}) {
  if (!items.length) return null;
  return (
    <aside
      className={`disclaimers${compact ? " compact" : ""}`}
      aria-label="Disclaimers"
    >
      {items.map((d) => (
        <p key={d.id}>
          <strong>{d.title}</strong> {d.body}{" "}
          <External href={d.restrictions_url ?? d.url}>Read more</External>
        </p>
      ))}
    </aside>
  );
}

/** Render `ready`, or a loading line, or the error with a retry. */
export function Await<T>({
  state,
  children,
  what,
  retry: ownRetry,
}: {
  state: Async<T>;
  children: (value: T) => ReactNode;
  what: string;
  retry?: () => void;
}) {
  const { retry: globalRetry } = usePortal();
  const retry = ownRetry ?? globalRetry;
  if (state.status === "ready") return <>{children(state.value)}</>;
  if (state.status === "loading") {
    return (
      <div className="state" role="status">
        <span className="spinner" aria-hidden="true" /> Loading {what}…
      </div>
    );
  }
  return (
    <div className="state state-error" role="alert">
      <p>
        <strong>Could not load {what}.</strong> {publicError(state.error)}
      </p>
      <button type="button" className="button" onClick={retry}>
        Try again
      </button>
    </div>
  );
}

export function External({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const safe = safeHref(href);
  if (safe === "#") return <span>{children} (source link unavailable)</span>;
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer">
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}
