import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient, type Client } from '../src/api/client';
import type { Envelope, ProjectList, ProjectRow } from '../src/api/types';
import { resolveScope, summarise, type ScopedProject } from '../src/lib/scope';
import { csvCell, projectsCsv } from '../src/lib/csv';
import { gaaCsv, gaaYearTotals, type GaaRow } from '../src/lib/gaa';
import { php, phpFull } from '../src/lib/format';
import { safeHref } from '../src/lib/safe-url';
import { ACK_KEY, LEGAL_VERSION, hasAcknowledgment, saveAcknowledgment } from '../src/lib/legal';
import config from '../portal.config';

// Captured real response is used for shape only. Overrides below are test-only values.
const evidence = JSON.parse(readFileSync('docs/evidence/resolved-scope.json', 'utf8'));
const sample: ScopedProject = evidence.projects[0];
const row = (changes: Partial<ProjectRow> = {}): ProjectRow => ({ ...sample, ...changes });

test('missing values remain distinct from zero, and budget versions stay separate', () => {
  const s = summarise([row({ nep_php: null, house_php: 200, bridge_group: 'house_only' }), row({ nep_php: 0, house_php: 0, bridge_group: 'unchanged' })]);
  assert.deepEqual(s.nep, { rows: 1, php: 0 });
  assert.deepEqual(s.house, { rows: 2, php: 200 });
  assert.equal(s.groups.house_only.rows, 1);
  assert.equal(php(null), '—'); assert.equal(phpFull(0), '₱0'); assert.equal(phpFull(1234567), '₱1,234,567');
});
test('all six comparison classifications and uncertain matches are retained', () => {
  const groups = ['house_only', 'nep_only', 'unchanged', 'increased', 'decreased', 'scope_review'] as const;
  const s = summarise(groups.map(g => row({ bridge_group: g, held: g === 'scope_review' })));
  for (const g of groups) assert.equal(s.groups[g].rows, 1);
  assert.equal(s.unconfirmed, 1);
});
test('all pages are fetched and missing pages fail closed', async () => {
  const original = globalThis.fetch;
  const offsets: number[] = [];
  let broken = false;
  globalThis.fetch = (async input => {
    const offset = Number(new URL(String(input)).searchParams.get('offset'));
    offsets.push(offset);
    const rows = Array.from({ length: broken && offset ? 0 : Math.min(200, 401-offset) }, (_, i) => row({ id: String(offset+i) }));
    return Response.json({ meta: evidence.meta, disclaimers: [], data: { total: 401, rows } });
  }) as typeof fetch;
  try {
    assert.equal((await createClient('https://test.invalid').allProjects('dpwh', {})).rows.length, 401);
    assert.deepEqual(offsets.sort((a,b)=>a-b), [0,200,400]);
    broken = true;
    await assert.rejects(createClient('https://test.invalid').allProjects('dpwh', {}), /pagination did not reconcile/);
  } finally { globalThis.fetch = original; }
});
test('API failures are removed from request cache and can be retried', async () => {
  const original = globalThis.fetch; let calls = 0;
  globalThis.fetch = (async () => ++calls === 1 ? new Response('', { status: 503 }) : Response.json({ ok: true })) as typeof fetch;
  try { const api = createClient('https://test.invalid'); await assert.rejects(api.json('')); assert.deepEqual(await api.json(''), { ok: true }); } finally { globalThis.fetch = original; }
});
test('historical pagination rejects repeated cursors instead of repeating rows', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => Response.json({data:[{fam_key:'test'}],next_cursor:'repeated',meta:{matched:3}})) as typeof fetch;
  try { await assert.rejects(createClient('https://test.invalid').gaaPrograms('18','test'),/repeated a cursor/); } finally { globalThis.fetch=original; }
});
test('historical pagination rejects incomplete final pages', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => Response.json({data:[{fam_key:'test'}],next_cursor:null,meta:{matched:2}})) as typeof fetch;
  try { await assert.rejects(createClient('https://test.invalid').gaaPrograms('18','test'),/did not reconcile/); } finally { globalThis.fetch=original; }
});
test('overlapping office and place queries deduplicate while preserving reasons and shared-office metadata', async () => {
  const sharedLens = { shared_office_total: true, note: 'Shared, never split', offices: [] };
  const env = { meta: evidence.meta, disclaimers: [], data: { total: 1, rows: [row()], office_lens: sharedLens } } as unknown as Envelope<ProjectList>;
  const api = { allProjects: async () => ({ list: env, rows: [row()], truncated: false }), href: () => 'https://test.invalid/' } as unknown as Client;
  const s = await resolveScope(api, { ...config, scope: { offices: ['test office'], places: [{ label: 'test place', datasets: ['dpwh'] }] } });
  assert.equal(s.projects.length, 1); assert.equal(s.projects[0].reasons.length, 2);
  assert.equal(s.queries[0].officeLens?.shared_office_total, true);
  assert.equal(summarise(s.projects).house.php, sample.house_php);
});
test('region filtering preserves unknowns and excludes other regions without rewriting labels', async () => {
  const rows = [row({ id:'nir', region_key:'NIR' }), row({ id:'unknown', region_key:null }), row({ id:'other', region_key:'II' })];
  const env = { meta:evidence.meta, disclaimers:[], data:{ total:3, rows } } as unknown as Envelope<ProjectList>;
  const api = { allProjects:async()=>({list:env, rows, truncated:false}), href:()=> 'https://test.invalid/' } as unknown as Client;
  const s = await resolveScope(api,{...config,scope:{places:[{label:'place',region:'NIR',datasets:['dpwh']}]}});
  assert.deepEqual(s.projects.map(p=>p.id).sort(), ['nir','unknown']);
});
test('CSV exports neutralize spreadsheet formulas while preserving numeric negatives and nulls', () => {
  for (const s of ['=HYPERLINK("evil")', ' +SUM(1)', '\t@SUM(1)', '-CMD']) assert.ok(csvCell(s).includes("'"));
  assert.equal(csvCell(-1), '-1'); assert.equal(csvCell(null), '');
  const csv = projectsCsv([{...sample,title:'=SUM(1)',nep_php:null}]);
  assert.ok(csv.includes("'=SUM(1)")); assert.ok(csv.includes('why_listed_here'));
  const history = gaaCsv([{department:'Test',agency_id:'1',name:'=SUM(1)',years:{},reasons:[],fam_key:'test'} as unknown as GaaRow]);
  assert.ok(history.includes("'=SUM(1)"));
});
test('unsafe document schemes are rejected', () => {
  assert.equal(safeHref('javascript:alert(1)'), '#'); assert.equal(safeHref('data:text/html,evil'), '#');
  assert.equal(safeHref('https://budget-assets.bettergov.ph/doc.pdf#page=3'), 'https://budget-assets.bettergov.ph/doc.pdf#page=3');
});
test('legal acknowledgment stores only a version and older versions require renewal', () => {
  const values = new Map<string,string>(); const storage = { getItem:(k:string)=> values.get(k) ?? null, setItem:(k:string,v:string)=>{values.set(k,v);} };
  assert.equal(hasAcknowledgment(storage), false); storage.setItem(ACK_KEY,'old'); assert.equal(hasAcknowledgment(storage),false);
  saveAcknowledgment(storage); assert.equal(hasAcknowledgment(storage),true); assert.deepEqual([...values],[[ACK_KEY,LEGAL_VERSION]]);
});
test('blocked browser storage does not throw or claim persisted acknowledgment', () => {
  const storage = { getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('blocked');} };
  assert.doesNotThrow(()=>saveAcknowledgment(storage)); assert.equal(hasAcknowledgment(storage),false);
});
test('historical totals count positive appropriations only and do not merge budget stages', () => {
  const totals = gaaYearTotals([{ years:{'2020':{amount:100},'2021':{amount:0}} } as unknown as GaaRow]);
  assert.equal(totals.find(t=>t.year===2020)?.amount,100); assert.equal(totals.find(t=>t.year===2021)?.programs,0);
  assert.equal(totals.some(t=>Number(t.year)===2027),false);
});
test('regional configuration includes all three provinces and Bacolod without auth',()=>{assert.equal(config.kind,'region');assert.equal(config.scope.places?.length,4);assert.ok(config.scope.places?.some(p=>p.label==='Siquijor'));assert.ok(config.scope.places?.some(p=>p.label==='Bacolod'));assert.equal(config.reporting?.enabled,false);});
