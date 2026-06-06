"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getVendorByIdAction, updateVendorAction } from "@/lib/actions/vendor";
import { Vendor } from "@/lib/db";
import { User, ShieldAlert, Save, Building, Star, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", category: "", gstNumber: "", contactPhone: "", address: "" });

  const loadVendor = async () => {
    if (!user?.vendorId) {
      setLoading(false);
      return;
    }
    try {
      const v = await getVendorByIdAction(user.vendorId);
      if (v) {
        setVendor(v);
        setForm({
          name: v.name,
          category: v.category,
          gstNumber: v.gstNumber,
          contactPhone: v.contactPhone,
          address: v.address || "",
        });
      }
    } catch {
      toast.error("Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    try {
      await updateVendorAction(vendor.id, {
        name: form.name,
        category: form.category,
        gstNumber: form.gstNumber,
        contactPhone: form.contactPhone,
        address: form.address,
      });
      toast.success("Profile saved successfully");
      loadVendor();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (!user || user.role !== "Vendor") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4 animate-bounce" />
        <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Only vendor accounts can view and manage supplier profiles here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Supplier Profile</h2>
        <p className="text-xs text-muted-foreground font-light">Verify company registration values, contact numbers, and compliance scores.</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-xl bg-secondary/20 animate-pulse border border-border/20" />
      ) : vendor ? (
        <div className="space-y-6">
          {/* Status badge and score */}
          <div className="rounded-xl border border-border/40 bg-card p-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-green-muted/20 border border-brand-green-border/30 flex items-center justify-center text-brand-green">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{vendor.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Supplier Partner ID: {vendor.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground block font-medium uppercase">Verification Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1">
                  <CheckCircle className="h-3 w-3" /> {vendor.status}
                </span>
              </div>
              <div className="text-center border-l border-border/40 pl-6">
                <span className="text-[10px] text-muted-foreground block font-medium uppercase">Rating index</span>
                <div className="flex items-center gap-1 mt-1 font-mono font-semibold text-sm justify-center">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span>{vendor.rating || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile form */}
          <form onSubmit={handleSave} className="rounded-xl border border-border/40 bg-card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs font-semibold">Company Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="bg-secondary/40 h-9 text-xs" />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs font-semibold">Category Type *</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required className="bg-secondary/40 h-9 text-xs" />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs font-semibold">GST Registration *</Label>
                <Input value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))} required className="bg-secondary/40 h-9 text-xs" />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs font-semibold">Contact Phone Number *</Label>
                <Input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} required className="bg-secondary/40 h-9 text-xs" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-semibold">Corporate Address</Label>
                <Textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="bg-secondary/40 text-xs min-h-[70px]" />
              </div>
            </div>

            <Button type="submit" className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-9">
              <Save className="h-4 w-4 mr-1" /> Save Supplier Details
            </Button>
          </form>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-10">No vendor link found for your account.</p>
      )}
    </div>
  );
}
