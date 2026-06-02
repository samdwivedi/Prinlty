import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);
    if (!["ADMIN"].includes(user.role)) return apiError("Forbidden", 403);

    const shops = await prisma.shop.findMany({
      include: {
        operator: { select: { name: true, email: true, phone: true } },
        _count: {
          select: { printers: true, printJobs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse(shops);
  } catch (error) {
    console.error("Get shops error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);
    if (!["ADMIN"].includes(user.role)) return apiError("Forbidden", 403);

    const body = await req.json();
    const { name, description, address, phone, email, operatorId } = body;

    if (!name || !address || !phone || !operatorId) {
      return apiError("Name, address, phone, and operator are required", 400);
    }

    // Validate operator exists and has correct role
    const operatorUser = await prisma.user.findUnique({
      where: { id: operatorId },
    });
    if (!operatorUser) {
      return apiError("Operator user not found", 400);
    }
    if (operatorUser.role !== "OPERATOR") {
      return apiError("Selected user does not have the OPERATOR role", 400);
    }

    // Validate operator is not already managing a shop
    const existingShop = await prisma.shop.findUnique({
      where: { operatorId },
    });
    if (existingShop) {
      return apiError("This operator is already assigned to another shop", 400);
    }

    const shop = await prisma.shop.create({
      data: { name, description, address, phone, email, operatorId },
      include: { operator: { select: { name: true, email: true } } },
    });

    return apiResponse(shop, 201);
  } catch (error) {
    console.error("Create shop error:", error);
    return apiError("Internal server error", 500);
  }
}
