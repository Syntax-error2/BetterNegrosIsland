import { writeFileSync } from 'node:fs';
import config from '../portal.config.ts';
import { createClient } from '../src/api/client.ts';
import { resolveGaa } from '../src/lib/gaa.ts';
import { resolveScope } from '../src/lib/scope.ts';
const scope=await resolveScope(createClient('https://budget.bettergov.ph'),config);
writeFileSync('docs/evidence/resolved-scope.json',JSON.stringify(scope,null,2));
for(const p of scope.projects.filter(p=>p.dataset==='dpwh' && p.office?.startsWith('Negros Occidental') && p.office!==config.scope.offices?.[0]))console.log(p.key, p.office, p.title);

const gaa=await resolveGaa(createClient('https://budget.bettergov.ph'),config);
writeFileSync('docs/evidence/resolved-history.json',JSON.stringify(gaa,null,2));
for(const row of gaa.rows.filter(r=>/canlaon|negros oriental/i.test(r.name)))console.log(row.key,row.name);
