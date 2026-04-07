import { prisma } from "@/lib/db";

export async function countPortfolioApplicationsForDay(slotId: string) {
  return prisma.portfolioApplication.count({
    where: { slotId, status: { not: "CANCELLED" } },
  });
}

export async function listAvailablePortfolioDays() {
  const days = await prisma.portfolioShootDay.findMany({
    where: { isActive: true },
    orderBy: { shootDate: "asc" },
  });
  const withCounts = await Promise.all(
    days.map(async (d) => {
      const booked = await countPortfolioApplicationsForDay(d.id);
      const remaining = Math.max(0, d.maxBookings - booked);
      return { ...d, booked, remaining };
    }),
  );
  return withCounts.filter((d) => d.remaining > 0);
}

export async function listAllPortfolioDaysForAdmin() {
  return prisma.portfolioShootDay.findMany({
    orderBy: { shootDate: "desc" },
    include: {
      _count: { select: { applications: true } },
    },
  });
}

export async function listPortfolioApplicationsForAdmin() {
  return prisma.portfolioApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { slot: true },
  });
}

export async function createPortfolioShootDay(data: { shootDate: Date; maxBookings: number }) {
  return prisma.portfolioShootDay.create({
    data: { shootDate: data.shootDate, maxBookings: data.maxBookings },
  });
}

export async function updatePortfolioShootDay(
  id: string,
  data: Partial<{ maxBookings: number; isActive: boolean; shootDate: Date }>,
) {
  return prisma.portfolioShootDay.update({ where: { id }, data });
}

export async function deletePortfolioShootDay(id: string) {
  return prisma.portfolioShootDay.delete({ where: { id } });
}

export async function setPortfolioApplicationStatus(
  id: string,
  status: import("@prisma/client").ServiceLeadStatus,
) {
  return prisma.portfolioApplication.update({ where: { id }, data: { status } });
}
