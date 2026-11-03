import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { regionalChanges } from '../src/lib/regional-changes';
import type { ScopedProject } from '../src/lib/scope';
const m=JSON.parse(fs.readFileSync('public/data/manifest.json','utf8'));
const rows:ScopedProject[]=JSON.parse(fs.readFileSync('public'+m.scope,'utf8')).projects;
test('regional reading view uses source-confirmed NIR changes, preserving identities and uncertainty',()=>{
  const result=regionalChanges(rows);
  const expected=rows.filter(p=>p.regionConfirmed&&p.region_key==='NIR'&&!p.held&&['house_only','increased','decreased'].includes(p.bridge_group));
  assert.equal(result.rows.length,expected.length);
  assert.equal(result.counts.reduce((s,c)=>s+c.count,0),result.rows.length);
  assert.ok(result.rows.every(p=>expected.includes(p)));
  assert.equal(new Set(result.rows.map(p=>p.key)).size,result.rows.length);
  assert.equal(regionalChanges([...rows,rows[0]]).rows.length,result.rows.length);
  assert.throws(()=>regionalChanges([rows[0],{...rows[0],house_php:1}]),/Conflicting duplicate/);
  const all=regionalChanges(rows,{includeUnconfirmed:true});
  assert.equal(all.rows.length-result.rows.length,result.excludedUnconfirmed);
});
test('regional reading filters cannot import title-only records or treat a missing amount as zero',()=>{
  const example=rows.find(p=>p.bridge_group==='house_only'&&p.regionConfirmed&&!p.held)!;
  assert.ok(example);
  const selected=regionalChanges(rows,{query:example.id,program:example.dataset,group:'house_only'});
  assert.ok(selected.rows.includes(example));
  assert.equal(selected.rows.find(p=>p.key===example.key)?.nep_php,example.nep_php);
  assert.equal(regionalChanges([{...example,regionConfirmed:false,region_key:null}]).rows.length,0);
  assert.equal(regionalChanges(rows,{query:'no-such-source-record-xyz'}).rows.length,0);
  for(const province of ['negros-occidental','negros-oriental','siquijor'])assert.ok(regionalChanges(rows,{province}).rows.every(p=>p.provinceMatches?.includes(province)));
});
