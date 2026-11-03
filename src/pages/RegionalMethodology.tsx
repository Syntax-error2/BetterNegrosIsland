import { Link } from "react-router-dom";
import { usePortal } from "../lib/portal-context";
import { Disclaimers, External } from "../components/Bits";
import { useSnapshot, type Manifest } from "../lib/snapshot";
import { useTitle } from "../lib/use-title";
import ResearchToolkit from "../components/ResearchToolkit";
export default function RegionalMethodology() {
  const { overview, config } = usePortal();
  const m = useSnapshot<Manifest>();
  useTitle("Research & methodology · BetterNegrosIsland");
  return (
    <main id="main-content" tabIndex={-1} className="page main legal-page">
      <p className="eyebrow">EVIDENCE, BEFORE INTERPRETATION</p>
      <h1>How to read this portal.</h1>
      <p>Use this portal for descriptive and exploratory research into published budget documents. Verify findings against the original records and report the limits of this collection.</p>
      <nav className="research-methods-nav" aria-label="Research and methodology contents"><a href="#research">Research toolkit</a><a href="#research-checklist">Verification checklist</a><a href="#budget-methods">Budget methods</a><a href="#data-sources">Source documents</a></nav>
      <section id="research" aria-labelledby="research-heading"><h2 id="research-heading">Research toolkit</h2>
        <p>Keep a dated citation, your exported data and the source documents together. Shared links can show newer records later. Research use does not override privacy responsibilities or source restrictions.</p>
        {m.status === 'ready' ? <ResearchToolkit manifest={m.value} origin={config.siteUrl || window.location.origin} sourceNotices={overview.status === 'ready' ? [overview.value.meta.notice, ...overview.value.disclaimers.map(d => [d.title, d.body, d.restrictions_url ?? d.url, d.upstream_restrictions_url].filter(Boolean).join(' '))].filter(Boolean) : []} /> : <p role="status">Snapshot metadata is {m.status === 'loading' ? 'loading' : 'unavailable'}. Citation and research-note downloads require that metadata.</p>}
      </section>
      <section id="research-checklist" aria-labelledby="research-checklist-heading"><h2 id="research-checklist-heading">Before reporting a finding</h2>
        <ol>
          <li>Define your question, unit of analysis, exact filters, search terms and exclusions. This collection is not a census of all NIR funding.</li>
          <li>Save the snapshot version, exported rows, source documents and access dates. Verify retained files against the manifest checksums where available.</li>
          <li>Compare matching fiscal years, budget stages and House readings. Keep missing values distinct from zero; never add NEP and House versions.</li>
          <li>Deduplicate by program and source ID. Inspect unconfirmed pairings, overlapping locality associations and office-based inclusions; show how exclusions affect your result.</li>
          <li>Check the original PDF page or row. Record any discrepancy instead of silently correcting source values. Nominal appropriations across years are not inflation-adjusted or automatically comparable.</li>
          <li>Report descriptive associations with limitations. These records do not establish causal effects, actual spending, completion, sponsorship or wrongdoing.</li>
        </ol>
        <p>Review titles and PDFs for unrelated personal information before sharing. Do not enter research-participant data, private identifiers or sensitive personal information into portal searches or public issues. Independent review remains necessary; the portal is not a peer-reviewed dataset or an audit finding.</p>
      </section>
      <h2 id="budget-methods">Budget methods</h2>
      <h3>1. Separate the budget stages</h3>
      <p>
        FY2027 NEP is an executive proposal. House Bill 10858 is a legislative
        version. FY2020–2026 GAA is enacted authority to spend. None establishes
        actual disbursement or project completion. The budget-cycle API exposes
        agency series but does not support a defensible local execution
        allocation; no regional expenditure is inferred.
      </p>
      <h3>2. Define the query scope</h3>
      <p>
        2027 source-region NIR queries cover the four published project
        programs. Discovered engineering-office ledgers and province-name
        searches supplement these records, including records with no region
        label. The same source identity is stored once, with every inclusion
        reason. An office’s entire budget is never added to those project totals
        or split across the districts it serves.
      </p>
      <h3>3. Treat geographic precision honestly</h3>
      <p>
        A source-confirmed NIR label confirms only the published region
        association. Province and city/municipality filters use text in the
        project title, not independently verified locations. Multiple
        associations can overlap. We do not publish provincial money totals
        inferred from office coverage. Bacolod retains its own HUC PSGC code;
        regional navigation groups it alongside Negros Occidental. Siquijor is
        included in full.
      </p>
      <h3>4. Preserve historical classifications</h3>
      <p>
        Historical GAA offers text searches, not a region/location filter.
        Province and province-qualified locality names query each department,
        following every returned cursor. Original Region VI/VII labels are
        preserved; they are not rewritten to region 18. Those historical title
        matches are not a complete historical regional budget.
      </p>
      <h3>5. Keep version comparisons comparable</h3>
      <p>
        Null means a missing document line, never zero. Source comparison
        classifications and unconfirmed match markers remain intact. Aggregate
        version differences include one-sided lines. Percentage change is
        unavailable when the baseline is missing or zero. A difference is not
        evidence of wrongdoing or proof that an official requested a project.
      </p>
      <h3>6. Know the snapshot and refresh behavior</h3>
      <p>
        Pages use dated static snapshots; project details can retrieve a newer
        live source record. Use the displayed source build dates before
        comparing them. Automated extraction validates page counts and safe peso
        integers and preserves raw records. A failed extraction leaves the last
        successful public pointer intact and writes a failure report.
      </p>
      {m.status === "ready" && (
        <p className="notice">
          Current snapshot: {m.value.version}. Retrieved {m.value.retrieved_at};
          source build {m.value.source_build}.{" "}
          <Link to="/data-coverage">
            Inspect every query and coverage status →
          </Link>
        </p>
      )}
      <h2>Official geographic reference</h2>
      <p>
        <External href="https://psa.gov.ph/classification/psgc">
          PSA Philippine Standard Geographic Code
        </External>
        . Accessible city/municipality lists are dated July 2025. The September
        2026 publication exists, but its workbook download was blocked; this
        release does not claim workbook verification.
      </p>
      <h2 id="data-sources">Published source documents</h2>
      {overview.status === "ready" ? (
        <>
          <ul>
            {overview.value.data.documents.map((d) => (
              <li key={d.key}>
                <External href={d.pdf_url}>{d.title}</External>
              </li>
            ))}
          </ul>
          <section id="data-disclaimer" aria-labelledby="disclaimer-heading"><h2 id="disclaimer-heading">Full source data disclaimer</h2><p>{overview.value.meta.notice}</p><Disclaimers items={overview.value.disclaimers} /></section>
        </>
      ) : (
        <p role="status">Source-document manifest unavailable or loading.</p>
      )}
      <h2 id="source-attribution">Open source and operator review</h2>
      <p>
        Original MIT source:{" "}
        <External href="https://github.com/bettergovph/transparency-portal">
          BetterGov.PH Transparency Portal
        </External>
        . BetterNegrosIsland is independent.{" "}
        <Link to="/about">Operator details and release limitations</Link> remain
        subject to review.
      </p>
    </main>
  );
}
