import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { snapshotSelection, snapshotPath } from '../src/lib/snapshot-selection';
import { createSnapshotReader, validatePinnedManifest } from '../src/lib/snapshot-reader';
import { safeSearchPath } from '../src/lib/notebook';
import { correctionLog, CORRECTIONS_EMAIL, correctionMailto } from '../src/lib/corrections';
// @ts-expect-error Native ESM ingestion module.
import { dataFingerprint, stableData } from '../scripts/data-ingestion/fingerprint.mjs';

const version='2026-11-02-37334582ca74';
const manifest=JSON.parse(fs.readFileSync(`public/data/snapshots/${version}/manifest.json`,'utf8'));

test('exact snapshot links preserve filters and fragments and reject unsafe versions',()=>{
  const path=snapshotPath('/projects?q=bridge&stage=nep#results',version);
  assert.equal(snapshotSelection(path).base,'/snapshots/'+version);
  assert.equal(snapshotSelection('/snapshots/bad/projects').invalid,true);
  assert.equal(snapshotSelection('/projects').version,null);
  assert.equal(safeSearchPath(`/snapshots/${version}/projects?stage=nep&q=bridge`),`/snapshots/${version}/projects?q=bridge&stage=nep`);
  assert.equal(safeSearchPath('/snapshots/bad/projects'),null);
  for(const value of ['../latest','invalid','2026-11-04-not-a-hash'])assert.throws(()=>snapshotPath('/projects',value));
  assert.throws(()=>snapshotPath('//evil.invalid',version));
});

test('pinned data reader never requests latest, live API, another snapshot or mutable indexes',async()=>{
  const requests:string[]=[];
  const reader=createSnapshotReader(version,async(input,options)=>{
    const url=String(input);requests.push(url);
    assert.equal(options?.credentials,'omit');
    return new Response(fs.readFileSync('public'+url),{headers:{'content-type':'application/json'}});
  });
  assert.deepEqual(await reader('/data/manifest.json'),manifest);
  const rows=await reader<{projects:unknown[]}>(manifest.scope);
  assert.equal(rows.projects.length,manifest.project_count);
  for(const input of ['/data/hearings.json','/data/update-history.json','/data/refresh-status.json','/data/snapshots/2026-11-03-aaaaaaaaaaaa/scope.json','/data/other.json','https://budget.bettergov.ph/api/v1/projects'])await assert.rejects(reader(input));
  assert.deepEqual(requests,[`/data/snapshots/${version}/manifest.json`,manifest.scope]);
});

test('missing and corrupted pinned snapshots fail closed without substituting current files',async()=>{
  let calls=0;
  const missing=createSnapshotReader(version,async()=>{calls++;return new Response('missing',{status:404});});
  await assert.rejects(missing('/data/manifest.json'),/unavailable/);
  assert.equal(calls,1);
  const corrupt=createSnapshotReader(version,async(input)=>new Response(String(input).endsWith('/manifest.json')?JSON.stringify(manifest):'{"projects":[]}',{headers:{'content-type':'application/json'}}));
  await assert.rejects(corrupt(manifest.scope),/checksum mismatch/);
  assert.throws(()=>validatePinnedManifest({...manifest,history:'/data/current.json'},version));
  const absent={...manifest,checksums:{}};
  assert.throws(()=>validatePinnedManifest(absent,version));
});

test('review fingerprint ignores collection timestamps but preserves financial and source changes',()=>{
  assert.deepEqual(stableData({amount:12,retrieved_at:'y',raw:{amount:null,retrieved_at:'x'}}),{amount:12,raw:{amount:null}});
  assert.notDeepEqual(stableData({amount:12}),stableData({amount:13}));
  assert.notDeepEqual(stableData({amount:null}),stableData({amount:0}));
  assert.match(dataFingerprint(process.cwd()),/^[a-f0-9]{64}$/);
});

test('private contact uses exactly the supplied address and public log requires valid entries',()=>{
  assert.equal(CORRECTIONS_EMAIL,'aquraitssuport@gmail.com');
  assert.ok(correctionMailto.startsWith('mailto:'+CORRECTIONS_EMAIL+'?subject='));
  assert.ok(Array.isArray(correctionLog(JSON.parse(fs.readFileSync('public/data/corrections.json','utf8')))));
  assert.throws(()=>correctionLog({schema:1,entries:[{date:'2026-11-04',version,record:'dpwh:1',summary:'Example',source:'javascript:alert(1)'}]}));
});
