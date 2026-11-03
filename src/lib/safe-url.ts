/** Explicit source trust list; public API access is intentional. */
const SOURCE_HOSTS = new Set([
  'budget.bettergov.ph', 'budget-assets.bettergov.ph', 'juris-assets.bettergov.ph',
  'bettergov.ph', 'www.bettergov.ph', 'www.dbm.gov.ph', 'dbm.gov.ph',
  'budget-transparency-portal.senate.gov.ph', 'www.congress.gov.ph',
  'psa.gov.ph', 'privacy.gov.ph',
]);
const REFERENCE_HOSTS = new Set(['github.com', 'bills.juris.ph', 'commons.wikimedia.org', 'www.openstreetmap.org']);

export function sourceHref(value: unknown, references = false): string | null {
  if (typeof value !== 'string' || !value || ([...value].some(c => c.charCodeAt(0) <= 32 || c.charCodeAt(0) === 127) || value.includes('\\'))) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    if (!SOURCE_HOSTS.has(url.hostname) && !(references && REFERENCE_HOSTS.has(url.hostname))) return null;
    if (/\/(?:redirect|out)(?:\/|$)/i.test(url.pathname)) return null;
    if ([...url.searchParams.keys()].some(k => /^(?:url|redirect|redirect_uri|redirect_url|return|returnTo|next|target|destination)$/i.test(k))) return null;
    return url.href;
  } catch { return null; }
}

export function safeHref(value: string): string { return sourceHref(value, true) ?? '#'; }

/** Prefer a source-provided citizen page, then a PDF with its original fragment. */
export function resolveSourceLink(project: { url?: unknown; pdf_url?: Record<string, unknown> }): string | null {
  const canonical = sourceHref(project.url);
  if (canonical && !new URL(canonical).pathname.startsWith('/api/')) return canonical;
  for (const key of ['hgab3', 'hgab2', 'nep']) {
    const pdf = sourceHref(project.pdf_url?.[key]);
    if (pdf && !new URL(pdf).pathname.startsWith('/api/')) return pdf;
  }
  return null;
}

/** General website pages only; never manufacture region-filtered website paths. */
export function coverageSource(endpoint: string): string | null {
  const href = sourceHref(endpoint);
  if (!href) return null;
  const path = new URL(href).pathname;
  if (path.startsWith('/api/v1/hgab/2027')) return 'https://budget.bettergov.ph/hgab/2027/overview';
  if (path.startsWith('/api/v1/gaa/')) return 'https://budget.bettergov.ph/';
  if (path.startsWith('/api/v1/nep/2027')) return 'https://budget.bettergov.ph/nep/2027';
  return null;
}
