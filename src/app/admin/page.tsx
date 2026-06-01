"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/sidebar";
import { StatCard } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Users,
  Store,
  Printer,
  FileText,
  TrendingUp,
  Activity,
  CheckCircle,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatRelativeTime, formatCurrency } from "@/lib/cn";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminPage() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await axios.get("/api/analytics");
      return res.data.data;
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/users?limit=5");
      return res.data.data;
    },
  });

  const { data: shopsData } = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/shops");
      return res.data.data;
    },
  });

  const { data: jobsData } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await axios.get("/api/jobs?limit=5");
      return res.data.data;
    },
  });

  const summary = analytics?.summary || {};
  const dailyJobs = analytics?.dailyJobs?.slice(-14) || [];
  const recentJobs = jobsData?.jobs || [];
  const recentUsers = usersData?.users || [];

  return (
    <DashboardLayout requiredRole={["ADMIN"]}>
      <DashboardHeader
        title="Admin Dashboard"
        subtitle="Platform-wide overview and management"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Jobs" value={summary.totalJobs || 0} subtitle="All time" icon={<FileText className="w-5 h-5" />} color="blue" />
            <StatCard title="Revenue" value={formatCurrency(summary.totalRevenue || 0)} subtitle="Completed jobs" icon={<TrendingUp className="w-5 h-5" />} color="green" />
            <StatCard title="Print Shops" value={shopsData?.length || 0} subtitle="Active shops" icon={<Store className="w-5 h-5" />} color="purple" />
            <StatCard title="Total Users" value={usersData?.total || 0} subtitle="Registered users" icon={<Users className="w-5 h-5" />} color="cyan" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Job Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Job Activity</h2>
            </div>
            <Link href="/dashboard/analytics">
              <Button variant="ghost" size="sm">Analytics <ArrowRight className="w-3.5 h-3.5" /></Button>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyJobs} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "13px" }} />
              <Area type="monotone" dataKey="jobs" stroke="#2563EB" strokeWidth={2} fill="url(#adminGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-gray-900">Platform Health</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "API Status", value: "Operational", color: "text-green-600" },
                { label: "DB Connection", value: "Connected", color: "text-green-600" },
                { label: "Jobs (7d)", value: summary.jobsLast7Days || 0, color: "text-blue-600" },
                { label: "Completion Rate", value: summary.totalJobs ? `${Math.round((summary.completedJobs / summary.totalJobs) * 100)}%` : "—", color: "text-purple-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
            <Printer className="w-7 h-7 mb-3 opacity-80" />
            <p className="text-sm font-medium mb-1">Manage Shops</p>
            <p className="text-blue-100 text-xs mb-4">Add, edit, and configure print centers</p>
            <Link href="/admin/shops">
              <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
                Manage Shops <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
            <Link href="/dashboard/jobs">
              <Button variant="ghost" size="sm">View all <ArrowRight className="w-3.5 h-3.5" /></Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job: {
              id: string;
              jobNumber: string;
              document?: { originalName: string };
              user?: { name: string };
              status: string;
              createdAt: string;
            }) => (
              <div key={job.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{job.document?.originalName}</p>
                  <p className="text-xs text-gray-400">{job.user?.name} · {formatRelativeTime(job.createdAt)}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">Manage <ArrowRight className="w-3.5 h-3.5" /></Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user: {
              id: string;
              name: string;
              email: string;
              role: string;
              isActive: boolean;
              createdAt: string;
            }) => (
              <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">{user.role.toLowerCase()}</span>
                  {user.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
