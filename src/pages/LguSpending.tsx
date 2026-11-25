import { Link, useSearchParams } from 'react-router-dom';
import { CivicRecords, CivicSource } from '../components/CivicRecords';
import DataTable from '../components/DataTable';
import { civicCsv, civilDate } from '../lib/civic-records';
import { moneyExact } from '../lib/tracker';
import spending from '../data/civic/bacolod-spending.json';
import RegionalLguSpending from './RegionalLguSpending';

const columns = [
  { key: 'category', label: 'Expenditure category', width: '39%' },
  { key: 'budget', label: 'Budget appropriation', numeric: true },
  { key: 'actual', label: 'Reported expenditures', numeric: true },
  { key: 'share', label: 'Share of appropriation', numeric: true },
];
const total = spending.rows.reduce((sum, row) => ({
  appropriation: sum.appropriation + row.appropriation,
  actual: sum.actual + row.actual,
}), { appropriation: 0, actual: 0 });
const exact = (amount: number) => moneyExact(amount / 100);
const percentFormat = new Intl.NumberFormat('en-PH', { style: 'percent', maximumFractionDigits: 1 });
const percent = (actual: number, budget: number) => budget > 0 ? percentFormat.format(actual / budget) : 'Unavailable';
const scale = Math.max(...spending.rows.map((row) => Math.max(row.appropriation, row.actual)));

function BacolodComparison() {
  return <CivicRecords title="LGU budget vs. actual spending"
    description="Compare published appropriations and reported expenditures for Bacolod using the same categories and reporting period.">
    <p><Link to="/lgu-spending">Browse spending for all cities and municipalities</Link></p>
    <div className="spending-context">
      <h2>{spending.place} · {spending.period}</h2>
      <p>Statement of Receipts and Expenditures. Source checked {civilDate(spending.checked)}.</p>
      <div className="civic-links">
        <CivicSource href={spending.report}>Download the Q4 expenditure workbook (XLS)</CivicSource>
        <Link to={'/local-disclosures?lgu=' + spending.code}>Bacolod disclosure checklist</Link>
      </div>
    </div>
    <div className="civic-metrics spending-metrics">
      <div><span>Listed appropriations</span><strong>{exact(total.appropriation)}</strong><small>Operating and capital/investment categories</small></div>
      <div><span>Reported expenditures</span><strong>{exact(total.actual)}</strong><small>Total across the funds as reported in the SRE</small></div>
      <div><span>Share of listed appropriations</span><strong>{percent(total.actual, total.appropriation)}</strong><small>Same report rows and reporting period</small></div>
    </div>
    <div className="civic-callout">
      <strong>How to read the comparison</strong>
      <p>The figures pair the SRE’s Budget Appropriation and Total columns for the selected expenditure rows. The workbook groups actual expenditures across funds and provides one appropriation column. The comparison excludes prior-year payable payments and cash balances.</p>
    </div>
    <section className="spending-section" aria-labelledby="spend-category-heading">
      <div className="spending-heading"><h2 id="spend-category-heading">Spending by category</h2>
        <button className="button" type="button" onClick={() => civicCsv('bacolod-spending-q4-2025.csv', [
          ['lgu', 'period', 'category', 'appropriation_php', 'reported_expenditure_php', 'source_row', 'source'],
          ...spending.rows.map((row) => [spending.place, spending.period, row.label, row.appropriation / 100, row.actual / 100, row.row, spending.report]),
        ])}>Download comparison CSV</button>
      </div>
      <p className="spending-legend"><span>Budget appropriation</span><span>Reported expenditures</span></p>
      <DataTable caption="Bacolod Q4 2025 category comparison" columns={columns}
        unitNote="Amounts are in Philippine pesos. Bars use the same scale across categories.">
        {spending.rows.map((row) => <tr key={row.row}>
          <th scope="row">{row.label}
            <span className="spending-bars" aria-hidden="true">
              <span style={{ width: (100 * row.appropriation / scale) + '%' }} />
              <span style={{ width: (100 * row.actual / scale) + '%' }} />
            </span>
          </th>
          <td className="money-cell">{exact(row.appropriation)}</td>
          <td className="money-cell">{exact(row.actual)}</td>
          <td className="money-cell">{percent(row.actual, row.appropriation)}</td>
        </tr>)}
      </DataTable>
    </section>
    <section className="civic-record spending-section" aria-labelledby="spend-sources-heading">
      <h2 id="spend-sources-heading">Budget and audit sources</h2>
      <p>The Annual Budget workbook lists {exact(spending.proposedGeneralFund)} in proposed FY2025 General Fund expenditures. The chart above uses the appropriations in the Q4 SRE because that report provides the paired actuals.</p>
      <div className="civic-links">
        <CivicSource href={spending.abr}>Bacolod 2025 Annual Budget workbook (XLSX)</CivicSource>
        <CivicSource href={spending.source}>Bacolod Full Disclosure Policy</CivicSource>
        <CivicSource href={spending.coa}>COA Annual Audit Report · 2023</CivicSource>
      </div>
      <p>The linked COA report covers an earlier year. The 2025 comparison reflects the city-published SRE.</p>
    </section>
  </CivicRecords>;
}

export default function LguSpending() {
  const [params] = useSearchParams();
  const comparison = params.get('view') === 'comparison';
  const place = params.get('lgu');
  return comparison && (!place || place === spending.code) ? <BacolodComparison /> : <RegionalLguSpending />;
}
