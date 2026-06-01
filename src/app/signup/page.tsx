"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/signup", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      const { user, token } = res.data.data;
      login(user, token);
      toast.success(`Welcome to Printly, ${user.name}!`);
      if (user.role === "OPERATOR") router.push("/operator");
      else router.push("/dashboard");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : "Signup failed";
      toast.error(message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-12 text-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Printer className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">Printly</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold mb-4">Join thousands of<br />print centers today</h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            Get started in minutes. No credit card required. 
            Free for students, powerful tools for operators.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Print Centers", value: "500+" },
              { label: "Jobs Processed", value: "1M+" },
              { label: "Students Served", value: "50K+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-blue-200 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-300 text-sm">© 2025 Printly · Secure Print Management</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Printly</span>
          </Link>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
              <p className="text-gray-500 text-sm">Start managing prints the modern way</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full name"
                type="text"
                id="signup-name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name}
                required
              />
              <Input
                label="Email address"
                type="email"
                id="signup-email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email}
                required
              />
              <Input
                label="Phone number"
                type="tel"
                id="signup-phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
              />
              <Select
                label="I am a"
                id="signup-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                options={[
                  { value: "STUDENT", label: "Student / User" },
                  { value: "OPERATOR", label: "Print Shop Operator" },
                ]}
              />
              <Input
                label="Password"
                type={showPass ? "text" : "password"}
                id="signup-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password}
                required
              />
              <Input
                label="Confirm password"
                type="password"
                id="signup-confirm-password"
                placeholder="Same as above"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword}
                required
              />
              <p className="text-xs text-gray-400">
                By creating an account, you agree to our{" "}
                <Link href="#" className="text-blue-600 hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>.
              </p>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Create account <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
