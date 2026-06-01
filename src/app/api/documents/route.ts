import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/storage";
import { getUserFromRequest } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file provided", 400);
    }

    const saved = await saveFile(file);

    const document = await prisma.document.create({
      data: {
        fileName: saved.fileName,
        originalName: saved.originalName,
        fileSize: saved.fileSize,
        mimeType: file.type,
        storagePath: saved.storagePath,
        storageKey: saved.storageKey,
        uploadedById: user.userId,
        pageCount: 0,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action: "DOCUMENT_UPLOADED",
        details: { documentId: document.id, fileName: document.originalName },
      },
    });

    return apiResponse({
      id: document.id,
      fileName: document.originalName,
      fileSize: document.fileSize,
      storageKey: document.storageKey,
      pageCount: document.pageCount,
      createdAt: document.createdAt,
    }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Upload error:", error);
    return apiError(message, 400);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return apiError("Unauthorized", 401);

    const documents = await prisma.document.findMany({
      where: {
        uploadedById: user.userId,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return apiResponse(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    return apiError("Internal server error", 500);
  }
}
