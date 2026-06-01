import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiResponse } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const job = await prisma.printJob.findUnique({
      where: { qrToken: token, isDeleted: false },
      include: {
        document: { select: { originalName: true, pageCount: true } },
        shop: { select: { name: true, address: true, phone: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!job) return apiError("Invalid QR token", 404);

    const isExpired = new Date() > new Date(job.qrExpiresAt);

    return apiResponse({
      job: {
        id: job.id,
        jobNumber: job.jobNumber,
        status: job.status,
        copies: job.copies,
        color: job.color,
        sides: job.sides,
        paperSize: job.paperSize,
        estimatedCost: job.estimatedCost,
        actualCost: job.actualCost,
        document: job.document,
        shop: job.shop,
        user: job.user,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      },
      isExpired,
      expiresAt: job.qrExpiresAt,
    });
  } catch (error) {
    console.error("Verify QR error:", error);
    return apiError("Internal server error", 500);
  }
}
