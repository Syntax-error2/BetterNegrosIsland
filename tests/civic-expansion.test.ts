import assert from 'node:assert/strict';
import { test } from 'node:test';
import timeline from '../src/data/civic/project-timelines.json';
import evidence from '../src/data/civic/evidence.json';
import spending from '../src/data/civic/bacolod-spending.json';
import releases from '../src/data/civic/fund-releases.json';
import assistance from '../src/data/civic/local-assistance.json';
import bids from '../src/data/civic/bids.json';
import awards from '../src/data/civic/awards.json';
import { sourceHref } from '../src/lib/safe-url';
import regional from '../src/data/civic/regional-operating-spending.json';
import { LOCATIONS, PROVINCES, localityTerm } from '../src/lib/geography';

test('project timelines cover the evidence pilot by exact contract ID', () => {
  assert.deepEqual(timeline.rows.map(({ id }) => id).sort(), evidence.rows.map(({ id }) => id).sort());
  assert.equal(new Set(timeline.rows.map(({ id }) => id)).size, timeline.rows.length);
  assert.ok(timeline.rows.some((row) => row.award === null));
  assert.ok(timeline.rows.some((row) => row.awardDocument));
  for (const row of timeline.rows) {
    for (const url of [row.advertisementPdf, row.awardDocument, row.contractDocument]) {
      if (!url) continue;
      assert.ok(sourceHref(url));
      assert.ok(new URL(url).pathname.split('/').includes(row.id));
    }
  }
});

test('Bacolod Q4 values reconcile to the two SRE subtotals in centavos', () => {
  const rows = spending.rows;
  assert.deepEqual(rows.map((row) => row.row), [25, 26, 27, 28, 29, 30, 31, 32, 48]);
  assert.equal(rows.reduce((sum, row) => sum + row.appropriation, 0), 480280000000);
  assert.equal(rows.reduce((sum, row) => sum + row.actual, 0), 338076250583);
  assert.equal(rows.find((row) => row.row === 28)?.actual, 0);
  assert.equal(spending.proposedGeneralFund, 440000000000);
});

test('signed DBM entries retain their amount and source page, and assistance keeps all source counts', () => {
  assert.equal(new Set(releases.rows.map((row) => row.id)).size, releases.rows.length);
  assert.ok(releases.rows.some((row) => row.amount < 0) && releases.rows.some((row) => row.amount === 0));
  for (const row of releases.rows) {
    assert.ok(Number.isFinite(row.amount));
    assert.ok(Number.isInteger(row.page) && row.page > 0 && row.page <= releases.pages);
    assert.ok(sourceHref(releases.register + '#page=' + row.page));
  }
  assert.equal(assistance.rows.reduce((sum, row) => sum + row.sourceRows, 0), assistance.sourceRows);
  assert.ok(assistance.rows.some((row) => row.sourceRows > 1));
  assert.ok(assistance.rows.some((row) => row.allotment !== row.cashAuthority));
  assert.ok(sourceHref(assistance.source));
});

test('PhilGEPS bids keep exact buyers, deadlines, status and matched city rows', () => {
  const buyers = new Map(awards.buyers.map((buyer) => [buyer.code, buyer.agency]));
  assert.equal(new Set(bids.rows.map((row) => row.id)).size, bids.rows.length);
  assert.deepEqual(new Set(bids.rows.map((row) => row.code)), new Set(buyers.keys()));
  for (const row of bids.rows) {
    assert.equal(row.buyer, buyers.get(row.code));
    assert.equal(new URL(row.source).searchParams.get('refid'), row.id);
    assert.ok(sourceHref(row.source));
    assert.ok(row.deadline.endsWith('+08:00'));
    assert.ok(Date.parse(row.deadline) >= Date.parse(row.published));
    if (row.cityResult) {
      assert.equal(row.status, 'Awarded');
      assert.equal(row.code, '1830200000');
      assert.ok(row.cityResult.bidAmount <= row.abc);
      assert.ok(sourceHref(row.cityResult.source));
    }
  }
  assert.equal(bids.rows.find((row) => row.id === '11702570')?.cityResult?.bidAmount, 3101687);
});

test('FY2025 regional spending covers every PSGC locality with its reported display precision', () => {
  assert.equal(regional.year, 2025);
  assert.equal(regional.rows.length, LOCATIONS.length);
  assert.deepEqual(regional.rows.map((row) => row.code).sort(), LOCATIONS.map((place) => place.code).sort());
  for (const row of regional.rows) {
    const place = LOCATIONS.find((location) => location.code === row.code)!;
    assert.ok(sourceHref(row.source));
    assert.ok(new URL(row.source).pathname.startsWith('/atlas/' + place.province + '/'));
    assert.match(row.reported, /^₱[\d,.]+(?: (?:billion|million|thousand))?$/);
  }
  assert.equal(regional.rows.find((row) => row.code === '1804503000')?.reported, '₱332.4 million');
});

test('named COMPASS rows match a place within the source province', () => {
  const names = new Map(PROVINCES.map(({ name, slug }) => [slug, name]));
  const codes = new Set<string>();
  let provinceOnly = 0;
  for (const row of assistance.rows) {
    if (!row.locality) {
      provinceOnly++;
      continue;
    }
    const matches = LOCATIONS.filter((place) =>
      names.get(place.province) === row.province && localityTerm(place.name).toLowerCase() === row.locality.toLowerCase());
    assert.equal(matches.length, 1, row.province + '/' + row.locality);
    codes.add(matches[0].code);
  }
  assert.equal(codes.size, 49);
  assert.ok(provinceOnly > 0);
});
