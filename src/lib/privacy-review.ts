/** Conservative triage of displayed source text, not a determination that a person is identifiable. */
export function sensitiveTextRules(text: string): string[] {
  const rules: [string, RegExp][] = [
    ["email-address", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
    [
      "contact-number",
      /\b(?:mobile|telephone|contact|phone|tel)\s*(?:number|no\.?|#)?\s*[:#]\s*\+?[\d ()-]{7,}/i,
    ],
    [
      "government-id-context",
      /\b(?:SSS|GSIS|TIN|PhilSys|passport|PhilHealth)\s*(?:number|no\.?)?\s*[:#]\s*[\d -]{6,}/i,
    ],
    ["birth-date-context", /\b(?:date of birth|birthdate|DOB)\s*[:#]\s*\d/i],
  ];
  return rules
    .filter(([, pattern]) => pattern.test(text))
    .map(([name]) => name);
}
