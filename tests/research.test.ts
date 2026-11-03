import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Manifest } from '../src/lib/snapshot';
import { PROJECT_CSV_FIELDS } from '../src/lib/csv';
import { RESEARCH_FIELDS, researchCitation, researchNotes } from '../src/lib/research';
import type { ScopeResult } from '../src/lib/scope';

const m: Manifest = JSON.parse(readFileSync('public/data/manifest.json','utf8'));
const s: ScopeResult = JSON.parse(readFileSync('public'+m.scope,'utf8'));

test('research citation and notes preserve the actual snapshot, checksums and upstream notices', () => {
  const notices = [s.meta.notice, ...s.disclaimers.map(d => d.title+' '+d.body)];
  const before = JSON.stringify(m);
  const citation = researchCitation(m,'https://betternegrosisland.vercel.app');
  assert.ok(citation.includes(m.version));
  assert.ok(citation.includes(m.retrieved_at));
  assert.ok(citation.includes(m.source_build));
  const notes = researchNotes(m,'https://betternegrosisland.vercel.app',notices);
  const retained = JSON.parse(notes.split('EXACT LOADED SNAPSHOT MANIFEST')[1].split('\n').slice(2).join('\n'));
  assert.deepEqual(retained,m);
  for (const notice of notices) assert.ok(notes.includes(notice));
  assert.ok(notes.includes('not a complete census'));
  assert.ok(notes.includes('not a peer-reviewed dataset'));
  assert.ok(notes.includes('not inflation-adjusted'));
  assert.equal(JSON.stringify(m),before);
  assert.throws(() => researchNotes(m,'https://betternegrosisland.vercel.app',[]));
  assert.throws(() => researchCitation(m,'javascript:alert(1)'));
  assert.throws(() => researchCitation({...m,retrieved_at:'unavailable'},'https://betternegrosisland.vercel.app'));
});

test('research field guide covers every base comparison CSV column without inventing measurements', () => {
  assert.deepEqual(Object.keys(RESEARCH_FIELDS),PROJECT_CSV_FIELDS);
  assert.match(RESEARCH_FIELDS.nep_php,/Blank means unavailable, not zero/);
  assert.match(RESEARCH_FIELDS.unconfirmed_match,/not independent verification/);
  assert.match(RESEARCH_FIELDS.title_associated_psgc_codes,/overlap/);
});
