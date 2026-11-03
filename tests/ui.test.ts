import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fragmentId, fundingError, clearProjectFilters, publicError, observePromise } from '../src/lib/ui';
import { loadGaa } from '../src/lib/gaa';
import type { Client } from '../src/api/client';
import config from '../portal.config';

test('malformed URL fragments cannot crash project or history rendering', () => {
  assert.equal(fragmentId('#%'), '');
  assert.equal(fragmentId('#%E0%A4%A'), '');
  assert.equal(fragmentId('#office%3Anegros-occidental-2nd-deo'), 'office:negros-occidental-2nd-deo');
});
test('abandoned render requests are observed without swallowing errors from later subscribers', async () => {
  observePromise(Promise.reject(new Error('discarded development render')));
  await new Promise(resolve => setImmediate(resolve));
  await assert.rejects(observePromise(Promise.reject(new Error('still visible to the UI'))),/still visible/);
});
test('funding bounds reject invalid numbers and reversed ranges; zero is valid', () => {
  assert.equal(fundingError('0','0'), '');
  assert.equal(fundingError('',''), '');
  for(const [min,max] of [['10','1'],['-1',''],['NaN',''],['','Infinity']]) assert.notEqual(fundingError(min,max),'');
});
test('reset removes all explorer filters and retains unrelated share parameters', () => {
  const params=new URLSearchParams('q=road&min=0&sort=title&lgu=Isabela&ref=community');
  assert.equal(clearProjectFilters(params).toString(),'ref=community');
  assert.equal(params.get('q'),'road');
});
test('public errors explain recovery without leaking server messages or stacks', () => {
  assert.ok(publicError(new Error('404')).includes('unavailable'));
  assert.ok(publicError(new Error('TimeoutError')).includes('longer'));
  assert.equal(publicError(new Error('secret internal database trace')),publicError(new Error('Failed to fetch')));
});
test('shared historical requests notify later subscribers without duplicate API calls', async () => {
  let finish!: () => void;
  const pending=new Promise<void>(resolve=>{finish=resolve;});
  let calls=0;
  const client={base:'https://progress-test.invalid',gaaDepartments:async()=>({data:[{id:'test',description:'Test'}]}),gaaPrograms:async()=>{calls++;await pending;return {first:{meta:{matched:0}},rows:[],truncated:false};},href:()=> 'https://progress-test.invalid'} as unknown as Client;
  const scope={...config,id:'progress-fixture',scope:{places:[{label:'Test'}]}};
  const first=loadGaa(client,scope,()=>{});
  await new Promise(resolve=>setImmediate(resolve));
  const updates:number[][]=[];
  const second=loadGaa(client,scope,(done,total)=>updates.push([done,total]));
  finish();await Promise.all([first,second]);
  assert.equal(calls,1);assert.deepEqual(updates,[[0,1],[1,1]]);
});
