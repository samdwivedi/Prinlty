import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/api";
import { subDays, startOfDay, endOfDay, eachDayOfInterval, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);
    if (!["ADMIN", "OPERATOR"].includes(user.role)) return apiError("Forbidden", 403);

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    // Get operator's shop if operator
    let shopFilter: { shopId?: string } = {};
    if (user.role === "OPERATOR") {
      const shop = await prisma.shop.findUnique({ where: { operatorId: user.userId } });
      if (shop) shopFilter = { shopId: shop.id };
    }

    const [
      totalJobs,
      completedJobs,
      pendingJobs,
      totalRevenue,
      jobsLast7Days,
      jobsLast30Days,
      statusBreakdown,
    ] = await Promise.all([
      prisma.printJob.count({ where: { ...shopFilter, isDeleted: false } }),
      prisma.printJob.count({ where: { ...shopFilter, status: "COMPLETED", isDeleted: false } }),
      prisma.printJob.count({ where: { ...shopFilter, status: { in: ["PENDING", "QUEUED"] }, isDeleted: false } }),
      prisma.printJob.aggregate({
        where: { ...shopFilter, status: "COMPLETED", isDeleted: false },
        _sum: { actualCost: true },
      }),
      prisma.printJob.count({
        where: { ...shopFilter, createdAt: { gte: sevenDaysAgo }, isDeleted: false },
      }),
      prisma.printJob.count({
        where: { ...shopFilter, createdAt: { gte: thirtyDaysAgo }, isDeleted: false },
      }),
      prisma.printJob.groupBy({
        by: ["status"],
        where: { ...shopFilter, isDeleted: false },
        _count: { status: true },
      }),
    ]);

    // Daily jobs for chart (last 30 days)
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
    const dailyJobs = await Promise.all(
      days.map(async (day) => {
        const count = await prisma.printJob.count({
          where: {
            ...shopFilter,
            createdAt: { gte: startOfDay(day), lte: endOfDay(day) },
            isDeleted: false,
          },
        });
        const revenue = await prisma.printJob.aggregate({
          where: {
            ...shopFilter,
            status: "COMPLETED",
            completedAt: { gte: startOfDay(day), lte: endOfDay(day) },
            isDeleted: false,
          },
          _sum: { actualCost: true },
        });
        return {
          date: format(day, "MMM dd"),
          jobs: count,
          revenue: revenue._sum.actualCost || 0,
        };
      })
    );

    // Weekly summary (last 4 weeks)
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = subDays(now, (i + 1) * 7);
      const weekEnd = subDays(now, i * 7);
      const count = await prisma.printJob.count({
        where: {
          ...shopFilter,
          createdAt: { gte: weekStart, lte: weekEnd },
          isDeleted: false,
        },
      });
      weeklyData.push({
        week: `Week ${4 - i}`,
        jobs: count,
      });
    }

    const statusMap = statusBreakdown.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    return apiResponse({
      summary: {
        totalJobs,
        completedJobs,
        pendingJobs,
        totalRevenue: totalRevenue._sum.actualCost || 0,
        jobsLast7Days,
        jobsLast30Days,
      },
      statusBreakdown: statusMap,
      dailyJobs,
      weeklyData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return apiError("Internal server error", 500);
  }
}
