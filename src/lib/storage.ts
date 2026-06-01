import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "50");
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveFile(
  file: File
): Promise<{ fileName: string; originalName: string; fileSize: number; storagePath: string; storageKey: string }> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`);
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  await ensureUploadDir();

  const storageKey = randomUUID();
  const ext = path.extname(file.name) || ".pdf";
  const fileName = `${storageKey}${ext}`;
  const storagePath = path.join(UPLOAD_DIR, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(storagePath, buffer);

  return {
    fileName,
    originalName: file.name,
    fileSize: file.size,
    storagePath,
    storageKey,
  };
}

export async function deleteFile(storagePath: string): Promise<void> {
  try {
    if (existsSync(storagePath)) {
      await unlink(storagePath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export function getFileUrl(storageKey: string): string {
  return `/api/files/${storageKey}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
