import { Link } from 'react-router-dom';
import { CivicFocus, CivicResults, CivicSearch, CivicSelect, CivicSource } from './CivicRecords';
import { civicCsv, civilDate, matchingText } from '../lib/civic-records';
import { useCivicFilters } from '../lib/use-civic-filters';
import { moneyExact } from '../lib/tracker';
import bids from '../data/civic/bids.json';
import awards from '../data/civic/awards.json';

const buyers = new Map(awards.buyers.map((item) => [item.code, item.name]));
const statuses = [...new Set(bids.rows.map((row) => row.status))].sort().map((status) => [status, status] as const);
const deadlineFormat = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' });

export default function BidNotices() {
  const { params, change, limit, more } = useCivicFilters('bid');
  const term = params.get('q') ?? '';
  const locality = params.get('lgu') ?? '';
  const status = params.get('status') ?? '';
  const bid = params.get('bid');
  const rows = bids.rows.filter((row) => (!bid || row.id === bid) &&
    (!locality || row.code === locality) && (!status || row.status === status) &&
    matchingText(term, row.id, row.buyer, row.title, row.solicitation, row.category, row.cityResult?.winningBidder ?? '')
  ).sort((a, b) => b.deadline.localeCompare(a.deadline));
  return <>
    <p className="tracker-stamp">Official PhilGEPS bid abstracts for Bacolod and Vallehermoso.
      {' '}<CivicSource href={bids.source}>PhilGEPS Open Data</CivicSource>
    </p>
    <div className="civic-callout"><strong>Archived bid notices</strong>
      <p>The pilot contains historical notices with posted deadlines and the status shown when checked. For two Bacolod notices, the city’s bid results also identify the winning bidder and bid amount. Use PhilGEPS for current opportunities and amendments.</p>
    </div>
    {bid && <CivicFocus to="/procurement?view=bids">Browse all pilot bid notices</CivicFocus>}
    <section className="tracker-filters civic-filters" aria-label="Filter procurement bid notices">
      <CivicSearch label="Bid title, reference, solicitation or category" value={term} onChange={(v) => change('q', v)} />
      <CivicSelect label="Buyer locality" value={locality} all="Both pilot localities" options={[...buyers]} onChange={(v) => change('lgu', v)} />
      <CivicSelect label="PhilGEPS status" value={status} all="All statuses" options={statuses} onChange={(v) => change('status', v)} />
      {(term || status || locality || bid) && <Link className="button" to="/procurement?view=bids">Clear filters</Link>}
    </section>
    <div className="citizen-toolbar">
      <button type="button" className="button" disabled={!rows.length} onClick={() => civicCsv('betternegrosisland-bid-notices.csv', [
        ['philgeps_bid_reference', 'solicitation', 'title', 'buyer', 'category', 'published', 'deadline_pht', 'notice_status', 'approved_budget_php', 'checked', 'source', 'city_winning_bidder', 'city_winning_bid_php', 'city_results_workbook', 'city_results_sheet', 'city_results_row'],
        ...rows.map((row) => [row.id, row.solicitation, row.title, row.buyer, row.category, row.published, row.deadline, row.status, row.abc, row.checked, row.source,
          row.cityResult?.winningBidder ?? null, row.cityResult?.bidAmount ?? null, row.cityResult?.source ?? null, row.cityResult?.sheet ?? null, row.cityResult?.row ?? null]),
      ])}>Download matching bid notices</button>
    </div>
    {!rows.length && <p className="state">No indexed bid notices match this selection.</p>}
    <div className="civic-record-list">
      {rows.slice(0, limit).map((row) => <article className="civic-record" key={row.id}>
        <div className="civic-record-meta"><span>PhilGEPS bid {row.id} · {row.solicitation}</span><span className="civic-label">{row.status}</span></div>
        <h2>{row.title}</h2><p>{row.buyer} · {row.category}</p>
        <dl className="civic-values">
          <div><dt>Published bid deadline</dt><dd><time dateTime={row.deadline}>{deadlineFormat.format(new Date(row.deadline))} PHT</time></dd></div>
          <div><dt>Approved budget for the contract</dt><dd>{moneyExact(row.abc)}</dd></div>
          <div><dt>Notice published</dt><dd><time dateTime={row.published}>{civilDate(row.published)}</time></dd></div>
        </dl>
        <p className="tracker-record-meta">Status checked {civilDate(row.checked)}. {row.status === 'Awarded' && !row.cityResult && 'Award details have yet to be linked for this bid reference.'}</p>
        {row.cityResult && <section className="bid-result" aria-label="Matched city bid result">
          <h3>Matched city bid result</h3>
          <p>{row.cityResult.winningBidder} · {moneyExact(row.cityResult.bidAmount)} winning bid</p>
          <p>Matched by solicitation number and approved budget. <CivicSource href={row.cityResult.source}>City bid results · row {row.cityResult.row}</CivicSource></p>
        </section>}
        <div className="civic-links">
          <CivicSource href={row.source}>Open PhilGEPS bid abstract</CivicSource>
          <Link to={'/local-disclosures?lgu=' + row.code}>Buyer disclosures</Link>
          {!bid && <Link to={'/procurement?view=bids&bid=' + row.id}>Open bid {row.id}</Link>}
        </div>
      </article>)}
    </div>
    <CivicResults count={rows.length} noun="pilot bid notices" limit={limit} more={more} />
  </>;
}
