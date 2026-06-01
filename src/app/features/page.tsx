"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Printer,
  Upload,
  QrCode,
  Shield,
  Zap,
  BarChart3,
  Users,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle,
  FileText,
  Lock,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    category: "For Students",
    color: "blue",
    items: [
      { icon: <Upload className="w-5 h-5" />, title: "Drag & Drop Upload", desc: "Upload PDFs instantly with real-time progress and validation. Maximum 50MB." },
      { icon: <QrCode className="w-5 h-5" />, title: "QR Pickup Token", desc: "Receive a unique QR code for each job. Show it at the counter and collect your prints." },
      { icon: <FileText className="w-5 h-5" />, title: "Job History", desc: "Track all your print jobs—pending, completed, cancelled—in one place." },
      { icon: <Smartphone className="w-5 h-5" />, title: "Mobile Friendly", desc: "Fully responsive design. Upload and check status from any device." },
    ],
  },
  {
    category: "For Print Operators",
    color: "purple",
    items: [
      { icon: <Zap className="w-5 h-5" />, title: "Live Queue Dashboard", desc: "See all pending, queued, and processing jobs in real-time. Auto-refreshes every 15 seconds." },
      { icon: <CheckCircle className="w-5 h-5" />, title: "One-Click Actions", desc: "Accept, reject, start printing, and mark complete with a single click per job." },
      { icon: <RefreshCw className="w-5 h-5" />, title: "Status Updates", desc: "Customers are notified automatically when their job status changes." },
      { icon: <Clock className="w-5 h-5" />, title: "Job Details View", desc: "See customer info, print settings, cost, and notes for every job." },
    ],
  },
  {
    category: "For Admins",
    color: "green",
    items: [
      { icon: <Users className="w-5 h-5" />, title: "User Management", desc: "Manage all students, operators and admins. Activate, deactivate, and change roles." },
      { icon: <Globe className="w-5 h-5" />, title: "Multi-Shop Support", desc: "Manage multiple print centers from a single admin dashboard." },
      { icon: <BarChart3 className="w-5 h-5" />, title: "Analytics & Reports", desc: "Track job volume, revenue trends, and printer utilization with interactive charts." },
      { icon: <Printer className="w-5 h-5" />, title: "Printer Management", desc: "Register and monitor printers across all shops, with color and duplex capabilities." },
    ],
  },
  {
    category: "Security & Privacy",
    color: "red",
    items: [
      { icon: <Shield className="w-5 h-5" />, title: "Auto-Delete", desc: "Documents are automatically deleted 7 days after printing. No files linger on shared systems." },
      { icon: <Lock className="w-5 h-5" />, title: "JWT Authentication", desc: "Secure HTTP-only cookie-based JWT sessions. No localStorage vulnerabilities." },
      { icon: <QrCode className="w-5 h-5" />, title: "QR Token Expiry", desc: "QR codes expire after 48 hours. Expired tokens are clearly flagged at verification." },
      { icon: <Users className="w-5 h-5" />, title: "Role-Based Access", desc: "Students can only see their own jobs. Operators see their shop. Admins see everything." },
    ],
  },
];

export default function FeaturesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Printly</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium text-blue-600">Features</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign In</Link>
            <Button size="sm" onClick={() => router.push("/signup")}>
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Every feature you need to<br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">modernize your print center</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Printly covers the entire print workflow from upload to delivery, with security and analytics built in.
          </p>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          {features.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-8">
                <div className={`h-px flex-1 bg-gray-100`} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-4">{section.category}</h2>
                <div className={`h-px flex-1 bg-gray-100`} />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-8">Free for students. Professional tools for operators.</p>
          <Button size="lg" onClick={() => router.push("/signup")}>
            Create your free account <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <Printer className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Printly</span>
          </Link>
          <p className="text-xs text-gray-400">© 2025 Printly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
