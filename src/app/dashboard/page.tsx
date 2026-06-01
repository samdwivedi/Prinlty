"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/sidebar";
import { StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  ArrowRight,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatRelativeTime } from "@/lib/cn";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await axios.get("/api/jobs?limit=5");
      return res.data.data;
    },
  });

  const jobs = jobsData?.jobs || [];
  const total = jobsData?.pagination?.total || 0;

  const statusCounts = jobs.reduce(
    (acc: Record<string, number>, job: { status: string }) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <DashboardLayout>
      <DashboardHeader
        title={`Good ${getGreeting()}, ${user?.name?.split(" ")[0]}! 👋`}
        subtitle="Here's your print activity overview"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Jobs"
              value={total}
              subtitle="All time"
              icon={<FileText className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              title="Pending"
              value={statusCounts["PENDING"] || 0}
              subtitle="Awaiting processing"
              icon={<Clock className="w-5 h-5" />}
              color="orange"
            />
            <StatCard
              title="Completed"
              value={statusCounts["COMPLETED"] || 0}
              subtitle="Successfully printed"
              icon={<CheckCircle className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="Cancelled"
              value={statusCounts["CANCELLED"] || 0}
              subtitle="Cancelled jobs"
              icon={<XCircle className="w-5 h-5" />}
              color="purple"
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Print Jobs</h2>
            <Link href="/dashboard/jobs">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <SkeletonTable rows={4} />
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Printer className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No print jobs yet</p>
              <p className="text-gray-400 text-sm mb-4">Upload your first PDF to get started</p>
              <Link href="/dashboard/upload">
                <Button size="sm">
                  <Upload className="w-4 h-4" /> Upload & Print
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job: {
                id: string;
                jobNumber: string;
                document?: { originalName: string };
                shop?: { name: string };
                status: string;
                copies: number;
                color: string;
                createdAt: string;
              }) => (
                <div
                  key={job.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {job.document?.originalName || "Untitled"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {job.shop?.name} · {job.copies} cop{job.copies !== 1 ? "ies" : "y"} · {job.color === "COLOR" ? "Color" : "B&W"} · {formatRelativeTime(job.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
            <Printer className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="text-lg font-bold mb-2">Print a Document</h3>
            <p className="text-blue-100 text-sm mb-4 leading-relaxed">
              Upload a PDF and create a print job in under a minute.
            </p>
            <Link href="/dashboard/upload">
              <Button variant="secondary" size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
                <Upload className="w-4 h-4" /> Upload PDF
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">How it works</h3>
            <div className="space-y-3">
              {[
                { n: "1", label: "Upload your PDF" },
                { n: "2", label: "Configure print settings" },
                { n: "3", label: "Get your QR code" },
                { n: "4", label: "Collect at the counter" },
              ].map((step) => (
                <div key={step.n} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-50 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center">
                    {step.n}
                  </div>
                  <span className="text-sm text-gray-600">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
