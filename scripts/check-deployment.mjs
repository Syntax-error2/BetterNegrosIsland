import fs from 'node:fs';
import assert from 'node:assert/strict';
import {securityHeaders} from './deployment-policy.mjs';
const base=new URL(process.argv[2]??'http://127.0.0.1:5134');
if(!['http:','https:'].includes(base.protocol)||base.username||base.password)throw Error('Expected a plain HTTP(S) site origin');
const cases=[['/',200],['/analytics',200],['/privacy',200],['/we-are-not-ignorant',200],['/projects/dpwh/house-reading%3A1918',200],['/evidence/hfep/ib%3Ap885%3Ar51%7Cinfrastructure',200],['/data/manifest.json',200],['/data/missing-audit-file.json',404],['/assets/missing-audit-file.js',404],['/brand/missing-audit-file.png',404],['/.env',404],['/__qa/charts',404],['/not-a-real-page',404]];
const results=await Promise.all(cases.map(async([pathname,status])=>{
  const r=await fetch(new URL(pathname,base),{redirect:'manual',signal:AbortSignal.timeout(20000)});
  assert.equal(r.status,status,pathname+' returned an unexpected status');
  for(const [key,value] of Object.entries(securityHeaders))assert.equal(r.headers.get(key),value,pathname+' '+key);
  const body=await r.text();
  if(status===404){assert.ok(!body.includes('id="root"'),pathname+' returned the application shell');assert.ok(!r.headers.get('cache-control')?.includes('immutable'),pathname+' caches a missing file indefinitely');}
  if(pathname==='/data/manifest.json'){assert.match(r.headers.get('content-type')??'',/application\/json/);assert.ok(JSON.parse(body).version);assert.match(r.headers.get('cache-control')??'',/no-cache/);}
  return {path:pathname,status:r.status,type:r.headers.get('content-type'),cache:r.headers.get('cache-control'),result:'PASS'};
}));
const html=await(await fetch(new URL('/',base))).text();
const asset=html.match(/src="([^\"]+\.js)"/)?.[1];
assert.ok(asset,'No production module found');
const js=await fetch(new URL(asset,base));assert.equal(js.status,200);assert.match(js.headers.get('content-type')??'',/(javascript|ecmascript)/);
const manifest=await(await fetch(new URL('/data/manifest.json',base))).json();
const shard=await fetch(new URL(manifest.summary,base));assert.equal(shard.status,200);assert.match(shard.headers.get('cache-control')??'',/immutable/);
const report={checked_at:new Date().toISOString(),origin:base.origin,cases:results,module:{path:asset,status:js.status,result:'PASS'},limits:'HTTP checks on this origin only; no legal clearance or other-host verification implied.'};
fs.mkdirSync('docs/qa/deployment-privacy',{recursive:true});fs.writeFileSync('docs/qa/deployment-privacy/http-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
