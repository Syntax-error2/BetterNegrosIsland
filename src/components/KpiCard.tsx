import type { ReactNode } from 'react';
import FigureHelp, { type FigureExplanation } from './FigureHelp';

/** A definition-list item shared by the overview and analytics dashboards. */
export default function KpiCard({ label, value, note, exact, explanation, unavailable = false }: {
  label: string; value: ReactNode; note: ReactNode; exact?: string; unavailable?: boolean; explanation?: FigureExplanation;
}) {
  return <div className="kpi-card">
    <dt>{label}</dt>
    <dd className={'stat kpi-value' + (unavailable ? ' stat-unavailable' : '')} title={exact}>{value}</dd>
    <dd className="kpi-note">{note}</dd>
    {explanation && <dd className="kpi-explanation"><FigureHelp kind={explanation} label={label} /></dd>}
  </div>;
}
