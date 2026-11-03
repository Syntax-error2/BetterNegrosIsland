import { Link, useParams, useSearchParams } from "react-router-dom";
import { PROVINCES, LOCATIONS, GEO_SOURCE } from "../lib/geography";
import { useSnapshot } from "../lib/snapshot";
import { PageHead } from "../components/Chrome";
import { useTitle } from "../lib/use-title";
import Home from "./Home";
export default function RegionalPlaces() {
  const { slug, psgcCode } = useParams();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const province = PROVINCES.find((p) => p.slug === slug);
  const location = LOCATIONS.find((l) => l.code === psgcCode);
  const summary = useSnapshot<{
    locationCounts: { code: string; count: number }[];
  }>("summary");
  useTitle(
    (province?.name ?? location?.name ?? "Places") + " · BetterNegrosIsland",
  );
  if (psgcCode && location) return <Home locality={location.name} />;
  if ((slug && !province) || (psgcCode && !location))
    return (
      <main id="main-content" tabIndex={-1} className="page main">
        <h1>Place not found</h1>
        <Link to="/provinces">Browse the official directory</Link>
      </main>
    );
  const locations = LOCATIONS.filter(
    (l) =>
      (!province || l.province === province.slug) &&
      l.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <main id="main-content" tabIndex={-1} className="page main">
      <PageHead
        eyebrow="PSA GEOGRAPHIC DIRECTORY · REGION 18"
        title={province?.name ?? "Explore the region."}
      >
        <p>
          {province?.note ??
            "Negros Occidental including Bacolod, Negros Oriental, and Siquijor. All 63 cities and municipalities are represented."}
        </p>
      </PageHead>
      <p className="notice">
        Directory coverage is not budget completeness. Counts are title
        associations, not verified project locations or exclusive LGU
        allocations. PSGC browser lists are dated {GEO_SOURCE.listingDate}; the
        latest workbook could not be downloaded. Original historical VI/VII
        labels remain unchanged.
      </p>
      {!province && (
        <div className="province-tabs">
          {PROVINCES.map((p) => (
            <Link key={p.slug} to={"/provinces/" + p.slug}>
              {p.name} →
            </Link>
          ))}
        </div>
      )}
      <label className="field explorer-search">
        <span>Search cities and municipalities</span>
        <input
          type="search"
          value={q}
          onChange={(e) =>
            setParams(e.target.value ? { q: e.target.value } : {}, {
              replace: true,
            })
          }
          placeholder="Bacolod, Dumaguete, Larena…"
        />
      </label>
      <p role="status">{locations.length} {locations.length===1?'place':'places'} in this directory view.</p>
      <div className="place-directory">
        {locations.map((l) => (
          <Link key={l.code} to={"/locations/" + l.code}>
            <span className="place-code">
              {l.code} · {l.type}
            </span>
            <strong>{l.name}</strong>
            <span>
              {summary.status === "ready"
                ? (summary.value.locationCounts.find((r) => r.code === l.code)
                    ?.count ?? 0)
                : "…"}{" "}
              title matches ↗
            </span>
          </Link>
        ))}
      </div>
      <p className="fine">
        Source:{" "}
        <a href={GEO_SOURCE.source}>Philippine Statistics Authority PSGC</a>.
        Bacolod has its own HUC code; regional navigation groups it with Negros
        Occidental without rewriting its classification.
      </p>
    </main>
  );
}
