"use client";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, FunnelChart, Funnel, LabelList,
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#ec4899"];

const STATUS_ORDER = [
  "Not Contacted", "Contacted", "Awaiting Response", "Interested",
  "Follow-up Scheduled", "Demo Scheduled", "Pilot Started", "Pilot Completed", "Customer", "Lost"
];

interface GroupCount { status?: string; specialty?: string; city?: string; benefitScore?: number | null; priority?: string; _count: { id: number } }

export function StatusDistributionChart({ data }: { data: GroupCount[] }) {
  const sorted = STATUS_ORDER.map((s) => ({
    name: s.length > 15 ? s.slice(0, 14) + "…" : s,
    value: data.find((d) => d.status === s)?._count.id || 0,
  })).filter((d) => d.value > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-sm text-foreground mb-4">Status Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={sorted} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
            {sorted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BenefitScoreChart({ data }: { data: GroupCount[] }) {
  const buckets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => ({
    score: String(score),
    count: data.find((d) => d.benefitScore === score)?._count.id || 0,
  }));
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-sm text-foreground mb-4">Benefit Score Distribution</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={buckets} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="score" tick={{ fontSize: 11 }} className="text-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
          <Tooltip />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PharmaciesByCityChart({ data }: { data: GroupCount[] }) {
  const sorted = [...data].sort((a, b) => b._count.id - a._count.id).slice(0, 10).map((d) => ({ city: d.city || "Unknown", count: d._count.id }));
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-sm text-foreground mb-4">Pharmacies by City</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={80} />
          <Tooltip />
          <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SpecialtyChart({ data }: { data: GroupCount[] }) {
  const sorted = data.map((d) => ({ name: d.specialty || "Unknown", value: d._count.id }));
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-sm text-foreground mb-4">Pharmacies by Specialty</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={sorted} cx="50%" cy="50%" outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
            {sorted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConversionFunnelChart({ stats }: { stats: { total: number; contacted: number; interested: number; demoScheduled: number; pilotStarted: number; customers: number } }) {
  const data = [
    { name: "Total", value: stats.total, fill: "#6366f1" },
    { name: "Contacted", value: stats.contacted, fill: "#3b82f6" },
    { name: "Interested", value: stats.interested, fill: "#10b981" },
    { name: "Demo Scheduled", value: stats.demoScheduled, fill: "#f59e0b" },
    { name: "Pilot Started", value: stats.pilotStarted, fill: "#f97316" },
    { name: "Customers", value: stats.customers, fill: "#22c55e" },
  ];
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-semibold text-sm text-foreground mb-4">Pilot Conversion Funnel</h3>
      <ResponsiveContainer width="100%" height={220}>
        <FunnelChart>
          <Tooltip />
          <Funnel dataKey="value" data={data} isAnimationActive>
            <LabelList position="center" fill="#fff" stroke="none" dataKey="name" style={{ fontSize: 11 }} />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}
