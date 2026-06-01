"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SkeletonTable } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { formatDate } from "@/lib/cn";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actionModal, setActionModal] = useState<{ user: { id: string; name: string; isActive: boolean; role: string } | null; action: string }>({ user: null, action: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "15" });
      if (roleFilter) params.set("role", roleFilter);
      if (search) params.set("search", search);
      const res = await axios.get(`/api/admin/users?${params}`);
      return res.data.data;
    },
    debounce: 300,
  } as Parameters<typeof useQuery>[0]);

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, isActive, role }: { userId: string; isActive?: boolean; role?: string }) => {
      await axios.patch("/api/admin/users", { userId, isActive, role });
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      setActionModal({ user: null, action: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Failed to update user"),
  });

  const users = data?.users || [];
  const pagination = { total: data?.total || 0, pages: data?.pages || 1 };

  const roleColors: Record<string, "info" | "warning" | "danger"> = {
    STUDENT: "info",
    OPERATOR: "warning",
    ADMIN: "danger",
  };

  return (
    <DashboardLayout requiredRole={["ADMIN"]}>
      <DashboardHeader title="User Management" subtitle={`${pagination.total} registered users`} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          id="user-search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="w-4 h-4" />}
          className="sm:max-w-xs"
        />
        <Select
          id="role-filter"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          options={[
            { value: "", label: "All roles" },
            { value: "STUDENT", label: "Students" },
            { value: "OPERATOR", label: "Operators" },
            { value: "ADMIN", label: "Admins" },
          ]}
          className="sm:max-w-40"
        />
      </div>

      {/* Users table wrapper */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50 overflow-hidden animate-card-entrance">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Jobs Submitted</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6">
                    <SkeletonTable rows={8} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                        <Users className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No users found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adapting your search filters or page queries</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user: {
                  id: string;
                  name: string;
                  email: string;
                  role: string;
                  isActive: boolean;
                  createdAt: string;
                  _count?: { printJobs: number };
                }) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0 max-w-[240px]">
                          <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={roleColors[user.role] || "default"}>
                        {user.role === "ADMIN" && <Shield className="w-3 h-3 mr-1 text-rose-500" />}
                        {user.role === "OPERATOR" && <Users className="w-3 h-3 mr-1 text-amber-500" />}
                        {user.role === "STUDENT" && <Users className="w-3 h-3 mr-1 text-sky-500" />}
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                      {user._count?.printJobs || 0}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${user.isActive ? "text-green-700 bg-green-50 border border-green-200/50" : "text-rose-700 bg-rose-50 border border-rose-200/50"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500 animate-pulse" : "bg-rose-500"}`} />
                        {user.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left group">
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </Button>
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-100 shadow-lg py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          {user.isActive ? (
                            <button
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                              onClick={() => setActionModal({ user, action: "deactivate" })}
                            >
                              <UserX className="w-4 h-4" /> Deactivate User
                            </button>
                          ) : (
                            <button
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-green-600 hover:bg-green-50 transition-colors text-left"
                              onClick={() => setActionModal({ user, action: "activate" })}
                            >
                              <UserCheck className="w-4 h-4" /> Activate User
                            </button>
                          )}
                          {user.role !== "ADMIN" && (
                            <button
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors text-left"
                              onClick={() => setActionModal({ user, action: "make-admin" })}
                            >
                              <Shield className="w-4 h-4" /> Make Administrator
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Block */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/20">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Page {page} of {pagination.pages} · {pagination.total} registered users
            </p>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1} className="w-8 h-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= pagination.pages} className="w-8 h-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!actionModal.user}
        onClose={() => setActionModal({ user: null, action: "" })}
        title="Access Level Configuration"
        size="sm"
      >
        {actionModal.user && (
          <div className="space-y-5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Confirm selection for:</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{actionModal.user.name}</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {actionModal.action === "deactivate" && "Deactivating this profile locks out their account. They will instantly lose print and queue management privileges."}
              {actionModal.action === "activate" && "Activating this user profile immediately restores all features and dashboard portal accessibility."}
              {actionModal.action === "make-admin" && "Promoting to administrator gives full database write/delete, printer setup, and financial analytics powers."}
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setActionModal({ user: null, action: "" })}>
                Go Back
              </Button>
              <Button
                variant={actionModal.action === "deactivate" ? "danger" : "primary"}
                className="flex-1"
                loading={updateUserMutation.isPending}
                onClick={() => {
                  if (!actionModal.user) return;
                  if (actionModal.action === "deactivate") {
                    updateUserMutation.mutate({ userId: actionModal.user.id, isActive: false });
                  } else if (actionModal.action === "activate") {
                    updateUserMutation.mutate({ userId: actionModal.user.id, isActive: true });
                  } else if (actionModal.action === "make-admin") {
                    updateUserMutation.mutate({ userId: actionModal.user.id, role: "ADMIN" });
                  }
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
