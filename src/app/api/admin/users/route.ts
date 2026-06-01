import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);
    if (!["ADMIN"].includes(user.role)) return apiError("Forbidden", 403);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { printJobs: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return apiResponse({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get users error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);
    if (!["ADMIN"].includes(user.role)) return apiError("Forbidden", 403);

    const body = await req.json();
    const { userId, isActive, role } = body;

    if (!userId) return apiError("User ID required", 400);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(role && { role }),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return apiResponse(updated);
  } catch (error) {
    console.error("Update user error:", error);
    return apiError("Internal server error", 500);
  }
}
