import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const jwtUser = await getUserFromRequest(req);
    if (!jwtUser) {
      return apiError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: jwtUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiResponse(user);
  } catch (error) {
    console.error("Get me error:", error);
    return apiError("Internal server error", 500);
  }
}
