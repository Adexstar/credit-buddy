import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AreaChart as AreaIcon, BarChart3, Download, LineChart as LineIcon } from "lucide-react";
import type { TimeRange, UsageData } from "@/lib/api";
import { exportData } from "@/utils/export";
import { Panel } from "./primitives";

const RANGES: { id: TimeRange; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
];

const CHART_TYPES = [
  { id: "area", label: "Area", icon: AreaIcon },
  { id: "line", label: "Line", icon: LineIcon },
  { id: "bar", label: "Bar", icon: BarChart3 },
] as const;

type ChartType = (typeof CHART_TYPES)[number]["id"];

const TEAL = "oklch(0.79 0.13 174)";
const AMBER = "oklch(0.82 0.13 85)";

const axisProps = {
  stroke: "oklch(0.56 0.02 215)",
  tick: { fontSize: 12, fontFamily: "IBM Plex Mono" },
  axisLine: false,
  tickLine: false,
} as const;

const tooltipStyle = {
  background: "oklch(0.223 0.026 220)",
  border: "1px solid oklch(0.3 0.03 220)",
  borderRadius: 12,
  fontFamily: "IBM Plex Mono",
  fontSize: 12,
  color: "oklch(0.96 0.008 210)",
} as const;

export function UsageChart({
  data,
  range,
  onRangeChange,
}: {
  data: UsageData | null;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}) {
  const [chartType, setChartType] = useState<ChartType>("area");
  const [hidden, setHidden] = useState<Record<"used" | "added", boolean>>({ used: false, added: false });

  const rows = useMemo(
    () =>
      (data?.labels ?? []).map((label, i) => ({
        label,
        used: data?.used[i] ?? 0,
        added: data?.added[i] ?? 0,
      })),
    [data],
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({ used: acc.used + row.used, added: acc.added + row.added }),
        { used: 0, added: 0 },
      ),
    [rows],
  );

  const toggleSeries = (key: "used" | "added") => setHidden((prev) => ({ ...prev, [key]: !prev[key] }));

  const shared = (
    <>
      <CartesianGrid stroke="oklch(0.3 0.03 220)" strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="label" {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: TEAL, strokeOpacity: 0.3 }} />
      <Legend
        verticalAlign="top"
        height={28}
        onClick={(entry) => toggleSeries((entry as { dataKey?: string }).dataKey === "added" ? "added" : "used")}
        wrapperStyle={{ fontSize: 12, cursor: "pointer", fontFamily: "IBM Plex Mono" }}
      />
      {rows.length > 8 && (
        <Brush
          dataKey="label"
          height={22}
          travellerWidth={8}
          stroke={TEAL}
          fill="oklch(0.223 0.026 220)"
          tickFormatter={() => ""}
        />
      )}
    </>
  );

  return (
    <Panel
      title="Usage overview"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full border border-vault-border bg-vault-raised p-1">
            {CHART_TYPES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                title={`${label} chart`}
                aria-label={`${label} chart`}
                aria-pressed={chartType === id}
                onClick={() => setChartType(id)}
                className={`rounded-full p-1.5 transition ${
                  chartType === id ? "bg-vault-teal/15 text-vault-teal" : "text-vault-muted hover:text-vault-foreground"
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-full border border-vault-border bg-vault-raised p-1">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onRangeChange(r.id)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  range === r.id ? "bg-vault-teal/15 text-vault-teal" : "text-vault-muted hover:text-vault-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            title="Export chart data as CSV"
            onClick={() => exportData(rows, `usage-${range}`, { format: "csv" })}
            className="rounded-full border border-vault-border bg-vault-raised p-1.5 text-vault-muted transition hover:text-vault-foreground"
          >
            <Download size={14} />
          </button>
        </div>
      }
    >
      <div className="-mt-3 mb-4 flex flex-wrap items-center gap-4 text-sm">
        <p className="text-vault-muted">Credits consumed vs. topped up</p>
        <span className="font-mono text-xs text-vault-teal">used {totals.used.toLocaleString()}</span>
        <span className="font-mono text-xs text-vault-amber">added {totals.added.toLocaleString()}</span>
        <span className="text-xs text-vault-faint">Click a legend item to isolate a series</span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              {shared}
              {!hidden.used && <Bar dataKey="used" name="Used" fill={TEAL} radius={[4, 4, 0, 0]} />}
              {!hidden.added && <Bar dataKey="added" name="Added" fill={AMBER} radius={[4, 4, 0, 0]} />}
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              {shared}
              {!hidden.used && (
                <Line type="monotone" dataKey="used" name="Used" stroke={TEAL} strokeWidth={2} dot={false} />
              )}
              {!hidden.added && (
                <Line type="monotone" dataKey="added" name="Added" stroke={AMBER} strokeWidth={2} dot={false} />
              )}
            </LineChart>
          ) : (
            <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="usedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TEAL} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="addedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AMBER} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
                </linearGradient>
              </defs>
              {shared}
              {!hidden.used && (
                <Area
                  type="monotone"
                  dataKey="used"
                  name="Used"
                  stroke={TEAL}
                  strokeWidth={2}
                  fill="url(#usedFill)"
                />
              )}
              {!hidden.added && (
                <Area
                  type="monotone"
                  dataKey="added"
                  name="Added"
                  stroke={AMBER}
                  strokeWidth={2}
                  fill="url(#addedFill)"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
