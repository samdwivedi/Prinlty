"use client";

import { useState } from "react";
import { use } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FileText,
  QrCode,
  Download,
  XCircle,
  Calendar,
  Store,
  Printer,
  Copy,
  Layers,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatDateTime, formatRelativeTime, formatCurrency } from "@/lib/cn";
import Image from "next/image";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [showQR, setShowQR] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const { data: jobData, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const res = await axios.get(`/api/jobs/${id}`);
      return res.data.data;
    },
  });

  const { data: qrData, isLoading: qrLoading } = useQuery({
    queryKey: ["job-qr", id],
    queryFn: async () => {
      const res = await axios.get(`/api/jobs/${id}/qr`);
      return res.data.data;
    },
    enabled: showQR,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await axios.patch(`/api/jobs/${id}`, { status: "CANCELLED" });
    },
    onSuccess: () => {
      toast.success("Job cancelled");
      setCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : "Failed to cancel";
      toast.error(message || "Failed to cancel");
    },
  });

  const downloadReceipt = () => {
    if (!jobData) return;
    const content = `
PRINTLY - PRINT RECEIPT
========================
Job #: ${jobData.jobNumber}
Date: ${formatDateTime(jobData.createdAt)}

Document: ${jobData.document?.originalName}
Copies: ${jobData.copies}
Color: ${jobData.color === "COLOR" ? "Color" : "Black & White"}
Sides: ${jobData.sides === "DOUBLE" ? "Double-sided" : "Single-sided"}
Paper: ${jobData.paperSize}

Shop: ${jobData.shop?.name}
Status: ${jobData.status}

Estimated Cost: ${formatCurrency(jobData.estimatedCost)}
${jobData.actualCost ? `Actual Cost: ${formatCurrency(jobData.actualCost)}` : ""}

========================
Thank you for using Printly!
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${jobData.jobNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded!");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const job = jobData;
  if (!job) return null;

  const canCancel = ["PENDING", "QUEUED"].includes(job.status);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/dashboard/jobs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Job #{job.jobNumber}
            </h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-gray-400 text-sm">
            Created {formatRelativeTime(job.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <Button variant="outline" size="sm" onClick={() => setCancelModal(true)}>
              <XCircle className="w-4 h-4" /> Cancel Job
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={downloadReceipt}>
            <Download className="w-4 h-4" /> Receipt
          </Button>
          <Button size="sm" onClick={() => setShowQR(true)}>
            <QrCode className="w-4 h-4" /> View QR Code
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Info */}
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Document</h2>
                <p className="text-xs text-gray-400">File details</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">File name</p>
                <p className="text-sm font-medium text-gray-900 break-words">{job.document?.originalName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Pages</p>
                <p className="text-sm font-medium text-gray-900">{job.document?.pageCount || "—"}</p>
              </div>
            </div>
          </Card>

          {/* Print Settings */}
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Printer className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Print Settings</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: <Copy className="w-4 h-4" />, label: "Copies", value: job.copies },
                { icon: <Layers className="w-4 h-4" />, label: "Color", value: job.color === "COLOR" ? "Color" : "B&W" },
                { icon: <Layers className="w-4 h-4" />, label: "Sides", value: job.sides === "DOUBLE" ? "Double" : "Single" },
                { icon: <FileText className="w-4 h-4" />, label: "Paper", value: job.paperSize },
                { icon: <FileText className="w-4 h-4" />, label: "Page Range", value: job.pageRange || "All pages" },
                { icon: <CheckCircle className="w-4 h-4" />, label: "Est. Cost", value: formatCurrency(job.estimatedCost) },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1.5">
                    {item.icon}
                    {item.label}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            {job.notes && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-700 font-medium mb-1">Notes</p>
                <p className="text-sm text-amber-900">{job.notes}</p>
              </div>
            )}
            {job.operatorNotes && (
              <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-700 font-medium mb-1">Operator Notes</p>
                <p className="text-sm text-blue-900">{job.operatorNotes}</p>
              </div>
            )}
          </Card>

          {/* Timeline */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-5">Job Timeline</h2>
            <div className="space-y-4">
              {[
                { label: "Created", time: job.createdAt, icon: <Clock className="w-4 h-4" />, color: "blue" },
                ...(job.startedAt ? [{ label: "Processing started", time: job.startedAt, icon: <Printer className="w-4 h-4" />, color: "purple" }] : []),
                ...(job.completedAt ? [{ label: "Completed", time: job.completedAt, icon: <CheckCircle className="w-4 h-4" />, color: "green" }] : []),
                ...(job.cancelledAt ? [{ label: "Cancelled", time: job.cancelledAt, icon: <XCircle className="w-4 h-4" />, color: "red" }] : []),
              ].map((event) => (
                <div key={event.label} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    event.color === "blue" ? "bg-blue-50 text-blue-600" :
                    event.color === "green" ? "bg-green-50 text-green-600" :
                    event.color === "red" ? "bg-red-50 text-red-600" :
                    "bg-purple-50 text-purple-600"
                  }`}>
                    {event.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.label}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(event.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Print Center</h2>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{job.shop?.name}</p>
              <p className="text-xs text-gray-500">{job.shop?.address}</p>
              <p className="text-xs text-gray-500">{job.shop?.phone}</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">QR Expiry</h2>
              </div>
            </div>
            <p className="text-sm text-gray-600">{formatDateTime(job.qrExpiresAt)}</p>
            <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(job.qrExpiresAt)}</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
            <QrCode className="w-8 h-8 text-blue-600 mb-3" />
            <p className="text-sm font-semibold text-gray-900 mb-1">Your QR Pickup Token</p>
            <p className="text-xs text-gray-500 mb-4">Show this at the print center counter</p>
            <Button size="sm" onClick={() => setShowQR(true)} className="w-full">
              <QrCode className="w-4 h-4" /> Show QR Code
            </Button>
          </Card>
        </div>
      </div>

      {/* QR Modal */}
      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="QR Pickup Token" size="sm">
        {qrLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : qrData ? (
          <div className="text-center">
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 inline-block mb-4">
              <Image
                src={qrData.qrDataUrl}
                alt="QR Code"
                width={240}
                height={240}
                className="block"
              />
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-2 inline-block mb-4">
              <p className="text-xs text-gray-400 mb-0.5">Job Number</p>
              <code className="text-lg font-black text-gray-900 tracking-wider">{qrData.jobNumber}</code>
            </div>
            <p className="text-xs text-gray-400">
              Expires {formatRelativeTime(qrData.expiresAt)}
            </p>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = qrData.qrDataUrl;
                  a.download = `qr-${qrData.jobNumber}.png`;
                  a.click();
                  toast.success("QR downloaded!");
                }}
              >
                <Download className="w-4 h-4" /> Save QR
              </Button>
              <Button size="sm" className="flex-1" onClick={() => setShowQR(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Print Job" size="sm">
        <p className="text-gray-600 text-sm mb-6">
          Are you sure you want to cancel this print job? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setCancelModal(false)}>
            Keep Job
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            Cancel Job
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
