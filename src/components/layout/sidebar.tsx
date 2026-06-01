"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/cn";
import {
  Printer,
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  Settings,
  Users,
  Store,
  LogOut,
  Bell,
  ChevronRight,
  Layers,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/dashboard/upload", label: "Upload & Print", icon: <Upload className="w-4 h-4" /> },
  { href: "/dashboard/jobs", label: "My Jobs", icon: <FileText className="w-4 h-4" /> },
];

const operatorNav: NavItem[] = [
  { href: "/operator", label: "Queue", icon: <Layers className="w-4 h-4" /> },
  { href: "/dashboard/jobs", label: "All Jobs", icon: <FileText className="w-4 h-4" /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/dashboard/jobs", label: "All Jobs", icon: <FileText className="w-4 h-4" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="w-4 h-4" /> },
  { href: "/admin/shops", label: "Shops", icon: <Store className="w-4 h-4" /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const navItems =
    user?.role === "ADMIN"
      ? adminNav
      : user?.role === "OPERATOR"
      ? operatorNav
      : studentNav;

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axios.get("/api/notifications");
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter((n: { isRead: boolean }) => !n.isRead).length || 0;

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      logout();
      router.push("/login");
      toast.success("Logged out successfully");
    } catch {
      logout();
      router.push("/login");
    }
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-45 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Logo & Close Button */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={handleLinkClick}>
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-sky-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 animate-pulse-glow">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Printly</span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  item.href !== "/operator" &&
                  item.href !== "/admin" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className={isActive ? "text-white" : "text-gray-400"}>{item.icon}</span>
                  {item.label}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                pathname === "/settings"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Settings className={cn("w-4 h-4", pathname === "/settings" ? "text-white" : "text-gray-400")} />
              Settings
            </Link>
          </div>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-gray-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center flex-shrink-0 shadow-inner">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate font-medium capitalize">
                {user?.role?.toLowerCase()}
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="flex-shrink-0 bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5 font-bold min-w-5 text-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuthStore();
  return (
    <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100/60">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100/50 cursor-pointer transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-100">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
