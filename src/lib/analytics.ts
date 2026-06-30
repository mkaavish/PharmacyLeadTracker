import prisma from "./db";

export async function getAnalyticsData() {
  const [
    total,
    byStatus,
    byPriority,
    bySpecialty,
    byCity,
    byBenefitScore,
    recentActivity,
    upcomingFollowUps,
  ] = await Promise.all([
    (prisma as any).pharmacy.count(),
    (prisma as any).pharmacy.groupBy({ by: ["status"], _count: { id: true } }),
    (prisma as any).pharmacy.groupBy({ by: ["priority"], _count: { id: true } }),
    (prisma as any).pharmacy.groupBy({ by: ["specialty"], _count: { id: true } }),
    (prisma as any).pharmacy.groupBy({ by: ["city"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 15 }),
    (prisma as any).pharmacy.groupBy({ by: ["benefitScore"], _count: { id: true }, where: { benefitScore: { not: null } } }),
    (prisma as any).activityLog.findMany({
      orderBy: { createdAt: "desc" }, take: 20,
      include: { pharmacy: { select: { id: true, name: true } } },
    }),
    (prisma as any).pharmacy.findMany({
      where: { nextFollowUpDate: { not: null } },
      orderBy: { nextFollowUpDate: "asc" },
      take: 10,
      select: { id: true, name: true, city: true, status: true, nextFollowUpDate: true, phone: true },
    }),
  ]);

  const contacted = await (prisma as any).pharmacy.count({ where: { contacted: true } });
  const customers = await (prisma as any).pharmacy.count({ where: { status: "Customer" } });
  const interested = await (prisma as any).pharmacy.count({ where: { status: "Interested" } });
  const demoScheduled = await (prisma as any).pharmacy.count({ where: { status: "Demo Scheduled" } });
  const pilotStarted = await (prisma as any).pharmacy.count({ where: { status: "Pilot Started" } });
  const pilotCompleted = await (prisma as any).pharmacy.count({ where: { status: "Pilot Completed" } });

  const pipeline = await (prisma as any).pharmacy.aggregate({
    _sum: { expectedMonthlyValue: true },
    where: { status: { notIn: ["Lost", "Not Contacted"] } },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const followUpsDueToday = await (prisma as any).pharmacy.count({
    where: { nextFollowUpDate: { gte: today, lt: tomorrow } },
  });

  return {
    total,
    contacted,
    notContacted: total - contacted,
    customers,
    interested,
    demoScheduled,
    pilotStarted,
    pilotCompleted,
    conversionRate: total > 0 ? ((customers / total) * 100).toFixed(1) : "0",
    byStatus,
    byPriority,
    bySpecialty,
    byCity,
    byBenefitScore,
    recentActivity,
    upcomingFollowUps,
    followUpsDueToday,
    pipelineValue: pipeline._sum.expectedMonthlyValue || 0,
  };
}
