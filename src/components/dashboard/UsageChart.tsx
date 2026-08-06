import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimeRange, UsageData } from "@/lib/api";
import { Panel } from "./primitives";

const RANGES: { id: TimeRange; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
];

export function UsageChart({
  data,
  range,
  onRangeChange,
}: {
  data: UsageData | null;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}) {
  const rows = useMemo(
    () =>
      (data?.labels ?? []).map((label, i) => ({
        label,
        used: data?.used[i] ?? 0,
        added: data?.added[i] ?? 0,
      })),
    [data],
  );

  return (
    <Panel
      title="Usage overview"
      action={
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
      }
    >
      <p className="-mt-3 mb-4 text-sm text-vault-muted">Credits consumed vs. topped up</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="usedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.79 0.13 174)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="oklch(0.79 0.13 174)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="addedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.82 0.13 85)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.82 0.13 85)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.3 0.03 220)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="oklch(0.56 0.02 215)"
              tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="oklch(0.56 0.02 215)"
              tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.223 0.026 220)",
                border: "1px solid oklch(0.3 0.03 220)",
                borderRadius: 12,
                fontFamily: "IBM Plex Mono",
                fontSize: 12,
                color: "oklch(0.96 0.008 210)",
              }}
            />
            <Area
              type="monotone"
              dataKey="used"
              name="Used"
              stroke="oklch(0.79 0.13 174)"
              strokeWidth={2}
              fill="url(#usedFill)"
            />
            <Area
              type="monotone"
              dataKey="added"
              name="Added"
              stroke="oklch(0.82 0.13 85)"
              strokeWidth={2}
              fill="url(#addedFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
