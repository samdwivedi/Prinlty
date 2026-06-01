"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState("profile");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await axios.get("/api/auth/me");
      return res.data.data;
    },
  });

  useEffect(() => {
    if (meData) {
      const timer = setTimeout(() => {
        setProfileForm({
          name: meData.name || "",
          phone: meData.phone || "",
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [meData]);

  const sections = [
    { key: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { key: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
    { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  ];

  const validatePassword = () => {
    const errors: Record<string, string> = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "Current password required";
    if (!passwordForm.newPassword) errors.newPassword = "New password required";
    else if (passwordForm.newPassword.length < 8) errors.newPassword = "At least 8 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = "Passwords don't match";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    toast.success("Password updated! (Demo - not actually changed)");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <DashboardLayout>
      <DashboardHeader title="Settings" subtitle="Manage your account preferences" />

      <div className="flex gap-6 max-w-4xl">
        {/* Sidebar Nav */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className={activeSection === section.key ? "text-white" : "text-gray-400"}>
                  {section.icon}
                </span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === "profile" && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{user?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
                  <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Full name"
                  id="settings-name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{meData?.email}</span>
                    <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Cannot change</span>
                  </div>
                </div>
                <Input
                  label="Phone number"
                  id="settings-phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4" />}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => toast.success("Profile saved! (Demo)")}
                >
                  <Check className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </Card>
          )}

          {activeSection === "security" && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Your account is secured</p>
                    <p className="text-xs text-blue-600 mt-0.5">Use a strong, unique password and never share it.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current password"
                  id="current-password"
                  type={showCurrentPass ? "text" : "password"}
                  placeholder="Your current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)}>
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={passwordErrors.currentPassword}
                />
                <Input
                  label="New password"
                  id="new-password"
                  type={showNewPass ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)}>
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={passwordErrors.newPassword}
                />
                <Input
                  label="Confirm new password"
                  id="confirm-password"
                  type="password"
                  placeholder="Same as above"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={passwordErrors.confirmPassword}
                />
                <Button type="submit">Update Password</Button>
              </form>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "Job status updates", desc: "Get notified when your print job status changes", enabled: true },
                  { label: "Job completion", desc: "Notification when your document is ready for pickup", enabled: true },
                  { label: "Job cancellation", desc: "Alert when a job is cancelled by operator", enabled: true },
                  { label: "Weekly summary", desc: "Weekly digest of your print activity", enabled: false },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${pref.enabled ? "bg-blue-600" : "bg-gray-200"}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${pref.enabled ? "translate-x-6" : "translate-x-1"}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button onClick={() => toast.success("Preferences saved! (Demo)")}>
                  <Check className="w-4 h-4" /> Save Preferences
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
