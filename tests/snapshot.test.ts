import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateSnapshot } from '../scripts/data-ingestion/validate.ts';
import { retryDelay } from '../scripts/data-ingestion/retry.ts';
const manifest=JSON.parse(fs.readFileSync('public/data/manifest.json','utf8'));
test('published regional shards reconcile identities, money and provenance',()=>{
 const result=validateSnapshot(manifest);
 assert.equal(result.projects,manifest.project_count);
 assert.equal(result.history_families,manifest.history_count);
 assert.equal(result.checksums,7);
});
test('a corrupted shard checksum fails closed',()=>{
 assert.throws(()=>validateSnapshot({...manifest,checksums:{[manifest.scope]:'invalid-checksum'}}),/Checksum mismatch/);
});
test('a manifest count disagreement fails closed',()=>{
 assert.throws(()=>validateSnapshot({...manifest,project_count:manifest.project_count+1}),/identity\/count mismatch/);
});
test('source cooldowns honor seconds and HTTP dates; long delays abort without early retries',()=>{
 const now=Date.parse('2026-11-02T00:00:00Z');
 assert.equal(retryDelay('3',0,now),3000);
 assert.equal(retryDelay('Mon, 02 Nov 2026 00:00:04 GMT',0,now),4000);
 assert.equal(retryDelay(null,2,now),2000);
 assert.throws(()=>retryDelay('120',0,now),/cooldown/);
});
