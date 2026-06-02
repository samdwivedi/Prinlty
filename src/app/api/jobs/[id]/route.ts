import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/api";
import { logger } from "@/lib/logger";

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
      include: {
        document: { select: { originalName: true, fileSize: true, pageCount: true, storageKey: true } },
        shop: { select: { name: true, address: true, phone: true } },
        printer: { select: { name: true, model: true } },
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!job) return apiError("Job not found", 404);

    if (
      user.role === "STUDENT" && job.userId !== user.userId
    ) {
      return apiError("Forbidden", 403);
    }

    return apiResponse(job);
  } catch (error) {
    logger.error("Get job details error in API route", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const { status, operatorNotes, printerId, actualCost } = body;

    const job = await prisma.printJob.findUnique({ where: { id, isDeleted: false } });
    if (!job) return apiError("Job not found", 404);

    // Role checks
    if (user.role === "STUDENT") {
      // Students can only cancel their own pending jobs
      if (status !== "CANCELLED" || job.userId !== user.userId) {
        return apiError("Forbidden", 403);
      }
      if (!["PENDING", "QUEUED"].includes(job.status)) {
        return apiError("Cannot cancel a job that is already being processed", 400);
      }
    }

    if (user.role === "OPERATOR" || user.role === "ADMIN") {
      // Operators can manage jobs
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (operatorNotes !== undefined) updateData.operatorNotes = operatorNotes;
    if (printerId) updateData.printerId = printerId;
    if (actualCost !== undefined) updateData.actualCost = actualCost;

    if (status === "PROCESSING") updateData.startedAt = new Date();
    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
      // Update printer job count
      if (job.printerId) {
        await prisma.printer.update({
          where: { id: job.printerId },
          data: { jobsCompleted: { increment: 1 } },
        });
      }
    }
    if (status === "CANCELLED") updateData.cancelledAt = new Date();

    const updated = await prisma.printJob.update({
      where: { id },
      data: updateData,
      include: {
        document: { select: { originalName: true } },
        shop: { select: { name: true } },
      },
    });

    // Notify student
    const statusMessages: Record<string, string> = {
      QUEUED: "Your print job has been accepted and queued.",
      PROCESSING: "Your document is now being printed.",
      COMPLETED: "Your print job is complete. Please collect your document.",
      CANCELLED: "Your print job has been cancelled.",
    };

    if (status && statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: job.userId,
          printJobId: job.id,
          title: `Job ${status.charAt(0) + status.slice(1).toLowerCase()}`,
          message: statusMessages[status],
          type: status === "COMPLETED" ? "success" : status === "CANCELLED" ? "error" : "info",
        },
      });
    }

    await logger.activity(req, user.userId, `JOB_STATUS_CHANGED_TO_${status}`, { jobId: id, previousStatus: job.status, newStatus: status }, job.id);

    return apiResponse(updated);
  } catch (error) {
    logger.error("Update job status error in API route", error);
    return apiError("Internal server error", 500);
  }
}
