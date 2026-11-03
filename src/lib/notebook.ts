import { PROJECT_FILTERS } from "./ui";
export const NOTEBOOK_KEY = "betternegrosisland:notebook:v1";
export interface SavedSearch {
  path: string;
  label: string;
}
export interface Notebook {
  version: 1;
  records: string[];
  searches: SavedSearch[];
}
export const emptyNotebook = (): Notebook => ({
  version: 1,
  records: [],
  searches: [],
});
export function safeSearchPath(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    value.length > 2400 ||
    !/^\/(projects|locations\/[0-9]{10})(\?|$)/.test(value) ||
    /[\\\r\n]/.test(value)
  )
    return null;
  const u = new URL(value, "https://local.invalid");
  if (
    u.origin !== "https://local.invalid" ||
    u.hash ||
    !/^\/(projects|locations\/[0-9]{10})$/.test(u.pathname)
  )
    return null;
  const params = new URLSearchParams();
  for (const k of PROJECT_FILTERS) {
    const v = u.searchParams.get(k);
    if (v && v.length <= 300) params.set(k, v);
  }
  params.sort();
  return u.pathname + (params.size ? "?" + params.toString() : "");
}
export function parseNotebook(raw: string | null): Notebook {
  try {
    if (raw && raw.length > 100000) return emptyNotebook();
    const v = JSON.parse(raw ?? "null");
    if (v?.version !== 1) return emptyNotebook();
    const records = Array.isArray(v.records)
      ? ([
          ...new Set(
            v.records.filter(
              (k: unknown) =>
                typeof k === "string" &&
                /^(dpwh|fmr|hfep|nia):[^\s]{1,240}$/.test(k),
            ),
          ),
        ].slice(0, 100) as string[])
      : [];
    const searches: SavedSearch[] = Array.isArray(v.searches)
      ? v.searches
          .flatMap((s: SavedSearch) => {
            const path = safeSearchPath(s?.path);
            return path && typeof s.label === "string"
              ? [{ path, label: s.label.slice(0, 160) }]
              : [];
          })
          .filter(
            (s: SavedSearch, i: number, a: SavedSearch[]) =>
              a.findIndex((v) => v.path === s.path) === i,
          )
          .slice(0, 30)
      : [];
    return { version: 1, records, searches };
  } catch {
    return emptyNotebook();
  }
}
export function loadNotebook(storage: Pick<Storage, "getItem">): Notebook {
  return parseNotebook(storage.getItem(NOTEBOOK_KEY));
}
export function writeNotebook(
  storage: Pick<Storage, "setItem" | "removeItem">,
  value: Notebook,
) {
  if (!value.records.length && !value.searches.length)
    storage.removeItem(NOTEBOOK_KEY);
  else
    storage.setItem(
      NOTEBOOK_KEY,
      JSON.stringify(parseNotebook(JSON.stringify(value))),
    );
}
