import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface AnalyticsSummary {
  totalJobs: number;
  completedJobs: number;
  totalRevenue: number;
  jobsLast7Days: number;
}

interface DailyJobs {
  date: string;
  jobs: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyJobs: DailyJobs[];
  weeklyData: unknown[];
  statusBreakdown: Record<string, number>;
}

export function useAnalytics() {
  const query = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await axios.get("/api/analytics");
      return res.data.data;
    },
  });

  const summary = query.data?.summary || {} as Partial<AnalyticsSummary>;
  const dailyJobs = query.data?.dailyJobs?.slice(-14) || [];
  const weeklyData = query.data?.weeklyData || [];
  const statusBreakdown = query.data?.statusBreakdown || {};

  const statusPieData = Object.entries(statusBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    summary,
    dailyJobs,
    weeklyData,
    statusBreakdown,
    statusPieData,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
