import fs from 'node:fs';
import { validateSnapshot } from './validate';
console.log(JSON.stringify(validateSnapshot(JSON.parse(fs.readFileSync('public/data/manifest.json','utf8'))),null,2));
