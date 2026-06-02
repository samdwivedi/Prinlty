import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET() {
  try {
    const now = new Date();
    logger.info(`Starting automated system cleanup task at ${now.toISOString()}`);

    // 1. Find all print jobs that are past their autoDeleteAt and are not yet marked as isDeleted
    const expiredJobs = await prisma.printJob.findMany({
      where: {
        autoDeleteAt: { lte: now },
        isDeleted: false,
      },
      include: {
        document: true,
      },
    });

    let deletedFilesCount = 0;
    let deletedJobsCount = 0;

    for (const job of expiredJobs) {
      const document = job.document;

      if (document && !document.isDeleted) {
        // Double check if there are other ACTIVE jobs referencing the same document
        const activeJobsCount = await prisma.printJob.count({
          where: {
            documentId: document.id,
            isDeleted: false,
            autoDeleteAt: { gt: now },
            id: { not: job.id },
          },
        });

        // If no other active jobs require the file, delete it from disk
        if (activeJobsCount === 0) {
          logger.info(`Deleting physical file for document ${document.id}: ${document.storagePath}`);
          await deleteFile(document.storagePath);
          deletedFilesCount++;

          // Mark document as deleted in DB
          await prisma.document.update({
            where: { id: document.id },
            data: {
              isDeleted: true,
              deletedAt: now,
            },
          });
        }
      }

      // Mark the print job as deleted in DB
      await prisma.printJob.update({
        where: { id: job.id },
        data: {
          isDeleted: true,
          deletedAt: now,
        },
      });
      deletedJobsCount++;
    }

    // 2. Scan uploads directory for orphan files (files on disk not referenced or marked as deleted in DB)
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    let deletedOrphansCount = 0;

    if (existsSync(uploadDir)) {
      const files = await readdir(uploadDir);
      for (const file of files) {
        // Exclude directory structures if any
        if (file === "." || file === "..") continue;

        const storagePath = path.join(uploadDir, file);

        // Find if there is an active document pointing to this file
        const dbDoc = await prisma.document.findFirst({
          where: {
            OR: [
              { storagePath },
              { fileName: file }
            ],
            isDeleted: false,
          },
        });

        // If no active document is found, it is an orphan file
        if (!dbDoc) {
          logger.warn(`Found orphan file on disk, deleting: ${storagePath}`);
          await deleteFile(storagePath);
          deletedOrphansCount++;
        }
      }
    }

    logger.info(`Cleanup finished. Deleted jobs: ${deletedJobsCount}, Deleted files: ${deletedFilesCount}, Deleted orphans: ${deletedOrphansCount}`);

    return NextResponse.json({
      success: true,
      message: "Automated cleanup completed successfully",
      metrics: {
        jobsDeleted: deletedJobsCount,
        filesDeleted: deletedFilesCount,
        orphansDeleted: deletedOrphansCount,
      },
    });
  } catch (error) {
    logger.error("Error occurred during automated system cleanup", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during cleanup" },
      { status: 500 }
    );
  }
}
