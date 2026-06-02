import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { apiError } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);

    const document = await prisma.document.findUnique({
      where: { storageKey: key, isDeleted: false },
    });

    if (!document) {
      return apiError("File not found", 404);
    }

    // Only allow owner, operators, and admins
    if (
      document.uploadedById !== user.userId &&
      user.role !== "OPERATOR" &&
      user.role !== "ADMIN"
    ) {
      return apiError("Forbidden", 403);
    }

    const fileBuffer = await readFile(document.storagePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${document.originalName}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("File serve error:", error);
    return apiError("File not found", 404);
  }
}
