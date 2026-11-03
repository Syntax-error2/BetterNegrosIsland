import { Link } from "react-router-dom";
import { usePortal } from "../lib/portal-context";
import { Disclaimers, External } from "../components/Bits";
import { useSnapshot, type Manifest } from "../lib/snapshot";
import { useTitle } from "../lib/use-title";
export default function RegionalMethodology() {
  const { overview } = usePortal();
  const m = useSnapshot<Manifest>();
  useTitle("Methodology · BetterNegrosIsland");
  return (
    <main id="main-content" tabIndex={-1} className="page main legal-page">
      <p className="eyebrow">EVIDENCE, BEFORE INTERPRETATION</p>
      <h1>How to read this portal.</h1>
      <h2>1. Separate the budget stages</h2>
      <p>
        FY2027 NEP is an executive proposal. House Bill 10858 is a legislative
        version. FY2020–2026 GAA is enacted authority to spend. None establishes
        actual disbursement or project completion. The budget-cycle API exposes
        agency series but does not support a defensible local execution
        allocation; no regional expenditure is inferred.
      </p>
      <h2>2. Define the query scope</h2>
      <p>
        2027 source-region NIR queries cover the four published project
        programs. Discovered engineering-office ledgers and province-name
        searches supplement these records, including records with no region
        label. The same source identity is stored once, with every inclusion
        reason. An office’s entire budget is never added to those project totals
        or split across the districts it serves.
      </p>
      <h2>3. Treat geographic precision honestly</h2>
      <p>
        A source-confirmed NIR label confirms only the published region
        association. Province and city/municipality filters use text in the
        project title, not independently verified locations. Multiple
        associations can overlap. We do not publish provincial money totals
        inferred from office coverage. Bacolod retains its own HUC PSGC code;
        regional navigation groups it alongside Negros Occidental. Siquijor is
        included in full.
      </p>
      <h2>4. Preserve historical classifications</h2>
      <p>
        Historical GAA offers text searches, not a region/location filter.
        Province and province-qualified locality names query each department,
        following every returned cursor. Original Region VI/VII labels are
        preserved; they are not rewritten to region 18. Those historical title
        matches are not a complete historical regional budget.
      </p>
      <h2>5. Keep version comparisons comparable</h2>
      <p>
        Null means a missing document line, never zero. Source comparison
        classifications and unconfirmed match markers remain intact. Aggregate
        version differences include one-sided lines. Percentage change is
        unavailable when the baseline is missing or zero. A difference is not
        evidence of wrongdoing or proof that an official requested a project.
      </p>
      <h2>6. Know the snapshot and refresh behavior</h2>
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
