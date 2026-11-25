import { LOCATIONS, PROVINCES, localityTerm } from "./geography";
import { questionKind } from "./tracker";
import type { QuestionKind } from "./tracker";

const programs = {
  dpwh: /\bdpwh\b/g,
  hfep: /\b(?:hfep|health facilit(?:y|ies))\b/g,
  fmr: /\b(?:fmr|farm to market roads?)\b/g,
  nia: /\b(?:nia|irrigation)\b/g,
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function namedPlaces<T>(text: string, places: T[], name: (place: T) => string) {
  const matches: T[] = [];
  let rest = ` ${text} `;
  for (const label of [...new Set(places.map(name))].sort(
    (a, b) => b.length - a.length,
  )) {
    if (!rest.includes(` ${label} `)) continue;
    matches.push(...places.filter((place) => name(place) === label));
    rest = rest.replaceAll(` ${label} `, " ");
  }
  return { matches, rest: rest.trim() };
}

type ParsedQuestion =
  | { error: string }
  | {
      kind: QuestionKind;
      province: string;
      lgu: string;
      program: string;
      stage: string;
      direction: string;
    };

export function parseTrackerQuestion(input: string): ParsedQuestion {
  const text = normalize(input);
  const kind = questionKind(text);
  if (
    !kind ||
    /\b(?:spend|spending|spent|paid|completed|corruption|contractors?)\b/.test(
      text,
    )
  ) {
    return {
      error:
        "Choose a budget total, ranking, paired change, or source document question.",
    };
  }
  const provinces = namedPlaces(text, PROVINCES, (place) =>
    normalize(place.name),
  );
  const localities = namedPlaces(provinces.rest, LOCATIONS, (place) =>
    normalize(localityTerm(place.name)),
  );
  const province = provinces.matches[0]?.slug;
  const candidates = localities.matches.filter(
    (place) => !province || place.province === province,
  );
  if (
    provinces.matches.length > 1 ||
    candidates.length > 1 ||
    (localities.matches.length && !candidates.length)
  ) {
    return {
      error:
        "Choose one province and locality using the filters, or include the province in your question.",
    };
  }
  let rest = localities.rest;
  const programMatches = Object.entries(programs).filter(([, pattern]) =>
    rest.match(pattern),
  );
  if (programMatches.length > 1)
    return { error: "Ask about one source program at a time." };
  for (const [, pattern] of programMatches) rest = rest.replace(pattern, " ");
  const nep = /\bnep\b/.test(rest),
    house = /\bhouse\b/.test(rest);
  if (
    kind === "changes" &&
    /\b(largest|biggest|highest|top|total)\b/.test(rest)
  ) {
    return { error: "Choose a paired change list or a ranking question." };
  }
  if (kind === "documents" && (nep || house)) {
    return {
      error:
        "Ask for the source documents, then choose the specific reading in the document centre.",
    };
  }
  if (nep && house && (kind === "largest" || kind === "total")) {
    return {
      error:
        "Choose one budget stage for this question. The total view also shows the other stage separately.",
    };
  }
  const increase = /\bincreas(?:e|ed|es)\b/.test(rest),
    decrease = /\bdecreas(?:e|ed|es)\b/.test(rest);
  const leftover = rest
    .replace(
      /\b(?:how|much|what|which|where|can|i|check|show|me|the|a|an|is|are|in|for|of|from|to|between|and|with|has|have|at|by|fiscal|fy|2027|total|proposed|proposal|proposals|budget|budgets|allocation|allocations|amount|amounts|largest|biggest|highest|top|projects?|records?|paired|changes?|changed|increas(?:e|ed|es)|decreas(?:e|ed|es)|difference|source|documents?|pdf|verify|nep|house|bill|city|municipality|negros island region|negros island|all)\b/g,
      " ",
    )
    .trim();
  if (leftover)
    return {
      error:
        "Some terms could not be applied. Use a suggested question or choose the place, program, and stage below.",
    };
  return {
    kind,
    province: province ?? candidates[0]?.province ?? "",
    lgu: candidates[0]?.code ?? "",
    program: programMatches[0]?.[0] ?? "",
    stage: nep && !house ? "nep" : house ? "house" : "",
    direction:
      kind === "changes" && increase !== decrease
        ? increase
          ? "increased"
          : "decreased"
        : "",
  };
}
