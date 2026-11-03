import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { hasAcknowledgment, saveAcknowledgment } from "../lib/legal";
import BrandLogo from "./BrandLogo";
import { PROVINCES } from "../lib/geography";

export default function LegalEntry({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(() => {
    try {
      return hasAcknowledgment(window.localStorage);
    } catch {
      return false;
    }
  });
  const [checked, setChecked] = useState(false);
  const [declined, setDeclined] = useState(false);
  const location = useLocation();
  const returnState = {
    returnTo: location.pathname + location.search + location.hash,
  };
  useEffect(() => {
    if (!entered && !["/terms", "/privacy"].includes(location.pathname))
      document.title = "Welcome · BetterNegrosIsland";
  }, [entered, location.pathname]);
  if (entered || ["/terms", "/privacy"].includes(location.pathname))
    return children;
  return (
    <main id="main-content" tabIndex={-1} className="welcome-shell">
      <div className="page welcome-container">
        <div className="welcome-top"><Link to="/" aria-label="BetterNegrosIsland"><BrandLogo /></Link><span>Free to explore. Open to everyone.</span></div>
        <div className="welcome-layout">
          <section className="welcome-intro" aria-labelledby="welcome-heading">
            <h1 id="welcome-heading">Welcome to Better<wbr />NegrosIsland</h1>
            <p className="welcome-subtitle">Explore public budget information across the Negros Island Region.</p>
            <p>Explore published public projects and budget allocations. Compare the versions, read the evidence, and trace figures back to their source.</p>
            <div className="welcome-places">{PROVINCES.map(l => <span key={l.slug}>{l.name}</span>)}</div>
            <p className="welcome-independence">BetterNegrosIsland is an independent civic transparency initiative. Published budget information is provided for public understanding and verification.</p>
            <p className="welcome-source">Built on <a href="https://github.com/bettergovph/transparency-portal">BetterGov.PH’s open-source Transparency Portal</a>. Budget data provided by BetterGov.PH. No government affiliation, endorsement or partnership is implied.</p>
          </section>
          <section className="welcome-notices" aria-labelledby="welcome-review">
            <h2 id="welcome-review">Before you explore</h2>
            <p>Read the notices at any time, including before entering.</p>
            <div className="welcome-document-links">
              <Link to="/terms" state={returnState}><strong>Terms of Use</strong><span>Purpose, source limitations and responsible use</span></Link>
              <Link to="/privacy" state={returnState}><strong>Privacy Notice</strong><span>Local storage, requests and your rights</span></Link>
            </div>
            <Link to="/terms#full-data-disclaimer" state={returnState}>Read the full data disclaimer</Link>
            <p className="welcome-data-note">Budget proposals and appropriations are not proof of actual spending.</p>
            <label className="acknowledgment">
              <input type="checkbox" checked={checked} onChange={e => { setChecked(e.target.checked); setDeclined(false); }} />
              <span>I agree to the Terms of Use and acknowledge that I have been provided the Privacy Notice.</span>
            </label>
            <button className="button button-primary entry-button" disabled={!checked} onClick={() => {
              try { saveAcknowledgment(window.localStorage); } catch { /* Memory-only entry. */ }
              setEntered(true);
              requestAnimationFrame(() => document.getElementById("main-content")?.focus({preventScroll:true}));
            }}>Enter Transparency Portal</button>
            <button className="link-button decline" onClick={() => { setChecked(false); setDeclined(true); }}>I prefer to stay here</button>
            {declined && <p role="status" className="small">You can remain here and read the notices. No acknowledgment has been saved.</p>}
            <p className="welcome-access">Free access. No login or registration.<br />Only the notice version is remembered in this browser.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
