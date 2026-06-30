import {
  StatusDistributionChart, BenefitScoreChart, PharmaciesByCityChart,
  SpecialtyChart, ConversionFunnelChart
} from "@/components/dashboard/DashboardCharts";
import KpiCard from "@/components/dashboard/KpiCard";
import { Target, TrendingUp, DollarSign, Clock, Users, PlayCircle } from "lucide-react";
import { getAnalyticsData } from "@/lib/analytics";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  const kpis = [
    { title: "Conversion Rate", value: `${data.conversionRate}%`, icon: Target, color: "text-indigo-600", subtitle: "contacts → customers" },
    { title: "Pipeline Value", value: `$${Math.round(data.pipelineValue).toLocaleString()}/mo`, icon: DollarSign, color: "text-green-600" },
    { title: "Customers", value: data.customers, icon: Users, color: "text-emerald-600" },
    { title: "Pilots Active", value: data.pilotStarted, icon: PlayCircle, color: "text-teal-600" },
    { title: "Interested", value: data.interested, icon: TrendingUp, color: "text-blue-600" },
    { title: "Follow-ups Today", value: data.followUpsDueToday, icon: Clock, color: "text-orange-500" },
  ];

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Sales pipeline metrics and insights</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <StatusDistributionChart data={data.byStatus} />
        <BenefitScoreChart data={data.byBenefitScore} />
        <ConversionFunnelChart stats={{ total: data.total, contacted: data.contacted, interested: data.interested, demoScheduled: data.demoScheduled, pilotStarted: data.pilotStarted, customers: data.customers }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PharmaciesByCityChart data={data.byCity} />
        <SpecialtyChart data={data.bySpecialty} />
      </div>
    </div>
  );
}
