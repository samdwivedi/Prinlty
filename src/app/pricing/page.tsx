"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Student",
    price: "Free",
    period: "Forever",
    desc: "Everything a student needs for campus printing",
    features: [
      "Unlimited print job requests",
      "PDF upload up to 50MB",
      "QR pickup tokens",
      "Job history & tracking",
      "Email notifications",
      "Receipt downloads",
    ],
    cta: "Get started free",
    highlighted: false,
    badge: null,
  },
  {
    name: "Operator",
    price: "₹999",
    period: "/month",
    desc: "For print shop operators managing a center",
    features: [
      "Everything in Student",
      "Live queue dashboard",
      "Real-time job management",
      "Accept/reject job controls",
      "Analytics & revenue reports",
      "Multi-printer support",
      "Customer notifications",
      "Priority email support",
    ],
    cta: "Start 14-day free trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Institution",
    price: "₹4,999",
    period: "/month",
    desc: "For colleges with multiple print centers",
    features: [
      "Everything in Operator",
      "Unlimited print shops",
      "Advanced analytics",
      "Custom branding",
      "SSO / LDAP integration",
      "API access",
      "SLA guarantee (99.9%)",
      "Dedicated account manager",
      "Priority phone support",
    ],
    cta: "Contact sales",
    highlighted: false,
    badge: null,
  },
];

const faqs = [
  { q: "Is Printly really free for students?", a: "Yes, completely free forever. Students pay nothing — the print shop operator covers the cost." },
  { q: "Can I use Printly with any print shop?", a: "Only if the print shop has signed up for Printly. Ask your campus print center to join!" },
  { q: "What happens to my uploaded files?", a: "Files are automatically deleted 7 days after printing. You can also request immediate deletion." },
  { q: "Can I cancel my subscription anytime?", a: "Yes, no lock-ins. Cancel anytime and your data will be retained for 30 days." },
  { q: "Do you offer discounts for educational institutions?", a: "Yes! We offer special pricing for verified educational institutions. Contact our sales team." },
];

export default function PricingPage() {
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
            <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-blue-600">Pricing</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign In</Link>
            <Button size="sm" onClick={() => router.push("/signup")}>Get Started <ArrowRight className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">
          Free for students. Affordable for operators. Enterprise-ready for institutions.
        </p>
      </section>

      {/* Plans */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.highlighted
                  ? "bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-200 scale-105"
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? "text-blue-200" : "text-gray-400"}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-blue-200" : "text-gray-400"}`}>{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-cyan-300" : "text-blue-500"}`} />
                    <span className={plan.highlighted ? "text-blue-100" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlighted ? "secondary" : "outline"}
                className={`w-full ${plan.highlighted ? "bg-white text-blue-600 hover:bg-blue-50" : ""}`}
                onClick={() => router.push("/signup")}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
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
