"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/sidebar";
import { useAdminUsers } from "@/hooks/use-users";
import { UserFilterBar } from "./_components/UserFilterBar";
import { UserTable } from "./_components/UserTable";
import { UserActionModal } from "./_components/UserActionModal";
import { User } from "@/types";

type ActionType = "activate" | "deactivate" | "make-admin" | "";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actionModal, setActionModal] = useState<{ user: User | null; action: ActionType }>({
    user: null,
    action: "",
  });

  const {
    users,
    pagination,
    isLoading,
    updateUser,
    isUpdating,
  } = useAdminUsers({
    search,
    roleFilter,
    page,
  });

  const handleSelectAction = (user: User, action: ActionType) => {
    setActionModal({ user, action });
  };

  const handleCloseModal = () => {
    setActionModal({ user: null, action: "" });
  };

  const handleConfirmAction = async () => {
    const { user, action } = actionModal;
    if (!user || !action) return;

    try {
      if (action === "deactivate") {
        await updateUser({ userId: user.id, isActive: false });
      } else if (action === "activate") {
        await updateUser({ userId: user.id, isActive: true });
      } else if (action === "make-admin") {
        await updateUser({ userId: user.id, role: "ADMIN" });
      }
      handleCloseModal();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <DashboardLayout requiredRole={["ADMIN"]}>
      <DashboardHeader title="User Management" subtitle={`${pagination.total} registered users`} />

      <UserFilterBar
        search={search}
        setSearch={(val) => { setSearch(val); setPage(1); }}
        roleFilter={roleFilter}
        setRoleFilter={(val) => { setRoleFilter(val); setPage(1); }}
      />

      <UserTable
        users={users}
        pagination={pagination}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        onSelectAction={handleSelectAction}
      />

      <UserActionModal
        user={actionModal.user}
        action={actionModal.action}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        isPending={isUpdating}
      />
    </DashboardLayout>
  );
}
