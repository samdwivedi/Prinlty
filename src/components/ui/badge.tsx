"use client";

import { cn } from "@/lib/cn";
import { formatJobStatus } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const styles: Record<string, string> = {
    PENDING: "text-amber-700 bg-amber-50 border-amber-200",
    QUEUED: "text-blue-700 bg-blue-50 border-blue-200",
    PROCESSING: "text-purple-700 bg-purple-50 border-purple-200",
    COMPLETED: "text-emerald-700 bg-emerald-50 border-emerald-200",
    CANCELLED: "text-red-700 bg-red-50 border-red-200",
    FAILED: "text-red-900 bg-red-50 border-red-200",
  };

  const dots: Record<string, string> = {
    PENDING: "bg-amber-400",
    QUEUED: "bg-blue-400",
    PROCESSING: "bg-purple-400",
    COMPLETED: "bg-emerald-400",
    CANCELLED: "bg-red-400",
    FAILED: "bg-red-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        styles[status] || "text-gray-700 bg-gray-50 border-gray-200",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          dots[status] || "bg-gray-400",
          status === "PROCESSING" && "animate-pulse"
        )}
      />
      {formatJobStatus(status)}
    </span>
  );
}

interface GenericBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: GenericBadgeProps) {
  const styles = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
