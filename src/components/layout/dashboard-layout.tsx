"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Menu, Printer } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, setUser, token } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await axios.get("/api/auth/me");
      return res.data.data;
    },
    retry: false,
    enabled: true,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  useEffect(() => {
    if (error) {
      router.push("/login");
    }
  }, [error, router]);

  useEffect(() => {
    if (data && requiredRole && !requiredRole.includes(data.role)) {
      if (data.role === "ADMIN") router.push("/admin");
      else if (data.role === "OPERATOR") router.push("/operator");
      else router.push("/dashboard");
    }
  }, [data, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Initializing Secure Session...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Mobile Sticky Header */}
        <header className="lg:hidden flex items-center justify-between px-6 h-16 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm shadow-slate-100/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-sky-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
                <Printer className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900 tracking-tight">Printly</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">
              {data?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-card-entrance">
          {children}
        </main>
      </div>
    </div>
  );
}
