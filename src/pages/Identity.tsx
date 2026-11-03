import { Link } from "react-router-dom";
import { useTitle } from "../lib/use-title";
export default function Identity() {
  useTitle("About BetterNegrosIsland");
  return (
    <main id="main-content" tabIndex={-1} className="page main legal-page">
      <p className="eyebrow">OPEN DATA. A STRONGER NEGROS ISLAND.</p>
      <h1>
        About Better
        <wbr />
        NegrosIsland.
      </h1>
      <p>
        An independent, nonpartisan civic budget transparency portal for Negros
        Occidental including Bacolod, Negros Oriental, and Siquijor.
      </p>
      <h2>Public evidence, open to everyone.</h2>
      <p>
        Operated by Aqura Information Technology Solutions / Dave Hermoso,
        Binalbagan, Negros Occidental.
      </p>
      <p>
        No login, registration, payment, residency proof, or GPS access is
        required. Published proposals and appropriations are not proof that
        funds were released, spent, or used to complete a project.
      </p>
      <h2>Open-source foundation</h2>
      <p>For research use, start with the <Link to="/methodology#research">research toolkit and verification checklist</Link>. It includes a snapshot citation, research notes and a field guide. Research purpose does not replace source verification, privacy safeguards or legal review.</p>
      <p>
        Powered by BetterGov.PH Budget Data. Built on{" "}
        <a href="https://github.com/bettergovph/transparency-portal">
          BetterGov.PH’s Transparency Portal
        </a>
        , with its original MIT license preserved. No government affiliation,
        endorsement, or partnership is implied.
      </p>
      <h2>Coverage with clear boundaries</h2>
      <p>
        Our geographic directory includes all 63 cities and municipalities in
        the PSA’s accessible NIR lists. Budget records have different and
        incomplete geographic precision.{" "}
        <Link to="/data-coverage">Read the collection ledger</Link> before
        drawing regional or local conclusions.
      </p>
      <h2 id="operator">Operator information</h2>
      <p className="notice">
        The operator details above were supplied by the project owner and have
        not been independently verified as a legal registration. No privacy
        contact or submission form is currently published.
        A corrections and rights-request procedure, approved legal notices and
        provider processing review remain pending. The website is hosted by Vercel;
        hosting does not certify completion of those reviews.
      </p>
    </main>
  );
}
