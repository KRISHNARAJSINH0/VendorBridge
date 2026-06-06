"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { useAuth } from "@/context/auth-context";
import { LogIn, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginAction(email, password);
      if (!res.success || !res.user) { setError(res.error || "Login failed"); return; }
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


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green/10 border border-brand-green-border">
            <div className="h-2.5 w-2.5 rounded-full bg-brand-green animate-pulse" />
          </div>
          <span className="text-xl font-semibold tracking-tight">VendorBridge</span>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border/40 bg-card p-8">
          <h1 className="text-lg font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your procurement dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full h-10 rounded-lg border border-border/40 bg-secondary/30 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/40 transition-all"
                placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full h-10 rounded-lg border border-border/40 bg-secondary/30 px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/40 transition-all"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-green-hover transition-all green-glow-button flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? "Signing in..." : <><LogIn className="h-4 w-4" /> Sign In</>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/register" className="text-xs text-brand-green hover:underline inline-flex items-center gap-1">
              New user? Create account <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Quick login roles */}
        <div className="mt-6 rounded-xl border border-border/40 bg-card/50 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Quick Sign In Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Admin", email: "admin@vendorbridge.com", pw: "admin123" },
              { label: "Procurement", email: "rahul@vendorbridge.com", pw: "rahul123" },
              { label: "Manager", email: "amit@vendorbridge.com", pw: "amit123" },
              { label: "Vendor (Dell)", email: "dell@vendor.com", pw: "dell123" },
            ].map(acc => (
              <button key={acc.email} type="button" onClick={() => { setEmail(acc.email); setPassword(acc.pw); }}
                className="text-left p-2.5 rounded-lg border border-border/40 hover:bg-secondary/40 hover:border-brand-green/30 transition-all text-xs cursor-pointer">
                <span className="font-medium text-foreground">{acc.label}</span>
                <span className="block text-muted-foreground text-[10px] mt-0.5">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
