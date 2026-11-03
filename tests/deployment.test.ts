import test from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error Shared host policy is a native Node ESM module.
import { clientRoutes,deploymentFiles,securityHeaders } from '../scripts/deployment-policy.mjs';
import { snapshotJson } from '../src/lib/snapshot';

test('host fallbacks cover real application routes without swallowing missing data or assets',()=>{
  const files=deploymentFiles();
  const vercel=JSON.parse(files['vercel.json']);
  const matches=(url:string)=>clientRoutes.some((route:string)=>new RegExp('^'+route.replace(/:[a-zA-Z]+/g,'[^/]+')+'/?$').test(url));
  for(const url of ['/analytics','/privacy','/corrections','/snapshots/2026-11-02-37334582ca74/projects','/snapshots/2026-11-02-37334582ca74/projects/dpwh/house-reading%3A1918','/we-are-not-ignorant','/projects/dpwh/house-reading%3A1918','/evidence/hfep/ib%3Ap885%3Ar51%7Cinfrastructure'])assert.ok(matches(url),url);
  for(const url of ['/data/missing.json','/assets/missing.js','/snapshots/2026-11-02-37334582ca74/assets/missing.js','/brand/missing.png','/favicon.ico','/.env','/__qa/charts'])assert.equal(matches(url),false,url);
  assert.equal(vercel.rewrites.length,clientRoutes.length);
  const headers=Object.fromEntries(vercel.headers[0].headers.map((h:{key:string;value:string})=>[h.key,h.value]));
  assert.deepEqual(headers,securityHeaders);
  assert.ok(!files['netlify.toml'].includes('from = "/*"'));
});
test('snapshot loading rejects external/traversal URLs and HTML fallback responses and omits credentials',async()=>{
  const original=globalThis.fetch;
  let calls=0;
  globalThis.fetch=async(_url,options)=>{calls++;assert.equal(options?.credentials,'omit');assert.equal(options?.referrerPolicy,'no-referrer');return new Response('<html>missing</html>',{headers:{'content-type':'text/html'}});};
  try{
    for(const url of ['https://example.invalid/data/a.json','/data/../secret.json','/data/a.json?q=private','//example.invalid/data/a.json'])await assert.rejects(snapshotJson(url),/Invalid snapshot path/);
    assert.equal(calls,0);
    await assert.rejects(snapshotJson('/data/qa-html-fallback.json'),/not JSON/);
    globalThis.fetch=async()=>new Response('{"ok":true}',{headers:{'content-type':'application/json; charset=utf-8'}});
    assert.deepEqual(await snapshotJson('/data/qa-valid-json.json'),{ok:true});
  }finally{globalThis.fetch=original;}
});
