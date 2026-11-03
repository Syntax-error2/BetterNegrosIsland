export const clientRoutes=['/','/projects','/projects/:dataset/:id','/evidence/:dataset/:id','/provinces','/provinces/:slug','/locations/:psgcCode','/municipalities','/municipalities/:slug','/analytics','/compare','/budget-guide','/budget-history','/data-coverage','/methodology','/terms','/privacy','/gaa','/about','/districts','/we-are-not-ignorant','/saved','/topics','/updates','/data-quality','/glossary','/hearings'];
import fs from 'node:fs';
export const securityHeaders={
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'no-referrer',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://budget.bettergov.ph; font-src 'self'; manifest-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'",
};
const current=JSON.parse(fs.readFileSync('public/data/manifest.json','utf8'));
const shards=Object.keys(current.checksums).sort();
for(const shard of shards)if(!shard.startsWith('/data/snapshots/')||!fs.existsSync('public'+shard))throw Error('Cannot configure caching for an absent snapshot shard');
// Exact existing shards only: a wildcard immutable rule also caches missing
// JSON/JS responses for a year and can obstruct recovery from a failed request.
export const cacheRules=[['/data/manifest.json','no-cache, must-revalidate'],['/data/update-history.json','no-cache, must-revalidate'],['/data/hearings.json','no-cache, must-revalidate'],['/data/refresh-status.json','no-cache, must-revalidate'],...shards.map(p=>[p,'public, max-age=31536000, immutable'])];
export function deploymentFiles(){
  const headers='/*\n'+Object.entries(securityHeaders).map(([k,v])=>`  ${k}: ${v}`).join('\n')+'\n\n'+cacheRules.map(([p,v])=>`${p}\n  Cache-Control: ${v}`).join('\n\n')+'\n';
  const orderedRoutes=[...clientRoutes].sort((a,b)=>Number(a.includes(':'))-Number(b.includes(':')));
  const redirects='# Generated: application routes only. Missing data/assets must remain 404.\n'+orderedRoutes.map(p=>`${p} /index.html 200`).join('\n')+'\n';
  const vercel={$schema:'https://openapi.vercel.sh/vercel.json',framework:'vite',buildCommand:'npm run build',outputDirectory:'dist',headers:[{source:'/(.*)',headers:Object.entries(securityHeaders).map(([key,value])=>({key,value}))},...cacheRules.map(([p,value])=>({source:p.replace('*',':path*'),headers:[{key:'Cache-Control',value}]}))],rewrites:clientRoutes.map(source=>({source,destination:'/index.html'}))};
  const netlify='[build]\n  command = "npm run build"\n  publish = "dist"\n\n[build.environment]\n  NODE_VERSION = "24"\n\n# Routing and security headers are shared through public/_redirects and public/_headers.\n';
  return {'public/_headers':headers,'public/_redirects':redirects,'vercel.json':JSON.stringify(vercel,null,2)+'\n','netlify.toml':netlify};
}
