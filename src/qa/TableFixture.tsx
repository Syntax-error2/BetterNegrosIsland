import ProjectTable from "../components/ProjectTable";
import { useSearchParams } from "react-router-dom";
import { syntheticRows } from "./fixtures";
export default function TableFixture() {
  const [p] = useSearchParams();
  return (
    <main id="main-content" tabIndex={-1} className="page main qa-fixture">
      <h1>Table layout test</h1>
      <p className="notice" role="note">
        SYNTHETIC LAYOUT FIXTURES. Not government budget data. This
        development-only route is excluded from production.
      </p>
      {p.has("empty") ? (
        <p role="status">No synthetic projects match this test.</p>
      ) : (
        <ProjectTable
          rows={syntheticRows}
          programName={() => "Synthetic test program"}
        />
      )}
    </main>
  );
}
