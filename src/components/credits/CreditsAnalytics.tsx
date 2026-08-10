import { useMemo } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { analytics, type CreditBucket } from "@/lib/credits";
import { Panel } from "@/components/dashboard/primitives";

const COLORS = [
  "var(--color-vault-teal)",
  "var(--color-vault-amber)",
  "var(--color-vault-blue)",
  "var(--color-vault-purple)",
  "var(--color-vault-green)",
  "var(--color-vault-danger)",
];

const tooltipStyle = {
  background: "var(--color-vault-panel)",
  border: "1px solid var(--color-vault-border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--color-vault-foreground)",
};

function Legend({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ul className="mt-4 space-y-1.5">
      {data.map((d, i) => (
        <li key={d.name} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-2 text-vault-muted">
            <span className="size-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {d.name}
          </span>
          <span className="vault-mono text-vault-foreground">{d.value.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

export function CreditsAnalytics({ buckets }: { buckets: CreditBucket[] }) {
  const data = useMemo(() => analytics(buckets), [buckets]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Distribution by app">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.byApp} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} strokeWidth={0}>
                {data.byApp.map((d, i) => (
                  <Cell key={d.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <Legend data={data.byApp} />
      </Panel>

      <Panel title="Distribution by source">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.bySource} dataKey="value" nameKey="name" outerRadius={62} strokeWidth={0}>
                {data.bySource.map((d, i) => (
                  <Cell key={d.name} fill={COLORS[(i + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <Legend data={data.bySource} />
      </Panel>

      <Panel title="Expiry distribution">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byExpiry}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-vault-faint)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-vault-raised)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--color-vault-teal)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Legend data={data.byExpiry} />
      </Panel>
    </div>
  );
}
