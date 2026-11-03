import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { evidenceModel, wrapEvidenceText, houseReading, evidencePath, comparisonPath, guideExample } from '../src/lib/evidence';
import type { ScopeResult } from '../src/lib/scope';
import type { Manifest } from '../src/lib/snapshot';
import { phpFull } from '../src/lib/format';

const manifest:Manifest=JSON.parse(readFileSync('public/data/manifest.json','utf8'));
const scope:ScopeResult=JSON.parse(readFileSync('public'+manifest.scope,'utf8'));

test('the guide uses a real pair without unconfirmed/scope-review flags and handles missing eligible records',()=>{
  const p=guideExample(scope.projects)!;
  assert.ok(scope.projects.includes(p));assert.equal(p.held,false);assert.notEqual(p.bridge_group,'scope_review');
  assert.notEqual(p.nep_php,null);assert.notEqual(p.house_php,null);
  assert.equal(guideExample([]),undefined);
  assert.equal(guideExample(scope.projects.filter(p=>p.held)),undefined);
});

test('evidence cards preserve exact amounts, separate budget versions, provenance and source notices for every record',()=>{
  for(const p of scope.projects)for(const stage of ['nep','house'] as const){
    const model=evidenceModel(p,stage,manifest,scope), amount=stage==='nep'?p.nep_php:p.house_php;
    assert.equal(model.amount,amount===null?'Not available in this version':phpFull(amount));
    assert.equal(model.retrieved,manifest.retrieved_at);
    assert.equal(model.title,p.title);assert.ok(model.source?.startsWith('https://'));
    assert.ok(!new URL(model.source!).pathname.startsWith('/api/'));
    assert.ok(model.notes.includes(scope.meta.notice));
    assert.ok(model.notes.some(n=>n.includes('not actual spending')));
    assert.ok(scope.disclaimers.every(d=>model.notes.some(n=>n.includes(d.body))));
    if(p.held)assert.ok(model.notes.some(n=>n.includes('unconfirmed pairing')));
  }
});

test('zero stays zero, missing stays unavailable, unsafe money fails closed and paths encode source identities',()=>{
  const p=scope.projects[0];
  assert.equal(evidenceModel({...p,house_php:0},'house',manifest,scope).amount,'₱0');
  assert.equal(evidenceModel({...p,house_php:null},'house',manifest,scope).amount,'Not available in this version');
  assert.throws(()=>evidenceModel({...p,house_php:NaN},'house',manifest,scope));
  assert.throws(()=>evidenceModel({...p,house_php:Number.MAX_SAFE_INTEGER+1},'house',manifest,scope));
  assert.equal(houseReading('dpwh'),'House bill · third reading');assert.equal(houseReading('hfep'),'House bill · second reading');
  assert.ok(evidencePath({...p,id:'ib:p877:r12|infrastructure'}).endsWith('ib%3Ap877%3Ar12%7Cinfrastructure'));
  assert.equal(new URL(comparisonPath(p),'https://local.invalid').searchParams.get('left'),p.key);
});

test('evidence text wraps long titles and unbroken URLs without discarding characters',()=>{
  const long='https://budget.bettergov.ph/'+ 'long-record-id'.repeat(50);
  const lines=wrapEvidenceText(long,40,s=>s.length);
  assert.equal(lines.join(''),long);assert.ok(lines.every(l=>l.length<=40));
  const title='A full published project title with a long barangay name';
  assert.equal(wrapEvidenceText(title,20,s=>s.length).join(' ').replace(/\s+/g,' '),title);
});

test('evidence QR modules decode to the exact trusted source URL, including PDF page fragments',()=>{
  for(const url of [evidenceModel(scope.projects[0],'house',manifest,scope).source!,'https://budget-assets.bettergov.ph/hgab/2027/pdf/nep2027-vol-iib.pdf#page=283']){
    const qr=QRCode.create(url,{errorCorrectionLevel:'M'}),scale=5,size=(qr.modules.size+8)*scale;
    const rgba=new Uint8ClampedArray(size*size*4).fill(255);
    for(let row=0;row<qr.modules.size;row++)for(let col=0;col<qr.modules.size;col++)if(qr.modules.get(row,col)){
      for(let y=0;y<scale;y++)for(let x=0;x<scale;x++){const i=(((row+4)*scale+y)*size+(col+4)*scale+x)*4;rgba[i]=0;rgba[i+1]=0;rgba[i+2]=0;}
    }
    assert.equal(jsQR(rgba,size,size)?.data,url);
  }
});
