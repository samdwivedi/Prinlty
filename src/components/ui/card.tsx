"use client";

import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

function Card({ children, className, hover = true, padding = "md" }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-100 shadow-sm",
        paddings[padding],
        hover && "transition-all duration-300 hover:shadow-md hover:shadow-slate-100/80 hover:border-slate-200/80 hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      {children}
    </div>
  );
}

function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-lg font-bold text-gray-900 tracking-tight", className)}>
      {children}
    </h3>
  );
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("", className)}>{children}</div>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "blue" | "cyan" | "green" | "purple" | "orange";
}

function StatCard({ title, value, subtitle, icon, trend, color = "blue" }: StatCardProps) {
  const colorStyles = {
    blue: {
      icon: "bg-indigo-50 text-indigo-600 border border-indigo-100/50",
      bg: "bg-gradient-to-tr from-white via-white to-indigo-50/20",
    },
    cyan: {
      icon: "bg-sky-50 text-sky-600 border border-sky-100/50",
      bg: "bg-gradient-to-tr from-white via-white to-sky-50/20",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-600 border border-emerald-100/50",
      bg: "bg-gradient-to-tr from-white via-white to-emerald-50/20",
    },
    purple: {
      icon: "bg-purple-50 text-purple-600 border border-purple-100/50",
      bg: "bg-gradient-to-tr from-white via-white to-purple-50/20",
    },
    orange: {
      icon: "bg-amber-50 text-amber-600 border border-amber-100/50",
      bg: "bg-gradient-to-tr from-white via-white to-amber-50/20",
    },
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 p-6 transition-all duration-300",
        "hover:shadow-md hover:shadow-slate-100/80 hover:border-slate-200/80 hover:-translate-y-0.5",
        colorStyles[color].bg,
        "relative overflow-hidden group bg-white shadow-sm"
      )}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs font-medium text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2.5">
              <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-md",
                trend.value >= 0 ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
              )}>
                {trend.value >= 0 ? "+" : ""}{trend.value}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl transition-all duration-300 group-hover:scale-110", colorStyles[color].icon)}>
          {icon}
        </div>
      </div>
      {/* Premium glowing overlay background effect */}
      <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-transparent to-slate-50/30 rounded-tl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardContent, StatCard };
