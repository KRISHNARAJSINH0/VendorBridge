"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  Globe,
  MapPin,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  Clock,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { registerAction } from "@/lib/actions/auth";

// ─── Step definitions for the stepper ───
const STEPS = [
  { num: 1, label: "Personal Information", icon: User },
  { num: 2, label: "Company Information", icon: Building2 },
  { num: 3, label: "Verification", icon: ShieldCheck },
];

// ─── Vendor categories ───
const VENDOR_CATEGORIES = [
  "IT Hardware",
  "Furniture",
  "Logistics",
  "Industrial Supplies",
  "Office Equipment",
  "Stationery",
  "Other",
];

// ─── Role options ───
const ROLE_OPTIONS = [
  { value: "Vendor", label: "Vendor", desc: "Submit quotations and respond to RFQs", icon: Building2 },
  { value: "Procurement Officer", label: "Procurement Officer", desc: "Create RFQs and manage procurement", icon: FileText },
  { value: "Manager", label: "Manager", desc: "Approve requests and oversee operations", icon: ShieldCheck },
];

// ─── Success redirect sub-component ───
function SuccessRedirect({ email, role, companyName }: { email: string; role: string; companyName: string }) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = "/dashboard";
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6"
    >
      <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Account Created Successfully!</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
        Welcome to VendorBridge. Redirecting you to your dashboard...
      </p>

      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm font-semibold mb-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Redirecting in {countdown}s
      </div>

      <div className="space-y-3 text-xs text-zinc-500 bg-white/[0.02] rounded-xl p-4 border border-white/[0.06] text-left max-w-sm mx-auto mb-6">
        <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Account created for <span className="text-white font-medium">{email}</span></div>
        <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Role: <span className="text-white font-medium">{role}</span></div>
        <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Company: <span className="text-white font-medium">{companyName}</span></div>
      </div>

      {/* Progress bar */}
      <div className="max-w-sm mx-auto h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-green rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 fields
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [category, setCategory] = useState("IT Hardware");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [role, setRole] = useState("Vendor");
  const [description, setDescription] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // File uploads
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [regFile, setRegFile] = useState<File | null>(null);

  const { setUser } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Password strength meter ───
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  // ─── Step 1 validation ───
  const validateStep1 = () => {
    if (!firstName.trim()) return "First name is required";
    if (!lastName.trim()) return "Last name is required";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email";
    if (!phone.trim()) return "Phone number is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  // ─── Step 2 validation ───
  const validateStep2 = () => {
    if (!companyName.trim()) return "Company name is required";
    if (!acceptTerms) return "You must accept the Terms & Conditions";
    if (!acceptPrivacy) return "You must accept the Privacy Policy";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await registerAction({
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        password,
        role: role as any,
        vendorName: companyName,
        vendorCategory: category,
        vendorGst: gstNumber,
        vendorPhone: phone,
        vendorAddress: address,
      });

      if (!res.success || !res.user) {
        setError(res.error || "Registration failed. Please try again.");
        return;
      }

      setUser(res.user);
      setSuccess(true);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
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

  // ─── Shared input class ───
  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/20 transition-all duration-200 disabled:opacity-50 font-sans";
  const labelClass = "text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5";

  return (
    <div className="min-h-screen flex bg-[#060609] overflow-hidden relative">

      {/* ─── Ambient background ─── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-brand-green/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/[0.02] blur-[100px]" />
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
      {/* LEFT PANEL – Branding                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] relative z-10 flex-col justify-between p-10 xl:p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-green/[0.04] via-transparent to-purple-500/[0.02] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 border border-brand-green/30 shadow-[0_0_20px_rgba(74,222,128,0.1)]">
              <div className="h-3 w-3 rounded-full bg-brand-green animate-pulse" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">VendorBridge</span>
          </Link>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-[1.1] mb-4">
            Join the Procurement
            <br />
            <span className="bg-gradient-to-r from-brand-green to-emerald-300 bg-clip-text text-transparent">Ecosystem</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
            Register as a vendor, procurement officer, or manager. Get onboarded into a professional procurement platform powered by AI.
          </p>
        </motion.div>

        {/* ─── Onboarding Steps Preview ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 space-y-4 my-8"
        >
          {[
            { icon: FileText, title: "Submit Details", desc: "Provide your business and contact information" },
            { icon: ShieldCheck, title: "Verification", desc: "Our team reviews and approves within 24 hours" },
            { icon: Sparkles, title: "Start Bidding", desc: "Access RFQs, submit quotations, and win contracts" },
          ].map((item, i) => (
            <div key={item.title} className="flex items-start gap-4 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-500 group-hover:border-brand-green/30 group-hover:text-brand-green transition-all shrink-0">
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-300">{item.title}</p>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }} className="relative z-10 text-[11px] text-zinc-600">
          © 2026 VendorBridge Corp. Enterprise Procurement Platform.
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL – Registration Form                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[520px]"
        >
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-[0_8px_60px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-brand-green/60 to-transparent" />

            <div className="p-8 sm:p-10">

              {/* ─── Mobile Logo ─── */}
              <div className="flex items-center gap-2.5 mb-6 lg:hidden">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/10 border border-brand-green/30">
                    <div className="h-2 w-2 rounded-full bg-brand-green animate-pulse" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white">VendorBridge</span>
                </Link>
              </div>

              {/* ─── Header ─── */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5">Create Account</h2>
                <p className="text-sm text-zinc-500">Join VendorBridge Procurement Platform</p>
              </div>

              {/* ─── Stepper ─── */}
              {step < 3 && (
                <div className="flex items-center gap-2 mb-8">
                  {STEPS.slice(0, 2).map((s, i) => (
                    <React.Fragment key={s.num}>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        step === s.num
                          ? "bg-brand-green/10 text-brand-green border border-brand-green/20"
                          : step > s.num
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-white/[0.03] text-zinc-600 border border-white/[0.06]"
                      }`}>
                        {step > s.num ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <s.icon className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">{s.label}</span>
                        <span className="sm:hidden">Step {s.num}</span>
                      </div>
                      {i < 1 && <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* ─── Error ─── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2.5"
                  >
                    <Zap className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══════════════════════════════════════════════ */}
              {/* STEP 1 – Personal Information                   */}
              {/* ═══════════════════════════════════════════════ */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}><User className="h-3 w-3 text-zinc-500" />First Name</label>
                      <input value={firstName} onChange={(e) => { setFirstName(e.target.value); setError(""); }} placeholder="John" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Last Name</label>
                      <input value={lastName} onChange={(e) => { setLastName(e.target.value); setError(""); }} placeholder="Doe" className={inputClass} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}><Mail className="h-3 w-3 text-zinc-500" />Email Address</label>
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@company.com" className={inputClass} />
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}><Phone className="h-3 w-3 text-zinc-500" />Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setError(""); }} placeholder="+91 98765 43210" className={inputClass} />
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}><Lock className="h-3 w-3 text-zinc-500" />Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Min. 6 characters" className={`${inputClass} pr-10`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Strength meter */}
                    {password.length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : "bg-white/[0.06]"}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium">{strengthLabels[strength]}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }} placeholder="Re-enter password" className={`${inputClass} pr-10`} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3.5 rounded-xl bg-brand-green text-zinc-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-brand-green-hover transition-all duration-200 shadow-[0_0_20px_rgba(74,222,128,0.15)] hover:shadow-[0_0_30px_rgba(74,222,128,0.25)] active:scale-[0.98] cursor-pointer mt-2"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════ */}
              {/* STEP 2 – Company Information                     */}
              {/* ═══════════════════════════════════════════════ */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className={labelClass}><Briefcase className="h-3 w-3 text-zinc-500" />Register As</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLE_OPTIONS.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                            role === r.value
                              ? "bg-brand-green/10 border-brand-green/30 text-brand-green"
                              : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:border-white/[0.12]"
                          }`}
                        >
                          <r.icon className="h-4 w-4 mb-1.5" />
                          <p className="text-[11px] font-bold">{r.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}><Building2 className="h-3 w-3 text-zinc-500" />Company Name</label>
                      <input value={companyName} onChange={(e) => { setCompanyName(e.target.value); setError(""); }} placeholder="Acme Corp" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>GST Number</label>
                      <input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="22AAAAA0000A1Z5" className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Business Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                        {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}><Globe className="h-3 w-3 text-zinc-500" />Country</label>
                      <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}>State</label>
                      <input value={state} onChange={(e) => setState(e.target.value)} placeholder="Gujarat" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}><MapPin className="h-3 w-3 text-zinc-500" />City</label>
                      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ahmedabad" className={inputClass} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>Business Address</label>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Business Park, S.G. Highway" className={inputClass} />
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-2">
                    <label className={labelClass}><Upload className="h-3 w-3 text-zinc-500" />Documents (Optional)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] hover:border-brand-green/30 transition-all cursor-pointer group">
                        <Upload className="h-4 w-4 text-zinc-600 group-hover:text-brand-green mb-1.5 transition-colors" />
                        <span className="text-[10px] text-zinc-500 font-medium text-center">{gstFile ? gstFile.name : "GST Certificate"}</span>
                        <input type="file" accept=".pdf,.png,.jpg" className="hidden" onChange={(e) => e.target.files?.[0] && setGstFile(e.target.files[0])} />
                      </label>
                      <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] hover:border-brand-green/30 transition-all cursor-pointer group">
                        <Upload className="h-4 w-4 text-zinc-600 group-hover:text-brand-green mb-1.5 transition-colors" />
                        <span className="text-[10px] text-zinc-500 font-medium text-center">{regFile ? regFile.name : "Business Registration"}</span>
                        <input type="file" accept=".pdf,.png,.jpg" className="hidden" onChange={(e) => e.target.files?.[0] && setRegFile(e.target.files[0])} />
                      </label>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-1.5">
                    <label className={labelClass}>About Your Business</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us about your business and services..."
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Terms */}
                  <div className="space-y-3 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <button type="button" onClick={() => setAcceptTerms(!acceptTerms)} className={`h-4 w-4 rounded border transition-all flex items-center justify-center shrink-0 mt-0.5 ${acceptTerms ? "bg-brand-green/20 border-brand-green/50" : "bg-transparent border-white/[0.12]"}`}>
                        {acceptTerms && <div className="h-1.5 w-1.5 rounded-sm bg-brand-green" />}
                      </button>
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-400">I accept the <span className="text-brand-green/70">Terms & Conditions</span></span>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <button type="button" onClick={() => setAcceptPrivacy(!acceptPrivacy)} className={`h-4 w-4 rounded border transition-all flex items-center justify-center shrink-0 mt-0.5 ${acceptPrivacy ? "bg-brand-green/20 border-brand-green/50" : "bg-transparent border-white/[0.12]"}`}>
                        {acceptPrivacy && <div className="h-1.5 w-1.5 rounded-sm bg-brand-green" />}
                      </button>
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-400">I accept the <span className="text-brand-green/70">Privacy Policy</span></span>
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={handleBack} className="px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-zinc-400 font-semibold hover:text-white hover:border-white/[0.15] transition-all cursor-pointer flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 rounded-xl bg-brand-green text-zinc-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-brand-green-hover transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_rgba(74,222,128,0.15)] active:scale-[0.98] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</>
                      ) : (
                        <>Create Account <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════ */}
              {/* STEP 3 – Success Screen with auto-redirect       */}
              {/* ═══════════════════════════════════════════════ */}
              {step === 3 && (
                <SuccessRedirect email={email} role={role} companyName={companyName} />
              )}

              {/* ─── Login Link ─── */}
              {step < 3 && (
                <div className="mt-6 text-center">
                  <p className="text-xs text-zinc-600">
                    Already have an account?{" "}
                    <Link href="/" className="text-brand-green/80 hover:text-brand-green font-semibold transition-colors">
                      Sign In
                    </Link>
                  </p>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
