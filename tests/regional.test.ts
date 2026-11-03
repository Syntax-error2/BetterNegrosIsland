import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOCATIONS,PROVINCES } from '../src/lib/geography';
import { safeSum,percentage,annotate,validateRows,validateProjectSums } from '../src/lib/regional-data';
import { readFileSync } from 'node:fs';
test('official accessible PSGC directory has unique codes, three provinces, 19 cities and 44 municipalities',()=>{
 assert.equal(PROVINCES.length,3);assert.equal(LOCATIONS.length,63);assert.equal(new Set(LOCATIONS.map(l=>l.code)).size,63);
 assert.equal(LOCATIONS.filter(l=>l.type==='City').length,19);assert.equal(LOCATIONS.filter(l=>l.type==='Municipality').length,44);
 assert.equal(LOCATIONS.find(l=>l.name==='City of Bacolod')?.code,'1830200000');assert.equal(LOCATIONS.filter(l=>l.province==='siquijor').length,6);
});
test('region confirmation and province title association remain separate',()=>{
 const a=annotate({title:'Regional program without local place',region_key:'NIR'});assert.equal(a.regionConfirmed,true);assert.deepEqual(a.provinceMatches,[]);assert.deepEqual(a.locationMatches,[]);
 const b=annotate({title:'Road in Bacolod City, Negros Occidental',region_key:null});assert.equal(b.regionConfirmed,false);assert.ok(b.provinceMatches.includes('negros-occidental'));assert.ok(b.locationMatches.includes('1830200000'));
});
test('locality associations use word boundaries and do not confuse Siquijor province with its namesake town',()=>{
 assert.ok(annotate({title:'Road in Enrique B. Magalona, Negros Occidental',region_key:'NIR'}).locationMatches.includes('1804508000'));
 assert.ok(!annotate({title:'Mariano road, Negros Island',region_key:'NIR'}).locationMatches.includes('1806104000'));
 assert.ok(!annotate({title:'San Juan, Siquijor',region_key:'NIR'}).locationMatches.includes('1806106000'));
});
test('money guards reject unsafe integers and percentages preserve missing baselines',()=>{
 assert.equal(safeSum([1,2]),3);assert.throws(()=>safeSum([Number.MAX_SAFE_INTEGER,1]));assert.throws(()=>safeSum([1.5]));
 assert.equal(percentage(null,10),null);assert.equal(percentage(0,10),null);assert.equal(percentage(100,150),50);
});
test('source comparison validation never silently coerces missing money',()=>{
 const row=JSON.parse(readFileSync('docs/evidence/resolved-scope.json','utf8')).projects[0];
 assert.doesNotThrow(()=>validateProjectSums([], {nep_php:null,hgab2_php:null,hgab3_php:null}));assert.throws(()=>validateProjectSums([], {nep_php:0,hgab2_php:null,hgab3_php:null}),/sum mismatch/);
 assert.doesNotThrow(()=>validateRows([{...row,nep_php:null}]));assert.throws(()=>validateRows([{...row,house_php:NaN}]));
});
