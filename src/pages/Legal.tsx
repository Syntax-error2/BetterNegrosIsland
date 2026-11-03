import { Link, useLocation } from "react-router-dom";
import { LEGAL_VERSION, ACK_KEY } from "../lib/legal";
import { useTitle } from "../lib/use-title";
import BrandLogo from "../components/BrandLogo";
import { usePortal } from "../lib/portal-context";
import { Disclaimers } from "../components/Bits";

export default function Legal() {
  const { scope } = usePortal();
  const { pathname, state } = useLocation();
  const candidate = state?.returnTo;
  const returnTo =
    typeof candidate === "string" &&
    candidate.startsWith("/") &&
    !candidate.startsWith("//")
      ? candidate
      : "/";
  const privacy = pathname === "/privacy";
  const title = privacy ? "Privacy Notice" : "Terms of Use";
  useTitle(`${title} · BetterNegrosIsland`);
  return (
    <main id="main-content" tabIndex={-1} className="page page--reading main legal-page legal-document">
      <Link to={returnTo}>← Return to the portal</Link>
      <div className="legal-document-brand"><BrandLogo /></div>
      <p className="legal-revision">Review draft · Revised 3 November 2026 · Version {LEGAL_VERSION}</p>
      <h1>{title}</h1>
      <p className="notice">
        <strong>Privacy and legal review remain pending.</strong> This portal is
        hosted by Vercel. Rights-request procedures, applicable lawful
        criteria, retention and legal review remain unresolved. This draft is
        not a legal certification.
      </p>
      <nav className="legal-toc" aria-label={`${title} contents`}>
        <strong>In this notice</strong>
        <a href="#legal-content">Read the full {privacy ? "Privacy Notice" : "Terms of Use"}</a>
        <Link state={{ returnTo }} to={privacy ? "/terms" : "/privacy"}>{privacy ? "Terms of Use" : "Privacy Notice"}</Link>
        {privacy && <a href="#privacy-rights">Rights and complaints</a>}
        <Link to={returnTo}>Return to the portal</Link>
      </nav>
      <div id="legal-content">
      {privacy ? (
        <>
          <h2>1. Responsible operator</h2>
          <p>
            BetterNegrosIsland is operated by Aqura Information Technology
            Solutions / Dave Hermoso, Binalbagan, Negros Occidental. It is an
            independent, nonpartisan initiative, not a government service or an
            endorsed BetterGov.PH project.
          </p>
          <p>BetterGov.PH supplies budget data. BetterNegrosIsland independently selects and presents it. The data provider is not presented as this portal’s privacy officer or rights-request handler; no such arrangement has been verified.</p>
          <h2>2. What this portal processes</h2>
          <p>
            You can read public information without an account, email address,
            phone number, identification document, payment, residency check, or
            visitor GPS permission. The application does not use advertising
            trackers, fingerprinting, behavioral analytics, or tracking cookies.
          </p>
          <dl className="privacy-inventory">
            <dt>Local notice acknowledgment</dt>
            <dd>
              Your browser stores the current legal document version under{" "}
              <code>{ACK_KEY}</code>. It is not sent to a portal backend and
              does not identify you. You can remove it below. If storage is
              blocked, entry works in memory for the current page session.
            </dd>
            <dt>Optional saved records and searches</dt>
            <dd>When you choose Save record or Save this search, this browser stores public record identifiers and the selected search path and terms under <code>betternegrosisland:notebook:v1</code>. There is no account or automatic cross-device synchronization. Use public budget terms only; do not save personal information in searches. Other people using this browser profile can see these items. They remain until removed in <Link to="/saved">Saved items</Link> or browser data is cleared. Clearing saved items leaves the notice acknowledgment in place. If storage fails, the reading list is held in memory for the current visit and is labeled accordingly.</dd>
            <dt>Technical delivery</dt>
            <dd>
              Serving pages and data can reveal IP addresses, browser/request
              headers, requested paths, query strings and request times to the
              hosting provider, Vercel. The operator has not yet completed its
              review of provider logging, retention, subprocessors and processing
              locations. We do not claim that visiting a website produces no
              personal data.
            </dd>
            <dt>Public budget records</dt>
            <dd>
              The portal displays published project names, amounts, source
              references and geographic evidence. Public-source status does not
              remove privacy responsibilities. Unrelated personal identifiers
              should be reviewed and handled proportionately before publication;
              no unrestricted republication permission is asserted.
            </dd>
            <dt>Evidence cards and record comparisons</dt>
            <dd>
              Evidence images and QR codes are generated in your browser from
              the loaded snapshot, without uploading the generated image to a
              portal server. Download saves a file on your device. Copy buttons
              write the requested link to your clipboard only when you select
              them. Comparison links contain public record identifiers, not
              your search text. Opening or sharing those links can still expose
              their paths and identifiers to the host or recipients. Review
              source titles and documents before sharing; the portal does not
              automatically detect or redact personal information. Do not add
              or republish unrelated personal identifiers, private contact
              details or sensitive personal information.
            </dd>
          </dl>
          <button
            className="button"
            onClick={() => {
              try {
                localStorage.removeItem(ACK_KEY);
              } catch {
                /* Storage may be blocked. */
              }
              window.location.assign("/");
            }}
          >
            Clear acknowledgment and return to welcome
          </button>
          <h2>3. Network requests and service providers</h2>
          <p>
            Pages, fonts, the supplied logo and dated budget snapshots are
            delivered by this portal’s host. There is no external font service
            or embedded third-party chart script. Project filters run locally
            over the loaded snapshot. A shared URL or page reload can include
            filter terms in the host’s request logs, so do not enter personal
            information into search.
          </p>
          <p>
            Individual project details may request a current record from
            budget.bettergov.ph. The provider can receive ordinary
            connection/request information; the local acknowledgment is not
            included. Opening a source PDF, map or other external link contacts
            its separate provider and is governed by that provider’s practices.
            Current details may be newer than the dated snapshot. Development
            preview also uses a local Vite connection; it is not production
            tracking.
          </p>
          <h2>4. Purposes, lawful criteria and retention</h2>
          <p>
            The defined purposes are delivering public budget information,
            explaining source limitations, keeping a reading list when requested and remembering that the current
            notices were provided. The operator must document the applicable
            lawful criteria, processor arrangements, technical safeguards, log
            retention and any international processing before public launch.
            Consent is not assumed to be the only possible lawful criterion, and
            this draft does not determine the final legal basis.
          </p>
          <p>
            The acknowledgment stays in your browser until cleared or replaced
            by a later version. No verified hosting/API log retention period or
            automatic deletion schedule is asserted. Public snapshot retention
            is separate from visitor log retention.
          </p>
          <h2>5. Notice acknowledgment is not blanket consent</h2>
          <p>
            The entry checkbox records agreement to the Terms and acknowledgment
            that this Privacy Notice was provided. It is not consent to
            advertising, tracking, arbitrary personal data processing, or
            disclosure. If a future activity requires consent, it must have its
            own specific explanation, choice and appropriate withdrawal
            mechanism. Saved items use optional local browser storage only when selected; no account, advertising or report-submission service is enabled.
          </p>
          <h2 id="privacy-rights">6. Rights and complaints</h2>
          <p>
            Rights under applicable law may include information, access,
            correction, objection, erasure or blocking, portability and damages.
            You may consult the National Privacy Commission’s{" "}
            <a href="https://privacy.gov.ph/data-subject-rights/">
              data subject rights guidance
            </a>{" "}
            and{" "}
            <a href="https://privacy.gov.ph/">
              official complaint/contact channels
            </a>
            . A portal procedure for receiving and resolving rights requests is
            not yet operational. No portal privacy contact or submission form
            has been added.
          </p>
          <p>For an initial privacy or correction request, provide only the affected page or source-record reference and a short description through a verified private operator channel once available. Do not post identity documents, private contact details, health information or other sensitive personal data in public GitHub issues or social-media comments. Request identity verification only when necessary and through an appropriate private process.</p>
          <h2>7. Security and accountability</h2>
          <p>
            Data minimization, local fonts, escaped text rendering, restricted
            document link schemes and safe spreadsheet exports reduce avoidable
            exposure. Production security headers and provider practices must
            still be verified on the selected host. These technical measures are
            not a certification of Data Privacy Act or WCAG compliance.
          </p>
          <h2>8. Review sources and changes</h2>
          <p>
            This review uses the official{" "}
            <a href="https://privacy.gov.ph/data-privacy-act/">
              Data Privacy Act
            </a>
            , its{" "}
            <a href="https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/">
              Implementing Rules and Regulations
            </a>
            ,{" "}
            <a href="https://privacy.gov.ph/the-right-to-be-informed/">
              right-to-be-informed guidance
            </a>{" "}
            and{" "}
            <a href="https://privacy.gov.ph/pips-and-pics/advisories-circulars/">
              NPC issuances, including Circular 2023-04 on consent
            </a>
            . Material changes require a new version. Hosting does not establish
            completion of the outstanding legal/privacy review.
          </p>
        </>
      ) : (
        <>
          <h2>1. Purpose and open access</h2>
          <p>
            The portal helps citizens understand public budget records
            associated with the Negros Island Region. It is free and open to
            everyone, with no login, registration, subscription, or residency
            check.
          </p>
          <h2>2. Independent status and attribution</h2>
          <p>
            BetterNegrosIsland is independent and nonpartisan. It is not an
            official government website. No endorsement, partnership, or
            government affiliation is implied. BetterGov.PH provides the
            original open-source Transparency Portal and the primary budget API.
          </p>
          <h2>3. What the data means</h2>
          <p>
            FY2027 NEP and House Bill 10858 are budget proposals or legislative
            versions. FY2020–2026 GAA figures are enacted appropriations.
            Neither proves spending, release, payment, completion, or
            wrongdoing. Document versions are compared and never added. A
            missing line is not zero. Candidate and uncertain matches require
            review.
          </p>
          <h2>4. Coverage and accuracy</h2>
          <p>
            Four published project program groups and historical appropriations
            are covered where available. Place-name searches can miss projects
            or include uncertain associations. Office records are not silently
            divided among LGUs. Data may be incomplete, outdated, incorrectly
            extracted, or unavailable. No guarantee of accuracy, completeness,
            fitness, or continuous availability is made. Verify important
            conclusions against the linked source documents.
          </p>
          <h2>5. Responsible use</h2>
          <p>
            Use records in context. Do not claim that a comparison proves
            wrongdoing, or attribute changes to an official without independent
            evidence. Do not disrupt the service, introduce malicious content,
            or misrepresent this portal as an official source. Quote the budget
            stage, source, and limitations when sharing.
          </p>
          <p>Public-source availability is not permission for unrestricted republication of personal information. Do not add or republish unrelated identifiers, private contact details or sensitive personal information. This disclaimer does not waive anyone’s legal rights or remove the operator’s responsibilities under applicable law.</p>
          <h2>6. Source links and open-source license</h2>
          <p>
            External sites and documents are controlled by their providers. This
            application retains the upstream MIT license and copyright notice.
            Government documents and API data retain their own source notices
            and restrictions. The software license does not remove those
            notices.{" "}
            <a href="https://github.com/bettergovph/transparency-portal">
              Read the original source repository and license.
            </a>
          </p>
          <p>Source providers control their websites and can update or remove material. Citizen source actions prefer published project pages and PDF page references. Public read-only JSON endpoints and fair-use guidance are available in the clearly labeled developer section of Data Coverage.</p>
          <section id="full-data-disclaimer" aria-labelledby="full-disclaimer-heading">
            <h2 id="full-disclaimer-heading">Full data disclaimer</h2>
            <p>This portal compares published records for public information. Candidate matches and one-sided lines need independent verification. Missing records do not establish concealment or absent funding. Shared-office totals remain undivided. Title associations do not certify a project’s physical location. Different budget versions and fiscal years must not be added as one annual appropriation.</p>
            {scope.status === "ready" ? <Disclaimers items={scope.value.disclaimers} /> : <p>Loading the preserved source notices. <a href="https://budget.bettergov.ph/docs#disclaimers">Read the provider’s source disclaimers</a>.</p>}
          </section>
          <h2>7. Updates, corrections, and operator details</h2>
          <p>
            Published API records can change. This portal displays available
            source build metadata and inclusion reasons. The responsible
            operator is Aqura Information Technology Solutions / Dave Hermoso,
            Binalbagan, Negros Occidental. A corrections and rights-request
            procedure remains to be finalized before public launch. No report or
            contact submission service is currently operated by this portal.
          </p>
          <h2>8. Acknowledgment</h2>
          <p>
            The welcome checkbox acknowledges these terms and the Privacy
            Notice. It is not identity verification, a secure access boundary,
            or consent to unrelated personal data processing. A new material
            version requires renewed acknowledgment. You may decline and remain
            on the welcome screen.
          </p>
        </>
      )}
      </div>
      <p className="fine">
        Review draft revised 3 November 2026. Identified Vercel as the hosting provider; optional local storage and source-access disclosures remain in place. This version requires renewed acknowledgment.{" "}
        <Link state={{ returnTo }} to={privacy ? "/terms" : "/privacy"}>
          {privacy ? "Read the Terms of Use" : "Read the Privacy Notice"}
        </Link>
      </p>
    </main>
  );
}
