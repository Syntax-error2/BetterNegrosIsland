import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dataFingerprint } from './fingerprint.mjs';

const run = (file, cwd) => new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[path.resolve('node_modules/tsx/dist/cli.mjs'),path.resolve(file)],{cwd,stdio:'inherit',shell:false});
  child.on('error',reject);
  child.on('exit',code=>code===0?resolve():reject(Error(`${file} failed (${code}); current published data was not replaced.`)));
});
const json=async file=>JSON.parse(await fs.readFile(file,'utf8'));

/** Isolated preparation only. Never writes to the current public/data directory. */
export async function prepareCandidate({rehearse=false,execute=run}={}) {
  const repo=process.cwd();
  const before=await json(path.join(repo,'public/data/manifest.json'));
  const stage=await fs.mkdtemp(path.join(os.tmpdir(),'bni-refresh-'));
  try {
    if(rehearse)await fs.cp(path.join(repo,'public/data'),path.join(stage,'public/data'),{recursive:true});
    else await execute('scripts/data-ingestion/refresh.ts',stage);
    await execute('scripts/data-ingestion/validate-candidate.ts',stage);
    await execute('scripts/privacy-review.ts',stage);
    const after=await json(path.join(stage,'public/data/manifest.json'));
    const oldRows=(await json(path.join(repo,'public'+before.scope))).projects;
    const newRows=(await json(path.join(stage,'public'+after.scope))).projects;
    // Carry retained verified snapshots into the candidate so the public reading
    // history survives publication. Never overwrite a freshly extracted shard.
    for(const entry of await fs.readdir(path.join(repo,'public/data/snapshots'),{withFileTypes:true})){
      if(!entry.isDirectory())continue;
      if(!/^\d{4}-\d{2}-\d{2}-[a-f0-9]{12,64}$/.test(entry.name))throw Error('Invalid retained snapshot directory');
      const destination=path.join(stage,'public/data/snapshots',entry.name);
      const previous=path.join(repo,'public/data/snapshots',entry.name);
      const retained=await json(path.join(previous,'manifest.json'));
      // Fingerprint verifies all seven retained shards before they are carried.
      const { createHash }=await import('node:crypto');
      for(const field of ['scope','overview','districts','history','nep','summary','coverage']){
        const url=`/data/snapshots/${entry.name}/${field}.json`;
        if(retained.version!==entry.name||retained[field]!==url||createHash('sha256').update(await fs.readFile(path.join(previous,field+'.json'))).digest('hex')!==retained.checksums?.[url])throw Error('Unverified retained snapshot');
      }
      let exists=true;try{await fs.access(destination);}catch(error){if(error.code==='ENOENT')exists=false;else throw error;}
      if(exists){
        for(const file of ['manifest','scope','overview','districts','history','nep','summary','coverage'])if(!(await fs.readFile(path.join(previous,file+'.json'))).equals(await fs.readFile(path.join(destination,file+'.json'))))throw Error('A retained snapshot version cannot be overwritten');
      }else await fs.cp(previous,destination,{recursive:true});
    }
    try{await fs.copyFile(path.join(repo,'public/data/hearings.json'),path.join(stage,'public/data/hearings.json'));}catch(error){if(error.code!=='ENOENT')throw error;}
    await execute('scripts/build-reading-data.ts',stage);
    const oldMap=new Map(oldRows.map(p=>[p.key,p]));
    const newMap=new Map(newRows.map(p=>[p.key,p]));
    const report={prepared_at:new Date().toISOString(),mode:rehearse?'EXISTING SNAPSHOT REHEARSAL — NO API REQUESTS':'FRESH API CANDIDATE',published:false,
      data_changed:dataFingerprint(repo)!==dataFingerprint(stage),
      previous_version:before.version,candidate_version:after.version,retrieved_at:after.retrieved_at,
      previous_records:oldRows.length,candidate_records:newRows.length,
      added:newRows.filter(p=>!oldMap.has(p.key)).length,removed:oldRows.filter(p=>!newMap.has(p.key)).length,
      changed:newRows.filter(p=>oldMap.has(p.key)&&JSON.stringify(oldMap.get(p.key).raw)!==JSON.stringify(p.raw)).length,
      note:'Complete only for the configured FY2027 programs, regional/office/title queries and FY2020–FY2026 history. No deployment or legal/privacy clearance.'};
    const relative=path.posix.join('release/nir-refresh',Date.now()+'-'+after.version);
    const destination=path.join(repo,relative);
    await fs.mkdir(destination,{recursive:true});
    await fs.cp(path.join(stage,'public'),path.join(destination,'public'),{recursive:true});
    await fs.cp(path.join(stage,'docs'),path.join(destination,'docs'),{recursive:true});
    await fs.writeFile(path.join(destination,'candidate.json'),JSON.stringify(report,null,2)+'\n');
    const next=path.join(repo,'release/nir-refresh/latest.next.json');
    await fs.writeFile(next,JSON.stringify({directory:relative,...report},null,2)+'\n');
    await fs.rename(next,path.join(repo,'release/nir-refresh/latest.json'));
    return {directory:relative,...report};
  } finally {
    const target=path.resolve(stage);
    if(path.dirname(target)!==path.resolve(os.tmpdir())||!path.basename(target).startsWith('bni-refresh-'))throw Error('Unexpected temporary cleanup target');
    await fs.rm(target,{recursive:true,force:true});
  }
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])) {
  const args=process.argv.slice(2);
  if(args.some(v=>v!=='--rehearse'))throw Error('Only --rehearse is supported; without it a full API extraction is prepared.');
  prepareCandidate({rehearse:args.includes('--rehearse')}).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});
}
