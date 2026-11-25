import assert from 'node:assert/strict';
import { test } from 'node:test';
import senate from '../src/data/civic/senate.json';
import awards from '../src/data/civic/awards.json';
import evidence from '../src/data/civic/evidence.json';
import disclosures from '../src/data/civic/disclosures.json';
import { LOCATIONS, PROVINCES } from '../src/lib/geography';
import { senateComparisonPath } from '../src/lib/civic-budget';
import { sourceHref } from '../src/lib/safe-url';

test('Senate extracts retain explicit cuts, unavailable matches, and exact DPWH source IDs', () => {
  const ids = new Set(senate.rows.map((row) => row.id));
  const codes = new Set(LOCATIONS.map((place) => place.code));
  const cuts = senate.rows.filter((row) => row.status === 'cut');
  assert.equal(ids.size, senate.rows.length);
  assert.ok(cuts.length > 0);
  assert.ok(senate.rows.some((row) => row.nep === null));
  for (const row of senate.rows) {
    assert.ok(row.localities.every((code) => codes.has(code)));
    assert.ok(sourceHref(row.record));
    assert.ok(sourceHref(row.houseRecord));
    assert.equal(senateComparisonPath('dpwh:' + row.id), '/budget-stages?id=' + encodeURIComponent(row.id));
    assert.equal(senateComparisonPath('nia:' + row.id), null);
  }
  for (const row of cuts) {
    assert.equal(row.senate, 0);
    assert.ok(row.house > 0);
    assert.ok(sourceHref(row.pdf));
    assert.equal(new URL(row.pdf).hash, '#page=' + row.page);
  }
});

test('pilot award rows have unique exact keys and source-matching buyers', () => {
  const buyers = new Map(awards.buyers.map((buyer) => [buyer.code, buyer.agency]));
  const counts = new Set<string>();
  const entries = new Set<string>();
  for (const row of awards.rows) {
    assert.match(row.reference, /^\d+$/);
    assert.equal(row.agency, buyers.get(row.code));
    assert.ok(Number.isFinite(row.amount));
    counts.add(row.code);
    entries.add(JSON.stringify(row));
  }
  assert.equal(counts.size, buyers.size);
  assert.equal(entries.size, awards.rows.length);
  assert.ok(sourceHref(awards.query));
});

test('contract and disclosure sources have exact IDs and allowed source hosts', () => {
  const codes = new Set([...LOCATIONS, ...PROVINCES].map((place) => place.code));
  const ids = new Set(evidence.rows.map((row) => row.id));
  assert.equal(ids.size, evidence.rows.length);
  for (const row of evidence.rows) {
    assert.ok(sourceHref(row.bisto));
    assert.ok(sourceHref(row.api));
    assert.equal(new URL(row.bisto).pathname.split('/').at(-1), row.id);
    assert.equal(new URL(row.api).pathname.split('/').at(-1), row.id);
    assert.ok(Date.parse(row.verifiedAt) >= Date.parse(evidence.archiveDate));
  }
  const entries = new Set<string>();
  for (const source of disclosures.sources) {
    assert.ok(codes.has(source.code));
    assert.ok(sourceHref(source.href));
    entries.add(source.code + '/' + source.type);
  }
  assert.equal(entries.size, disclosures.sources.length);
});
