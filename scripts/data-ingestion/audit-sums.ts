import {retryDelay} from './retry.ts';
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import {safeSum} from '../../src/lib/regional-data.ts';
const m=JSON.parse(fs.readFileSync('public/data/manifest.json','utf8'));
const s=JSON.parse(fs.readFileSync('public'+m.scope,'utf8'));
const ledger=JSON.parse(fs.readFileSync('public'+m.coverage,'utf8'));
const audit:any[]=[];
for(const c of ledger.filter((r:any)=>['dpwh','fmr','hfep','nia'].includes(r.dataset))) {
 const url=new URL(c.endpoint);url.searchParams.set('limit','1');
 let j:any;
 for(let attempt=0;attempt<4;attempt++) {
  const r=await fetch(url,{headers:{'user-agent':'BetterNegrosIsland/0.2 public-budget-sum-audit'},signal:AbortSignal.timeout(30000)}).catch(()=>null);
  if(r?.ok){j=await r.json();break;}
  if(r&&![429,500,502,503,504].includes(r.status))throw Error('Audit source HTTP '+r.status);
  await new Promise(resolve=>setTimeout(resolve,retryDelay(r?.headers.get('retry-after')??null,attempt)));
 }
 if(!j||j.meta.built_at!==m.source_build)throw Error('Source changed/unavailable; refresh snapshot before auditing');
 const rows=s.projects.filter((r:any)=>r.dataset===c.dataset&&(c.query.region?r.region_key==='NIR':r.reasons.some((reason:any)=>reason.label===(c.query.office??c.query.q))));
 if(rows.length!==j.data.total)throw Error('Audit membership/count mismatch');
 const sums:any={};
 for(const key of ['nep_php','hgab2_php','hgab3_php']) {
  const values=rows.map((r:any)=>r[key]).filter((v:any)=>v!=null);
  const actual=values.length?safeSum(values):null,expected=j.data.sums[key];
  if(actual!==expected)throw Error('Audit amount mismatch: '+c.endpoint+' '+key+' '+actual+' vs '+expected);
  sums[key]=actual;
 }
 audit.push({endpoint:c.endpoint,records:rows.length,sums,source_sums:j.data.sums,source_meta:j.meta,verified_at:new Date().toISOString(),status:'RECONCILED'});
 await new Promise(resolve=>setTimeout(resolve,250));
}
fs.writeFileSync('docs/regional/project-sum-audit.json',JSON.stringify(audit,null,2));
console.log(audit.length+' project query totals and version sums reconciled; source build unchanged.');
