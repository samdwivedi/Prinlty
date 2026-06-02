"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/sidebar";
import { StatCard } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/cn";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  QUEUED: "#3b82f6",
  PROCESSING: "#8b5cf6",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
  FAILED: "#dc2626",
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await axios.get("/api/analytics");
      return res.data.data;
    },
  });

  const summary = data?.summary || {};
  const dailyJobs = data?.dailyJobs?.slice(-14) || []; // Last 14 days
  const weeklyData = data?.weeklyData || [];
  const statusBreakdown = data?.statusBreakdown || {};

  const pieData = Object.entries(statusBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Analytics"
        subtitle="Track your print activity and revenue"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Jobs"
              value={summary.totalJobs || 0}
              subtitle="All time"
              icon={<FileText className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              title="Completed"
              value={summary.completedJobs || 0}
              subtitle="Successfully printed"
              icon={<CheckCircle className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(summary.totalRevenue || 0)}
              subtitle="From completed jobs"
              icon={<TrendingUp className="w-5 h-5" />}
              color="cyan"
            />
            <StatCard
              title="Last 30 Days"
              value={summary.jobsLast30Days || 0}
              subtitle={`+${summary.jobsLast7Days || 0} this week`}
              icon={<Clock className="w-5 h-5" />}
              color="purple"
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Daily Jobs Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Jobs per Day</h2>
            <span className="text-sm text-gray-400 ml-auto">Last 14 days</span>
          </div>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyJobs} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "13px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#jobsGradient)"
                  name="Jobs"
                  dot={false}
                  activeDot={{ r: 4, fill: "#2563EB" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Status Breakdown</h2>
          {isLoading || pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <p className="text-gray-400 text-sm">No data yet</p>
              )}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                      {value}
                    </span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Revenue + Weekly Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h2>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyJobs} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "13px" }}
                  formatter={(value: number, name: string) => [`₹${value}`, name]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fill="url(#revGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#06B6D4" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Job Volume</h2>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "13px" }}
                />
                <Bar dataKey="jobs" fill="#2563EB" radius={[6, 6, 0, 0]} name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
