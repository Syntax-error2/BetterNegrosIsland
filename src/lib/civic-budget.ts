import senate from '../data/civic/senate.json';

const committeeLines = new Set(senate.rows.map((row) => row.id));

export function senateComparisonPath(key: string) {
  const id = key.startsWith('dpwh:') ? key.slice('dpwh:'.length) : '';
  return committeeLines.has(id) ? '/budget-stages?id=' + encodeURIComponent(id) : null;
}
