import CitizenShortcuts from "../components/CitizenShortcuts";
import ResponsibleUse from "../components/ResponsibleUse";
import CommunitySpotlight from "../components/CommunitySpotlight";
import KpiCard from "../components/KpiCard";
import { Link } from "react-router-dom";
import { useSnapshot } from "../lib/snapshot";
import SourceStatus from "../components/SourceStatus";
import { php, count } from "../lib/format";
import type { Summary } from "../lib/scope";
import { PROVINCES } from "../lib/geography";
import { useTitle } from "../lib/use-title";
export default function RegionalOverview() {
  useTitle("BetterNegrosIsland · Public budgets. Clearer decisions.");
  const s = useSnapshot<
    Summary & {
      provinceCounts: { slug: string; name: string; count: number }[];
    }
  >("summary");
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page page--wide main regional-overview"
    >
      <section className="region-hero">
        <div>
          <p className="eyebrow">Open data for Negros Island Region</p>
          <h1>
            Public budgets.
            <br />
            Clearer decisions.
          </h1>
          <p>
            Follow published budget proposals and historical appropriations
            across Negros Occidental, Negros Oriental, and Siquijor. Evidence
            first. Always.
          </p>
          <div className="hero-actions">
            <Link to="/projects" className="button button-primary">
              Explore budget projects
            </Link>
            <Link to="/methodology">How the data works</Link>
          </div>
        </div>
        <aside className="region-edition" aria-labelledby="review-title">
          <div className="edition-heading"><h2 id="review-title">The regional budget review</h2><span>FY 2027</span></div>
          <p className="edition-versions"><strong>NEP proposal</strong><span>compared with</span><strong>House Bill 10858</strong></p>
          <p>Published versions are compared, never added. Proposed allocations and appropriations are not proof of spending.</p>
          <SourceStatus />
        </aside>
      </section>
      {s.status === "ready" && (
        <>
          <div className="section-heading">
            <h2>The published comparison, at a glance.</h2>
            <Link to="/analytics">Explore the analysis →</Link>
          </div>
          <dl className="stats overview-kpis">
            <KpiCard explanation="nep" label="NEP proposal · scoped records" value={s.value.nep.rows ? php(s.value.nep.php) : "Not available"} unavailable={!s.value.nep.rows} note={<>{count(s.value.nep.rows)} lines with an amount</>} />
            <KpiCard explanation="house" label="House bill · same record union" value={s.value.house.rows ? php(s.value.house.php) : "Not available"} unavailable={!s.value.house.rows} note={<>{count(s.value.house.rows)} lines with an amount</>} />
            <KpiCard explanation="records" label="Unique comparison records" value={count(s.value.rows)} note="Deduplicated by source identity" />
            <KpiCard explanation="unconfirmed" label="Unconfirmed matches" value={count(s.value.unconfirmed)} note="Included in the comparison records" />
          </dl>
          <p className="notice">
            These totals combine source-confirmed NIR records with documented
            office and place-name associations. They are not a complete regional
            government budget or verified local spending. The separate NEP
            regional rollup is available on Analytics.
          </p>
        </>
      )}
      <CommunitySpotlight />
      <section className="reading-discovery" aria-labelledby="reading-tools-heading"><div><h2 id="reading-tools-heading">Keep following the evidence.</h2><p>See what changed, save a useful record, or begin with the services your community uses.</p></div><nav aria-label="Citizen reading tools"><Link to="/updates">What changed in the data</Link><Link to="/topics">Browse everyday needs</Link><Link to="/saved">Your saved items</Link><Link to="/hearings">Budget hearing mentions</Link></nav></section>
      <CitizenShortcuts />
      {s.status === "ready" && (
        <>
          <section className="overview-provinces">
            <div className="section-heading">
              <h2>One region. Every community.</h2>
              <span>19 cities · 44 municipalities · PSA directory</span>
            </div>
            <div className="province-grid">
              {PROVINCES.map((p, i) => (
                <Link
                  to={"/provinces/" + p.slug}
                  key={p.slug}
                  className="province-card"
                >
                  <span className="province-index">0{i + 1}</span>
                  <h3>{p.name}</h3>
                  <p>{p.note}</p>
                  <strong>
                    {s.value.provinceCounts.find((x) => x.slug === p.slug)
                      ?.count ?? 0}{" "}
                    title-associated records
                  </strong>
                  <span>Explore province →</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="region-reading">
            <div>
              <p className="eyebrow">BEYOND THE HEADLINE</p>
              <h2>
                Read the documents.
                <br />
                Understand the differences.
              </h2>
            </div>
            <p>
              Four project programs, historical enacted appropriations, and a
              separately identified NEP regional rollup. Every dataset has
              boundaries. Our coverage ledger makes those boundaries visible.
            </p>
            <Link to="/data-coverage" className="button">
              Inspect data coverage ↗
            </Link>
          </section>
        </>
      )}
      {s.status === "loading" && (
        <p role="status" className="state">
          Loading comparison summary…
        </p>
      )}
      {s.status === "error" && (
        <div role="alert" className="state">
          <p>Summary unavailable. No figures have been substituted.</p>
          <button className="button" onClick={() => window.location.reload()}>
            Reload verified data
          </button>
        </div>
      )}
      <ResponsibleUse />
    </main>
  );
}
