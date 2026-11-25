import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

// A separate, explicit import. Never refresh or modify the budget snapshot here.
const root = path.resolve(import.meta.dirname, '..');
const cache = path.join(root, 'node_modules/.cache/project-tracker');
const output = path.join(root, 'public/data/tracker');
await fs.mkdir(cache, { recursive: true });
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120000), headers: { 'User-Agent': 'BetterNegrosIsland-public-data-import/1.0' } });
  if (!response.ok) throw Error(`Source returned ${response.status}: ${new URL(url).pathname}`);
  return Buffer.from(await response.arrayBuffer());
}
function* csv(text) {
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if (c === '\n' && !quoted) { row.push(field.replace(/\r$/, '')); yield row; row = []; field = ''; }
    else field += c;
  }
  if (quoted) throw Error('Unterminated source CSV');
  if (field || row.length) { row.push(field.replace(/\r$/, '')); yield row; }
}
function* records(text) {
  const rows = csv(text.replace(/^\uFEFF/, '')), header = rows.next().value;
  if (!header || new Set(header).size !== header.length) throw Error('Invalid CSV header');
  for (const row of rows) {
    if (row.length !== header.length) throw Error('Invalid CSV row width');
    yield Object.fromEntries(header.map((key, i) => [key, row[i]]));
  }
}
const amount = value => {
  if (value === '') return null;
  if (!/^-?\d+(\.\d{1,2})?$/.test(value)) throw Error('Unexpected source amount');
  const n = Number(value);
  if (!Number.isSafeInteger(Math.round(n * 100))) throw Error('Unsafe source amount');
  return n;
};
function province(row) {
  const office = row.dpwh_office;
  if (/^Negros Occidental\b|^Bacolod City\b/i.test(office)) return 'negros-occidental';
  if (/^Negros Oriental\b/i.test(office)) return 'negros-oriental';
  if (/^Siquijor\b/i.test(office)) return 'siquijor';
  if (/^(NIR|Negros Island Region)$/i.test(row.region)) return 'regional';
  return null;
}
const retrieved_at = new Date().toISOString();
const manifestUrl = 'https://budget-assets.bettergov.ph/hgab/2027/contractors/downloads/manifest.json';
const manifestBytes = await get(manifestUrl), manifest = JSON.parse(manifestBytes);
if (!manifest.notice || !manifest.built_at || !Array.isArray(manifest.files)) throw Error('Source manifest unavailable');
async function verified(file) {
  const filename = path.join(cache, file.file);
  let bytes;
  try { bytes = await fs.readFile(filename); } catch { /* fetch below */ }
  if (!bytes || sha(bytes) !== file.sha256) { bytes = await get(file.url); }
  if (sha(bytes) !== file.sha256 || bytes.length !== file.bytes) throw Error('Source checksum/size mismatch: ' + file.file);
  await fs.writeFile(filename, bytes);
  return file.file.endsWith('.gz') ? gunzipSync(bytes).toString('utf8') : bytes.toString('utf8');
}
const contractFile = manifest.files.find(f => f.key === 'dpwh-contracts-2016-2026');
const linkFile = manifest.files.find(f => f.key === 'gaa-2020-2026-dpwh-line-contracts');
if (!contractFile || !linkFile) throw Error('Required source table unavailable');
const groups = Object.fromEntries(['negros-occidental', 'negros-oriental', 'siquijor', 'regional'].map(p => [p, []]));
const ids = new Map();
let sourceContracts = 0;
for (const row of records(await verified(contractFile.csv))) {
  sourceContracts++;
  const p = province(row);
  if (!p) continue;
  if (!/^[A-Za-z0-9-]{4,30}$/.test(row.contract_id) || ids.has(row.contract_id)) throw Error('Duplicate/invalid contract identity');
  const record = {
    id: row.contract_id, title: row.description, category: row.category, status: row.status,
    contract_php: amount(row.contract_php), contractor: row.contractor || null,
    progress_percent: row.progress_percent === '' ? null : Number(row.progress_percent),
    office: row.dpwh_office, region: row.region, start_date: row.start_date || null,
    completion_date: row.completion_date || null, year: Number(row.infra_year),
    source_of_funds: row.source_of_funds, gaa_year: row.gaa_year ? Number(row.gaa_year) : null,
    url: row.dpwh_url, province: p, links: [],
  };
  if (!Number.isInteger(record.year) || record.year < 2016 || record.year > 2026) throw Error('Unexpected contract year');
  if (record.progress_percent !== null && (!Number.isFinite(record.progress_percent) || record.progress_percent < 0 || record.progress_percent > 100)) throw Error('Unexpected progress');
  ids.set(record.id, record); groups[p].push(record);
}
let sourceLinks = 0, acceptedLinks = 0;
for (const row of records(await verified(linkFile.csv))) {
  sourceLinks++;
  const contract = ids.get(row.contract_id);
  if (!contract) continue;
  contract.links.push({ year: Number(row.fiscal_year), line_id: row.line_id, title: row.gaa_title,
    office: row.gaa_office, gaa_php: amount(row.gaa_php), method: row.method,
    searched: row.searched, title_score: row.title_score, amount_ratio: row.amount_ratio, candidates: row.candidates });
  acceptedLinks++;
}
if (sourceContracts !== contractFile.rows || sourceLinks !== linkFile.rows) throw Error('CSV source row count mismatch');
const documentsUrl = 'https://budget.bettergov.ph/api/v1/hgab/2027/documents';
const documentBytes = await get(documentsUrl), documents = JSON.parse(documentBytes);
if (documents.data?.length !== documents.meta?.total || documents.data.length !== 8) throw Error('Source document catalogue changed');
const readme = await verified(manifest.readme);
const version = 'contracts-' + sha(manifestBytes).slice(0, 12), folder = path.join(output, version);
await fs.mkdir(folder, { recursive: true });
// Refuse to overwrite an existing immutable data version with different contents.
async function writeVersion(name, data) {
  const bytes = typeof data === 'string' ? data : JSON.stringify(data);
  const destination = path.join(folder, name);
  try { if (await fs.readFile(destination, 'utf8') !== bytes) throw Error('Existing data version differs: ' + name); }
  catch (e) { if (e.code !== 'ENOENT') throw e; await fs.writeFile(destination, bytes); }
  return { path: '/data/tracker/' + version + '/' + name, sha256: sha(bytes), bytes: Buffer.byteLength(bytes) };
}
const shards = {};
for (const [p, rows] of Object.entries(groups)) { rows.sort((a,b) => b.year - a.year || a.id.localeCompare(b.id)); shards[p] = { ...await writeVersion(p + '.json', rows), count: rows.length }; }
const docs = await writeVersion('documents.json', documents);
const sourceManifest = await writeVersion('source-manifest.json', manifestBytes.toString());
const readmeFile = await writeVersion('README.txt', readme);
const index = { schema: 1, version, retrieved_at, built_at: manifest.built_at, notice: manifest.notice,
  provider: "People's Budget Coalition × BetterGov.PH", source_url: manifestUrl,
  source_page: 'https://budget.bettergov.ph/hgab/2027/contractors',
  scope: 'Contracts listed under Negros Occidental, Bacolod City, Negros Oriental or Siquijor DPWH offices, plus explicitly NIR-tagged contracts. Office association is not verified physical location. National and regional offices can hold other local projects outside this selection.',
  linking: 'GAA links are upstream candidates based on title, office and amount, not official identifiers. They may be wrong. No link to FY2027 proposals is inferred. Contract amounts and GAA appropriations are separate and must not be added.',
  source_counts: { contracts: sourceContracts, links: sourceLinks }, accepted_links: acceptedLinks,
  source_files: [contractFile.csv, linkFile.csv], shards, documents: docs, documents_retrieved_at: retrieved_at, source_manifest: sourceManifest, readme: readmeFile };
await fs.writeFile(path.join(output, 'index.json'), JSON.stringify(index));
console.log(JSON.stringify({ version, sourceContracts, sourceLinks, acceptedLinks, provinces: Object.fromEntries(Object.entries(shards).map(([p,s]) => [p,s.count])) }, null, 2));
