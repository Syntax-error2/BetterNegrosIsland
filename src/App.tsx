import { lazy, Suspense } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Footer, Masthead } from "./components/Chrome";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";
import { configProblems } from "./config";
import { usePortal } from "./lib/portal-context";
const About = lazy(() => import("./pages/RegionalMethodology"));
const EvidenceCard = lazy(() => import("./pages/EvidenceCard"));
const CompareRecords = lazy(() => import("./pages/CompareRecords"));
const BudgetGuide = lazy(() => import("./pages/BudgetGuide"));
const RegionalChanges = lazy(() => import("./pages/RegionalChanges"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Coverage = lazy(() => import("./pages/Coverage"));
const Places = lazy(() => import("./pages/RegionalPlaces"));
import Home from "./pages/Home";
const Project = lazy(() => import("./pages/Project"));
const Enacted = lazy(() => import("./pages/Enacted"));
import Overview from "./pages/RegionalOverview";
import { LOCATIONS } from "./lib/geography";
import { useParams } from "react-router-dom";
function LegacyLocation() {
  const { slug } = useParams();
  const term = slug?.replaceAll("-", " ");
  const l = LOCATIONS.find(
    (l) => l.name.replace(/^City of /, "").toLowerCase() === term,
  );
  return <Navigate to={l ? "/locations/" + l.code : "/provinces"} replace />;
}
const Legal = lazy(() => import("./pages/Legal"));
import LegalEntry from "./components/LegalEntry";
import PageErrorBoundary from "./components/PageErrorBoundary";
const Identity = lazy(() => import("./pages/Identity"));
const TableFixture = import.meta.env.DEV
  ? lazy(() => import("./qa/TableFixture"))
  : null;
const AccessibilityAudit = import.meta.env.DEV
  ? lazy(() => import("./qa/AccessibilityAudit"))
  : null;
const BrandFixture = import.meta.env.DEV
  ? lazy(() => import("./qa/BrandFixture"))
  : null;
const ChartFixture = import.meta.env.DEV
  ? lazy(() => import("./qa/ChartFixture"))
  : null;

export default function App() {
  const location = useLocation();
  const posterView=location.pathname==='/we-are-not-ignorant';
  const { config } = usePortal();
  const problems = import.meta.env.DEV ? configProblems(config) : [];
  return (
    <>
      <ScrollToTop />
      <LegalEntry>
        {!posterView&&<Masthead />}
        {problems.length > 0 && (
          <div className="page config-warning" role="alert">
            <strong>portal.config.ts needs attention</strong> (shown in
            development only):
            <ul>
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        <PageErrorBoundary key={location.pathname}><Suspense
          fallback={
            <main
              id="main-content"
              tabIndex={-1}
              className="page main"
              data-route-loading
            >
              <p className="state" role="status">
                Opening this page…
              </p>
            </main>
          }
        >
          <Routes>
            {import.meta.env.DEV && ChartFixture && (
              <Route path="/__qa/charts" element={<ChartFixture />} />
            )}
            {import.meta.env.DEV && BrandFixture && (
              <Route path="/__qa/brand" element={<BrandFixture />} />
            )}
            {import.meta.env.DEV && TableFixture && (
              <Route path="/__qa/table" element={<TableFixture />} />
            )}
            <Route path="/" element={<Overview />} />
            <Route path="/projects" element={<Home />} />
            <Route path="/provinces" element={<Places />} />
            <Route path="/provinces/:slug" element={<Places />} />
            <Route path="/locations/:psgcCode" element={<Places />} />
            <Route path="/evidence/:dataset/:id" element={<EvidenceCard />} />
            <Route path="/compare" element={<CompareRecords />} />
            <Route path="/budget-guide" element={<BudgetGuide />} />
            <Route path="/we-are-not-ignorant" element={<RegionalChanges />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/data-coverage" element={<Coverage />} />
            <Route
              path="/municipalities"
              element={<Navigate to="/provinces" replace />}
            />
            <Route path="/municipalities/:slug" element={<LegacyLocation />} />
            <Route path="/budget-history" element={<Enacted />} />
            <Route path="/methodology" element={<About />} />
            <Route path="/terms" element={<Legal />} />
            <Route path="/privacy" element={<Legal />} />
            {/* Offices and their districts are a section of the main page; old links land there. */}
            <Route
              path="/districts"
              element={<Navigate to="/data-coverage" replace />}
            />
            <Route path="/gaa" element={<Enacted />} />
            <Route path="/about" element={<Identity />} />
            <Route path="/projects/:dataset/:id" element={<Project />} />
            <Route
              path="*"
              element={
                <main id="main-content" tabIndex={-1} className="page main">
                  <h1>Page not found</h1>
                  <p className="state">
                    This page does not exist.{" "}
                    <Link to="/projects">Explore the projects</Link>
                  </p>
                </main>
              }
            />
          </Routes>
        </Suspense></PageErrorBoundary>
        {!posterView&&<Footer />}
      </LegalEntry>
      <BackToTop />
      {import.meta.env.DEV &&
        AccessibilityAudit &&
        new URLSearchParams(location.search).has("__a11y") && (
          <Suspense fallback={null}>
            <AccessibilityAudit />
          </Suspense>
        )}
    </>
  );
}
