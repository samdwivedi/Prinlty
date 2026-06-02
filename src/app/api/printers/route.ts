import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);

    let shopId: string | undefined;

    if (user.role === "OPERATOR") {
      const shop = await prisma.shop.findUnique({ where: { operatorId: user.userId } });
      if (!shop) return apiError("No shop found", 404);
      shopId = shop.id;
    }

    const { searchParams } = new URL(req.url);
    const queryShopId = searchParams.get("shopId");

    const printers = await prisma.printer.findMany({
      where: {
        shopId: shopId || queryShopId || undefined,
      },
      include: {
        shop: { select: { name: true } },
        _count: { select: { printJobs: true } },
      },
      orderBy: { name: "asc" },
    });

    return apiResponse(printers);
  } catch (error) {
    console.error("Get printers error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);
    if (!["OPERATOR", "ADMIN"].includes(user.role)) return apiError("Forbidden", 403);

    const body = await req.json();
    const { name, model, shopId, isColorCapable, isDuplexCapable } = body;

    if (!name || !shopId) return apiError("Name and shop are required", 400);

    if (user.role === "OPERATOR") {
      const shop = await prisma.shop.findUnique({
        where: { operatorId: user.userId },
      });
      if (!shop || shop.id !== shopId) {
        return apiError("Forbidden: You cannot register a printer for another shop", 403);
      }
    }

    const printer = await prisma.printer.create({
      data: {
        name,
        model,
        shopId,
        isColorCapable: isColorCapable || false,
        isDuplexCapable: isDuplexCapable !== false,
      },
    });

    return apiResponse(printer, 201);
  } catch (error) {
    console.error("Create printer error:", error);
    return apiError("Internal server error", 500);
  }
}
