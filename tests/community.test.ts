import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { communityProjects } from '../src/lib/community';
import { LOCATIONS } from '../src/lib/geography';
import type { ScopeResult } from '../src/lib/scope';

test('community previews reconcile all 63 directory counts with the verified summary', () => {
  const m=JSON.parse(readFileSync('public/data/manifest.json','utf8'));
  const scope:ScopeResult=JSON.parse(readFileSync('public'+m.scope,'utf8'));
  const summary=JSON.parse(readFileSync('public'+m.summary,'utf8'));
  for(const place of LOCATIONS){
    const rows=communityProjects(scope.projects,place);
    assert.equal(rows.length,summary.locationCounts.find((p:{code:string})=>p.code===place.code)?.count ?? 0,place.name);
    assert.equal(new Set(rows.map(p=>p.key)).size,rows.length);
    assert.ok(rows.every(row=>scope.projects.includes(row)));
  }
});

test('community associations do not invent matches from shared offices or confuse same-name places',()=>{
  const m=JSON.parse(readFileSync('public/data/manifest.json','utf8'));
  const scope:ScopeResult=JSON.parse(readFileSync('public'+m.scope,'utf8'));
  const sample=scope.projects[0];
  const place={code:'test-code',name:'Test community'};
  assert.equal(communityProjects([{...sample,locationMatches:[],reasons:[],office:'Test community office'}],place).length,0);
  assert.equal(communityProjects([{...sample,locationMatches:['other-code'],reasons:[{kind:'place',label:'Other community'}]}],place).length,0);
  assert.equal(communityProjects([{...sample,locationMatches:[],reasons:[{kind:'place',label:'Siquijor'}]}],{code:'1806106000',name:'Siquijor'}).length,0);
  const row={...sample,locationMatches:['test-code'],nep_php:null};
  assert.equal(communityProjects([row],place)[0].nep_php,null);
});
