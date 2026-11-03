import type { ScopedProject, ScopeResult } from './scope';
import type { Manifest } from './snapshot';
import { resolveSourceLink, sourceHref } from './safe-url';
import { phpFull } from './format';

export type EvidenceStage = 'nep' | 'house';
export const recordPath = (p: Pick<ScopedProject, 'dataset' | 'id'>) => '/projects/' + p.dataset + '/' + encodeURIComponent(p.id);
export const evidencePath = (p: Pick<ScopedProject, 'dataset' | 'id'>) => '/evidence/' + p.dataset + '/' + encodeURIComponent(p.id);
export const comparisonPath = (p: Pick<ScopedProject, 'key'>) => '/compare?' + new URLSearchParams({left: p.key});
export const houseReading = (dataset: string) => dataset === 'dpwh' ? 'House bill · third reading' : 'House bill · second reading';
export function guideExample(projects: ScopedProject[]) {
  const paired = projects.filter(p => !p.held && p.bridge_group !== 'scope_review' && p.nep_php !== null && p.house_php !== null);
  return paired.find(p => p.dataset === 'hfep' && p.nep_php !== p.house_php) ?? paired[0];
}

export function evidenceModel(p: ScopedProject, stage: EvidenceStage, manifest: Manifest, scope: ScopeResult) {
  const amount = stage === 'nep' ? p.nep_php : p.house_php;
  if (amount !== null && !Number.isSafeInteger(amount)) throw Error('This source amount cannot be safely displayed.');
  const source = resolveSourceLink(p);
  const stageLabel = stage === 'nep' ? 'NEP · Executive proposal' : houseReading(p.dataset);
  const notes = [
    'Published FY2027 budget proposal, not actual spending, payment or project completion. NEP and House versions must be compared, never added.',
    'Geographic title associations do not verify physical project locations or exclusive local allocations. Shared-office amounts remain undivided.',
    'Document classification: ' + p.status_label + (p.held ? ' · Source-marked unconfirmed pairing.' : '.') + ' Classifications do not establish wrongdoing. Missing amounts are not zero.',
    'Share evidence in context. Review the source before sharing; do not add or republish unrelated personal identifiers, private contact details or sensitive personal information. Public availability does not remove privacy responsibilities.',
    ...scope.disclaimers.map(d => d.title + ' ' + d.body + ' Source notice: ' +
      [d.restrictions_url ?? d.url, d.upstream_restrictions_url].map(v => sourceHref(v, true)).filter(Boolean).join(' · ')),
    scope.meta.notice,
  ].filter((v, i, all) => v && all.indexOf(v) === i);
  return {
    title: p.title, dataset: p.dataset.toUpperCase(), recordId: p.id,
    stage: stageLabel, amount: amount === null ? 'Not available in this version' : phpFull(amount),
    retrieved: manifest.retrieved_at, sourceBuilt: manifest.source_build,
    source, notes, provider: 'Budget data powered by BetterGov.PH.',
    filename: 'betternegrosisland-' + p.dataset + '-' + p.id.replace(/[^a-zA-Z0-9_-]/g, '_') + '-' + stage + '.png',
  };
}
export type EvidenceModel = ReturnType<typeof evidenceModel>;

/** Wrap measured text, including long unbroken URLs/record IDs, without ellipsis. */
export function wrapEvidenceText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? line + ' ' + word : word;
      if (measure(candidate) <= maxWidth) { line = candidate; continue; }
      if (line) { lines.push(line); line = ''; }
      for (const character of word) {
        if (line && measure(line + character) > maxWidth) { lines.push(line); line = ''; }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}
