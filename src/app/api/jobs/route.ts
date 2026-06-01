import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/api";
import { calculatePrintCost, generateJobNumber, getQRExpiry, getAutoDeleteDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isDeleted: false,
    };

    if (user.role === "STUDENT") {
      where.userId = user.userId;
    }

    if (status) {
      where.status = status;
    }

    const [jobs, total] = await Promise.all([
      prisma.printJob.findMany({
        where,
        include: {
          document: {
            select: { originalName: true, fileSize: true, pageCount: true },
          },
          shop: {
            select: { name: true, address: true },
          },
          printer: {
            select: { name: true, model: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.printJob.count({ where }),
    ]);

    return apiResponse({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const {
      documentId,
      shopId,
      copies = 1,
      color = "BLACK_WHITE",
      sides = "SINGLE",
      pageRange,
      paperSize = "A4",
      notes,
    } = body;

    if (!documentId || !shopId) {
      return apiError("Document and shop are required", 400);
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId, uploadedById: user.userId, isDeleted: false },
    });
    if (!document) return apiError("Document not found", 404);

    const shop = await prisma.shop.findUnique({
      where: { id: shopId, isActive: true },
    });
    if (!shop) return apiError("Shop not found", 404);

    const estimatedCost = calculatePrintCost(
      document.pageCount || 1,
      copies,
      color,
      sides,
      pageRange
    );

    const totalPages = document.pageCount * copies;

    const job = await prisma.printJob.create({
      data: {
        jobNumber: generateJobNumber(),
        userId: user.userId,
        shopId,
        documentId,
        copies,
        color,
        sides,
        pageRange,
        paperSize,
        notes,
        estimatedCost,
        totalPages,
        qrExpiresAt: getQRExpiry(48),
        autoDeleteAt: getAutoDeleteDate(7),
      },
      include: {
        document: { select: { originalName: true, pageCount: true } },
        shop: { select: { name: true, address: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.userId,
        printJobId: job.id,
        title: "Print Job Created",
        message: `Your print job #${job.jobNumber} has been created successfully.`,
        type: "success",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        printJobId: job.id,
        action: "JOB_CREATED",
        details: { jobNumber: job.jobNumber, documentId, shopId },
      },
    });

    return apiResponse(job, 201);
  } catch (error) {
    console.error("Create job error:", error);
    return apiError("Internal server error", 500);
  }
}
