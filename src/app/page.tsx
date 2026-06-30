import {
  Building2, Phone, AlertTriangle, TrendingUp, Calendar, UserCheck,
  PlayCircle, CheckCircle2, Users, Target, DollarSign, Clock
} from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import UpcomingFollowUps from "@/components/dashboard/UpcomingFollowUps";
import {
  StatusDistributionChart, BenefitScoreChart, PharmaciesByCityChart,
  SpecialtyChart, ConversionFunnelChart
} from "@/components/dashboard/DashboardCharts";
import { getAnalyticsData } from "@/lib/analytics";

export default async function DashboardPage() {
  const data = await getAnalyticsData();

  const kpis = [
    { title: "Total Pharmacies", value: data.total, icon: Building2, color: "text-indigo-600" },
    { title: "Contacted", value: data.contacted, icon: Phone, color: "text-blue-600" },
    { title: "Not Contacted", value: data.notContacted, icon: AlertTriangle, color: "text-gray-500" },
    { title: "Interested", value: data.interested, icon: TrendingUp, color: "text-green-600" },
    { title: "Follow-ups Today", value: data.followUpsDueToday, icon: Calendar, color: "text-orange-500" },
    { title: "Demo Scheduled", value: data.demoScheduled, icon: UserCheck, color: "text-purple-600" },
    { title: "Pilot Started", value: data.pilotStarted, icon: PlayCircle, color: "text-teal-600" },
    { title: "Pilot Completed", value: data.pilotCompleted, icon: CheckCircle2, color: "text-cyan-600" },
    { title: "Customers", value: data.customers, icon: Users, color: "text-emerald-600" },
    { title: "Conversion Rate", value: `${data.conversionRate}%`, icon: Target, color: "text-indigo-500" },
    { title: "Pipeline Value", value: `$${Math.round(data.pipelineValue).toLocaleString()}/mo`, icon: DollarSign, color: "text-green-600" },
    { title: "High Priority", value: data.byPriority?.find((p: any) => p.priority === "High")?._count?.id || 0, icon: Clock, color: "text-red-500" },
  ];

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">RxPredict pharmacy outreach pipeline overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
        {kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <StatusDistributionChart data={data.byStatus} />
        <BenefitScoreChart data={data.byBenefitScore} />
        <ConversionFunnelChart stats={{ total: data.total, contacted: data.contacted, interested: data.interested, demoScheduled: data.demoScheduled, pilotStarted: data.pilotStarted, customers: data.customers }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <PharmaciesByCityChart data={data.byCity} />
        <SpecialtyChart data={data.bySpecialty} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivityFeed activities={data.recentActivity} />
        <UpcomingFollowUps followUps={data.upcomingFollowUps} />
      </div>
    </div>
  );
}
