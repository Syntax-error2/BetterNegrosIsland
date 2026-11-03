import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceHref, resolveSourceLink, coverageSource } from '../src/lib/safe-url';
import { createClient } from '../src/api/client';
import { readFileSync } from 'node:fs';

test('source navigation trusts exact HTTPS hosts and preserves PDF fragments', () => {
  const pdf = 'https://budget-assets.bettergov.ph/hgab/2027/pdf/hb10858-3r-vol-ic.pdf#page=283';
  assert.equal(sourceHref(pdf), pdf);
  assert.equal(sourceHref('https://www.dbm.gov.ph/NEP.pdf#page=1'), 'https://www.dbm.gov.ph/NEP.pdf#page=1');
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', 'http://budget.bettergov.ph/', '//budget.bettergov.ph/', 'https://budget.bettergov.ph.evil.invalid/', 'https://evil.invalid/', 'https://user:pass@budget.bettergov.ph/', 'https://budget.bettergov.ph:444/', 'https://budget.bettergov.ph/redirect?url=https://evil.invalid', 'https://budget.bettergov.ph/?next=https://evil.invalid', 'https://budget.bettergov.ph/\\evil.invalid/', 'not a URL']) assert.equal(sourceHref(url), null, url);
  const canonical = 'https://budget.bettergov.ph/hgab/2027/hfep/p/ib%3Ap877%3Ar12%7Cinfrastructure';
  assert.equal(resolveSourceLink({url:canonical,pdf_url:{hgab3:pdf}}),canonical);
  assert.equal(resolveSourceLink({url:'https://evil.invalid',pdf_url:{hgab3:pdf}}),pdf);
  assert.equal(resolveSourceLink({url:'https://budget.bettergov.ph/api/v1/hgab/2027'}),null);
  assert.equal(resolveSourceLink({}),null);
});

test('every published project has a trusted citizen source, never an API default', () => {
  const manifest = JSON.parse(readFileSync('public/data/snapshots/2026-11-02-37334582ca74/manifest.json','utf8'));
  const {projects} = JSON.parse(readFileSync('public'+manifest.scope,'utf8'));
  assert.equal(projects.length,866);
  for (const p of projects) {
    const href = resolveSourceLink(p);
    assert.ok(href,p.key);
    assert.ok(!new URL(href).pathname.startsWith('/api/'),p.key);
  }
  assert.equal(coverageSource('https://budget.bettergov.ph/api/v1/hgab/2027/datasets/dpwh/projects?region=NIR'),'https://budget.bettergov.ph/hgab/2027/overview');
  assert.equal(coverageSource('https://evil.invalid/api/v1/hgab/2027'),null);
});

test('API rejects unsupported paths, malformed IDs, invalid enums and unsafe pagination before fetch', async () => {
  const client = createClient('https://budget.bettergov.ph');
  for (const path of ['https://evil.invalid/', '//evil.invalid', '/api/v1/unknown', '/datasets/evil/projects', '/datasets/dpwh/projects/..', '/datasets/dpwh/projects/%2e%2e', '/datasets/dpwh/projects/%2Fsecret', '/datasets/dpwh/projects?url=x']) assert.throws(()=>client.href(path));
  for (const params of [{limit:0},{limit:201},{offset:-1},{offset:Infinity},{limit:'1e2'},{held:'yes'},{group:'made_up'},{order:'random'},{sort:'spending'},{q:'x\nheader'},{secret:'value'}]) assert.throws(()=>client.href('/datasets/dpwh/projects',params));
  for (const id of ['', '.', '..', '../secret', 'x/y', 'x\\y', 'bad\u0000id']) await assert.rejects(client.project('dpwh',id));
  assert.equal(new URL(client.href('/datasets/dpwh/projects',{q:'Siquijor & roads = 1',held:'only',limit:200})).searchParams.get('q'),'Siquijor & roads = 1');
  assert.ok(client.href('/api/v1/gaa/departments/18/programs',{limit:500,cursor:'a+/=b'}).includes('cursor=a%2B%2F%3Db'));
});

test('live record IDs are percent encoded and requests omit credentials/referrers', async () => {
  const original=globalThis.fetch;
  let requested=''; let options:RequestInit|undefined;
  const p = JSON.parse(readFileSync('docs/evidence/resolved-scope.json','utf8')).projects[0];
  const data = {...p, id:'ib:p877:r12|infrastructure', dataset:'hfep', labels:{status:{label:'Unchanged'},flags:[]}};
  globalThis.fetch=(async (url,init)=>{requested=String(url);options=init;return Response.json({meta:{currency:'PHP',scale:'pesos'},disclaimers:[],data});}) as typeof fetch;
  try {
    await createClient('https://budget.bettergov.ph').project('hfep','ib:p877:r12|infrastructure');
    assert.ok(requested.endsWith('/ib%3Ap877%3Ar12%7Cinfrastructure'));
    assert.equal(options?.credentials,'omit');
    assert.equal(options?.referrerPolicy,'no-referrer');
    assert.ok(options?.signal);
  } finally {globalThis.fetch=original;}
});

test('live project responses reject coerced, unsafe and incomplete money instead of displaying it', async () => {
  const original=globalThis.fetch;
  const p = JSON.parse(readFileSync('docs/evidence/resolved-scope.json','utf8')).projects[0];
  let data={...p,labels:{status:{label:'Unchanged'},flags:[]}};
  globalThis.fetch=(async ()=>Response.json({meta:{currency:'PHP',scale:'pesos'},disclaimers:[],data})) as typeof fetch;
  try {
    assert.equal((await createClient('https://budget.bettergov.ph').project(p.dataset,p.id)).data.id,p.id);
    for(const value of ['100',Number.MAX_SAFE_INTEGER+1,undefined]) {
      data={...data,house_php:value};
      await assert.rejects(createClient('https://budget.bettergov.ph').project(p.dataset,p.id),/could not be validated/);
    }
    data={...data,house_php:null};
    assert.equal((await createClient('https://budget.bettergov.ph').project(p.dataset,p.id)).data.house_php,null);
  } finally {globalThis.fetch=original;}
});
