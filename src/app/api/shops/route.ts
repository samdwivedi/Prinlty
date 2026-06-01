import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const shops = await prisma.shop.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        printers: {
          where: { status: "ONLINE" },
          select: { id: true, name: true, isColorCapable: true, isDuplexCapable: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return apiResponse(shops);
  } catch (error) {
    console.error("Get shops error:", error);
    return apiError("Internal server error", 500);
  }
}
