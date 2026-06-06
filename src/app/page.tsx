"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  FileText,
  BarChart3,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Zap,
  TrendingUp,
  Users
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { loginAction } from "@/lib/actions/auth";

// ─── Feature list shown on the left branding panel ───
const FEATURES = [
  { icon: Building2, label: "Vendor Management" },
  { icon: FileText, label: "RFQ Management" },
  { icon: Sparkles, label: "AI Quotation Analysis" },
  { icon: ShieldCheck, label: "Approval Workflow" },
  { icon: PackageCheck, label: "Purchase Orders" },
  { icon: BarChart3, label: "Reports & Analytics" },
];



// ─── Floating metric cards on the branding panel ───
const METRIC_CARDS = [
  { label: "Active Vendors", value: "128", icon: Users, color: "from-blue-500/20 to-blue-600/5" },
  { label: "RFQs Processed", value: "2,847", icon: FileText, color: "from-emerald-500/20 to-emerald-600/5" },
  { label: "AI Accuracy", value: "94%", icon: Sparkles, color: "from-purple-500/20 to-purple-600/5" },
  { label: "Cost Savings", value: "₹18.5L", icon: TrendingUp, color: "from-amber-500/20 to-amber-600/5" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { setUser } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginAction(email.trim().toLowerCase(), password);
      if (!res.success || !res.user) {
        setError(res.error || "Invalid credentials. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setUser(res.user);
      setSuccess(true);

      // Role-based redirect — all roles go to /dashboard which renders role-specific views
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#060609] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#060609] overflow-hidden relative">

      {/* ─── Ambient background effects ─── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-green/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/[0.02] blur-[100px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundSize: "60px 60px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* LEFT PANEL – Branding & Platform Showcase               */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative z-10 flex-col justify-between p-10 xl:p-14 overflow-hidden">

        {/* Top gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-green/[0.04] via-transparent to-blue-500/[0.02] pointer-events-none" />

        {/* ─── Logo & Tagline ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 border border-brand-green/30 shadow-[0_0_20px_rgba(74,222,128,0.1)]">
              <div className="h-3 w-3 rounded-full bg-brand-green animate-pulse" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              VendorBridge
            </span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.1] mb-4">
            AI-Powered
            <br />
            <span className="bg-gradient-to-r from-brand-green to-emerald-300 bg-clip-text text-transparent">
              Vendor Management
            </span>
          </h1>
          <p className="text-zinc-400 text-base max-w-md leading-relaxed">
            Manage vendors, RFQs, quotations, approvals, purchase orders, invoices, reports, and procurement analytics from one unified platform.
          </p>
        </motion.div>

        {/* ─── Floating Metric Cards Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 grid grid-cols-2 gap-3 my-8 max-w-lg"
        >
          {METRIC_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className={`relative rounded-xl border border-white/[0.06] bg-gradient-to-br ${card.color} backdrop-blur-sm p-4 group hover:border-white/[0.12] transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{card.label}</span>
                <card.icon className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
              <span className="text-xl font-black text-white font-mono tracking-tight">{card.value}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Features Checklist ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-10 space-y-2.5 max-w-md"
        >
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
              className="flex items-center gap-3 group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green/10 border border-brand-green/20 group-hover:border-brand-green/40 transition-colors">
                <feat.icon className="h-3.5 w-3.5 text-brand-green" />
              </div>
              <span className="text-sm text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">{feat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Bottom copyright ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="relative z-10 text-[11px] text-zinc-600 mt-6"
        >
          © 2026 VendorBridge Corp. Enterprise Procurement Platform.
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL – Authentication Card                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* ─── Glass Card Container ─── */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-[0_8px_60px_-12px_rgba(0,0,0,0.8)] overflow-hidden">

            {/* Top accent line */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-brand-green/60 to-transparent" />

            <div className="p-8 sm:p-10">

              {/* ─── Mobile Logo (shown only on small screens) ─── */}
              <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/10 border border-brand-green/30">
                  <div className="h-2 w-2 rounded-full bg-brand-green animate-pulse" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">VendorBridge</span>
              </div>

              {/* ─── Header ─── */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5">
                  Welcome Back
                </h2>
                <p className="text-sm text-zinc-500">
                  Sign in to continue managing procurement operations.
                </p>
              </div>

              {/* ─── Success State ─── */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">Login Successful</p>
                      <p className="text-xs text-emerald-400/60">Redirecting to your dashboard...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Error State ─── */}
              <AnimatePresence>
                {error && !success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2.5"
                  >
                    <Zap className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Login Form ─── */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-zinc-500" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      disabled={isSubmitting || success}
                      placeholder="you@company.com"
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/20 transition-all duration-200 disabled:opacity-50 font-sans"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-zinc-500" />
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="text-xs text-brand-green/70 hover:text-brand-green transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      disabled={isSubmitting || success}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/20 transition-all duration-200 disabled:opacity-50 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`h-4 w-4 rounded border transition-all duration-200 flex items-center justify-center shrink-0 ${
                      rememberMe
                        ? "bg-brand-green/20 border-brand-green/50"
                        : "bg-transparent border-white/[0.12] hover:border-white/[0.2]"
                    }`}
                  >
                    {rememberMe && <div className="h-1.5 w-1.5 rounded-sm bg-brand-green" />}
                  </button>
                  <span className="text-xs text-zinc-500 font-medium select-none">Remember me on this device</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="w-full py-3.5 rounded-xl bg-brand-green text-zinc-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-brand-green-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(74,222,128,0.15)] hover:shadow-[0_0_30px_rgba(74,222,128,0.25)] active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>



              {/* ─── Register Link ─── */}
              <div className="mt-7 text-center">
                <p className="text-xs text-zinc-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-brand-green/80 hover:text-brand-green font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    Create Account <ChevronRight className="h-3 w-3" />
                  </Link>
                </p>
              </div>

            </div>
          </div>

          {/* ─── Bottom Security Badge ─── */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-zinc-600">
            <Lock className="h-3 w-3" />
            <span>Secured with TLS 1.3 encryption • AES-256-GCM</span>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
