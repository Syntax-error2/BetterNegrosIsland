import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export interface DataColumn {
  key: string;
  label: string;
  width?: string;
  numeric?: boolean;
  selected?: boolean;
}
/** One native table system: full values, real headers and a focusable overflow region when needed. */
export default function DataTable({
  caption,
  columns,
  children,
  variant = "financial",
  unitNote = "Amounts are exact PHP. Missing figures remain unavailable.",
}: {
  caption: string;
  columns: DataColumn[];
  children: ReactNode;
  variant?: "financial" | "project" | "history";
  unitNote?: string;
}) {
  const id = useId(),
    frame = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const check = () =>
      setOverflow(element.scrollWidth > element.clientWidth + 1);
    const observer = new ResizeObserver(check);
    observer.observe(element);
    const table = element.querySelector("table");
    if (table) observer.observe(table);
    const initial = requestAnimationFrame(check);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(initial);
    };
  }, []);
  return (
    <div className={"data-table-frame variant-" + variant}>
      <p id={id + "-hint"} className="table-help">
        {unitNote}
        {overflow && <span className="table-scroll-hint">Scroll horizontally to read every column. Focus this region and use Left/Right, or Home/End for the first/last column.</span>}
      </p>
      <div
        ref={frame}
        onKeyDown={e => {
          if (e.target !== e.currentTarget || !overflow) return;
          if (e.key === "Home" || e.key === "End") {
            e.preventDefault();
            e.currentTarget.scrollLeft = e.key === "Home" ? 0 : e.currentTarget.scrollWidth;
          }
        }}
        className="data-table-scroll"
        role={overflow ? "region" : undefined}
        aria-label={overflow ? caption : undefined}
        tabIndex={overflow ? 0 : undefined}
        aria-describedby={id + "-hint"}
      >
        <table className="data-table" role="table" aria-label={caption}>
          <caption className="sr-only">{caption}</caption>
          <colgroup>
            {columns.map((c) => (
              <col
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
              />
            ))}
          </colgroup>
          <thead role="rowgroup">
            <tr role="row">
              {columns.map((c) => (
                <th
                  role="columnheader"
                  scope="col"
                  className={[c.numeric ? "money-heading" : "", c.selected ? "selected-year" : ""].filter(Boolean).join(" ") || undefined}
                  aria-current={c.selected ? "true" : undefined}
                  key={c.key}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
