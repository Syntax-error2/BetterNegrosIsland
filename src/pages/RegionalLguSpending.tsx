import { Link } from 'react-router-dom';
import { CivicRecords, CivicSearch, CivicSelect, CivicSource } from '../components/CivicRecords';
import DataTable from '../components/DataTable';
import { civicCsv, civilDate, matchingText } from '../lib/civic-records';
import { LOCATIONS, PROVINCES } from '../lib/geography';
import { useCivicFilters } from '../lib/use-civic-filters';
import fiscal from '../data/civic/regional-operating-spending.json';

const provinces = PROVINCES.map(({ slug, name }) => [slug, name] as const);
const provinceNames = new Map(provinces);
const rowsByPlace = new Map(fiscal.rows.map((row) => [row.code, row]));
const columns = [
  { key: 'place', label: 'City or municipality', width: '34%' },
  { key: 'spending', label: 'FY2025 operating expenditures', numeric: true },
  { key: 'sources', label: 'Source and disclosure records' },
];

export default function RegionalLguSpending() {
  const { params, change, reset } = useCivicFilters();
  const province = params.get('province') ?? '';
  const code = params.get('lgu') ?? '';
  const term = params.get('q') ?? '';
  const places = LOCATIONS.filter((place) => !province || place.province === province);
  const results = places.filter((place) => (!code || place.code === code) && matchingText(term, place.name, place.code));
  const indexed = results.filter((place) => rowsByPlace.has(place.code)).length;

  return <CivicRecords title="LGU spending across Negros Island"
    description="Find reported operating expenditures for cities and municipalities, and open the source for each figure.">
    <p className="tracker-stamp">{LOCATIONS.length} cities and municipalities in the directory. FY2025 operating totals checked {civilDate(fiscal.checked)}.
      {' '}<CivicSource href={fiscal.publisher}>Bureau of Local Government Finance</CivicSource>
      {' · '}<CivicSource href={fiscal.methodology}>Compilation and source notes</CivicSource>
    </p>
    <div className="civic-callout">
      <strong>What’s covered</strong>
      <p>The regional view shows reported operating expenditures using BLGF figures compiled by Scene.ph. Amounts keep the displayed rounding. A detailed budget comparison requires appropriation and spending figures from the same reporting basis. Bacolod’s city workbook provides that comparison.</p>
      <div className="civic-links"><Link to="/lgu-spending?view=comparison">Open Bacolod’s detailed budget comparison</Link></div>
    </div>
    <section className="tracker-filters civic-filters" aria-label="Find LGU spending">
      <CivicSearch label="Name or PSGC code" value={term} onChange={(value) => change('q', value)} />
      <CivicSelect label="Province" value={province} options={provinces} all="All provinces" onChange={(value) => change('province', value, ['lgu'])} />
      <CivicSelect label="City or municipality" value={code} options={places.map((place) => [place.code, place.name])}
        all="All cities and municipalities" onChange={(value) => change('lgu', value)} />
      {(term || province || code) && <button type="button" className="button" onClick={reset}>Clear filters</button>}
    </section>
    <div className="spending-heading">
      <p role="status">{results.length} {results.length === 1 ? 'place' : 'places'} shown. {indexed} {indexed === 1 ? 'has' : 'have'} a source figure.</p>
      <button className="button" type="button" disabled={!results.length}
        onClick={() => civicCsv('negros-island-lgu-operating-expenditures-2025.csv', [
          ['lgu', 'psgc_code', 'province', 'fiscal_year', 'reported_operating_expenditures_as_displayed', 'source', 'publisher'],
          ...results.map((place) => {
            const row = rowsByPlace.get(place.code);
            return [place.name, place.code, provinceNames.get(place.province) ?? '', fiscal.year, row?.reported ?? null, row?.source ?? null, fiscal.publisher];
          }),
        ])}>Download results CSV</button>
    </div>
    {results.length ? <DataTable caption="FY2025 operating expenditures by local government" columns={columns}
      unitNote="Figures are in Philippine pesos and reflect operating costs. An unavailable figure stays blank in the CSV.">
      {results.map((place) => {
        const row = rowsByPlace.get(place.code);
        return <tr key={place.code}>
          <th scope="row">{place.name}<br /><small>{provinceNames.get(place.province)}</small></th>
          <td className="money-cell">{row?.reported ?? 'Unavailable'}</td>
          <td><div className="civic-links">
            {row && <CivicSource href={row.source}>Spending source</CivicSource>}
            <Link to={'/local-disclosures?lgu=' + place.code}>Local disclosures</Link>
          </div></td>
        </tr>;
      })}
    </DataTable> : <p className="state">No places match. Clear the filters to browse the full region.</p>}
  </CivicRecords>;
}
