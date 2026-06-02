import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { PrintJob, PaginationMeta, Shop } from "@/types";

interface UseJobsProps {
  statusFilter?: string;
  page?: number;
  limit?: number;
}

interface JobsResponse {
  jobs: PrintJob[];
  pagination: PaginationMeta;
}

export function useJobs({ statusFilter = "", page = 1, limit = 10 }: UseJobsProps = {}) {
  const query = useQuery<JobsResponse>({
    queryKey: ["jobs", statusFilter, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (statusFilter) params.set("status", statusFilter);
      const res = await axios.get(`/api/jobs?${params}`);
      return res.data.data;
    },
  });

  return {
    jobs: query.data?.jobs || [],
    pagination: query.data?.pagination || { total: 0, pages: 1, currentPage: page } as PaginationMeta,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

interface OperatorQueueResponse {
  jobs: PrintJob[];
  shop: Shop;
}

export function useOperatorQueue(refetchInterval = 15000) {
  const queryClient = useQueryClient();

  const query = useQuery<OperatorQueueResponse>({
    queryKey: ["operator-queue"],
    queryFn: async () => {
      const res = await axios.get("/api/operator/queue");
      return res.data.data;
    },
    refetchInterval,
  });

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
      queryClient.invalidateQueries({ queryKey: ["operator-queue"] });
      queryClient.invalidateQueries({ queryKey: ["job-details", variables.jobId] });
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : "Failed to update";
      toast.error(message || "Failed to update job");
    },
  });

  return {
    jobs: query.data?.jobs || [],
    shop: query.data?.shop || null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updateJobStatus: updateJobMutation.mutateAsync,
    isUpdatingStatus: updateJobMutation.isPending,
  };
}

export function useJobDetails(jobId: string) {
  const queryClient = useQueryClient();

  const detailsQuery = useQuery<PrintJob>({
    queryKey: ["job-details", jobId],
    queryFn: async () => {
      const res = await axios.get(`/api/jobs/${jobId}`);
      return res.data.data;
    },
    enabled: !!jobId,
  });

  const qrQuery = useQuery<{ qrCodeUrl: string }>({
    queryKey: ["job-qr", jobId],
    queryFn: async () => {
      const res = await axios.get(`/api/jobs/${jobId}?qr=true`);
      return res.data.data;
    },
    enabled: !!jobId,
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ status, operatorNotes }: { status: string; operatorNotes?: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ["job-details", jobId] });
      queryClient.invalidateQueries({ queryKey: ["operator-queue"] });
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : "Failed to update";
      toast.error(message || "Failed to update job");
    },
  });

  return {
    job: detailsQuery.data || null,
    qrData: qrQuery.data || null,
    isLoading: detailsQuery.isLoading,
    isQrLoading: qrQuery.isLoading,
    isError: detailsQuery.isError,
    refetch: detailsQuery.refetch,
    updateJobStatus: updateJobMutation.mutateAsync,
    isUpdatingStatus: updateJobMutation.isPending,
  };
}
