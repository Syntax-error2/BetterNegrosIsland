import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import TrackerShell from './TrackerShell';
import { External } from './Bits';
import { sourceHref } from '../lib/safe-url';
import { CIVIC_PAGE_SIZE } from '../lib/use-civic-filters';

export function CivicRecords({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <TrackerShell title={title} description={description} civic>{children}</TrackerShell>;
}

export function CivicSource({ href, children }: { href: string | null; children: ReactNode }) {
  const link = sourceHref(href, true);
  return link ? <External href={link}>{children}</External> : null;
}

export function CivicSearch({ label, value, onChange }: {
  label: string; value: string; onChange: (value: string) => void;
}) {
  return <label className="field"><span>{label}</span>
    <input type="search" maxLength={150} value={value} onChange={(event) => onChange(event.target.value)} />
  </label>;
}

export function CivicSelect({ label, value, onChange, all, options }: {
  label: string; value: string; onChange: (value: string) => void; all: string;
  options: readonly (readonly [string, string])[];
}) {
  const knownValue = options.some(([id]) => id === value) ? value : '';
  return <label className="field"><span>{label}</span>
    <select value={knownValue} onChange={(event) => onChange(event.target.value)}>
      <option value="">{all}</option>
      {options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
    </select>
  </label>;
}

export function CivicResults({ count, noun, limit, more }: {
  count: number; noun: string; limit: number; more: () => void;
}) {
  return <div className="civic-results">
    <p role="status">Showing {Math.min(count, limit).toLocaleString()} of {count.toLocaleString()} {noun}</p>
    {count > limit && <button type="button" className="button" onClick={more}>
      Show {Math.min(CIVIC_PAGE_SIZE, count - limit)} more
    </button>}
  </div>;
}

export function CivicFocus({ to, children }: { to: string; children: ReactNode }) {
  return <p><Link to={to}>{children}</Link></p>;
}
