import { Link } from 'react-router-dom';
import { CivicResults, CivicSearch, CivicSelect, CivicSource } from './CivicRecords';
import { civicCsv, civilDate, matchingText } from '../lib/civic-records';
import { useCivicFilters } from '../lib/use-civic-filters';
import { moneyExact } from '../lib/tracker';
import { LOCATIONS, PROVINCES, localityTerm } from '../lib/geography';
import assistance from '../data/civic/local-assistance.json';

const provinces = PROVINCES.map(({ name }) => [name, name] as const);
const provinceNames = new Map(PROVINCES.map(({ slug, name }) => [slug, name]));
const localityKey = (province: string, locality: string) => province + '/' + localityTerm(locality).toLowerCase();
const byLocality = new Map(LOCATIONS.map((place) => [localityKey(provinceNames.get(place.province) ?? '', place.name), place]));
const entriesWithPlace = assistance.rows.map((row) => ({
  ...row, placeCode: byLocality.get(localityKey(row.province, row.locality))?.code,
}));
const namedPlaces = new Set(entriesWithPlace.flatMap((row) => row.placeCode ? [row.placeCode] : []));
const exact = (centavos: number | null) => moneyExact(centavos === null ? null : centavos / 100);

export default function LocalAssistance() {
  const { params, change, limit, more } = useCivicFilters();
  const province = params.get('province') ?? '';
  const code = params.get('lgu') ?? '';
  const place = LOCATIONS.find((location) => location.code === code);
  const term = params.get('q') ?? '';
  const places = LOCATIONS.filter((location) => !province || provinceNames.get(location.province) === province);
  const rows = entriesWithPlace.filter((row) => (!province || row.province === province) &&
    (!code || row.placeCode === code) && matchingText(term, row.province, row.locality, row.purpose));
  return <>
    <p className="tracker-stamp">DBM COMPASS · Financial Assistance to LGUs · FY {assistance.year} · {assistance.version} as of {civilDate(assistance.asOf)}. {namedPlaces.size} cities and municipalities have entries named in this extract.
      {' '}<CivicSource href={assistance.source}>Open DBM COMPASS FALGU</CivicSource>
    </p>
    <div className="civic-callout"><strong>Read cash authority separately from spending</strong>
      <p>The public FALGU export contains {assistance.sourceRows} Negros Island rows. A SARO amount indicates allotment authority and an NCA amount indicates cash authority. This table groups identical exported rows and retains their repeat count. The export provides fiscal year, location, and project details. Order numbers, issue dates, and payments are unavailable in these rows.</p>
    </div>
    <section className="tracker-filters civic-filters" aria-label="Filter LGU assistance records">
      <CivicSearch label="LGU, province, or project purpose" value={term} onChange={(value) => change('q', value)} />
      <CivicSelect label="Province" value={province} options={provinces} all="All provinces" onChange={(value) => change('province', value, ['lgu'])} />
      <CivicSelect label="City or municipality" value={code} all="All cities and municipalities"
        options={places.map((location) => [location.code, location.name])} onChange={(value) => change('lgu', value)} />
      {(term || province || code) && <Link className="button" to="/fund-releases?view=assistance">Clear filters</Link>}
    </section>
    <div className="citizen-toolbar">
      <button type="button" className="button" disabled={!rows.length} onClick={() => civicCsv('betternegrosisland-compass-falgu.csv', [
        ['fiscal_year', 'province', 'city_or_municipality', 'project', 'saro_php', 'nca_php', 'identical_source_rows', 'dataset_as_of', 'source'],
        ...rows.map((row) => [assistance.year, row.province, row.locality, row.purpose,
          row.allotment === null ? null : row.allotment / 100, row.cashAuthority === null ? null : row.cashAuthority / 100,
          row.sourceRows, assistance.asOf, assistance.source]),
      ])}>Download matching assistance entries</button>
    </div>
    {!rows.length && <p className="state">
      {place && !namedPlaces.has(place.code)
        ? 'This COMPASS export has no row naming ' + place.name + '. Browse its province to see separately listed provincial projects.'
        : 'No assistance entries match. Try another place or project term.'}
    </p>}
    <div className="civic-record-list">
      {rows.slice(0, limit).map((row) => <article className="civic-record" key={JSON.stringify(row)}>
        <div className="civic-record-meta"><span>{row.province}{row.locality ? ' · ' + row.locality : ' · City or municipality not specified'}</span>
          {row.sourceRows > 1 && <span className="civic-label">{row.sourceRows} identical source rows</span>}</div>
        <h2>{row.purpose}</h2>
        <dl className="civic-values civic-values--pair">
          <div><dt>Listed allotment authority (SARO)</dt><dd>{exact(row.allotment)}</dd></div>
          <div><dt>Listed cash authority (NCA)</dt><dd>{exact(row.cashAuthority)}</dd></div>
        </dl>
      </article>)}
    </div>
    <CivicResults count={rows.length} noun="assistance entries" limit={limit} more={more} />
  </>;
}
