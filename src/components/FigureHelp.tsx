import { Link } from 'react-router-dom';

const EXPLANATIONS = {
  nep: 'NEP means National Expenditure Program: the Executive’s proposed budget. This figure adds only the published NEP amounts in the selected comparison records. It is not the entire regional budget, and it does not show money spent. Missing amounts are not zero. Compare this version with the House bill; never add the two totals.',
  house: 'This is the amount listed in the House bill for the selected comparison records. It is a legislative budget version, not proof of payment, project completion or actual spending. Some records appear in only one version. Missing amounts are not zero.',
  records: 'Each source dataset and record ID is counted once, even if it appears in several collection queries. These are comparison records, not independently verified construction projects. One record can mention several places, so community counts can overlap.',
  unconfirmed: 'The source has marked these document pairings as uncertain. Similar names or amounts do not confirm that two lines describe the same project. These records are already included in the comparison count; they are not additional projects. Uncertainty does not establish wrongdoing.',
  houseOnly: 'The comparison found these lines in the House bill only. They are candidates for verification, not confirmed insertions or evidence of wrongdoing. They are already included in the comparison records above. A missing match does not establish concealment.',
};
export type FigureExplanation = keyof typeof EXPLANATIONS;

export default function FigureHelp({ kind, label }: { kind: FigureExplanation; label: string }) {
  return <details className="figure-help">
    <summary aria-label={'Explain this figure: ' + label}>Explain this figure</summary>
    <p>{EXPLANATIONS[kind]}</p>
    <Link to="/methodology">Read the methodology</Link>
  </details>;
}
