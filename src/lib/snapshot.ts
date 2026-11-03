import type { Async } from "./portal-context";
import { useEffect, useState } from "react";
export interface Coverage {
  fiscal_years?: number[] | null;
  retrieved_at?: string;
  uncertain_geographic_matches?: number | null;
  unverified_locality_matches?: number | null;
  dataset: string;
  endpoint: string;
  source: number | null;
  retrieved: number;
  accepted: number;
  duplicates: number;
  rejected: number;
  remaining?: number;
  status: string;
  note?: string;
  query?: Record<string, string>;
}
export interface Manifest {
  source_confirmed_nir?:number;
  uncertain_region?:number;
  duplicates_across_queries?:{comparison:number;history:number};
  version: string;
  retrieved_at: string;
  source_build: string;
  source_commit: string;
  scope: string;
  overview: string;
  districts: string;
  history: string;
  nep: string;
  summary: string;
  coverage: string | Coverage[];
  project_count: number;
  history_count: number;
  limitations: string[];
  checksums?: Record<string, string>;
  scope_sha256?: string;
}
const cache = new Map<string, Promise<unknown>>();
export function snapshotJson<T>(url: string): Promise<T> {
  if(!/^\/data\/[a-zA-Z0-9/_.-]+\.json$/.test(url)||url.split('/').some(part=>part==='.'||part==='..'))return Promise.reject(new Error('Invalid snapshot path'));
  let p = cache.get(url);
  if (!p) {
    p = fetch(url, { signal: AbortSignal.timeout(20000), credentials:'omit', referrerPolicy:'no-referrer', cache:/\/(manifest|refresh-status|update-history|hearings)\.json$/.test(url)?'no-cache':'default' }).then(async (r) => {
      if (!r.ok || !/\bapplication\/(?:[a-z0-9.-]+\+)?json\b/i.test(r.headers.get('content-type')??'')) throw Error("Snapshot unavailable or not JSON");
      return r.json();
    });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p as Promise<T>;
}
export function useSnapshot<T>(field?: keyof Manifest): Async<T> {
  const [state, setState] = useState<Async<T>>({ status: "loading" });
  useEffect(() => {
    let live = true;
    snapshotJson<Manifest>("/data/manifest.json")
      .then((m) => (field ? snapshotJson<T>(String(m[field])) : (m as T)))
      .then(
        (value) => {
          if (live) setState({ status: "ready", value });
        },
        (e) => {
          if (live)
            setState({
              status: "error",
              error: e instanceof Error ? e : new Error(String(e)),
            });
        },
      );
    return () => {
      live = false;
    };
  }, [field]);
  return state;
}
