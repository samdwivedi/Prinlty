"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import toast from "react-hot-toast";

const demoRoles = [
  { role: "student",  label: "Student",  email: "student@printly.app",  password: "Student@123"  },
  { role: "operator", label: "Operator", email: "operator@printly.app", password: "Operator@123" },
  { role: "admin",    label: "Admin",    email: "admin@printly.app",    password: "Admin@123"    },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", form);
      const { user, token } = res.data.data;
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === "ADMIN") router.push("/admin");
      else if (user.role === "OPERATOR") router.push("/operator");
      else router.push("/dashboard");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : "Login failed";
      toast.error(msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (d: typeof demoRoles[0]) => {
    setForm({ email: d.email, password: d.password });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-12 text-white flex-shrink-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Printly</span>
        </Link>

        {/* Middle content */}
        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4 tracking-tight">
            Secure printing,<br />simplified.
          </h2>
          <p className="text-blue-100 text-base leading-relaxed mb-10 max-w-xs">
            Upload PDFs, generate QR tokens, and manage your print queue from anywhere.
          </p>
          <div className="space-y-4">
            {["Auto-delete after printing", "QR pickup tokens", "Real-time queue management", "Role-based access control"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                <span className="text-blue-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">© 2025 Printly · Secure Print Management</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Printly</span>
          </Link>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-sm text-gray-500">Sign in to your Printly account</p>
            </div>

            {/* Demo quick-login */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-3">Quick Demo Login:</p>
              <div className="flex gap-2">
                {demoRoles.map((d) => (
                  <button
                    key={d.role}
                    onClick={() => fillDemo(d)}
                    className="flex-1 text-xs bg-white border border-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 font-semibold"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                id="login-email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email}
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type={showPass ? "text" : "password"}
                id="login-password"
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password}
                required
                autoComplete="current-password"
              />
              <div className="flex justify-end -mt-1">
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Sign in <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
