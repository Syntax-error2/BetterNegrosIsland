import { sourceHref } from "./safe-url";
export const HEARING_TERMS = [
  "Negros",
  "Siquijor",
  "Bacolod",
  "Dumaguete",
] as const;
export interface HearingMoment {
  seconds: number;
  timestamp: string;
  speaker: string;
  said: string;
  url: string;
}
export interface HearingHit {
  id: string;
  title: string;
  agency: string;
  date: string;
  topic: string;
  url: string;
  terms: string[];
  moments: HearingMoment[];
}
export interface HearingIndex {
  retrieved_at: string;
  fiscal_year: number;
  queries: {
    term: string;
    returned: number;
    limit: number;
    possibly_truncated: boolean;
  }[];
  hits: HearingHit[];
  notice: string;
}
function text(v: unknown) {
  if (typeof v !== "string" || v.length > 12000)
    throw Error("Invalid hearing text");
  return v;
}
function hearingUrl(v: unknown, video: string, seconds?: number) {
  const url = sourceHref(v);
  if (
    !url ||
    new URL(url).hostname !== "budget.bettergov.ph" ||
    !/^\/hearings\/[a-zA-Z0-9_-]+$/.test(new URL(url).pathname)
  )
    throw Error("Invalid hearing source");
  const parsed = new URL(url);
  if (
    parsed.pathname !== "/hearings/" + video ||
    (seconds !== undefined && parsed.searchParams.get("t") !== String(seconds))
  )
    throw Error("Hearing timestamp or identity mismatch");
  return url;
}
/** Index only moments containing a configured geographic term, not unrelated topic threads. */
export function normalizeHearingHits(
  data: unknown,
  term: string,
): HearingHit[] {
  if (!Array.isArray(data) || !HEARING_TERMS.some((t) => t === term))
    throw Error("Invalid hearing search");
  return data.flatMap((row) => {
    const h = row.hearing,
      t = row.topic;
    if (
      String(h?.fiscal_year) !== "2027" ||
      !Array.isArray(row.matching_moments)
    )
      throw Error("Unexpected hearing schema");
    const moments: HearingMoment[] = row.matching_moments
      .filter((m: { said: unknown }) =>
        new RegExp("\\b" + term + "\\b", "i").test(text(m.said)),
      )
      .map(
        (m: {
          seconds: number;
          timestamp: string;
          speaker: string;
          said: string;
          url: string;
        }) => {
          if (
            !Number.isSafeInteger(m.seconds) ||
            m.seconds < 0 ||
            !/^\d{1,3}:\d{2}(?::\d{2})?$/.test(m.timestamp)
          )
            throw Error("Invalid hearing timestamp");
          return {
            seconds: m.seconds,
            timestamp: m.timestamp,
            speaker: text(m.speaker),
            said: text(m.said),
            url: hearingUrl(m.url, h.video_id, m.seconds),
          };
        },
      );
    if (!moments.length) return [];
    if (!Number.isSafeInteger(t.index) || !h.video_id)
      throw Error("Missing hearing identity");
    return [
      {
        id: text(h.video_id) + ":" + t.index,
        title: text(h.title),
        agency: text(h.agency ?? ""),
        date: text(h.hearing_date),
        topic: text(t.topic),
        url: hearingUrl(t.url, h.video_id),
        terms: [term],
        moments,
      },
    ];
  });
}
