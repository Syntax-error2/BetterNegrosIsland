import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// @ts-expect-error CLI module intentionally uses native Node ESM.
import { prepareCandidate } from '../scripts/data-ingestion/candidate.mjs';

test('extraction, validation and privacy failures cannot replace public data or the last successful candidate',async()=>{
  const manifest=fs.readFileSync('public/data/manifest.json','utf8');
  const pointer='release/nir-refresh/latest.json';
  const before=fs.existsSync(pointer)?fs.readFileSync(pointer,'utf8'):null;
  for(const failAt of [1,2,3]){
    let calls=0;
    await assert.rejects(prepareCandidate({execute:async()=>{if(++calls===failAt)throw Error('Synthetic refresh gate failure');}}),/Synthetic refresh gate failure/);
    assert.equal(fs.readFileSync('public/data/manifest.json','utf8'),manifest);
    assert.equal(fs.existsSync(pointer)?fs.readFileSync(pointer,'utf8'):null,before);
  }
});
