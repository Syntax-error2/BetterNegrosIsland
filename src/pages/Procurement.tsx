import { Link } from 'react-router-dom';
import {
  CivicFocus, CivicRecords, CivicResults, CivicSearch, CivicSelect, CivicSource,
} from '../components/CivicRecords';
import { civicCsv, civilDate, matchingText } from '../lib/civic-records';
import { useCivicFilters } from '../lib/use-civic-filters';
import awards from '../data/civic/awards.json';

const amountFormat = new Intl.NumberFormat('en-PH', {
  style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 4,
});
const places = new Map(awards.buyers.map((buyer) => [buyer.code, buyer.name]));
const keys = (row: typeof awards.rows[number]) => [row.reference, row.date, row.agency, row.awardee, row.amount].join('|');

export default function Procurement() {
  const { params, change, reset, limit, more } = useCivicFilters('ref');
  const place = params.get('lgu') ?? '';
  const term = params.get('q') ?? '';
  const reference = params.get('ref');
  const sort = params.get('sort') ?? '';
  const rows = awards.rows.filter((row) => (!place || row.code === place) &&
    (!reference || row.reference === reference) &&
    matchingText(term, row.reference, row.title, row.awardee, row.agency)
  ).sort((a, b) => sort === 'amount'
    ? (b.amount ?? -1) - (a.amount ?? -1) || b.date.localeCompare(a.date)
    : b.date.localeCompare(a.date));

  return <CivicRecords title="Local procurement awards" description="Search a pilot sample of published PhilGEPS award notices by buyer, awardee, or reference number.">
    <p className="tracker-stamp">
      Extract checked {civilDate(awards.checked)}. {' '}
      <CivicSource href={awards.source}>BetterGov.PH PhilGEPS explorer</CivicSource>
      {' · '}<CivicSource href={awards.documentation}>Export coverage and CC0 license</CivicSource>
    </p>
    <div className="civic-callout"><strong>Pilot coverage</strong>
      <p>This extract keeps exact buyer matches for Bacolod and Vallehermoso from one historical BetterGov.PH result page. Award amounts are listed values. The source assumes Philippine pesos because its original files omit the currency field. The sample cannot establish total procurement or payments.</p>
    </div>
    {reference && <CivicFocus to="/procurement">Browse all pilot awards</CivicFocus>}
    <section className="tracker-filters civic-filters" aria-label="Filter procurement awards">
      <CivicSearch label="Award title, awardee, or reference" value={term} onChange={(v) => change('q', v)} />
      <CivicSelect label="Buyer locality" value={place} all="Both pilot localities" options={[...places]} onChange={(v) => change('lgu', v)} />
      <CivicSelect label="Sort awards" value={sort} all="Newest award date" options={[[ 'amount', 'Highest listed amount' ]]} onChange={(v) => change('sort', v)} />
      {params.size > 0 && <button type="button" className="button" onClick={reset}>Clear filters</button>}
    </section>
    <div className="citizen-toolbar">
      <button type="button" className="button" disabled={!rows.length} onClick={() => civicCsv('betternegrosisland-philgeps-pilot.csv', [
        ['reference', 'award_title', 'awardee', 'amount_php_assumed', 'award_date', 'buyer', 'source_checked', 'source_query'],
        ...rows.map((row) => [row.reference, row.title, row.awardee, row.amount, row.date, row.agency, awards.checked, awards.query]),
      ])}>Download matching awards</button>
      <CivicSource href={awards.query}>View sampled source response</CivicSource>
    </div>
    {!rows.length && <p className="state">No pilot awards match this selection. Try the buyer name or a PhilGEPS reference.</p>}
    <div className="civic-record-list">
      {rows.slice(0, limit).map((row) => <article className="civic-record" key={keys(row)}>
        <div className="civic-record-meta"><span>PhilGEPS reference {row.reference}</span><span className="civic-label">{places.get(row.code)}</span></div>
        <h2>{row.title}</h2>
        <dl className="civic-values">
          <div><dt>Awardee</dt><dd>{row.awardee || 'Unavailable'}</dd></div>
          <div><dt>Listed amount</dt><dd>{row.amount === null ? 'Unavailable' : amountFormat.format(row.amount)}</dd></div>
          <div><dt>Award date</dt><dd><time dateTime={row.date}>{civilDate(row.date)}</time></dd></div>
        </dl>
        <p className="tracker-record-meta">Listed buyer · {row.agency}</p>
        <div className="civic-links">
          <Link to={'/local-disclosures?lgu=' + row.code}>Buyer disclosures</Link>
          {!reference && <Link to={'/procurement?ref=' + row.reference}>Open award {row.reference}</Link>}
        </div>
      </article>)}
    </div>
    <CivicResults count={rows.length} noun="pilot awards" limit={limit} more={more} />
  </CivicRecords>;
}
