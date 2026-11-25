import { useEffect, useState } from "react";
import type { Async } from "./portal-context";
import type { TrackerFile, TrackerIndex } from "./tracker";
import { currentSnapshot } from "./snapshot-selection";

export async function readTracker<T>(
  file?: TrackerFile,
  signal?: AbortSignal,
): Promise<T> {
  if (currentSnapshot().version)
    throw Error(
      "Supporting tracker files are not archived within this budget snapshot.",
    );
  const path = file?.path ?? "/data/tracker/index.json";
  if (
    !/^\/data\/tracker\/(?:contracts-[a-f0-9]{12}\/)?[a-z-]+\.json$/.test(path)
  )
    throw Error("Unsafe tracker data path");
  const response = await fetch(path, {
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(30000)])
      : AbortSignal.timeout(30000),
    credentials: "omit",
    referrerPolicy: "no-referrer",
    cache: file ? "default" : "no-cache",
  });
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("application/json")
  )
    throw Error("Tracker source data could not be loaded.");
  const bytes = await response.arrayBuffer();
  if (file) {
    const hash = [
      ...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    ]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("");
    if (hash !== file.sha256 || bytes.byteLength !== file.bytes)
      throw Error("Tracker file checksum mismatch.");
  }
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (
    !file &&
    (data.schema !== 1 ||
      !/^contracts-[a-f0-9]{12}$/.test(data.version) ||
      !data.shards ||
      !data.notice)
  )
    throw Error("Invalid tracker index");
  return data;
}
export function useTrackerIndex() {
  const [attempt, setAttempt] = useState(0),
    [state, setState] = useState<Async<TrackerIndex>>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    readTracker<TrackerIndex>(undefined, controller.signal).then(
      (value) => setState({ status: "ready", value }),
      (error) => {
        if (!controller.signal.aborted) setState({ status: "error", error });
      },
    );
    return () => controller.abort();
  }, [attempt]);
  return { state, retry: () => setAttempt((n) => n + 1) };
}
