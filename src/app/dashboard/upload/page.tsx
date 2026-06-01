"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Printer,
  Copy,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  storageKey: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({
    shopId: "",
    copies: "1",
    color: "BLACK_WHITE",
    sides: "SINGLE",
    pageRange: "",
    paperSize: "A4",
    notes: "",
  });

  const { data: shops = [] } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await axios.get("/api/shops");
      return res.data.data;
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be under 50MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) {
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });
      setUploadedFile(res.data.data);
      toast.success("PDF uploaded successfully!");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : "Upload failed";
      toast.error(message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: uploading || !!uploadedFile,
  });

  const createJobMutation = useMutation({
    mutationFn: async () => {
      if (!uploadedFile || !form.shopId) throw new Error("Missing required fields");
      const res = await axios.post("/api/jobs", {
        documentId: uploadedFile.id,
        shopId: form.shopId,
        copies: parseInt(form.copies),
        color: form.color,
        sides: form.sides,
        pageRange: form.pageRange || undefined,
        paperSize: form.paperSize,
        notes: form.notes || undefined,
      });
      return res.data.data;
    },
    onSuccess: (job) => {
      toast.success("Print job created!");
      router.push(`/dashboard/jobs/${job.id}`);
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : "Failed to create print job";
      toast.error(message || "Failed to create job");
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Upload & Print"
        subtitle="Upload your PDF and configure print settings"
      />

      <div className="max-w-2xl">
        <div className="space-y-6">
          {/* Step 1: Upload */}
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h2 className="font-semibold text-gray-900">Upload your PDF</h2>
                <p className="text-xs text-gray-400">Maximum file size: 50MB</p>
              </div>
            </div>

            {!uploadedFile ? (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                  ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"}
                  ${uploading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <input {...getInputProps()} id="file-upload" />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-sm font-medium text-gray-700">Uploading... {uploadProgress}%</p>
                    <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    {isDragActive ? (
                      <p className="text-blue-600 font-medium">Drop your PDF here!</p>
                    ) : (
                      <>
                        <p className="font-medium text-gray-700 mb-1">
                          Drag & drop your PDF, or <span className="text-blue-600">click to browse</span>
                        </p>
                        <p className="text-xs text-gray-400">PDF files only · Max 50MB</p>
                      </>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.fileName}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.fileSize)}</p>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </Card>

          {/* Step 2: Configure */}
          <Card className={!uploadedFile ? "opacity-50 pointer-events-none" : ""}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${uploadedFile ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>2</div>
              <div>
                <h2 className="font-semibold text-gray-900">Configure print settings</h2>
                <p className="text-xs text-gray-400">Choose how you want your document printed</p>
              </div>
            </div>

            <div className="space-y-4">
              <Select
                label="Print Center"
                id="shop-select"
                value={form.shopId}
                onChange={(e) => setForm({ ...form, shopId: e.target.value })}
                options={[
                  { value: "", label: "Select a print center..." },
                  ...shops.map((s: { id: string; name: string; address: string }) => ({
                    value: s.id,
                    label: `${s.name} — ${s.address}`,
                  })),
                ]}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Number of copies"
                  type="number"
                  id="copies"
                  min="1"
                  max="100"
                  value={form.copies}
                  onChange={(e) => setForm({ ...form, copies: e.target.value })}
                  leftIcon={<Copy className="w-4 h-4" />}
                />
                <Select
                  label="Paper size"
                  id="paper-size"
                  value={form.paperSize}
                  onChange={(e) => setForm({ ...form, paperSize: e.target.value })}
                  options={[
                    { value: "A4", label: "A4" },
                    { value: "A3", label: "A3" },
                    { value: "Letter", label: "Letter" },
                    { value: "Legal", label: "Legal" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Print mode"
                  id="color-select"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  options={[
                    { value: "BLACK_WHITE", label: "Black & White" },
                    { value: "COLOR", label: "Color" },
                  ]}
                />
                <Select
                  label="Sides"
                  id="sides-select"
                  value={form.sides}
                  onChange={(e) => setForm({ ...form, sides: e.target.value })}
                  options={[
                    { value: "SINGLE", label: "Single-sided" },
                    { value: "DOUBLE", label: "Double-sided" },
                  ]}
                />
              </div>

              <Input
                label="Page range (optional)"
                id="page-range"
                type="text"
                placeholder="e.g. 1-5, 8, 10-12 (leave blank for all)"
                value={form.pageRange}
                onChange={(e) => setForm({ ...form, pageRange: e.target.value })}
                hint="Leave blank to print all pages"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes for operator (optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 resize-none"
                  placeholder="Any special instructions..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              onClick={() => createJobMutation.mutate()}
              loading={createJobMutation.isPending}
              disabled={!uploadedFile || !form.shopId}
              size="lg"
              className="flex-1"
            >
              <Printer className="w-4 h-4" />
              Create Print Job
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setUploadedFile(null);
                setForm({ shopId: "", copies: "1", color: "BLACK_WHITE", sides: "SINGLE", pageRange: "", paperSize: "A4", notes: "" });
              }}
            >
              Reset
            </Button>
          </div>

          {!form.shopId && uploadedFile && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Please select a print center to continue
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
