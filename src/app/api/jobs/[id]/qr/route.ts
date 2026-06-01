import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/api";
import QRCode from "qrcode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);

    const job = await prisma.printJob.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        jobNumber: true,
        qrToken: true,
        qrExpiresAt: true,
        status: true,
        userId: true,
        document: { select: { originalName: true } },
        shop: { select: { name: true } },
      },
    });

    if (!job) return apiError("Job not found", 404);

    if (user.role === "STUDENT" && job.userId !== user.userId) {
      return apiError("Forbidden", 403);
    }

    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${job.qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#1e293b", light: "#ffffff" },
    });

    return apiResponse({
      jobId: job.id,
      jobNumber: job.jobNumber,
      qrToken: job.qrToken,
      qrDataUrl,
      qrUrl,
      expiresAt: job.qrExpiresAt,
      status: job.status,
      document: job.document,
      shop: job.shop,
    });
  } catch (error) {
    console.error("QR generate error:", error);
    return apiError("Internal server error", 500);
  }
}
