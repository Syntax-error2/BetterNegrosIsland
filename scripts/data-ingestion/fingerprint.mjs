import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Ignore collection timestamps only. Amounts, source build metadata, titles,
// geography, notices, coverage and all seven collections affect the fingerprint.
export function stableData(value){
  if(Array.isArray(value))return value.map(stableData);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>k!=='retrieved_at').map(k=>[k,stableData(value[k])]));
  return value;
}
export function dataFingerprint(root){
  const m=JSON.parse(fs.readFileSync(path.join(root,'public/data/manifest.json'),'utf8'));
  if(!/^\d{4}-\d{2}-\d{2}-[a-f0-9]{12,64}$/.test(m.version))throw Error('Invalid candidate version');
  const hash=createHash('sha256');
  for(const field of ['scope','overview','districts','history','nep','summary','coverage']){
    if(m[field]!==`/data/snapshots/${m.version}/${field}.json`)throw Error('Unsafe candidate path');
    const raw=fs.readFileSync(path.join(root,'public'+m[field]));
    if(createHash('sha256').update(raw).digest('hex')!==m.checksums?.[m[field]])throw Error('Candidate checksum mismatch');
    hash.update(field+'\n'+JSON.stringify(stableData(JSON.parse(raw.toString())))+'\n');
  }
  return hash.digest('hex');
}
