import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { dataFingerprint } from './fingerprint.mjs';

const git=(...args)=>execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const candidate=JSON.parse(fs.readFileSync('release/nir-refresh/latest.json','utf8'));
const directory=path.resolve(candidate.directory);
const allowed=path.resolve('release/nir-refresh')+path.sep;
if(!directory.startsWith(allowed)||!fs.existsSync(path.join(directory,'candidate.json')))throw Error('Unsafe candidate directory');
if(!/^\d+$/.test(process.env.GITHUB_RUN_ID??''))throw Error('Run identity is required');
const actual=dataFingerprint(process.cwd());
if(actual!==dataFingerprint(directory))throw Error('Assembled candidate differs from validated preparation');
const report=JSON.parse(fs.readFileSync(path.join(directory,'candidate.json'),'utf8'));
if(report.mode!=='FRESH API CANDIDATE'||!report.data_changed){
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'\nNo review branch: rehearsal or unchanged budget collections. The live snapshot was not replaced.\n');
  process.exit(0);
}
const branch='codex/nir-data-review-'+actual.slice(0,16);
if(git('ls-remote','--heads','origin','refs/heads/'+branch)){
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`\nAn identical budget candidate already has a review branch: ${branch}. Review that branch; it has not been overwritten. The live snapshot remains unchanged.\n`);
  process.exit(0);
}
fs.mkdirSync('docs/data-refresh',{recursive:true});
fs.writeFileSync('docs/data-refresh/candidate.json',JSON.stringify({...report,review_branch:branch,collection_fingerprint:actual},null,2)+'\n');
git('checkout','-b',branch);
git('add','--','public/data','public/_headers','public/_redirects','vercel.json','netlify.toml','docs/data-refresh/candidate.json');
const files=git('diff','--cached','--name-only').split('\n');
if(files.some(p=>!p.startsWith('public/data/')&&!['public/_headers','public/_redirects','vercel.json','netlify.toml','docs/data-refresh/candidate.json'].includes(p)))throw Error('Candidate contains a non-data change');
git('-c','user.name=github-actions[bot]','-c','user.email=41898282+github-actions[bot]@users.noreply.github.com','commit','-m','Prepare reviewed NIR data candidate');
// Use the job token through the credential helper, without persisting it in Git.
git('-c','credential.helper=!gh auth git-credential','push','origin','HEAD:refs/heads/'+branch);
const repository=process.env.GITHUB_REPOSITORY;
if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository??''))throw Error('Invalid repository');
const compare=`https://github.com/${repository}/compare/main...${branch}?expand=1`;
fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`\n## Review required before publication\n\nCandidate: ${report.candidate_version}\n\n${report.added} added / ${report.removed} removed / ${report.changed} changed comparison records. Inspect the full diff for history, NEP, coverage and notices too.\n\n[Open a pull request for review](${compare})\n\nNothing was merged into main. Merge a reviewed pull request to publish through the existing Vercel Git integration. Remove the candidate branch after review.\n`);
