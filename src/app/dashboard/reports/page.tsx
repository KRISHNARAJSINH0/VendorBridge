"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getInvoicesAction, getPurchaseOrdersAction, getApprovalsAction } from "@/lib/actions/workflow";
import { getVendorsAction } from "@/lib/actions/vendor";
import { getRFQsAction } from "@/lib/actions/rfq";
import { Invoice, PurchaseOrder, Approval, Vendor, RFQ } from "@/lib/db";
import { BarChart3, TrendingUp, DollarSign, FileText, CheckCircle2, Star, Award, AwardIcon } from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [invs, poList, appList, venList, rfqList] = await Promise.all([
          getInvoicesAction(), getPurchaseOrdersAction(), getApprovalsAction(), getVendorsAction(), getRFQsAction()
        ]);
        setInvoices(invs);
        setPOs(poList);
        setApprovals(appList);
        setVendors(venList);
        setRFQs(rfqList);
      } catch {
        toast.error("Failed to compile reports data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!user) return null;

  const totalProcuredValue = pos.reduce((s, p) => s + p.totalAmount, 0);
  const totalInvoicedValue = invoices.reduce((s, i) => s + i.grandTotal, 0);

  // Group spends by category
  const categorySpend: Record<string, number> = {};
  pos.forEach(po => {
    const rfqObj = rfqs.find(r => r.id === po.rfqId);
    const cat = rfqObj?.category || "Other";
    categorySpend[cat] = (categorySpend[cat] || 0) + po.totalAmount;
  });

  const categoryArray = Object.entries(categorySpend).map(([name, value]) => ({ name, value }));
  const maxSpend = categoryArray.length > 0 ? Math.max(...categoryArray.map(c => c.value)) : 1;

  // Monthly simulated spends
  const monthlyData = [
    { month: "Jan", spend: totalProcuredValue * 0.15 },
    { month: "Feb", spend: totalProcuredValue * 0.10 },
    { month: "Mar", spend: totalProcuredValue * 0.25 },
    { month: "Apr", spend: totalProcuredValue * 0.20 },
    { month: "May", spend: totalProcuredValue * 0.18 },
    { month: "Jun", spend: totalProcuredValue * 0.12 },
  ];
  const maxMonthlySpend = Math.max(...monthlyData.map(m => m.spend)) || 1;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Reports & Spend Analytics</h2>
        <p className="text-xs text-muted-foreground font-light">Monitor monthly budgets, category audits, vendor scores, and financial release pipelines.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-xl bg-secondary/20 animate-pulse border border-border/20" />
          <div className="h-64 rounded-xl bg-secondary/20 animate-pulse border border-border/20" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Spend Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-border/40 bg-card p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase">Approved Releases</p>
              <p className="text-2xl font-bold font-mono tracking-tight mt-1">₹{totalProcuredValue.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" /> +12.4% from Q1</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase">Billed Invoices</p>
              <p className="text-2xl font-bold font-mono tracking-tight mt-1">₹{totalInvoicedValue.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Settlement rate: {totalProcuredValue ? Math.round((totalInvoicedValue / totalProcuredValue) * 100) : 0}%</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card p-5">
              <p className="text-xs text-muted-foreground font-medium uppercase">Vendor Approval Rate</p>
              <p className="text-2xl font-bold tracking-tight mt-1">
                {approvals.length ? Math.round((approvals.filter(a => a.status === "Approved").length / approvals.length) * 100) : 100}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Based on {approvals.length} workflow reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Trend Chart */}
            <div className="rounded-xl border border-border/40 bg-card p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Monthly Spend Trend</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Release values issued to contract partners during 2026.</p>
              </div>
              <div className="flex h-44 items-end justify-between gap-4 pt-4 border-b border-border/20 px-2">
                {monthlyData.map(m => {
                  const percentageHeight = (m.spend / maxMonthlySpend) * 100;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-brand-green/10 border border-brand-green-border/30 rounded-t-md hover:bg-brand-green/30 transition-all relative flex justify-center"
                        style={{ height: `${Math.max(percentageHeight, 5)}%` }}>
                        <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-secondary border border-border text-[9px] font-mono px-1.5 py-0.5 rounded transition-transform">
                          ₹{Math.round(m.spend).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Spend Chart */}
            <div className="rounded-xl border border-border/40 bg-card p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Category Spend Share</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Budget allocations across operational procurement groups.</p>
              </div>
              <div className="space-y-4">
                {categoryArray.map(cat => {
                  const percent = Math.round((cat.value / totalProcuredValue) * 100);
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-foreground">{cat.name}</span>
                        <span className="text-muted-foreground font-mono">₹{cat.value.toLocaleString("en-IN")} ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-secondary/40 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-green rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
                {categoryArray.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-10">No spend allocation charts available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Rated Vendors Table */}
          <div className="rounded-xl border border-border/40 bg-card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Vendor Performance Index</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Compliance records and ratings index evaluated by team managers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {vendors.slice(0, 3).map(v => (
                <div key={v.id} className="p-4 rounded-xl border border-border/30 bg-secondary/15 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-green-muted/20 border border-brand-green-border/30 flex items-center justify-center text-brand-green">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{v.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-[10px] font-semibold font-mono">{v.rating || "N/A"}</span>
                      <span className="text-[9px] text-muted-foreground">· Risk: {v.riskScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
