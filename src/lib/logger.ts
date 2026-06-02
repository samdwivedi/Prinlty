import { NextRequest } from "next/server";
import { prisma } from "./prisma";

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: "INFO" | "WARN" | "ERROR", message: string): string {
    const timestamp = this.getTimestamp();
    const colors = {
      INFO: "\x1b[32m",  // Green
      WARN: "\x1b[33m",  // Yellow
      ERROR: "\x1b[31m", // Red
      RESET: "\x1b[0m"
    };
    return `${colors[level]}[${timestamp}] [${level}] ${message}${colors.RESET}`;
  }

  info(message: string, details?: any) {
    console.log(this.formatMessage("INFO", message));
    if (details) {
      console.log(JSON.stringify(details, null, 2));
    }
  }

  warn(message: string, details?: any) {
    console.warn(this.formatMessage("WARN", message));
    if (details) {
      console.warn(JSON.stringify(details, null, 2));
    }
  }

  error(message: string, error?: any, details?: any) {
    console.error(this.formatMessage("ERROR", message));
    if (error) {
      console.error(error);
    }
    if (details) {
      console.error(JSON.stringify(details, null, 2));
    }
  }

  /**
   * Log an operational audit activity in both console and the database.
   */
  async activity(
    req: NextRequest,
    userId: string | null,
    action: string,
    details?: any,
    printJobId?: string
  ) {
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    this.info(`ACTIVITY [${action}] by User [${userId || "GUEST"}] from IP [${ipAddress}]`);

    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action,
          details: details ? (typeof details === "string" ? { message: details } : details) : undefined,
          ipAddress,
          userAgent,
          printJobId,
        },
      });
    } catch (dbError) {
      this.error("Failed to write activity audit log to database", dbError);
    }
  }
}

export const logger = new Logger();
