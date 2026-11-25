import { Link, useSearchParams } from 'react-router-dom';
import LocalAssistance from '../components/LocalAssistance';
import { CivicFocus, CivicRecords, CivicResults, CivicSearch, CivicSelect, CivicSource } from '../components/CivicRecords';
import { civicCsv, civilDate, matchingText } from '../lib/civic-records';
import { useCivicFilters } from '../lib/use-civic-filters';
import { moneyExact } from '../lib/tracker';
import releases from '../data/civic/fund-releases.json';

const departments = [...new Set(releases.rows.map((row) => row.department))].sort().map((name) => [name, name] as const);
const types = [['positive', 'Positive releases'], ['zero', 'Zero-amount entries'], ['negative', 'Negative entries']] as const;
const amountType = (amount: number) => amount < 0 ? 'negative' : amount === 0 ? 'zero' : 'positive';

function ReleaseOrders() {
  const { params, change, limit, more, reset } = useCivicFilters('order');
  const term = params.get('q') ?? '';
  const order = params.get('order');
  const department = params.get('department') ?? '';
  const type = params.get('type') ?? '';
  const rows = releases.rows.filter((row) => (!order || row.id === order) &&
    (!department || row.department === department) && (!type || amountType(row.amount) === type) &&
    matchingText(term, row.id, row.unit, row.department, row.agency, row.purpose));
  return <>
    <p className="tracker-stamp">{releases.rows.length} entries selected from the FY2026 SARO register checked {civilDate(releases.checked)}.
      {' '}<CivicSource href={releases.register}>DBM register (PDF)</CivicSource>
      {' · '}<CivicSource href={releases.compass}>LGU assistance on DBM COMPASS</CivicSource>
    </p>
    <div className="civic-callout"><strong>What a release order shows</strong>
      <p>A budget appropriation authorizes funding. A Special Allotment Release Order records authority to incur obligations within its terms. A payment requires a separate disbursement record. This extract shows published allotment orders, including signed adjustments.</p>
      <p>Coverage uses the NIR issuance code or a named regional operating unit or location in the order. National orders can cover several places. Read the named operating unit and purpose before attributing an amount to a locality.</p>
      <div className="civic-links"><Link to="/fund-releases?view=assistance">Browse project assistance by city or municipality</Link></div>
    </div>
    {order && <CivicFocus to="/fund-releases">Browse all release orders</CivicFocus>}
    <section className="tracker-filters civic-filters" aria-label="Filter release orders">
      <CivicSearch label="Order number, operating unit, or purpose" value={term} onChange={(v) => change('q', v)} />
      <CivicSelect label="Department" value={department} options={departments} all="All departments" onChange={(v) => change('department', v)} />
      <CivicSelect label="Listed amount" value={type} options={types} all="All amount types" onChange={(v) => change('type', v)} />
      {params.size > 0 && <button type="button" className="button" onClick={reset}>Clear filters</button>}
    </section>
    <div className="citizen-toolbar">
      <button type="button" className="button" disabled={!rows.length} onClick={() => civicCsv('betternegrosisland-dbm-release-orders.csv', [
        ['saro_number', 'release_date', 'allotment_php', 'department', 'agency', 'operating_unit', 'purpose', 'scope_basis', 'page', 'source_checked', 'source'],
        ...rows.map((row) => [row.id, row.date, row.amount, row.department, row.agency, row.unit, row.purpose, row.basis, row.page, releases.checked, releases.register + '#page=' + row.page]),
      ])}>Download matching release orders</button>
    </div>
    {!rows.length && <p className="state">No indexed orders match. Try a broader search or check the DBM register.</p>}
    <div className="civic-record-list">
      {rows.slice(0, limit).map((row) => <article className="civic-record" key={row.id}>
        <div className="civic-record-meta"><span>{row.id}</span><span className="civic-label">{row.basis}</span></div>
        <h2>{row.unit}</h2>
        <dl className="civic-values">
          <div><dt>Listed allotment</dt><dd>{moneyExact(row.amount)}</dd></div>
          <div><dt>Release date</dt><dd><time dateTime={row.date}>{civilDate(row.date)}</time></dd></div>
          <div><dt>Department</dt><dd>{row.department}</dd></div>
        </dl>
        <p className="tracker-record-meta">Agency · {row.agency}</p><p>{row.purpose}</p>
        <div className="civic-links">
          <CivicSource href={releases.register + '#page=' + row.page}>Open DBM register · page {row.page}</CivicSource>
          {!order && <Link to={'/fund-releases?order=' + row.id}>Open order {row.id}</Link>}
        </div>
      </article>)}
    </div>
    <CivicResults count={rows.length} noun="release orders" limit={limit} more={more} />
  </>;
}

export default function FundReleases() {
  const [params] = useSearchParams();
  const assistance = params.get('view') === 'assistance';
  return <CivicRecords title="National fund release tracker"
    description="Find published national allotment orders and project-level LGU assistance entries associated with Negros Island.">
    <nav className="record-views" aria-label="Fund release views">
      <Link to="/fund-releases" aria-current={assistance ? undefined : 'page'}>Allotment release orders</Link>
      <Link to="/fund-releases?view=assistance" aria-current={assistance ? 'page' : undefined}>LGU project assistance</Link>
    </nav>
    {assistance ? <LocalAssistance /> : <ReleaseOrders />}
  </CivicRecords>;
}
