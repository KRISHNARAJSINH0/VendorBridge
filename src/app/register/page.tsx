"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { useAuth } from "@/context/auth-context";
import { UserPlus, ArrowLeft } from "lucide-react";
import type { UserRole } from "@/lib/db";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    role: "Admin" as UserRole,
    vendorName: "", vendorCategory: "IT & Hardware",
    vendorGst: "", vendorPhone: "", vendorAddress: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await registerAction(form);
      if (!res.success || !res.user) { setError(res.error || "Registration failed"); return; }
      setUser(res.user);
      
      const role = res.user.role;
      if (role === "Admin") {
        router.push("/admin/dashboard");
      } else if (role === "Procurement Officer") {
        router.push("/procurement/dashboard");
      } else if (role === "Manager") {
        router.push("/manager/dashboard");
      } else if (role === "Vendor") {
        router.push("/vendor/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch { setError("Something went wrong."); } finally { setLoading(false); }
  };

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const inputClass = "w-full h-10 rounded-lg border border-border/40 bg-secondary/30 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-green/30 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green/10 border border-brand-green-border">
            <div className="h-2.5 w-2.5 rounded-full bg-brand-green animate-pulse" />
          </div>
          <span className="text-xl font-semibold tracking-tight">VendorBridge</span>
        </div>

        <div className="rounded-xl border border-border/40 bg-card p-8">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </Link>
          <h1 className="text-lg font-semibold mb-1">Create Account</h1>
          <p className="text-sm text-muted-foreground mb-6">Register to access VendorBridge ERP</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">First Name</label>
                <input type="text" value={form.firstName} onChange={e => set("firstName", e.target.value)} required
                  className={inputClass} placeholder="John" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Last Name</label>
                <input type="text" value={form.lastName} onChange={e => set("lastName", e.target.value)} required
                  className={inputClass} placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required
                className={inputClass} placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => set("password", e.target.value)} required minLength={6}
                className={inputClass} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value)}
                className={inputClass}>
                <option>Admin</option>
                <option>Procurement Officer</option>
                <option>Manager</option>
                <option>Vendor</option>
              </select>
            </div>

            {form.role === "Vendor" && (
              <div className="space-y-3 p-4 rounded-lg border border-brand-green-border/30 bg-brand-green/[0.02]">
                <p className="text-xs font-semibold text-brand-green">Vendor Company Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Company Name *</label>
                    <input type="text" value={form.vendorName} onChange={e => set("vendorName", e.target.value)} required
                      className={inputClass} placeholder="Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category *</label>
                    <select value={form.vendorCategory} onChange={e => set("vendorCategory", e.target.value)}
                      className={inputClass}>
                      <option>IT & Hardware</option>
                      <option>Office Infrastructure</option>
                      <option>Construction & Raw Materials</option>
                      <option>Logistics & Shipping</option>
                      <option>Industrial Equipment</option>
                      <option>IT & Software</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">GST Number *</label>
                    <input type="text" value={form.vendorGst} onChange={e => set("vendorGst", e.target.value)} required
                      className={inputClass} placeholder="22AAAAA0000A1Z5" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number *</label>
                    <input type="tel" value={form.vendorPhone} onChange={e => set("vendorPhone", e.target.value)} required
                      className={inputClass} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Business Address *</label>
                  <input type="text" value={form.vendorAddress} onChange={e => set("vendorAddress", e.target.value)} required
                    className={inputClass} placeholder="123 Business Park, City, State" />
                </div>
              </div>
            )}

            {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green-hover transition-all green-glow-button flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
              {loading ? "Creating..." : <><UserPlus className="h-4 w-4" /> Create Account</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
