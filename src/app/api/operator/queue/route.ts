import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);

    // Operators see their shop's queue
    if (user.role === "OPERATOR") {
      const shop = await prisma.shop.findUnique({
        where: { operatorId: user.userId },
      });
      if (!shop) return apiError("No shop found for this operator", 404);

      const jobs = await prisma.printJob.findMany({
        where: {
          shopId: shop.id,
          status: { in: ["PENDING", "QUEUED", "PROCESSING"] },
          isDeleted: false,
        },
        include: {
          document: { select: { originalName: true, pageCount: true } },
          user: { select: { name: true, email: true, phone: true } },
          printer: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      return apiResponse({ shop, jobs });
    }

    return apiError("Forbidden", 403);
  } catch (error) {
    console.error("Operator queue error:", error);
    return apiError("Internal server error", 500);
  }
}
