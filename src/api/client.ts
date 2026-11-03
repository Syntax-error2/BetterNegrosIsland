/**
 * A small client for the BetterGov.ph Budget API. Works in the browser and in
 * Node 20+ (the scripts), since both have `fetch`.
 *
 * Every GET is memoised for the life of the page: the API is read-only and
 * edge-cached, and the portal asks for the same overview from several views.
 */
import type { DatasetKey } from '../config';
import type {
  DistrictCard, DistrictList, Envelope, GaaDepartment, GaaEnvelope, GaaProgram, Overview, ProjectDetail, ProjectList, ProjectRow,
} from './types';

/** The API's page-size ceiling for project lists. */
export const PAGE_SIZE = 200;
/** A place query that matches more than this is too broad to be one LGU's; the portal says so. */
export const MAX_ROWS_PER_QUERY = 4000;
/** GAA program lists page up to 500 rows. */
export const GAA_PAGE_SIZE = 500;
/** A place matching more GAA program families than this in one department is cut there, and said so. */
export const MAX_GAA_PROGRAMS = 6000;

export type Params = Record<string, string | number | undefined>;

export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  constructor(status: number, url: string, message: string) {
    super(message);
    this.status = status;
    this.url = url;
  }
}

export interface Client {
  base: string;
  /** Any JSON route; paths not starting with /api/ are under /api/v1/hgab/2027. */
  json<T>(path: string, params?: Params): Promise<T>;
  get<T>(path: string, params?: Params): Promise<Envelope<T>>;
  overview(): Promise<Envelope<Overview>>;
  /** Every row matching the filters, fetched page by page. */
  allProjects(dataset: DatasetKey, filters: Params): Promise<{ list: Envelope<ProjectList>; rows: ProjectRow[]; truncated: boolean }>;
  project(dataset: DatasetKey, id: string): Promise<Envelope<ProjectDetail>>;
  district(id: string): Promise<Envelope<DistrictCard>>;
  districts(params?: Params): Promise<Envelope<DistrictList>>;
  /** Absolute URL for an API path, for "see the data" links. */
  href(path: string, params?: Params): string;
  /** GAA FY2020–2026: the departments. */
  gaaDepartments(): Promise<GaaEnvelope<GaaDepartment[]>>;
  /** GAA FY2020–2026: every program family in one department whose name matches q, all years, page by page. */
  gaaPrograms(departmentId: string, q: string): Promise<{ first: GaaEnvelope<GaaProgram[]>; rows: GaaProgram[]; truncated: boolean }>;
}

const ROOT = '/api/v1/hgab/2027';

const hasControl = (text: string) => [...text].some(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127);
function recordId(id: string): string {
  if (typeof id !== 'string' || !id || id.length > 512 || (/[\\/]/.test(id) || hasControl(id)) || id === '.' || id === '..') throw new Error('Invalid source record ID');
  return encodeURIComponent(id);
}

function checkedProject(env: Envelope<ProjectDetail>, dataset: DatasetKey, id: string): Envelope<ProjectDetail> {
  const p = env?.data;
  const money = ['nep_php','hgab2_php','hgab3_php','house_php','api_php','delta_php'] as const;
  if (!p || p.id !== id || p.dataset !== dataset || typeof p.title !== 'string' ||
      env.meta?.currency !== 'PHP' || env.meta?.scale !== 'pesos' || !Array.isArray(env.disclaimers) ||
      !p.pdf_url || typeof p.pdf_url !== 'object' || !Array.isArray(p.flags) ||
      !p.labels || typeof p.labels.status?.label !== 'string' || !Array.isArray(p.labels.flags) ||
      money.some(k => p[k] !== null && (typeof p[k] !== 'number' || !Number.isSafeInteger(p[k])))) {
    throw new Error('The source record could not be validated. No estimated values are shown.');
  }
  return env;
}

function validateRequest(path: string, params: Params): void {
  const normalized = path.startsWith('/api/') ? path : ROOT + path;
  const hgab = /^\/api\/v1\/hgab\/2027(?:\/datasets(?:\/(?:dpwh|fmr|hfep|nia)(?:\/(?:projects(?:\/[^/?#]+)?|regions))?)?|\/districts(?:\/[^/?#]+)?|\/documents|\/reconciliation)?$/;
  const gaa = /^\/api\/v1\/gaa\/departments(?:\/\d{2}(?:\/programs)?)?$/;
  if (!hgab.test(normalized) && !gaa.test(normalized)) throw new Error('Unsupported source API path');
  if (/[\\?#]/.test(normalized) || normalized.split('/').some(s => {
    try { const decoded = decodeURIComponent(s); return decoded === '.' || decoded === '..' || (/[\\/]/.test(decoded) || hasControl(decoded)); } catch { return true; }
  })) throw new Error('Invalid source API path');
  const allowed = new Set(['q', 'group', 'held', 'region', 'program', 'pap', 'office', 'office_kind', 'zone', 'trace', 'reading_status', 'flag', 'has_coordinates', 'sort', 'order', 'limit', 'offset', 'cursor', 'attribution', 'dataset', 'status']);
  const enums: Record<string, readonly string[]> = { held: ['all','hide','only'], zone: ['local','fap'], has_coordinates: ['0','1'], order: ['asc','desc'], attribution: ['A','B','mixed','none'], dataset: ['dpwh','fmr','hfep','nia'] };
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    if (!allowed.has(key) || !['string','number'].includes(typeof value) || String(value).length > (key === 'cursor' ? 4096 : 512) || hasControl(String(value))) throw new Error('Invalid source API filter');
    if (key === 'limit' || key === 'offset') {
      const max = key === 'offset' ? 100000 : normalized.includes('/gaa/') ? 500 : normalized.includes('/districts') ? 254 : 200;
      if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < (key === 'limit' ? 1 : 0) || Number(value) > max) throw new Error('Invalid source pagination');
    }
    if (enums[key] && !enums[key].includes(String(value))) throw new Error('Invalid source API option');
    if (key === 'sort' && !(normalized.includes('/districts') ? ['hgab3','gaa2026','change','name'] : ['house','nep','delta','abs_delta','title']).includes(String(value))) throw new Error('Invalid source sort');
    if (key === 'group' && !String(value).split(',').every(v => ['house_only','nep_only','unchanged','increased','decreased','scope_review'].includes(v))) throw new Error('Invalid source classification');
  }
}

export function createClient(base: string): Client {
  const host = base.replace(/\/+$/, '');
  const cache = new Map<string, Promise<unknown>>();

  const href = (path: string, params: Params = {}) => {
    validateRequest(path, params);
    const url = new URL(path.startsWith('/api/') ? path : ROOT + path, host + '/');
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
    return url.toString();
  };

  function json<T>(path: string, params: Params = {}): Promise<T> {
    const url = href(path, params);
    let hit = cache.get(url) as Promise<T> | undefined;
    if (!hit) {
      hit = (async () => {
        const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(25000), credentials: 'omit', referrerPolicy: 'no-referrer' });
        if (!res.ok) {
          throw new ApiError(res.status, url, 'Source request unavailable. Please try again later.');
        }
        return (await res.json()) as T;
      })();
      // A failed request must not stick: drop it so a retry fetches again.
      hit.catch(() => cache.delete(url));
      cache.set(url, hit);
    }
    return hit;
  }

  const get = <T,>(path: string, params: Params = {}) => json<Envelope<T>>(path, params);

  async function gaaPrograms(departmentId: string, q: string) {
    if (!/^\d{2}$/.test(departmentId)) throw new Error('Invalid source department');
    const path = `/api/v1/gaa/departments/${recordId(departmentId)}/programs`;
    const first = await json<GaaEnvelope<GaaProgram[]>>(path, { q, limit: GAA_PAGE_SIZE });
    const rows = [...first.data];
    let cursor = first.next_cursor;
    const visited = new Set<string>();
    // The cursor chains pages, so they are fetched one after another.
    while (cursor && rows.length < MAX_GAA_PROGRAMS) {
      if (visited.has(cursor)) { cache.clear(); throw new Error('Historical pagination repeated a cursor. Please try again.'); }
      visited.add(cursor);
      const page = await json<GaaEnvelope<GaaProgram[]>>(path, { q, limit: GAA_PAGE_SIZE, cursor });
      rows.push(...page.data);
      cursor = page.next_cursor;
    }
    if (!cursor && ((first.meta.matched != null && first.meta.matched !== rows.length) || new Set(rows.map(r => r.fam_key)).size !== rows.length)) {
      cache.clear();
      throw new Error('Historical pagination did not reconcile. Please try again.');
    }
    return { first, rows, truncated: Boolean(cursor) };
  }

  async function allProjects(dataset: DatasetKey, filters: Params) {
    const path = `/datasets/${dataset}/projects`;
    const first = await get<ProjectList>(path, { ...filters, limit: PAGE_SIZE, offset: 0 });
    const total = Math.min(first.data.total, MAX_ROWS_PER_QUERY);
    const offsets: number[] = [];
    for (let o = PAGE_SIZE; o < total; o += PAGE_SIZE) offsets.push(o);
    // A few pages at a time: kind to the API, quick enough for a few thousand rows.
    const pages: Envelope<ProjectList>[] = [];
    for (let i = 0; i < offsets.length; i += 4) {
      const batch = offsets.slice(i, i + 4).map((offset) => get<ProjectList>(path, { ...filters, limit: PAGE_SIZE, offset }));
      pages.push(...(await Promise.all(batch)));
    }
    const rows = [first, ...pages].flatMap((p) => p.data.rows);
    if (rows.length !== total || new Set(rows.map(r => r.id)).size !== rows.length || pages.some(p => p.data.total !== first.data.total)) {
      // Fail closed: never publish a headline total from missing or duplicated pages.
      cache.clear();
      throw new Error('Project pagination did not reconcile. The source may have changed; please try again.');
    }
    return { list: first, rows, truncated: first.data.total > MAX_ROWS_PER_QUERY };
  }

  return {
    base: host,
    json,
    get,
    href,
    gaaDepartments: () => json<GaaEnvelope<GaaDepartment[]>>('/api/v1/gaa/departments'),
    gaaPrograms,
    overview: () => get<Overview>(''),
    allProjects,
    project: async (dataset, id) => checkedProject(await get<ProjectDetail>(`/datasets/${dataset}/projects/${recordId(id)}`), dataset, id),
    district: async (id) => get<DistrictCard>(`/districts/${recordId(id)}`),
    districts: (params = {}) => get<DistrictList>('/districts', params),
  };
}
