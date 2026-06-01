"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/sidebar";
import { StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Layers,
  Clock,
  Printer,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Phone,
  RefreshCw,
  ChevronRight,
  Play,
  Check,
  X,
  Calendar,
  Layers2,
  FileSpreadsheet,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/cn";
import { formatCurrency } from "@/lib/cn";

type Job = {
  id: string;
  jobNumber: string;
  status: string;
  copies: number;
  color: string;
  sides: string;
  paperSize: string;
  pageRange: string | null;
  estimatedCost: number;
  notes: string | null;
  createdAt: string;
  document?: { originalName: string; pageCount: number };
  user?: { name: string; email: string; phone: string };
  printer?: { name: string };
};

export default function OperatorPage() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<"PENDING" | "QUEUED" | "PROCESSING" | "all">("PENDING");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["operator-queue"],
    queryFn: async () => {
      const res = await axios.get("/api/operator/queue");
      return res.data.data;
    },
    refetchInterval: 15000,
  });

  const jobs: Job[] = data?.jobs || [];
  const shop = data?.shop;

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, status, operatorNotes }: { jobId: string; status: string; operatorNotes?: string }) => {
      const res = await axios.patch(`/api/jobs/${jobId}`, { status, operatorNotes });
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      const messages: Record<string, string> = {
        QUEUED: "Job accepted and queued",
        PROCESSING: "Job moved to processing",
        COMPLETED: "Job marked as complete",
        CANCELLED: "Job cancelled",
      };
      toast.success(messages[variables.status] || "Job updated");
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ["operator-queue"] });
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : "Failed to update";
      toast.error(message || "Failed to update job");
    },
  });

  const filteredJobs = activeTab === "all" ? jobs : jobs.filter((j) => j.status === activeTab);

  const counts = {
    PENDING: jobs.filter((j) => j.status === "PENDING").length,
    QUEUED: jobs.filter((j) => j.status === "QUEUED").length,
    PROCESSING: jobs.filter((j) => j.status === "PROCESSING").length,
  };

  const tabs = [
    { key: "PENDING", label: "Pending", count: counts.PENDING },
    { key: "QUEUED", label: "Queued", count: counts.QUEUED },
    { key: "PROCESSING", label: "Processing", count: counts.PROCESSING },
    { key: "all", label: "All Active", count: jobs.length },
  ] as const;

  return (
    <DashboardLayout requiredRole={["OPERATOR", "ADMIN"]}>
      <DashboardHeader
        title={shop ? `${shop.name} — Real-time Queue` : "Print Queue"}
        subtitle="Manage incoming print jobs and process files"
      />

      {/* Real-time stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Awaiting Review" value={counts.PENDING} subtitle="Pending acceptance" icon={<Clock className="w-5 h-5" />} color="orange" />
            <StatCard title="In Queue" value={counts.QUEUED} subtitle="Accepted, waiting" icon={<Layers className="w-5 h-5" />} color="blue" />
            <StatCard title="Printing Now" value={counts.PROCESSING} subtitle="Currently processing" icon={<Printer className="w-5 h-5" />} color="purple" />
            <StatCard title="Active Tickets" value={jobs.length} subtitle="Live incoming load" icon={<FileText className="w-5 h-5" />} color="green" />
          </>
        )}
      </div>

      {/* Main Queue Workspace */}
      <div className="space-y-6">
        {/* Navigation & Refresh bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50">
          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto-sync active (15s)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                toast.success("Queue refreshed");
              }}
              className="w-8 h-8 p-0"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Tickets Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-white border border-slate-100 rounded-2xl animate-pulse p-6" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-20 text-center bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No print orders in queue</h3>
            <p className="text-sm text-slate-400 max-w-sm mt-1">
              Currently there are no jobs in <span className="font-bold text-indigo-600">{activeTab.toLowerCase()}</span> status for your print shop.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all flex flex-col relative overflow-hidden group"
              >
                {/* Status Bar Indicator */}
                <div className={`h-1.5 w-full ${
                  job.status === "PENDING" ? "bg-amber-500" :
                  job.status === "QUEUED" ? "bg-blue-500" :
                  job.status === "PROCESSING" ? "bg-purple-500" : "bg-emerald-500"
                }`} />

                {/* Ticket Top Meta */}
                <div className="p-5 pb-3 flex items-start justify-between border-b border-slate-50 bg-slate-50/20">
                  <div>
                    <span className="font-mono text-xs font-black text-slate-400">TICKET</span>
                    <p className="font-mono text-sm font-bold text-slate-800">{job.jobNumber}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                {/* Ticket Body */}
                <div className="p-5 flex-1 space-y-4">
                  {/* File Name */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors" title={job.document?.originalName}>
                        {job.document?.originalName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatRelativeTime(job.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Block */}
                  <div className="p-3 bg-slate-50/50 rounded-xl space-y-1.5 border border-slate-100/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Customer Details</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[130px] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {job.user?.name}
                      </span>
                      {job.user?.phone && (
                        <a href={`tel:${job.user.phone}`} className="text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {job.user.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Print Configuration Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50/30 rounded-xl border border-slate-100/30">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Quantity</p>
                      <p className="font-bold text-slate-800">{job.copies} Copies</p>
                    </div>
                    <div className="p-2.5 bg-slate-50/30 rounded-xl border border-slate-100/30">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mode</p>
                      <p className="font-bold text-slate-800">{job.color === "COLOR" ? "Full Color" : "Black & White"}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50/30 rounded-xl border border-slate-100/30">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Layout</p>
                      <p className="font-bold text-slate-800">{job.sides === "DOUBLE" ? "Double-sided" : "Single-sided"}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50/30 rounded-xl border border-slate-100/30">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Paper / Pages</p>
                      <p className="font-bold text-slate-800 truncate">
                        {job.paperSize} · {job.document?.pageCount || 1}p
                      </p>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {job.notes && (
                    <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100/50 text-[11px] text-amber-800">
                      <span className="font-bold uppercase tracking-wider text-[9px] block mb-0.5">Customer Note:</span>
                      <p className="font-medium truncate">{job.notes}</p>
                    </div>
                  )}
                </div>

                {/* Pricing & Quick Action Footer */}
                <div className="p-5 pt-3 bg-slate-50/40 border-t border-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Charge Amount</p>
                    <p className="text-base font-extrabold text-slate-800 leading-tight">
                      {formatCurrency(job.estimatedCost)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {job.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateJobMutation.mutate({ jobId: job.id, status: "QUEUED" })}
                          loading={updateJobMutation.isPending}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateJobMutation.mutate({ jobId: job.id, status: "CANCELLED" })}
                          className="w-8 h-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {job.status === "QUEUED" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateJobMutation.mutate({ jobId: job.id, status: "PROCESSING" })}
                        className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-4"
                      >
                        <Play className="w-3.5 h-3.5" /> Print File
                      </Button>
                    )}
                    {job.status === "PROCESSING" && (
                      <Button
                        size="sm"
                        onClick={() => updateJobMutation.mutate({ jobId: job.id, status: "COMPLETED" })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Done
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedJob(job)}
                      className="w-8 h-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={`Print Job Details — #${selectedJob?.jobNumber}`}
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">File Name</p>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-bold text-slate-800 truncate" title={selectedJob.document?.originalName}>
                    {selectedJob.document?.originalName}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Total Pages</p>
                <div className="flex items-center gap-2">
                  <Layers2 className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-bold text-slate-800">{selectedJob.document?.pageCount || 1} Pages</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Customer</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-bold text-slate-800">{selectedJob.user?.name}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Phone Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-bold text-slate-800">{selectedJob.user?.phone || "—"}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                Technical Print Specifications
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-slate-700 pt-1.5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Copies</span>
                  <span className="font-bold text-slate-900">{selectedJob.copies}x</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Color Profile</span>
                  <span className="font-bold text-slate-900">{selectedJob.color === "COLOR" ? "Full Color" : "Grayscale (B&W)"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Paper / Sheet Size</span>
                  <span className="font-bold text-slate-900">{selectedJob.paperSize}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Sides Layout</span>
                  <span className="font-bold text-slate-900">{selectedJob.sides === "DOUBLE" ? "Double-Sided (Duplex)" : "Single-Sided"}</span>
                </div>
              </div>
              {selectedJob.pageRange && (
                <div className="pt-2 border-t border-slate-200/50 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Selected Page Range</span>
                  <span className="font-bold text-slate-900">{selectedJob.pageRange}</span>
                </div>
              )}
            </div>

            {selectedJob.notes && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block mb-1">Customer instructions</span>
                <p className="text-xs text-amber-900 font-semibold leading-relaxed">{selectedJob.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Estimated cost charge</p>
                <p className="text-lg font-extrabold text-slate-900">{formatCurrency(selectedJob.estimatedCost)}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedJob.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateJobMutation.mutate({ jobId: selectedJob.id, status: "QUEUED" })}
                      loading={updateJobMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      <Check className="w-4 h-4" /> Accept Order
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => updateJobMutation.mutate({ jobId: selectedJob.id, status: "CANCELLED" })}
                      className="font-bold text-xs"
                    >
                      <XCircle className="w-4 h-4" /> Reject Order
                    </Button>
                  </>
                )}
                {selectedJob.status === "QUEUED" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateJobMutation.mutate({ jobId: selectedJob.id, status: "PROCESSING" })}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs"
                  >
                    <Play className="w-4 h-4" /> Start Printing
                  </Button>
                )}
                {selectedJob.status === "PROCESSING" && (
                  <Button
                    onClick={() => updateJobMutation.mutate({ jobId: selectedJob.id, status: "COMPLETED" })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark as Done
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedJob(null)}
                  className="font-bold text-xs"
                >
                  Close Window
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
