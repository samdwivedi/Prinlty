"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SkeletonTable } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Store,
  Plus,
  MapPin,
  Phone,
  Printer,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminShopsPage() {
  const queryClient = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    operatorId: "",
  });

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/shops");
      return res.data.data;
    },
  });

  const { data: operators = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/users?role=OPERATOR&limit=100");
      return res.data.data.users;
    },
  });

  const createShopMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/admin/shops", form);
    },
    onSuccess: () => {
      toast.success("Print Shop created successfully");
      setCreateModal(false);
      setForm({ name: "", description: "", address: "", phone: "", email: "", operatorId: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : "Failed to create shop";
      toast.error(message || "Failed");
    },
  });

  return (
    <DashboardLayout requiredRole={["ADMIN"]}>
      <DashboardHeader title="Shop Management" subtitle={`${shops.length} print centers`} />

      <div className="flex justify-end mb-6">
        <Button onClick={() => setCreateModal(true)}>
          <Plus className="w-4 h-4" /> Add Print Shop
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <SkeletonTable rows={6} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-card-entrance">
          {shops.map((shop: {
            id: string;
            name: string;
            description: string;
            address: string;
            phone: string;
            email: string;
            isActive: boolean;
            operator?: { name: string; email: string };
            _count?: { printers: number; printJobs: number };
          }) => (
            <div
              key={shop.id}
              className="premium-card p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 border border-indigo-100/50 rounded-xl flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  {shop.isActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200/50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Inactive
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight tracking-tight">{shop.name}</h3>
                {shop.description && <p className="text-xs text-slate-400 font-medium mb-4 line-clamp-2 leading-relaxed">{shop.description}</p>}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{shop.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {shop.phone}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Operator</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{shop.operator?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Printers</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <Printer className="w-3 h-3 text-slate-400" />
                      <p className="text-xs font-extrabold text-slate-800">{shop._count?.printers || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Jobs</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-0.5">{shop._count?.printJobs || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add new shop card */}
          <button
            onClick={() => setCreateModal(true)}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-300 min-h-56 cursor-pointer"
          >
            <Plus className="w-8 h-8 text-slate-400" />
            <p className="text-sm font-bold tracking-tight">Add New Print Center</p>
          </button>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Register Print Shop" size="lg">
        <div className="space-y-4">
          <Input label="Shop Name" id="shop-name" placeholder="Campus Print Center" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Address" id="shop-address" placeholder="Block A, Main Campus" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" id="shop-phone" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input label="Email (optional)" id="shop-email" type="email" placeholder="shop@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Select
              label="Assigned Operator"
              id="shop-operator"
              value={form.operatorId}
              onChange={(e) => setForm({ ...form, operatorId: e.target.value })}
              options={[
                { value: "", label: "Select an operator..." },
                ...operators.map((op: { id: string; name: string; email: string }) => ({
                  value: op.id,
                  label: `${op.name} (${op.email})`,
                })),
              ]}
              required
            />
          </div>
          <Input label="Description (optional)" id="shop-desc" placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button
              className="flex-1"
              loading={createShopMutation.isPending}
              onClick={() => createShopMutation.mutate()}
              disabled={!form.name || !form.address || !form.phone || !form.operatorId}
            >
              Create Shop
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
