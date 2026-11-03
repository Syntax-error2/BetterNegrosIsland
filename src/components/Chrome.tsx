import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { usePortal } from "../lib/portal-context";
import { SOURCE_CODE_URL, PORTAL_REPOSITORY_URL } from "../lib/links";
import { useSnapshot, type Manifest } from "../lib/snapshot";
import BrandLogo from "./BrandLogo";

const NAV = [["/", "Overview"], ["/projects", "Projects"], ["/provinces", "Places"], ["/analytics", "Analytics"], ["/budget-history", "Budget history"]];
const RESOURCES = [["/budget-guide","One-minute budget guide"],["/compare","Compare two records"],["/data-coverage","Data coverage & updates"],["/methodology","Methodology & sources"],["/about","About the initiative"]];

export function Masthead() {
  const snapshot = useSnapshot<Manifest>();
  const [open, setOpen] = useState(false);
  const [resources, setResources] = useState(false);
  const resourceButton = useRef<HTMLButtonElement>(null);
  const resourceGroup = useRef<HTMLDivElement>(null);
  const {pathname}=useLocation();
  const resourcesActive=RESOURCES.some(([to])=>pathname===to);
  const close=()=>{setOpen(false);setResources(false);};
  useEffect(()=>{
    if(!resources)return;
    const dismiss=(event:PointerEvent)=>{if(!resourceGroup.current?.contains(event.target as Node))setResources(false);};
    document.addEventListener('pointerdown',dismiss);
    return ()=>document.removeEventListener('pointerdown',dismiss);
  },[resources]);
  const menuButton = useRef<HTMLButtonElement>(null);
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="civic-strip"><div className="page page--wide"><span>Independent civic transparency initiative</span><span>Free to explore · Open to everyone</span></div></div>
    <Link className="regional-reading-banner" to="/we-are-not-ignorant" onClick={close}><span>We are not ignorant.</span><span>Negros Island · Read the budget changes <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></span></Link>
    <header className="civic-header" onKeyDown={e => { if(e.key==='Escape'&&resources){setResources(false);resourceButton.current?.focus();e.stopPropagation();} else if (e.key === "Escape" && open) { setOpen(false); menuButton.current?.focus(); } }}>
      <div className="page page--wide civic-header-grid">
        <Link to="/" className="civic-header-brand" aria-label="BetterNegrosIsland — overview" onClick={close}><BrandLogo /></Link>
        <button ref={menuButton} className="menu-toggle button" aria-expanded={open} aria-controls="main-nav" onClick={() => {setOpen(!open);setResources(false);}}>{open ? "Close menu" : "Menu"}<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2"><path d={open?'M6 6l12 12M6 18L18 6':'M4 6h16M4 12h16M4 18h16'}/></svg></button>
        <nav id="main-nav" className={"civic-navigation" + (open ? " is-open" : "")} aria-label="Main navigation">
          {NAV.map(([to,label]) => <NavLink key={to} to={to} end={to === "/"} onClick={close}>{label}</NavLink>)}
          <div ref={resourceGroup} className="nav-resources" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setResources(false);}}>
            <button ref={resourceButton} type="button" className={'nav-resources-toggle'+(resourcesActive?' is-active':'')} aria-expanded={resources} aria-controls="nav-resource-links" onClick={()=>setResources(!resources)}>Guide & sources <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2"><path d={resources?'m6 15 6-6 6 6':'m6 9 6 6 6-6'}/></svg></button>
            <div id="nav-resource-links" className="nav-resource-links" hidden={!resources}>{RESOURCES.map(([to,label])=><NavLink key={to} to={to} onClick={close}>{label}</NavLink>)}</div>
          </div>
        </nav>
        <Link className="header-source" to="/data-coverage">
          <span className="header-source-label"><span aria-hidden="true" className="snapshot-indicator" />{snapshot.status === "ready" ? "Dated snapshot" : snapshot.status === "error" ? "Snapshot unavailable" : "Reading snapshot…"}</span>
          <span>{snapshot.status === "ready" ? <>Retrieved {snapshot.value.retrieved_at.slice(0,10)}</> : "Inspect data coverage"}</span>
        </Link>
      </div>
    </header>
  </>;
}

function FooterLinks({ title, children }: { title: string; children: ReactNode }) {
  return <nav className="footer-column" aria-label={title}><h2>{title}</h2><ul>{children}</ul></nav>;
}

export function Footer() {
  const { scope, overview } = usePortal();
  const meta = scope.status === "ready" ? scope.value.meta : overview.status === "ready" ? overview.value.meta : null;
  return <footer className="civic-footer">
    <div className="page page--wide">
      <div className="civic-footer-grid">
        <div className="civic-footer-brand">
          <Link to="/" aria-label="BetterNegrosIsland — overview"><BrandLogo theme="dark" lazy /></Link>
          <p className="footer-tagline">Open Data. A Stronger Negros Island.</p>
          <p>An independent, nonpartisan civic transparency initiative making published government budget information more accessible across the Negros Island Region.</p>
          <p className="footer-independent">Independent and nonpartisan. No government affiliation, BetterGov.PH endorsement or partnership is implied.</p>
        </div>
        <FooterLinks title="Explore">{[["/","Overview"],["/projects","Projects"],["/provinces","Places"],["/analytics","Analytics"],["/budget-history","Budget history"],["/data-coverage","Data coverage"]].map(([to,label]) => <li key={to}><Link to={to}>{label}</Link></li>)}</FooterLinks>
        <FooterLinks title="Information">
          <li><Link to="/budget-guide">Budget reading guide</Link></li><li><Link to="/compare">Compare two records</Link></li><li><Link to="/methodology">Methodology</Link></li><li><Link to="/methodology#data-sources">Data sources</Link></li><li><Link to="/about">About the initiative</Link></li><li><a href={PORTAL_REPOSITORY_URL} target="_blank" rel="noopener noreferrer">BetterNegrosIsland repository</a></li><li><a href="https://bettergov.ph" target="_blank" rel="noopener noreferrer">BetterGov.PH</a></li><li><a href={SOURCE_CODE_URL} target="_blank" rel="noopener noreferrer">Original open-source repository</a></li>
        </FooterLinks>
        <FooterLinks title="Legal & accountability">
          <li><Link to="/terms">Terms of Use</Link></li><li><Link to="/privacy">Privacy Notice</Link></li><li><Link to="/methodology#data-disclaimer">Full data disclaimer</Link></li><li><Link to="/methodology#source-attribution">Source attribution</Link></li><li><Link to="/about#operator">Operator information</Link></li>
        </FooterLinks>
      </div>
      <div className="footer-evidence">
        <p>Budget figures represent published proposals or appropriations, not necessarily actual spending. Document comparison classifications do not establish irregularity or wrongdoing.</p>
        {meta ? <details className="footer-full-notice"><summary>Read the full source data disclaimer</summary><p>{meta.notice}</p><Link to="/methodology#data-disclaimer">All source caveats and restrictions</Link></details> : <Link to="/methodology#data-disclaimer">Read the full data disclaimer</Link>}
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} BetterNegrosIsland<span>Independent civic transparency initiative</span></p>
        <div className="footer-attribution"><p>Built on <a href={SOURCE_CODE_URL}>BetterGov.PH’s Transparency Portal</a>.<br />Budget data powered by BetterGov.PH. Original MIT license preserved.</p><nav aria-label="Footer legal links"><Link to="/methodology#source-attribution">Attribution</Link><a href="/LICENSE.txt">MIT license</a><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link></nav></div>
      </div>
      <p className="footer-operator">Operated by Aqura Information Technology Solutions / Dave Hermoso, Binalbagan, Negros Occidental.</p>
    </div>
  </footer>;
}

export function PageHead({ eyebrow, title, children, titleLevel = 1 }: { eyebrow: ReactNode; title: ReactNode; children?: ReactNode; titleLevel?: 1 | 2 }) {
  return <div className="page-head"><p className="eyebrow">{eyebrow}</p>{titleLevel === 1 ? <h1>{title}</h1> : <h2>{title}</h2>}{children && <div className="lede">{children}</div>}</div>;
}
