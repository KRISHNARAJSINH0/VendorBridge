"use client";

import { useAuth } from "@/context/auth-context";
import { resetDbAction } from "@/lib/actions/workflow";
import { Settings, ShieldAlert, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user || user.role !== "Admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4 animate-bounce" />
        <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Only system administrators are authorized to update platform settings.
        </p>
      </div>
    );
  }

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset the database to default seed data? All custom users, RFQs, POs, and invoices will be lost.")) return;
    try {
      await resetDbAction();
      toast.success("Database restored to seed data successfully");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      toast.error("Failed to reset database");
    }
  };

  const handleSaveSettings = () => {
    toast.success("Platform configurations updated successfully");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Platform Configurations</h2>
        <p className="text-xs text-muted-foreground font-light">Manage general preferences, authentication gates, email rules, and database tools.</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="rounded-xl border border-border/40 bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">ERP Setup</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Company Name</label>
              <input type="text" defaultValue="VendorBridge Corp" className="w-full h-9 rounded-md border border-border bg-secondary/40 px-3 outline-none focus:ring-1 focus:ring-brand-green" />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Currency System</label>
              <select className="w-full h-9 rounded-md border border-border bg-secondary/40 px-3 outline-none focus:ring-1 focus:ring-brand-green">
                <option>INR (₹)</option>
                <option>USD ($)</option>
              </select>
            </div>
          </div>
          <Button onClick={handleSaveSettings} className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-9">
            <Save className="h-4 w-4 mr-1" /> Save Configurations
          </Button>
        </div>

        {/* Database Tools */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.01] p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Sensitive database management operations.</p>
          </div>
          <p className="text-xs text-muted-foreground max-w-lg font-light leading-relaxed">
            Resetting the system will clear all current transactions, invitations, approvals, PO releases, and invoices, and restore the system to clean demo seed users and vendors.
          </p>
          <Button variant="destructive" onClick={handleReset} className="text-xs h-9 font-bold cursor-pointer">
            <RotateCcw className="h-4 w-4 mr-1" /> Restore Seed Data
          </Button>
        </div>
      </div>
    </div>
  );
}
