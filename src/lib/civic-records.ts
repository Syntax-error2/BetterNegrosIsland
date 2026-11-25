import { csvCell, downloadText } from './csv';

export function matchingText(term: string, ...fields: string[]) {
  const haystack = fields.join(' ').toLocaleLowerCase();
  return term.trim().toLocaleLowerCase().split(/\s+/).every((word) => haystack.includes(word));
}

export function civicCsv(filename: string, rows: (string | number | null)[][]) {
  downloadText(filename, '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n');
}

const dateFormat = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeZone: 'UTC' });

export function civilDate(value: string) {
  return dateFormat.format(new Date(value.slice(0, 10) + 'T00:00:00Z'));
}
