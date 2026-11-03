import fs from 'node:fs';
import { deploymentFiles } from './deployment-policy.mjs';
const check=process.argv.includes('--check');
for(const [file,content] of Object.entries(deploymentFiles())){
  if(check){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8').replaceAll('\r\n','\n')!==content)throw Error('Deployment configuration differs from policy: '+file);}
  else fs.writeFileSync(file,content);
}
console.log(check?'Deployment configuration matches the shared policy.':'Prepared Cloudflare/Netlify/Vercel routing and headers.');
