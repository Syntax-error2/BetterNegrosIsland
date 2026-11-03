import DataTable from "./DataTable";
import ChartCard from "./ChartCard";
import { useCallback, useId, useState, type ReactNode } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Text,
  LabelList,
} from "recharts";
import { php, phpFull } from "../lib/format";
import { percentage } from "../lib/regional-data";
import {
  chartModel,
  chartExtent,
  chartNumber,
  type ChartRow,
} from "../lib/analytics-data";
export type { ChartRow } from "../lib/analytics-data";

export default function DataChart({
  title,
  rows,
  keys,
  money = true,
  line = false,
  horizontal = false,
  ranked = false,
  adaptive = false,
  note,
  controls,
  children,
}: {
  title: string;
  rows: ChartRow[];
  keys: string[];
  money?: boolean;
  line?: boolean;
  horizontal?: boolean;
  ranked?: boolean;
  adaptive?: boolean;
  note: string;
  controls?: ReactNode;
  children?: ReactNode;
}) {
  const [chartWidth, setChartWidth] = useState(0);
  const resizeChart = useCallback(
    (width: number) =>
      setChartWidth((previous) => (previous === width ? previous : width)),
    [],
  );
  const chartRows = chartModel(rows, keys, ranked);
  const extent = chartExtent(chartRows, keys);
  const missing = chartRows.filter((row) =>
    keys.some((key) => row[key] === null),
  );
  const isHorizontal =
    horizontal || (adaptive && chartWidth > 0 && chartWidth < 480);
  const categoryWidth = ranked ? 40 : chartWidth < 400 ? 104 : 132;
  const height = isHorizontal
    ? Math.max(220, chartRows.length * (keys.length > 1 ? 66 : 44) + 58)
    : 300;
  const colors = [
    "#133b9c",
    "#08786b",
    "#895a16",
    "#8c4785",
    "#52637b",
    "#a8463a",
  ];
  const helperId = useId();
  const format = (value: unknown) => {
    const n = chartNumber(value);
    return n === null
      ? "Not available"
      : money
        ? phpFull(n)
        : n.toLocaleString("en-PH");
  };
  const numericDomain: [number, "auto"] = [extent.minimum, "auto"];
  const axes = (
    <>
      <CartesianGrid
        stroke="#d7e0e8"
        strokeDasharray="3 3"
        horizontal={!isHorizontal}
        vertical={isHorizontal}
      />
      <XAxis
        type={isHorizontal ? "number" : "category"}
        dataKey={isHorizontal ? undefined : "axisLabel"}
        domain={isHorizontal ? numericDomain : undefined}
        allowDecimals={money}
        tickCount={chartWidth < 400 ? 3 : 5}
        minTickGap={8}
        interval={isHorizontal ? undefined : line ? "preserveStartEnd" : 0}
        tickFormatter={(v) =>
          isHorizontal && money ? php(Number(v)) : String(v)
        }
        tick={{ fontSize: 12, fill: "#4e6375" }}
        height={36}
        tickLine={false}
        axisLine={{ stroke: "#aabccc" }}
      />
      <YAxis
        type={isHorizontal ? "category" : "number"}
        dataKey={isHorizontal ? "axisLabel" : undefined}
        domain={isHorizontal ? undefined : numericDomain}
        allowDecimals={money}
        interval={0}
        width={isHorizontal ? categoryWidth : 70}
        tickCount={5}
        tickFormatter={(v) =>
          !isHorizontal && money ? php(Number(v)) : String(v)
        }
        tick={
          isHorizontal
            ? ({ x, y, payload }) => (
                <Text
                  x={Number(x) - 4}
                  y={y}
                  textAnchor="end"
                  verticalAnchor="middle"
                  width={categoryWidth - 12}
                  fontSize={12}
                  fill="#334b60"
                >
                  {String(payload.value)}
                </Text>
              )
            : { fontSize: 12, fill: "#4e6375" }
        }
        tickLine={false}
        axisLine={false}
      />
      <Tooltip
        isAnimationActive={false}
        shared
        position={chartWidth < 480 ? { x: 0, y: 0 } : undefined}
        allowEscapeViewBox={{ x: false, y: false }}
        wrapperStyle={{
          width: chartWidth < 480 ? chartWidth : undefined,
          maxWidth: "min(340px,calc(100vw - 48px))",
          zIndex: 10,
        }}
        content={({ active, label, payload }) =>
          active && payload?.length ? (
            <div className="chart-tooltip" role="status" aria-live="polite">
              <strong>
                {String(payload[0]?.payload?.label ?? label ?? "")}
              </strong>
              {keys.map((key, index) => (
                <div key={key}>
                  <span
                    className="chart-series-dot"
                    style={{ background: colors[index % colors.length] }}
                    aria-hidden="true"
                  />
                  {key}: {format(payload[0]?.payload?.[key])}
                </div>
              ))}
              {keys.includes("NEP") && keys.includes("House") && (
                <p>
                  Difference:{" "}
                  {chartNumber(payload[0]?.payload?.NEP) === null ||
                  chartNumber(payload[0]?.payload?.House) === null
                    ? "Not available"
                    : phpFull(
                        payload[0].payload.House - payload[0].payload.NEP,
                      )}{" "}
                  ·{" "}
                  {percentage(
                    chartNumber(payload[0]?.payload?.NEP),
                    chartNumber(payload[0]?.payload?.House),
                  )?.toFixed(2) ?? "Not available"}
                  {percentage(
                    chartNumber(payload[0]?.payload?.NEP),
                    chartNumber(payload[0]?.payload?.House),
                  ) === null
                    ? ""
                    : "%"}
                  <br />
                  Percentage uses the NEP amount; unavailable for missing or
                  zero baselines.
                </p>
              )}
              <p>
                {money
                  ? "Published amounts, not spending."
                  : "Counts of selected source records."}{" "}
                Exact values are also in the table below.
              </p>
            </div>
          ) : null
        }
      />
    </>
  );
  return (
    <ChartCard
      title={title}
      description={note}
      wide={ranked}
      stage={line ? "Historical GAA appropriations" : undefined}
    >
      {controls}
      {keys.length > 1 && (
        <ul className="chart-series-key" aria-label="Chart series">
          {keys.map((key, index) => (
            <li key={key}>
              <span
                className="chart-series-dot"
                style={{ background: colors[index % colors.length] }}
                aria-hidden="true"
              />
              {key === "House" ? "House bill" : key}
            </li>
          ))}
        </ul>
      )}
      {extent.hasValues && extent.hasNonzero ? (
        <>
          <p id={helperId} className="chart-keyboard-help">
            Use Left and Right arrow keys on the chart to inspect values. Escape
            dismisses the tooltip. Exact values are also in the table.
          </p>
          <div
            className="chart-box responsive-chart"
            style={{ height }}
            role="group"
            aria-label={title + " visualization"}
            aria-describedby={helperId}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              onResize={resizeChart}
            >
              {line ? (
                <LineChart
                  data={chartRows}
                  accessibilityLayer
                  aria-label={title}
                  margin={{ top: 12, right: 16, bottom: 8, left: 0 }}
                >
                  {axes}
                  {keys.map((key, index) => (
                    <Line
                      key={key}
                      type="linear"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart
                  data={chartRows}
                  layout={isHorizontal ? "vertical" : "horizontal"}
                  accessibilityLayer
                  aria-label={title}
                  margin={{
                    top: 12,
                    right: isHorizontal
                      ? keys.length === 1
                        ? money
                          ? 66
                          : 36
                        : 32
                      : 16,
                    bottom: 8,
                    left: 0,
                  }}
                  barCategoryGap="24%"
                  barGap={4}
                  maxBarSize={28}
                >
                  {axes}
                  {keys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={colors[index % colors.length]}
                      isAnimationActive={false}
                    >
                      {isHorizontal && keys.length === 1 && (
                        <LabelList
                          dataKey={key}
                          position="right"
                          fill="#122b43"
                          fontSize={12}
                          formatter={(v) =>
                            money
                              ? php(Number(v))
                              : Number(v).toLocaleString("en-PH")
                          }
                        />
                      )}
                    </Bar>
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p role="status" className="chart-empty">
          {extent.hasValues
            ? "All reported values are zero for this selection. Zero has no bar length."
            : "No source amounts are available for this selection. Missing values are not zero."}{" "}
          Read the table for the category-level details.
        </p>
      )}
      {missing.length > 0 && (
        <p className="chart-availability">
          Unavailable in this selection:{" "}
          {missing
            .map(
              (row) =>
                row.label +
                " (" +
                keys.filter((key) => row[key] === null).join(", ") +
                ")",
            )
            .join("; ")}
          . Missing is not zero.
        </p>
      )}
      <details className={"chart-table chart-series-" + keys.length}>
        <summary>Read values as a table</summary>
        <DataTable
          unitNote={
            money
              ? "Amounts are exact PHP. Missing figures remain unavailable; zero is shown as ₱0."
              : "Counts of selected source records. A zero match count does not establish absent funding or complete source coverage."
          }
          caption={title + " — " + (money ? "exact pesos" : "record counts")}
          columns={[
            { key: "category", label: "Category" },
            ...keys.map((key) => ({
              key,
              label: key === "House" ? "House bill" : key,
              numeric: true,
              width: money ? "200px" : "140px",
            })),
          ]}
        >
          {chartRows.map((row, index) => (
            <tr key={row.label + index}>
              <th scope="row">
                {ranked ? String(index + 1) + ". " : ""}
                {row.label}
              </th>
              {keys.map((key) => (
                <td key={key} className="money-cell">
                  {format(row[key])}
                </td>
              ))}
            </tr>
          ))}
          {chartRows.length === 0 && (
            <tr>
              <td colSpan={keys.length + 1}>No records in this selection.</td>
            </tr>
          )}
        </DataTable>
      </details>
      {children}
      {import.meta.env.DEV && (
        <pre hidden data-chart-diagnostics>
          {JSON.stringify({
            title,
            keys,
            money,
            line,
            ranked,
            rows: chartRows,
            horizontal: isHorizontal,
            width: chartWidth,
            height,
            extent,
          })}
        </pre>
      )}
    </ChartCard>
  );
}
