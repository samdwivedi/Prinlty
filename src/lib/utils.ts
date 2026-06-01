export function generateQRToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function getQRExpiry(hours = 24): Date {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}

export function getAutoDeleteDate(days = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function calculatePrintCost(
  pageCount: number,
  copies: number,
  color: string,
  sides: string,
  pageRange?: string
): number {
  let pages = pageCount;
  if (pageRange) {
    pages = parsePageRange(pageRange, pageCount);
  }

  const totalPages = pages * copies;
  const colorRate = color === "COLOR" ? 5.0 : 1.0; // per page in INR
  const sideMultiplier = sides === "DOUBLE" ? 0.5 : 1.0;

  return Math.ceil(totalPages * colorRate * sideMultiplier);
}

export function parsePageRange(range: string, totalPages: number): number {
  if (!range || range.trim() === "") return totalPages;

  let count = 0;
  const parts = range.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        count += Math.abs(end - start) + 1;
      }
    } else {
      const num = parseInt(trimmed);
      if (!isNaN(num)) count += 1;
    }
  }
  return count || totalPages;
}

export function formatJobStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    QUEUED: "Queued",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    FAILED: "Failed",
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
    QUEUED: "text-blue-600 bg-blue-50 border-blue-200",
    PROCESSING: "text-purple-600 bg-purple-50 border-purple-200",
    COMPLETED: "text-green-600 bg-green-50 border-green-200",
    CANCELLED: "text-red-600 bg-red-50 border-red-200",
    FAILED: "text-red-700 bg-red-50 border-red-200",
  };
  return colorMap[status] || "text-gray-600 bg-gray-50 border-gray-200";
}

export function generateJobNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `PJ-${year}${month}${day}-${random}`;
}
