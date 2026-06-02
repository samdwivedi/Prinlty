"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Printer,
  ArrowRight,
  Upload,
  QrCode,
  Shield,
  Zap,
  BarChart3,
  CheckCircle,
  Star,
  Users,
  ChevronRight,
  Play,
  Check,
  Plus,
  Minus,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const features = [
  {
    icon: <Upload className="w-5 h-5" />,
    title: "Drag & Drop Upload",
    description: "Upload any PDF instantly. Real-time progress tracking and automatic file validation.",
    color: "blue",
  },
  {
    icon: <QrCode className="w-5 h-5" />,
    title: "QR Pickup Tokens",
    description: "Get a unique QR code for each print job. Walk in, scan, and collect — no waiting.",
    color: "cyan",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Auto-Delete Security",
    description: "Documents are automatically deleted after printing. Your files never stay on shared machines.",
    color: "green",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Live Queue Management",
    description: "Operators see real-time job queues, accept or reject jobs, and mark them complete instantly.",
    color: "purple",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Analytics Dashboard",
    description: "Track revenue, printer utilization, and job trends with beautiful interactive charts.",
    color: "orange",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Multi-Role Access",
    description: "Separate dashboards for students, print operators, and admins with role-based access.",
    color: "pink",
  },
];

const iconColors: Record<string, string> = {
  blue:   "bg-indigo-50 text-indigo-600 border border-indigo-100/40",
  cyan:   "bg-sky-50 text-sky-600 border border-sky-100/40",
  green:  "bg-emerald-50 text-emerald-600 border border-emerald-100/40",
  purple: "bg-purple-50 text-purple-600 border border-purple-100/40",
  orange: "bg-amber-50 text-amber-600 border border-amber-100/40",
  pink:   "bg-pink-50 text-pink-600 border border-pink-100/40",
};

const steps = [
  { n: "01", title: "Upload Your PDF",     desc: "Drag & drop or browse. Auto-validation and secure storage." },
  { n: "02", title: "Configure & Submit",  desc: "Choose copies, color, paper size, and select a print center." },
  { n: "03", title: "Get Your QR Token",   desc: "Receive a unique QR code with an expiry time." },
  { n: "04", title: "Collect & Done",      desc: "Walk in, show QR code, collect prints. File auto-deleted after." },
];

const testimonials = [
  { name: "Dr. Meera Krishnan", role: "IT Head, Anna University",    text: "Printly transformed our campus print experience. Students love the QR pickup system and we've eliminated document security risks.", rating: 5, category: "institution" },
  { name: "Rahul Nair",         role: "Print Shop Owner, Bangalore", text: "The queue management dashboard is incredible. I can handle 3× more jobs with the same staff. Revenue up 40%.",               rating: 5, category: "operator" },
  { name: "Priya Sharma",       role: "College Student",             text: "No more WhatsApp file sharing and awkward waits at the counter. QR pickup is brilliant!",                                         rating: 5, category: "student" },
];

const plans = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    desc: "Perfect for students",
    features: ["5 print jobs/month", "PDF upload up to 10 MB", "QR pickup tokens", "Job history"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₹499",
    period: "/month",
    desc: "For print shop operators",
    features: ["Unlimited print jobs", "Live queue dashboard", "Analytics & reports", "Multi-printer support", "Priority support"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For institutions & chains",
    features: ["Everything in Pro", "Custom branding", "API access", "SLA guarantee", "Dedicated support"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  { q: "Is Printly really free for students?", a: "Yes, completely free forever. Students pay nothing — the print shop operator covers the service subscription cost." },
  { q: "Can I use Printly with any print shop?", a: "Only if the print shop is registered with Printly. If your campus xerox center is not on Printly, tell them to get started for free!" },
  { q: "What happens to my uploaded files?", a: "Files are automatically and permanently deleted from our database and storage 7 days after printing. Your security is our priority." },
  { q: "Is payment secure?", a: "All transactions are fully encrypted. We support UPI, credit cards, and campus wallets through secured gatekeepers." },
];

export default function HomePage() {
  const router = useRouter();

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Testimonial Filter
  const [activeTestimonialTab, setActiveTestimonialTab] = useState<string>("all");

  // Print Simulator State
  const [simPages, setSimPages] = useState(12);
  const [simCopies, setSimCopies] = useState(2);
  const [simColorMode, setSimColorMode] = useState<"BW" | "COLOR">("BW");
  const [simPaperSize, setSimPaperSize] = useState<"A4" | "A3">("A4");
  const [simSides, setSimSides] = useState<"SINGLE" | "DOUBLE">("DOUBLE");
  const [simulating, setSimulating] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  // Dynamic cost calculation logic
  const getSimPrice = () => {
    const pageCost = simColorMode === "COLOR" ? 10 : 2;
    const baseTotal = simPages * pageCost * simCopies;
    const discount = simSides === "DOUBLE" ? 0.85 : 1; // 15% discount for duplex
    const sizeMultiplier = simPaperSize === "A3" ? 1.5 : 1;
    return Math.round(baseTotal * discount * sizeMultiplier);
  };

  const handleSimulatePrint = () => {
    setSimulating(true);
    setGeneratedToken(null);
    setTimeout(() => {
      setSimulating(false);
      setGeneratedToken(`PL-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1200);
  };

  const filteredTestimonials = activeTestimonialTab === "all"
    ? testimonials
    : testimonials.filter(t => t.category === activeTestimonialTab);

  return (
    <div className="min-h-screen bg-slate-50/30 font-sans">

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm shadow-slate-100/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-sky-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 animate-pulse-glow">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Printly</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
            <Link href="#simulator" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Playground</Link>
            <Link href="#pricing"  className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/login"    className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Sign In</Link>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100" onClick={() => router.push("/signup")}>
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-indigo-50/40 via-white to-white overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100/60 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full animate-fade-up">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              Secure Release & Queue Control
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Secure printing, <br />
              <span className="gradient-text-indigo">reimagined.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Stop sending sensitive PDFs over WhatsApp. Upload documents securely, customize specs, scan a **QR pickup token**, and get prints instantly. 
              Auto-deleted for absolute privacy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 w-full sm:w-auto" onClick={() => router.push("/signup")}>
                Start Printing for Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link href="#simulator">
                <Button size="lg" variant="outline" className="border-slate-200 hover:bg-slate-50 w-full sm:w-auto">
                  <Play className="w-4 h-4 mr-2 text-indigo-600" /> Try Simulator
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Free for Students</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Instant QR Pickups</span>
            </div>
          </div>

          {/* Right Column Image Representation */}
          <div className="lg:col-span-6 flex justify-center relative animate-fade-in delay-200">
            {/* Soft decorative glow behind image */}
            <div className="absolute w-[80%] h-[80%] bg-gradient-to-tr from-indigo-200 to-sky-200 blur-3xl opacity-35 rounded-full -z-10" />
            <div className="premium-card p-2 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl hover:-translate-y-1 transition-transform max-w-md sm:max-w-lg border border-slate-100">
              <Image
                src="/hero_illustration.png"
                alt="Printly Smart Printing Platform Illustration"
                width={600}
                height={400}
                className="rounded-xl w-full object-cover shadow-sm"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Interactive Playground (Simulator) ────────────────── */}
      <section id="simulator" className="py-20 px-6 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Interactive Demo</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Print Configurator Simulator</h2>
            <p className="text-slate-500 mt-1 max-w-md mx-auto">Tweak settings, watch the pricing update in real time, and simulate generating a secure QR token.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Input Config Panel */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* 1. Pages Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Number of Pages</label>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{simPages} Pages</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={simPages}
                    onChange={(e) => setSimPages(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                  />
                </div>

                {/* 2. Copies Counters */}
                <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Number of Copies</label>
                    <span className="text-[11px] text-slate-400 font-medium">Multiplies print batches</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSimCopies(Math.max(1, simCopies - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all text-slate-600 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-sm text-slate-800 w-6 text-center">{simCopies}</span>
                    <button
                      onClick={() => setSimCopies(Math.min(50, simCopies + 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all text-slate-600 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Color Mode & Size Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Color vs B&W Selector */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Print Mode</span>
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/20">
                      <button
                        onClick={() => setSimColorMode("BW")}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                          simColorMode === "BW" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        B&W (₹2/p)
                      </button>
                      <button
                        onClick={() => setSimColorMode("COLOR")}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                          simColorMode === "COLOR" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Color (₹10/p)
                      </button>
                    </div>
                  </div>

                  {/* Sides Select */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Layout Duplex</span>
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/20">
                      <button
                        onClick={() => setSimSides("SINGLE")}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                          simSides === "SINGLE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        1-Sided
                      </button>
                      <button
                        onClick={() => setSimSides("DOUBLE")}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                          simSides === "DOUBLE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Duplex (Save 15%)
                      </button>
                    </div>
                  </div>

                </div>

                {/* Paper Size selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paper Size Selection</span>
                  <div className="flex gap-2">
                    {["A4", "A3"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSimPaperSize(size as "A4" | "A3")}
                        className={`flex-1 py-2 text-xs font-bold border rounded-xl transition-all ${
                          simPaperSize === size
                            ? "bg-white border-indigo-600 text-indigo-600 shadow-md shadow-indigo-50"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {size} Sheet
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="pt-6 border-t border-slate-50 mt-6">
                <Button
                  onClick={handleSimulatePrint}
                  disabled={simulating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {simulating ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Calculating Queue Release...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <QrCode className="w-4 h-4" /> Simulate Secure Print Release
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Simulated Live Ticket Output */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
              {/* Background visual graphics */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">LIVE CALCULATION</span>
                    <h3 className="font-mono text-sm font-bold text-slate-100">SIMULATED_ORDER</h3>
                  </div>
                  <span className="bg-indigo-500/25 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Virtual Shop
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-indigo-200 font-semibold">Total Price Estimation:</span>
                    <span className="text-3xl font-black text-white tracking-tight">₹{getSimPrice()}</span>
                  </div>

                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Config Summary</p>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs font-semibold text-slate-200">
                      <div>Mode: <span className="font-bold text-white">{simColorMode === "COLOR" ? "Full Color" : "B&W"}</span></div>
                      <div>Layout: <span className="font-bold text-white">{simSides === "DOUBLE" ? "Duplex" : "Simplex"}</span></div>
                      <div>Size: <span className="font-bold text-white">{simPaperSize}</span></div>
                      <div>Volume: <span className="font-bold text-white">{simPages * simCopies} sheets</span></div>
                    </div>
                  </div>
                </div>

                {/* Animated QR Code output */}
                <div className="border-t border-white/10 pt-4 flex flex-col items-center justify-center">
                  {generatedToken ? (
                    <div className="bg-white p-4 rounded-2xl shadow-xl text-center space-y-2.5 animate-card-entrance">
                      <div className="w-32 h-32 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 mx-auto">
                        <QrCode className="w-20 h-20 text-indigo-950" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Print Code</p>
                        <p className="text-sm font-black text-indigo-600 font-mono leading-none mt-1">{generatedToken}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 space-y-3">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                        <QrCode className="w-8 h-8 text-white/40" />
                      </div>
                      <p className="text-xs font-medium max-w-[200px] mx-auto leading-relaxed">
                        Adjust config parameters and trigger the print release to simulate a secure pickup ticket.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-indigo-300/40 text-center font-mono mt-6 relative z-10">
                Printly Simulator v1.0 · Secured Session
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Core Values</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Everything you need to run a modern print center
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed mt-2">
              From secure document upload to automated garbage cleaning, Printly structures the entire campus xerox workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-3xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/30 transition-all duration-300 cursor-default"
              >
                <div className={`w-10 h-10 ${iconColors[f.color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Workflow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Four Simple Steps</h2>
            <p className="text-slate-500 mt-1">From file upload to hand collection in under two minutes</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <div key={step.n} className="relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100/30">
                <div className="text-4xl font-black text-indigo-100 leading-none mb-3 select-none font-mono">{step.n}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-10 -right-4 text-slate-300 w-5 h-5 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Reviews</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Loved by students & operators</h2>
          </div>

          {/* Testimonial Tabs */}
          <div className="flex justify-center gap-1.5 mb-10 p-1 bg-slate-100 rounded-xl max-w-sm mx-auto">
            {["all", "student", "operator", "institution"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTestimonialTab(tab)}
                className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTestimonialTab === tab
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/10"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {filteredTestimonials.map((t) => (
              <div key={t.name} className="p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-md transition-all animate-card-entrance">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-xs font-semibold leading-relaxed mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white text-xs font-black">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{t.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Subscriptions</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-slate-500 mt-1">Start for free. Scale your print business as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md"
                }`}
              >
                <div className="mb-6">
                  <h3 className={`text-base font-bold mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mb-4 ${plan.highlighted ? "text-indigo-200" : "text-slate-400"}`}>
                    {plan.desc}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm font-semibold ${plan.highlighted ? "text-indigo-200" : "text-slate-400"}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-xs font-semibold">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? "text-sky-300" : "text-indigo-500"}`} />
                      <span className={plan.highlighted ? "text-indigo-100" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? "secondary" : "outline"}
                  className={`w-full font-bold ${plan.highlighted ? "bg-white text-indigo-600 hover:bg-slate-50" : ""}`}
                  onClick={() => router.push("/signup")}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive FAQs ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">FAQ Accordion</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-indigo-600 hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base leading-tight">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-40 border-t border-slate-50 p-5 bg-slate-50/30" : "max-h-0"
                    }`}
                  >
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-bg-indigo rounded-3xl p-12 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 animate-float">
              <Printer className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3 tracking-tight relative z-10">
              Ready to modernize your print center?
            </h2>
            <p className="text-indigo-100 mb-8 leading-relaxed max-w-md mx-auto text-sm font-semibold relative z-10">
              Join hundreds of institutions already using Printly. Setup takes 5 minutes and it&apos;s free to start.
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/signup")}
              className="bg-white text-indigo-600 hover:bg-slate-50 font-bold px-8 shadow-lg relative z-10"
            >
              Get Started for Free <ArrowRight className="w-4 h-4 ml-1.5 animate-hover-lift" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-10 px-6 bg-slate-50/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-sky-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
              <Printer className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-sm">Printly</span>
          </Link>
          <div className="flex items-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Link href="#features" className="hover:text-slate-700 transition-colors">Features</Link>
            <Link href="#simulator" className="hover:text-slate-700 transition-colors">Playground</Link>
            <Link href="#pricing"  className="hover:text-slate-700 transition-colors">Pricing</Link>
          </div>
          <p className="text-xs text-slate-400 font-semibold">© 2026 Printly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
