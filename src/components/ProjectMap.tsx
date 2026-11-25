import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ScopedProject } from "../lib/scope";
import { usableCoordinate, inNegrosOverview } from "../lib/tracker";

const COLORS: Record<string, string> = {
  dpwh: "#174a96",
  fmr: "#246b4a",
  hfep: "#9b4059",
  nia: "#785516",
};
type Point = {
  key: string;
  title: string;
  dataset: string;
  lat: number;
  lon: number;
};

function groupPoints(points: Point[], map: L.Map) {
  const groups: { anchor: L.Point; points: Point[] }[] = [];
  for (const point of points) {
    const anchor = map.project([point.lat, point.lon]);
    const nearby = groups.find((group) => group.anchor.distanceTo(anchor) < 38);
    if (nearby) nearby.points.push(point);
    else groups.push({ anchor, points: [point] });
  }
  return groups.map((group) => group.points);
}
export default function ProjectMap({
  rows,
  selected,
  onSelect,
  onGroup,
}: {
  rows: ScopedProject[];
  selected: string;
  onSelect: (key: string) => void;
  onGroup: (keys: string[]) => void;
}) {
  const element = useRef<HTMLDivElement>(null),
    instance = useRef<L.Map | null>(null),
    markers = useRef<L.LayerGroup | null>(null),
    markerByKey = useRef(new Map<string, L.Marker>());
  const signature = JSON.stringify(
    rows.filter(usableCoordinate).map((p) => ({
      key: p.key,
      title: p.title,
      dataset: p.dataset,
      lat: p.lat,
      lon: p.lon,
    })),
  );
  const selectRef = useRef(onSelect);
  const groupRef = useRef(onGroup);
  const selectionRef = useRef(selected);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    selectRef.current = onSelect;
    groupRef.current = onGroup;
    selectionRef.current = selected;
  }, [onSelect, onGroup, selected]);
  useEffect(() => {
    if (!element.current) return;
    const map = L.map(element.current, {
      scrollWheelZoom: false,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    }).setView([10.0, 123.0], 8);
    instance.current = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      referrerPolicy: "origin",
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    })
      .on("tileerror", () => setFailed(true))
      .addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
    markers.current = L.layerGroup().addTo(map);
    const observer = new ResizeObserver(() =>
      map.invalidateSize({ animate: false }),
    );
    observer.observe(element.current);
    return () => {
      observer.disconnect();
      map.remove();
      instance.current = null;
      markers.current = null;
    };
  }, []);
  useEffect(() => {
    const layer = markers.current,
      map = instance.current;
    if (!layer || !map) return;
    const points: Point[] = JSON.parse(signature);
    function drawMarkers() {
      if (!layer || !map) return;
      layer.clearLayers();
      markerByKey.current.clear();
      for (const group of groupPoints(points, map)) {
        const [point] = group;
        const grouped = group.length > 1;
        const title = grouped
          ? `Inspect ${group.length} nearby projects`
          : point.title;
        const button = document.createElement("button");
        button.type = "button";
        button.className = grouped
          ? "tracker-pin-button tracker-cluster"
          : "tracker-pin-button";
        button.setAttribute("aria-label", title);
        const pin = document.createElement("span");
        pin.className = "tracker-pin";
        pin.style.setProperty(
          "--pin-color",
          COLORS[point.dataset] ?? COLORS.dpwh,
        );
        if (grouped) pin.textContent = String(group.length);
        pin.classList.toggle(
          "is-selected",
          group.some((item) => item.key === selectionRef.current),
        );
        button.append(pin);
        L.DomEvent.disableClickPropagation(button);
        button.addEventListener("click", () => {
          if (grouped) groupRef.current(group.map((item) => item.key));
          else selectRef.current(point.key);
        });
        const icon = L.divIcon({
          className: "tracker-pin-wrap",
          html: button,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([point.lat, point.lon], {
          icon,
          keyboard: false,
          title,
        }).addTo(layer);
        group.forEach((item) => markerByKey.current.set(item.key, marker));
        const text = document.createElement("span");
        text.textContent = title;
        marker.bindTooltip(text, { direction: "top" });
      }
    }
    const local = points.filter(inNegrosOverview);
    if (local.length) {
      map.fitBounds(
        L.latLngBounds(local.map((p) => [p.lat!, p.lon!] as [number, number])),
        { padding: [28, 28], maxZoom: 11, animate: false },
      );
    } else map.setView([10, 123], 8, { animate: false });
    drawMarkers();
    map.on("zoomend", drawMarkers);
    return () => {
      map.off("zoomend", drawMarkers);
    };
  }, [signature]);
  useEffect(() => {
    const active = markerByKey.current.get(selected);
    for (const marker of new Set(markerByKey.current.values())) {
      marker
        .getElement()
        ?.querySelector(".tracker-pin")
        ?.classList.toggle("is-selected", marker === active);
      marker.setZIndexOffset(marker === active ? 1000 : 0);
    }
    const point = (JSON.parse(signature) as Point[]).find(
      (p) => p.key === selected,
    );
    if (point)
      instance.current?.panTo([point.lat, point.lon], { animate: false });
  }, [selected, signature]);
  return (
    <>
      <div className="tracker-map-controls">
        <button
          className="button"
          onClick={() =>
            instance.current?.fitBounds(
              [
                [8.8, 122.2],
                [11.1, 123.9],
              ],
              { animate: false },
            )
          }
        >
          Negros overview
        </button>
        <button
          className="button"
          onClick={() => {
            const points = rows.filter(usableCoordinate);
            if (points.length)
              instance.current?.fitBounds(
                L.latLngBounds(
                  points.map((p) => [p.lat!, p.lon!] as [number, number]),
                ),
                { padding: [24, 24], maxZoom: 11, animate: false },
              );
          }}
        >
          Fit all source coordinates
        </button>
      </div>
      <p className="tracker-map-help">
        {rows.filter((p) => usableCoordinate(p) && !inNegrosOverview(p)).length}{" "}
        source points fall outside the broad Negros viewing window. They remain
        in the source list and may need geography review. The viewing window is
        not an administrative boundary.
      </p>
      <div
        ref={element}
        className="tracker-leaflet"
        role="region"
        aria-label="Published project coordinates. Use the matching list for full accessible details."
      />
      {failed && (
        <p role="status" className="tracker-map-error">
          Some street tiles could not load. Project markers and the list remain
          available.
        </p>
      )}
      <p className="tracker-map-help">
        Use + and − to zoom. Numbered markers open a list of nearby projects.
        Coordinates are source-reported, not independently verified.{" "}
        <a
          href="https://www.openstreetmap.org/fixthemap"
          target="_blank"
          rel="noopener noreferrer"
        >
          Report a basemap issue
        </a>
        .
      </p>
    </>
  );
}
