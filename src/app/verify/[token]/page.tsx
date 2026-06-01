"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Printer, CheckCircle, Clock, XCircle, QrCode, AlertTriangle } from "lucide-react";
import { formatDateTime } from "@/lib/cn";
import { formatCurrency } from "@/lib/cn";
import { StatusBadge } from "@/components/ui/badge";

export default function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["verify", token],
    queryFn: async () => {
      const res = await axios.get(`/api/verify/${token}`);
      return res.data.data;
    },
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Printly</span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">QR Token Verification</p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Verifying QR token...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Invalid QR Code</h2>
            <p className="text-gray-500 text-sm">This QR code is invalid or has already been used.</p>
          </div>
        ) : data ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className={`p-6 text-center ${data.isExpired ? "bg-red-50" : "bg-green-50"}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${data.isExpired ? "bg-red-100" : "bg-green-100"}`}>
                {data.isExpired ? (
                  <XCircle className="w-8 h-8 text-red-500" />
                ) : data.job.status === "COMPLETED" ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <QrCode className="w-8 h-8 text-green-600" />
                )}
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {data.isExpired ? "QR Code Expired" : "Valid Print Job"}
              </h2>
              <StatusBadge status={data.job.status} />
              {data.isExpired && (
                <p className="text-red-500 text-xs mt-2">Expired {formatDateTime(data.expiresAt)}</p>
              )}
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center mb-2">
                <p className="text-xs text-gray-400 mb-1">Job Number</p>
                <code className="text-2xl font-black text-gray-900 tracking-wider">{data.job.jobNumber}</code>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Document</p>
                  <p className="text-sm font-medium text-gray-900 break-words">{data.job.document?.originalName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Pages</p>
                  <p className="text-sm font-medium text-gray-900">{data.job.document?.pageCount || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Customer</p>
                  <p className="text-sm font-medium text-gray-900">{data.job.user?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Copies</p>
                  <p className="text-sm font-medium text-gray-900">{data.job.copies}x {data.job.color === "COLOR" ? "Color" : "B&W"}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-1">Print Center</p>
                <p className="text-sm font-semibold text-gray-900">{data.job.shop?.name}</p>
                <p className="text-xs text-gray-400">{data.job.shop?.address}</p>
              </div>

              {!data.isExpired && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <p className="text-xs font-medium text-blue-700">Cost Estimate</p>
                  </div>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(data.job.estimatedCost)}</p>
                  {data.job.actualCost && (
                    <p className="text-xs text-blue-600">Actual: {formatCurrency(data.job.actualCost)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <Link href="/" className="text-blue-600">Printly</Link>
        </p>
      </div>
    </div>
  );
}
