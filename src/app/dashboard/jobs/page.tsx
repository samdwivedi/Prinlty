"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/sidebar";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { SkeletonTable } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FileText, Search, ArrowRight, QrCode, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/cn";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await axios.get(`/api/jobs?${params}`);
      return res.data.data;
    },
  });

  const jobs = data?.jobs || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const filteredJobs = jobs.filter((job: { document?: { originalName: string }; jobNumber: string }) =>
    !search ||
    job.document?.originalName?.toLowerCase().includes(search.toLowerCase()) ||
    job.jobNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Print Jobs"
        subtitle={`${pagination.total} total jobs`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          id="job-search"
          placeholder="Search by filename or job number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="sm:max-w-xs"
        />
        <Select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[
            { value: "", label: "All statuses" },
            { value: "PENDING", label: "Pending" },
            { value: "QUEUED", label: "Queued" },
            { value: "PROCESSING", label: "Processing" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
          className="sm:max-w-48"
        />
      </div>

      {/* Jobs Table Wrapper */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Job #</th>
                <th className="px-6 py-4">Shop</th>
                <th className="px-6 py-4 text-center">Copies</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6">
                    <SkeletonTable rows={5} />
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No print jobs found</p>
                      <p className="text-xs text-slate-400 mt-1">Try resetting your search filters or upload a new file</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job: {
                  id: string;
                  jobNumber: string;
                  document?: { originalName: string };
                  shop?: { name: string };
                  status: string;
                  copies: number;
                  color: string;
                  sides: string;
                  createdAt: string;
                }) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 max-w-[240px]">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {job.document?.originalName || "Untitled"}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{formatRelativeTime(job.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                        {job.jobNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium truncate max-w-[150px]">
                      {job.shop?.name}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-800">
                      {job.copies}x
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {["PENDING", "QUEUED", "COMPLETED"].includes(job.status) && (
                          <Link href={`/dashboard/jobs/${job.id}?tab=qr`}>
                            <Button variant="ghost" size="sm" title="View QR Code">
                              <QrCode className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/dashboard/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm" className="group-hover:translate-x-0.5 transition-transform">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/20">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Page {pagination.page} of {pagination.pages} · {pagination.total} total jobs
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="w-8 h-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.pages}
                className="w-8 h-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
