"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getVendorsAction } from "@/lib/actions/vendor";
import { getRFQsAction } from "@/lib/actions/rfq";
import { getQuotationsAction } from "@/lib/actions/quotation";
import { getUsersAction } from "@/lib/actions/auth";
import { getApprovalsAction, getPurchaseOrdersAction, getInvoicesAction, getActivityLogsAction } from "@/lib/actions/workflow";
import { Users, Building2, FileText, ReceiptText, CheckSquare, ShoppingCart, Receipt, BarChart3, TrendingUp, Clock, Star } from "lucide-react";
import Link from "next/link";
import type { Vendor, RFQ, Quotation, AppUser, Approval, PurchaseOrder, Invoice, ActivityLog } from "@/lib/db";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{
    users: AppUser[]; vendors: Vendor[]; rfqs: RFQ[]; quotations: Quotation[];
    approvals: Approval[]; pos: PurchaseOrder[]; invoices: Invoice[]; logs: ActivityLog[];
  }>({ users: [], vendors: [], rfqs: [], quotations: [], approvals: [], pos: [], invoices: [], logs: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const [users, vendors, rfqs, quotations, approvals, pos, invoices, logs] = await Promise.all([
          getUsersAction(), getVendorsAction(), getRFQsAction(), getQuotationsAction(),
          getApprovalsAction(), getPurchaseOrdersAction(), getInvoicesAction(), getActivityLogsAction(),
        ]);
        setData({ users, vendors, rfqs, quotations, approvals, pos, invoices, logs });
      } catch (err) {
        console.error("Dashboard refresh error", err);
      }
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const Card = ({ label, value, icon: Icon, color, href }: { label: string; value: string | number; icon: typeof Users; color?: string; href?: string }) => (
    <Link href={href || "#"} className="group rounded-xl border border-border/40 bg-card p-5 hover:border-brand-green-border/30 transition-all hover:shadow-lg hover:shadow-brand-green/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color || "bg-brand-green-muted/20 text-brand-green"}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );

  const { users, vendors, rfqs, quotations, approvals, pos, invoices, logs } = data;
  const totalSpend = invoices.reduce((s, i) => s + i.grandTotal, 0);

  // ── Admin Dashboard ──
  if (user.role === "Admin") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card label="Total Users" value={users.length} icon={Users} href="/dashboard/users" />
          <Card label="Total Vendors" value={vendors.length} icon={Building2} href="/dashboard/vendors" />
          <Card label="Total RFQs" value={rfqs.length} icon={FileText} href="/dashboard/rfqs" />
          <Card label="Pending Approvals" value={approvals.filter(a => a.status === "Pending").length} icon={CheckSquare} color="bg-yellow-500/10 text-yellow-500" href="/dashboard/approvals" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Card label="Purchase Orders" value={pos.length} icon={ShoppingCart} href="/dashboard/purchase-orders" />
          <Card label="Invoices" value={invoices.length} icon={Receipt} href="/dashboard/invoices" />
          <Card label="Procurement Spend" value={`₹${totalSpend.toLocaleString("en-IN")}`} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-500" href="/dashboard/reports" />
          <Card label="Active Vendors" value={vendors.filter(v => v.status === "Active").length} icon={Star} color="bg-blue-500/10 text-blue-500" href="/dashboard/vendors" />
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Recent System Activity</h3>
          <div className="space-y-3">
            {logs.slice(-5).reverse().map(log => (
              <div key={log.id} className="flex items-center gap-4 text-xs border-b border-border/20 pb-2">
                <span className="text-muted-foreground font-mono w-36 shrink-0">{new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                <span className="px-2 py-0.5 rounded bg-secondary text-[10px] font-medium">{log.role}</span>
                <span className="text-foreground">{log.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Procurement Officer Dashboard ──
  if (user.role === "Procurement Officer") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card label="Active RFQs" value={rfqs.filter(r => r.status === "Published").length} icon={FileText} href="/dashboard/rfqs" />
          <Card label="Quotations Received" value={quotations.length} icon={ReceiptText} href="/dashboard/quotations" />
          <Card label="Pending Approvals" value={approvals.filter(a => a.status === "Pending").length} icon={CheckSquare} color="bg-yellow-500/10 text-yellow-500" href="/dashboard/approvals" />
          <Card label="Purchase Orders" value={pos.length} icon={ShoppingCart} href="/dashboard/purchase-orders" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card label="Invoices Generated" value={invoices.length} icon={Receipt} href="/dashboard/invoices" />
          <Card label="Monthly Spend" value={`₹${totalSpend.toLocaleString("en-IN")}`} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-500" href="/dashboard/reports" />
          <Card label="Registered Vendors" value={vendors.length} icon={Building2} href="/dashboard/vendors" />
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Quick Actions</h3>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/rfqs/create" className="px-4 py-2.5 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-green-hover transition-all green-glow-button">+ Create RFQ</Link>
            <Link href="/dashboard/quotations" className="px-4 py-2.5 rounded-lg border border-border/40 text-xs font-medium hover:bg-secondary/40 transition-all">Compare Quotations</Link>
            <Link href="/dashboard/vendors" className="px-4 py-2.5 rounded-lg border border-border/40 text-xs font-medium hover:bg-secondary/40 transition-all">View Vendors</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Vendor Dashboard ──
  if (user.role === "Vendor") {
    const vid = user.vendorId || "";
    const myRfqs = rfqs.filter(r => r.vendorIds.includes(vid));
    const myQuotes = quotations.filter(q => q.vendorId === vid);
    const myPOs = pos.filter(p => p.vendorId === vid);
    const myInvoices = invoices.filter(i => i.vendorId === vid);
    const pendingPay = myInvoices.filter(i => i.status !== "Paid").reduce((s, i) => s + i.grandTotal, 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card label="Assigned RFQs" value={myRfqs.length} icon={FileText} href="/dashboard/rfqs" />
          <Card label="Submitted Quotations" value={myQuotes.length} icon={ReceiptText} href="/dashboard/quotations" />
          <Card label="My Purchase Orders" value={myPOs.length} icon={ShoppingCart} href="/dashboard/purchase-orders" />
          <Card label="Pending Payments" value={`₹${pendingPay.toLocaleString("en-IN")}`} icon={Receipt} color="bg-yellow-500/10 text-yellow-500" href="/dashboard/invoices" />
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Active RFQs for Bidding</h3>
          <div className="space-y-2">
            {myRfqs.filter(r => r.status === "Published").map(rfq => {
              const submitted = myQuotes.find(q => q.rfqId === rfq.id);
              return (
                <div key={rfq.id} className="flex items-center justify-between p-3 rounded-lg border border-border/20 hover:bg-secondary/20 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{rfq.title}</p>
                    <p className="text-xs text-muted-foreground">Budget: ₹{rfq.budget.toLocaleString("en-IN")} · Deadline: {rfq.deadline}</p>
                  </div>
                  {submitted ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-brand-green-muted/20 text-brand-green font-medium">Bid Submitted</span>
                  ) : (
                    <Link href={`/dashboard/quotations/submit?rfqId=${rfq.id}`} className="text-xs px-3 py-1.5 rounded-lg bg-brand-green text-white font-medium hover:bg-brand-green-hover transition-all">Submit Quote</Link>
                  )}
                </div>
              );
            })}
            {myRfqs.filter(r => r.status === "Published").length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No active RFQs assigned to you.</p>}
          </div>
        </div>
      </div>
    );
  }

  // ── Manager Dashboard ──
  if (user.role === "Manager") {
    const pending = approvals.filter(a => a.status === "Pending");
    const approved = approvals.filter(a => a.status === "Approved");
    const rejected = approvals.filter(a => a.status === "Rejected");
    const totalProcuredValue = pos.reduce((s, p) => s + p.totalAmount, 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card label="Pending Approvals" value={pending.length} icon={CheckSquare} color="bg-yellow-500/10 text-yellow-500" href="/dashboard/approvals" />
          <Card label="Approved Requests" value={approved.length} icon={CheckSquare} color="bg-emerald-500/10 text-emerald-500" href="/dashboard/approvals" />
          <Card label="Rejected Requests" value={rejected.length} icon={CheckSquare} color="bg-red-500/10 text-red-500" href="/dashboard/approvals" />
          <Card label="Total Procurement" value={`₹${totalProcuredValue.toLocaleString("en-IN")}`} icon={BarChart3} href="/dashboard/reports" />
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Pending Approval Requests</h3>
            <Link href="/dashboard/approvals" className="text-xs text-brand-green hover:underline">View All →</Link>
          </div>
          <div className="space-y-2">
            {pending.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/20 hover:bg-secondary/20 transition-colors">
                <div>
                  <p className="text-sm font-medium">{a.rfqTitle}</p>
                  <p className="text-xs text-muted-foreground">Vendor: {a.vendorName} · Amount: ₹{a.totalAmount.toLocaleString("en-IN")}</p>
                </div>
                <Link href="/dashboard/approvals" className="text-xs px-3 py-1.5 rounded-lg bg-brand-green text-white font-medium hover:bg-brand-green-hover transition-all">Review</Link>
              </div>
            ))}
            {pending.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">🎉 All requests have been reviewed!</p>}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
