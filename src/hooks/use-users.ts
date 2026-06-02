import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { User, PaginationMeta } from "@/types";

interface UseAdminUsersProps {
  search: string;
  roleFilter: string;
  page: number;
  limit?: number;
}

interface AdminUsersResponse {
  users: User[];
  total: number;
  pages: number;
}

export function useAdminUsers({ search, roleFilter, page, limit = 15 }: UseAdminUsersProps) {
  const queryClient = useQueryClient();

  const query = useQuery<AdminUsersResponse>({
    queryKey: ["admin-users", search, roleFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (roleFilter) params.set("role", roleFilter);
      if (search) params.set("search", search);
      const res = await axios.get(`/api/admin/users?${params}`);
      return res.data.data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, isActive, role }: { userId: string; isActive?: boolean; role?: string }) => {
      await axios.patch("/api/admin/users", { userId, isActive, role });
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  return {
    users: query.data?.users || [],
    pagination: {
      total: query.data?.total || 0,
      pages: query.data?.pages || 1,
    } as PaginationMeta,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updateUser: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
  };
}
