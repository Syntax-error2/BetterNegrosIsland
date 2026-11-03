import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { sensitiveTextRules } from '../src/lib/privacy-review';

const findings:{file:string;path_fingerprint:string;rules:string[]}[]=[];
let files=0,strings=0;
function inspect(value:unknown,file:string,field:string){
  if(typeof value==='string'){
    strings++;
    const rules=sensitiveTextRules(value);
    if(rules.length)findings.push({file,path_fingerprint:createHash('sha256').update(field).digest('hex').slice(0,16),rules});
  }else if(Array.isArray(value))value.forEach((v,i)=>inspect(v,file,field+'['+i+']'));
  else if(value&&typeof value==='object')for(const [k,v] of Object.entries(value))inspect(v,file,field+'.'+k);
}
function walk(dir:string){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())walk(full);
  else if(entry.name.endsWith('.json')){files++;inspect(JSON.parse(fs.readFileSync(full,'utf8')),full.replaceAll('\\','/'),'$');}
}}
walk('public/data');
const report={reviewed_at:new Date().toISOString(),scope:'All JSON strings in public/data, including nested raw records and retained snapshots',files,strings,flag_count:findings.length,findings,limitations:'Pattern triage only: cannot determine lawful basis, identify every person, review linked PDFs or certify Data Privacy Act compliance. Matching content is intentionally not reproduced.'};
fs.mkdirSync('docs/qa/deployment-privacy',{recursive:true});
fs.writeFileSync('docs/qa/deployment-privacy/published-data-triage.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(findings.length)process.exitCode=1;
