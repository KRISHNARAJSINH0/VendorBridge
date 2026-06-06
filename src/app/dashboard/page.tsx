"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  FileText,
  ReceiptText,
  Plus,
  TrendingUp,
  Sparkles,
  Clock,
  Coins,
  ShieldCheck,
  Award,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Percent,
  CheckCircle2,
  CalendarDays,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Check,
  X,
  Bell
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";
import { Vendor, RFQ, Quotation, PurchaseOrder, Invoice, ActivityLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/context/StateContext";
import { useAuth } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

// Helper for currency formatting
const formatINR = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { vendors, rfqs, quotations, purchaseOrders, invoices, logs } = useAppState();
  const { user: currentUser } = useAuth();

  // Selection dialog for RFQ preview
  const [selectedRfqPreview, setSelectedRfqPreview] = useState<RFQ | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const approvals = useMemo(() => {
    return rfqs
      .filter((r: RFQ) => r.status === "Under Review" || r.status === "Approved" || r.status === "Rejected")
      .map((r: RFQ) => {
        const quote = quotations.find((q: Quotation) => q.rfqId === r.id && (q.status === "Selected" || q.status === "Approved" || q.status === "Rejected"));
        const vendor = quote ? vendors.find((v: Vendor) => v.id === quote.vendorId) : null;
        return {
          id: r.id,
          rfqId: r.id,
          rfqTitle: r.title,
          status: r.status === "Under Review" ? "Pending" : r.status,
          vendorName: quote ? quote.vendorName : "Unknown",
          amount: quote ? quote.grandTotal : 0,
          vendorRating: vendor ? vendor.rating : 4.0,
          riskScore: vendor ? vendor.riskScore : "Medium",
          confidenceScore: 94
        };
      });
  }, [rfqs, quotations, vendors]);

  const loading = !mounted;


  // Format today's date dynamically
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }, []);

  // Standard Dashboard: Vendor Performance Data mapping
  const barChartData = useMemo(() => {
    const vendorMap: Record<string, { rating: number; percentage: number }> = {
      "Smart Industrial Solutions": { rating: 4.6, percentage: 92 },
      "Infra Supplies Pvt Ltd": { rating: 4.5, percentage: 90 },
      "TechCore Ltd": { rating: 4.2, percentage: 84 },
      "Office Need Co.": { rating: 3.8, percentage: 76 },
      "FastLog Transport": { rating: 2.5, percentage: 50 }
    };
    return Object.entries(vendorMap).map(([name, data]) => ({
      name,
      rating: data.rating,
      percentage: data.percentage
    })).sort((a, b) => b.rating - a.rating);
  }, []);

  // Standard Dashboard: RFQ Status Donut Chart Data
  const donutChartData = [
    { name: "Active / Published", value: 12, color: "#4ade80" },
    { name: "Draft", value: 5, color: "#71717a" },
    { name: "Under Review", value: 4, color: "#fbbf24" },
    { name: "Awarded / Completed", value: 8, color: "#3b82f6" }
  ];

  // Standard Dashboard: Active RFQs list
  const activeRfqsList = useMemo(() => {
    const dbActive = rfqs.map((r: RFQ) => {
      const subCount = quotations.filter((q: Quotation) => q.rfqId === r.id).length;
      return {
        id: r.id,
        title: r.title,
        category: r.category,
        budget: r.budget,
        deadline: r.deadline,
        status: r.status === "Published" ? "Active" : r.status,
        submissions: subCount,
        originalRfq: r
      };
    });

    const supplementary = [
      {
        id: "rfq-mock-1",
        title: "Raw Concrete & Steel Construction",
        category: "Construction & Raw Materials",
        budget: 450000,
        deadline: "2026-06-25",
        status: "Active",
        submissions: 2,
        originalRfq: {
          id: "rfq-mock-1",
          title: "Raw Concrete & Steel Construction",
          category: "Construction & Raw Materials",
          budget: 450000,
          deadline: "2026-06-25",
          description: "Procurement of standard concrete mixture M25 and high strength reinforcement steel bars (TMT Fe 500D) for foundation work.",
          status: "Published",
          createdAt: new Date("2026-06-02").toISOString(),
          updatedAt: new Date("2026-06-02").toISOString(),
          items: [
            { name: "Ready Mix Concrete M25", qty: 80, unit: "Cu.m" },
            { name: "TMT Steel Rebars 12mm", qty: 3, unit: "Tons" }
          ],
          assignedVendors: ["v-2"],
          selectedQuotationId: null,
          managerRemarks: ""
        } as unknown as RFQ
      },
      {
        id: "rfq-mock-2",
        title: "Warehouse Logistics Transport Contract",
        category: "Logistics & Shipping",
        budget: 300000,
        deadline: "2026-06-18",
        status: "Active",
        submissions: 1,
        originalRfq: {
          id: "rfq-mock-2",
          title: "Warehouse Logistics Transport Contract",
          category: "Logistics & Shipping",
          budget: 300000,
          deadline: "2026-06-18",
          description: "Contracting local cargo shipping fleet to handle weekly logistics distribution across central warehouse docks.",
          status: "Published",
          createdAt: new Date("2026-06-03").toISOString(),
          updatedAt: new Date("2026-06-03").toISOString(),
          items: [
            { name: "Weekly Distribution Truck (10 Ton)", qty: 4, unit: "Weeks" }
          ],
          assignedVendors: ["v-3"],
          selectedQuotationId: null,
          managerRemarks: ""
        } as unknown as RFQ
      }
    ];

    return [...dbActive, ...supplementary].slice(0, 4);
  }, [rfqs, quotations]);

  // Loading skeleton layout
  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-secondary/30" />
            <Skeleton className="h-4 w-48 bg-secondary/30" />
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-secondary/30" />
          ))}
        </div>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-80 rounded-xl bg-secondary/30" />
            <Skeleton className="h-80 rounded-xl bg-secondary/30" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-64 rounded-xl bg-secondary/30" />
            <Skeleton className="h-64 rounded-xl bg-secondary/30" />
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MANAGER DASHBOARD VIEW RENDER
  // ----------------------------------------------------
  if (currentUser?.role === "Manager") {
    const pendingApprovalsCount = approvals.filter((a: any) => a.status === "Pending").length;
    const approvedRequestsCount = approvals.filter((a: any) => a.status === "Approved").length;
    const rejectedRequestsCount = approvals.filter((a: any) => a.status === "Rejected").length;
    const totalSpendVal = purchaseOrders.reduce((acc: number, curr: PurchaseOrder) => acc + curr.total, 0);

    const mockNotifications = [
      { id: "notif-1", msg: "New RFQ (Office Furniture Upgrade) published & ready for comparison", type: "info" },
      { id: "notif-2", msg: "AI recommendation processed for Office Furniture Upgrade", type: "ai" },
      { id: "notif-3", msg: "L2 approval sign-off required for Quotation Q-002", type: "warning" },
      { id: "notif-4", msg: "PO-2026-001 generated successfully for TechSupply LLC", type: "success" },
      { id: "notif-5", msg: "Invoice INV-2026-001 pending payment validation", type: "pending" }
    ];

    return (
      <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/30 pb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Manager Control Center
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
              <CalendarDays className="h-3.5 w-3.5 text-brand-green" />
              <span>{formattedDate}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-brand-green">Authorized Sign-off: Arthur Pendelton</span>
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/approvals">
              <Button className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-9 px-4 cursor-pointer shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] green-glow-button">
                <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Go to Workflow Queue
              </Button>
            </Link>
          </div>
        </div>

        {/* Manager KPI Row */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          
          <Card className="bg-card/10 border-border/40 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Pending Approvals</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-400">{pendingApprovalsCount}</span>
                {pendingApprovalsCount > 0 && <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
              </div>
              <p className="text-[9px] text-zinc-500">Awaiting sign-off</p>
            </CardContent>
          </Card>

          <Card className="bg-card/10 border-border/40 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Approved Requests</span>
              <span className="text-2xl font-black font-mono text-emerald-400">{approvedRequestsCount}</span>
              <p className="text-[9px] text-zinc-500">POs auto-generated</p>
            </CardContent>
          </Card>

          <Card className="bg-card/10 border-border/40 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Rejected Requests</span>
              <span className="text-2xl font-black font-mono text-red-400">{rejectedRequestsCount}</span>
              <p className="text-[9px] text-zinc-500">Rejections archived</p>
            </CardContent>
          </Card>

          <Card className="bg-card/10 border-border/40 relative overflow-hidden group hover:border-brand-green-border/30 transition-all duration-300 lg:col-span-2">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Monthly Spend</span>
              <span className="text-2xl font-black font-mono text-brand-green truncate">{formatINR(totalSpendVal)}</span>
              <p className="text-[9px] text-zinc-500">Cumulative transaction value</p>
            </CardContent>
          </Card>

          <Card className="bg-card/10 border-border/40 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">AI accuracy</span>
              <span className="text-2xl font-black font-mono text-purple-400">94%</span>
              <p className="text-[9px] text-zinc-500">Recommendation score</p>
            </CardContent>
          </Card>

        </div>

        {/* Manager Layout Matrix */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
          
          {/* Main Workspace (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* PENDING PROCUREMENT REQUESTS TABLE */}
            <Card className="bg-card/10 border-border/40">
              <CardHeader className="pb-2 border-b border-border/30 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-green" /> Pending Procurement Requests
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Workflow requests awaiting L2 managerial authorization.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/30 bg-zinc-950/20 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-5">RFQ Ref</th>
                        <th className="py-3 px-4">Tender Title</th>
                        <th className="py-3 px-4">Proposed Vendor</th>
                        <th className="py-3 px-4 text-right">Quote Value</th>
                        <th className="py-3 px-4 text-center">AI Match</th>
                        <th className="py-3 px-4 text-center">Risk Level</th>
                        <th className="py-3 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.filter((a: any) => a.status === "Pending").length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-zinc-500 italic">
                            All pending approvals cleared in the queue.
                          </td>
                        </tr>
                      ) : (
                        approvals.filter((a: any) => a.status === "Pending").map((app: any) => (
                          <tr
                            key={app.id}
                            className="border-b border-border/20 hover:bg-secondary/20 transition-colors duration-150"
                          >
                            <td className="py-3.5 px-5 font-bold font-mono text-zinc-200">
                              {app.rfqId}
                            </td>
                            <td className="py-3.5 px-4 text-zinc-300 font-semibold">{app.rfqTitle}</td>
                            <td className="py-3.5 px-4 text-zinc-400">{app.vendorName}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-brand-green font-bold">
                              {formatINR(app.amount)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-brand-green-muted/10 text-brand-green border border-brand-green-border/20">
                                94%
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <Badge variant="outline" className="text-[8.5px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                Low Risk
                              </Badge>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <Link href="/approvals">
                                <Button className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-[10px] h-7 px-3 cursor-pointer">
                                  Review Request
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* AI PROCUREMENT OVERSIGHT */}
            <Card className="bg-card/10 border-border/40">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-brand-green" /> AI Procurement Oversight
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Proactive audit and warning thresholds scanned by AI Agent.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid gap-6 grid-cols-1 md:grid-cols-2">
                
                {/* Risks and Alerts */}
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs">
                    <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                      <AlertTriangle className="h-4 w-4 shrink-0" /> Highest Risk Supplier Detected
                    </div>
                    <p className="text-zinc-200 font-semibold mb-0.5">FastLog Transport (GIDC surat)</p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Late deliveries increasing over past 60 days. Current transport contract cycle exceeds safety SLAs by 18%.
                    </p>
                  </div>
                  
                  <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs">
                    <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                      <ShieldAlert className="h-4 w-4 shrink-0" /> Active Budget Alert
                    </div>
                    <p className="text-zinc-200 font-semibold mb-0.5">Q2 Office Infrastructure</p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Department spend is currently at ₹4,90,000, which utilizes 82% of the total approved allocation limits.
                    </p>
                  </div>
                </div>

                {/* Best Vendor & Savings Stats */}
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                      <Award className="h-4 w-4 shrink-0" /> Best Performing Supplier
                    </div>
                    <p className="text-zinc-200 font-semibold mb-0.5">Infra Supplies Pvt Ltd</p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Exceptional fulfillment rate indices (98%) and low pricing deviation compared to average competitor scores.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-secondary/20 text-xs">
                    <div className="flex items-center gap-2 text-brand-green font-bold mb-1">
                      <Sparkles className="h-4 w-4 shrink-0" /> Procurement Savings Optimized
                    </div>
                    <p className="text-zinc-200 font-semibold mb-0.5">Expected savings target: ₹29,800</p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Calculated potential optimization margin on active tenders utilizing comparative bid analytics.
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>

          {/* Side Panels (Span 4) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* AI INSIGHTS CARD */}
            <Card className="relative overflow-hidden premium-gradient border border-zinc-800/40 group">
              <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-brand-green to-transparent opacity-65" />
              <CardHeader className="pb-2 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-brand-green" /> Procurement AI Insight
                  </CardTitle>
                  <span className="text-[9px] font-bold text-brand-green bg-brand-green-muted/20 border border-brand-green-border/30 px-1.5 py-0.2 rounded font-mono">ACTIVE SCAN</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3.5 text-xs">
                <div>
                  <span className="text-zinc-500 text-[9px] uppercase font-bold">Recommended Vendor Choice</span>
                  <p className="text-white font-bold text-sm mt-0.5">Infra Supplies Pvt Ltd</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-950/40 p-2 rounded border border-zinc-800/40">
                    <span className="text-zinc-500 text-[8px] uppercase font-bold">Confidence Match</span>
                    <p className="text-brand-green font-bold font-mono text-sm mt-0.5">94%</p>
                  </div>
                  <div className="bg-zinc-950/40 p-2 rounded border border-zinc-800/40">
                    <span className="text-zinc-500 text-[8px] uppercase font-bold">Expected Savings</span>
                    <p className="text-emerald-400 font-bold font-mono text-sm mt-0.5">₹29,800</p>
                  </div>
                </div>

                <div className="bg-zinc-950/20 p-2.5 rounded border border-zinc-800/20 space-y-1">
                  <span className="text-zinc-400 font-semibold text-[10px]">Decision Reasoning:</span>
                  <p className="text-zinc-500 text-[10.5px] leading-relaxed">
                    Infra Supplies submitted the lowest overall bid of ₹1,85,000, with a low risk matrix, low delivery time (10 days) and consistent SLA compliance.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* NOTIFICATIONS PANEL */}
            <Card className="bg-card/10 border-border/40">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-brand-green" /> Notifications Feed
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Manager procurement events.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {mockNotifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="p-3 bg-zinc-950/20 border border-zinc-850 hover:border-zinc-700/50 rounded-lg text-xs flex gap-2.5 items-start transition-all"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                      notif.type === "warning" 
                        ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]" 
                        : notif.type === "ai"
                        ? "bg-purple-400 shadow-[0_0_6px_#c084fc]"
                        : notif.type === "success"
                        ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                        : "bg-blue-400 shadow-[0_0_6px_#60a5fa]"
                    }`} />
                    <p className="text-zinc-400 leading-normal">{notif.msg}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    );
  }

  // ----------------------------------------------------
  // VENDOR DASHBOARD VIEW RENDER
  // ----------------------------------------------------
  if (currentUser?.role === "Vendor") {
    // 1. Robust vendor profile matching
    const myVendorProfile = vendors.find(
      (v: Vendor) =>
        v.contactEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
        v.id === currentUser.vendorId ||
        (currentUser.vendorId && v.id === currentUser.vendorId.replace(/^v/, "v-"))
    );

    // Default vendor name & details if profile is not synced yet (or during registration)
    const vendorName = myVendorProfile?.name || `${currentUser.firstName} ${currentUser.lastName}` || "My Vendor Corp";
    const vendorId = myVendorProfile?.id || currentUser.vendorId || "v-temp";
    const vendorCategory = myVendorProfile?.category || "Supplier";
    const vendorStatus = myVendorProfile?.status || "Active";
    const vendorRating = myVendorProfile?.rating || 4.5;
    const vendorCode = (myVendorProfile as any)?.vendorCode || "VND-NEW";

    // 2. Filter RFQs assigned to this vendor
    const myRfqs = rfqs.filter((r: RFQ) => {
      // Invite matching (both v-1 and v1 styles)
      const matchesId = r.assignedVendors?.some(
        (id: string) =>
          id === vendorId ||
          id.replace("v-", "v") === vendorId.replace("v-", "v")
      );
      return matchesId && (r.status === "Published" || r.status === "Active");
    });

    // 3. Filter Quotations submitted by this vendor
    const myQuotations = quotations.filter(
      (q: Quotation) =>
        q.vendorId === vendorId ||
        q.vendorId.replace("v-", "v") === vendorId.replace("v-", "v")
    );

    // 4. Filter Purchase Orders awarded to this vendor
    const myPOs = purchaseOrders.filter(
      (po: PurchaseOrder) =>
        po.vendorId === vendorId ||
        po.vendorId.replace("v-", "v") === vendorId.replace("v-", "v")
    );

    // 5. Filter Invoices for this vendor
    const myInvoices = invoices.filter(
      (inv: Invoice) =>
        inv.vendorId === vendorId ||
        inv.vendorId.replace("v-", "v") === vendorId.replace("v-", "v")
    );

    // 6. Calculate KPIs
    // Open invites: assigned RFQs that do not have a quote submitted by this vendor yet
    const openInvites = myRfqs.filter(
      (rfq: RFQ) => !myQuotations.some((q: Quotation) => q.rfqId === rfq.id)
    );

    const submittedQuotesCount = myQuotations.length;
    const awardedContractsCount = myPOs.length;
    const pendingInvoicesCount = myInvoices.filter((inv: Invoice) => inv.status !== "Paid").length;

    // Standard mock notifications for vendors
    const vendorNotifications = [
      { id: "vnotif-1", msg: "New RFQ invitation received: respond before deadline", type: "info" },
      { id: "vnotif-2", msg: `Your quotation for RFQ is under final review`, type: "pending" },
      { id: "vnotif-3", msg: "Purchase Order PO-2026-001 issued to your company", type: "success" },
      { id: "vnotif-4", msg: "Invoice payment INV-2026-001 has been processed successfully", type: "success" }
    ].slice(0, openInvites.length > 0 ? 4 : 3);

    return (
      <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/30 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {vendorName} Portal
              </h2>
              <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20 text-[10px] font-bold">
                {vendorStatus} Partner
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5 font-medium">
              <CalendarDays className="h-3.5 w-3.5 text-brand-green" />
              <span>{formattedDate}</span>
              <span className="text-zinc-600">•</span>
              <span>Category: <span className="text-white font-semibold">{vendorCategory}</span></span>
              <span className="text-zinc-600">•</span>
              <span>Vendor Code: <span className="text-white font-mono font-semibold">{vendorCode}</span></span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/quotations/submit">
              <Button className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-9 px-4 cursor-pointer shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] green-glow-button">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Submit New Quotation
              </Button>
            </Link>
          </div>
        </div>

        {/* Vendor KPIs */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/10 border-border/40 hover:border-brand-green-border/30 transition-all duration-300">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Open Invitations</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-400">{openInvites.length}</span>
                {openInvites.length > 0 && <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
              </div>
              <p className="text-[9px] text-zinc-500">RFQs awaiting your quotation</p>
            </CardContent>
          </Card>

          <Card className="bg-card/10 border-border/40 hover:border-brand-green-border/30 transition-all duration-300">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Submitted Bids</span>
              <span className="text-2xl font-black font-mono text-emerald-400">{submittedQuotesCount}</span>
              <p className="text-[9px] text-zinc-500">Active pricing quotations filed</p>
            </CardContent>
          </Card>

          <Card className="bg-card/10 border-border/40 hover:border-brand-green-border/30 transition-all duration-300">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Awarded POs</span>
              <span className="text-2xl font-black font-mono text-brand-green">{awardedContractsCount}</span>
              <p className="text-[9px] text-zinc-500">Contracts won & orders generated</p>
            </CardContent>
          </Card>

          <Card className="bg-card/10 border-border/40 hover:border-brand-green-border/30 transition-all duration-300">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quality Rating</span>
              <span className="text-2xl font-black font-mono text-purple-400">{vendorRating} / 5.0</span>
              <p className="text-[9px] text-zinc-500">System SLA compliance index</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Content Grid */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
          {/* Main Content Area (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ASSIGNED RFQ INVITATIONS */}
            <Card className="bg-card/10 border-border/40">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-green" /> Open RFQ Invitations
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  RFQs published by procurement officers inviting you to submit bids.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/30 bg-zinc-950/20 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-5">RFQ Ref</th>
                        <th className="py-3 px-4">Tender Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Target Budget</th>
                        <th className="py-3 px-4 text-center">Deadline</th>
                        <th className="py-3 px-5 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openInvites.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-zinc-500 italic">
                            No active RFQ invitations at the moment.
                          </td>
                        </tr>
                      ) : (
                        openInvites.map((rfq: RFQ) => (
                          <tr
                            key={rfq.id}
                            className="border-b border-border/20 hover:bg-secondary/20 transition-colors duration-150"
                          >
                            <td className="py-3.5 px-5 font-bold font-mono text-zinc-200">
                              {rfq.id}
                            </td>
                            <td className="py-3.5 px-4 text-zinc-300 font-semibold">{rfq.title}</td>
                            <td className="py-3.5 px-4 text-zinc-400">{rfq.category}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-brand-green font-bold">
                              {formatINR(rfq.budget)}
                            </td>
                            <td className="py-3.5 px-4 text-center text-zinc-400 font-mono">
                              {rfq.deadline}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <Link href={`/quotations/submit?rfqId=${rfq.id}`}>
                                <Button className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-[10px] h-7 px-3 cursor-pointer">
                                  Submit Bid
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* VENDOR BID HISTORY */}
            <Card className="bg-card/10 border-border/40">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-green" /> Submitted Quotations
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  History of pricing bids you filed in response to RFQs.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/30 bg-zinc-950/20 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-5">Quote Number</th>
                        <th className="py-3 px-4">RFQ Ref</th>
                        <th className="py-3 px-4">Submitted Date</th>
                        <th className="py-3 px-4 text-right">Delivery Days</th>
                        <th className="py-3 px-4 text-right">Bid Total</th>
                        <th className="py-3 px-5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myQuotations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-zinc-500 italic">
                            You haven't submitted any quotations yet.
                          </td>
                        </tr>
                      ) : (
                        myQuotations.map((q: Quotation) => (
                          <tr
                            key={q.id}
                            className="border-b border-border/20 hover:bg-secondary/20 transition-colors duration-150"
                          >
                            <td className="py-3.5 px-5 font-bold font-mono text-zinc-200">
                              {q.id}
                            </td>
                            <td className="py-3.5 px-4 text-zinc-300 font-semibold">{q.rfqId}</td>
                            <td className="py-3.5 px-4 text-zinc-400 font-mono">
                              {q.submittedDate || "-"}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                              {q.deliveryDays || 10} Days
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-brand-green font-bold">
                              {formatINR(q.grandTotal)}
                            </td>
                            <td className="py-3.5 px-5 text-center">
                              <Badge variant="outline" className={`text-[9px] font-bold px-2.5 py-0.5 ${
                                q.status === "Approved" || q.status === "Selected"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : q.status === "Rejected"
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-zinc-800 text-zinc-400 border-zinc-700/40"
                              }`}>
                                {q.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* AWARDED PURCHASE ORDERS */}
            <Card className="bg-card/10 border-border/40">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                  <Award className="h-4 w-4 text-brand-green" /> Awarded Orders
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  POs issued to you by the organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {myPOs.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 italic text-xs">
                    No purchase orders issued yet.
                  </div>
                ) : (
                  myPOs.map((po: PurchaseOrder) => (
                    <div 
                      key={po.id} 
                      className="p-3 bg-zinc-950/20 border border-zinc-850 hover:border-zinc-700/50 rounded-lg text-xs flex justify-between items-center transition-all"
                    >
                      <div>
                        <p className="font-bold text-zinc-200 font-mono">{po.id}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Ref: {po.rfqId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-brand-green font-bold">{formatINR(po.total)}</p>
                        <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mt-1">
                          {po.status || "Approved"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* NOTIFICATIONS PANEL */}
            <Card className="bg-card/10 border-border/40">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-brand-green" /> Notifications Feed
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Updates on RFQ invites, quote reviews, and payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {vendorNotifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="p-3 bg-zinc-950/20 border border-zinc-850 hover:border-zinc-700/50 rounded-lg text-xs flex gap-2.5 items-start transition-all"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                      notif.type === "warning" 
                        ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]" 
                        : notif.type === "success"
                        ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                        : "bg-blue-400 shadow-[0_0_6px_#60a5fa]"
                    }`} />
                    <p className="text-zinc-400 leading-normal">{notif.msg}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STANDARD PROCUREMENT OFFICER / ADMIN DASHBOARD VIEW
  // ----------------------------------------------------
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/30 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Today's Procurement Overview
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
            <CalendarDays className="h-3.5 w-3.5 text-brand-green" />
            <span>{formattedDate}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-brand-green">VendorBridge Corp</span>
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/rfqs/create">
            <Button className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold h-9 px-4 cursor-pointer transition-all duration-200">
              <Plus className="mr-2 h-3.5 w-3.5 text-brand-green" /> Create RFQ
            </Button>
          </Link>
          <Link href="/vendors">
            <Button className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold h-9 px-4 cursor-pointer transition-all duration-200">
              <Plus className="mr-2 h-3.5 w-3.5 text-brand-green" /> Add Vendor
            </Button>
          </Link>
          <Link href="/quotations?compare=true">
            <Button className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-9 px-4 cursor-pointer shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] green-glow-button">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> Compare Quotations
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* KPI 1 */}
        <Card className="bg-card/10 border-border/40 relative overflow-hidden group hover:border-brand-green-border/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,222,128,0.02)]">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active RFQs</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight font-mono">12</span>
                <span className="text-[10px] font-bold text-brand-green bg-brand-green-muted/10 border border-brand-green-border/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" /> +2 this month
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-emerald-400/80 transition-colors">
                9 published, 3 under review
              </p>
            </div>
            <div className="w-full h-4 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,8 L20,6 L40,9 L60,4 L80,2 L100,5" fill="none" stroke="#4ade80" strokeWidth="1.5" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="bg-card/10 border-border/40 relative overflow-hidden group hover:border-brand-green-border/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,222,128,0.02)]">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Vendors</span>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight font-mono">{vendors.length || 28}</span>
                <span className="text-[10px] font-bold text-brand-green bg-brand-green-muted/10 border border-brand-green-border/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" /> +4 this week
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-blue-400/80 transition-colors">
                Verified active system partners
              </p>
            </div>
            <div className="w-full h-4 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,9 L20,8 L40,7 L60,5 L80,3 L100,1" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="bg-card/10 border-border/40 relative overflow-hidden group hover:border-brand-green-border/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,222,128,0.02)]">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Spend</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight font-mono">₹23.4L</span>
                <span className="text-[10px] font-bold text-brand-green bg-brand-green-muted/10 border border-brand-green-border/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" /> +12% Q4 vs Q3
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-amber-400/80 transition-colors">
                ₹18.5L IT hardware, ₹4.9L office infra
              </p>
            </div>
            <div className="w-full h-4 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,7 L20,9 L40,6 L60,4 L80,5 L100,2" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="bg-card/10 border-border/40 relative overflow-hidden group hover:border-brand-green-border/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(74,222,128,0.02)]">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Perf Rating</span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight font-mono">91%</span>
                <span className="text-[10px] font-bold text-brand-green bg-brand-green-muted/10 border border-brand-green-border/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" /> +1.5% this month
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-purple-400/80 transition-colors">
                Top performer: Smart Industrial Solutions
              </p>
            </div>
            <div className="w-full h-4 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,9 L20,8 L40,9 L60,6 L80,3 L100,2" fill="none" stroke="#c084fc" strokeWidth="1.5" />
              </svg>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="bg-card/10 border-border/40">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-green" /> Vendor Performance Evaluation
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Supplier efficiency index calculated based on delivery timelines and compliance.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {mounted ? (
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a/40" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#71717a" fontSize={10} fontStyle="mono" tickFormatter={(val) => `${val}%`} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#71717a"
                        fontSize={10}
                        width={130}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          borderColor: "rgba(255,255,255,0.08)",
                          borderRadius: "10px",
                          fontSize: "11px"
                        }}
                      />
                      <Bar dataKey="percentage" fill="url(#brandGreenGradient)" radius={[0, 4, 4, 0]} barSize={16}>
                        {barChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.percentage > 85 ? "url(#brandGreenGradient)" : entry.percentage > 70 ? "url(#orangeGradient)" : "url(#redGradient)"}
                          />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient id="brandGreenGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="oklch(0.72 0.20 144.2 / 30%)" />
                          <stop offset="100%" stopColor="oklch(0.72 0.20 144.2)" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[240px] flex items-center justify-center">
                  <Skeleton className="h-full w-full bg-secondary/20 rounded-lg" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/10 border-border/40">
            <CardHeader className="pb-2 border-b border-border/30 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-green" /> Ongoing Active RFQ Tenders
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Click on an RFQ row to view a quick specification.
                </CardDescription>
              </div>
              <Link href="/rfqs">
                <Button variant="ghost" className="h-7 text-[10px] font-semibold text-zinc-400 hover:text-white cursor-pointer px-2 border border-zinc-800/40 hover:bg-zinc-800/20">
                  Manage RFQs <ExternalLink className="ml-1.5 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 bg-zinc-950/20 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-5">RFQ Title</th>
                      <th className="py-3 px-4">Department / Cat</th>
                      <th className="py-3 px-4 font-mono text-right">Budget</th>
                      <th className="py-3 px-4 text-center">Bids</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-5 text-right">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRfqsList.map((rfq) => (
                      <tr
                        key={rfq.id}
                        onClick={() => setSelectedRfqPreview(rfq.originalRfq)}
                        className="border-b border-border/20 hover:bg-secondary/20 cursor-pointer transition-colors duration-150 group"
                      >
                        <td className="py-3.5 px-5 font-semibold text-zinc-200 group-hover:text-brand-green truncate max-w-[180px]">
                          {rfq.title}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400">{rfq.category}</td>
                        <td className="py-3.5 px-4 font-mono text-right text-zinc-300 font-medium">
                          ₹{rfq.budget.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${rfq.submissions > 0 ? 'bg-brand-green-muted/10 text-brand-green border border-brand-green-border/20' : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/20'}`}>
                            {rfq.submissions}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant="outline" className={`text-[9px] font-bold px-2 py-0.5 ${rfq.status === 'Active' || rfq.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700/40'}`}>
                            {rfq.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-right text-zinc-400 font-mono">
                          {rfq.deadline}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Side */}
        <div className="space-y-8">
          
          <Card className="bg-card/10 border-border/40">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-green" /> RFQ Status Distribution
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Tender pipeline volume by active project states.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {mounted ? (
                <div className="relative h-[180px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {donutChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold tracking-tight font-mono">29</span>
                    <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-semibold">Total RFQs</span>
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center">
                  <Skeleton className="h-full w-full bg-secondary/20 rounded-lg" />
                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Preview Dialog */}
      <Dialog open={selectedRfqPreview !== null} onOpenChange={(open) => { if(!open) setSelectedRfqPreview(null); }}>
        <DialogContent className="max-w-2xl bg-card border border-border/40 text-foreground overflow-y-auto max-h-[85vh]">
          {selectedRfqPreview && (
            <>
              <DialogHeader className="border-b border-border/30 pb-4">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                    {selectedRfqPreview.title}
                  </DialogTitle>
                  <Badge variant="outline" className={`text-[9px] font-bold ${selectedRfqPreview.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700/40'}`}>
                    {selectedRfqPreview.status === 'Published' ? 'Active' : selectedRfqPreview.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-4 text-xs">
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1">Description</h4>
                  <p className="text-zinc-300 leading-relaxed bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/40">
                    {selectedRfqPreview.description}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 p-3 bg-zinc-950/20 rounded-lg border border-zinc-800/40">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Tender Budget</span>
                    <p className="font-mono text-sm text-brand-green font-extrabold">₹{selectedRfqPreview.budget.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Category</span>
                    <p className="text-zinc-300 font-semibold truncate">{selectedRfqPreview.category}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Deadline</span>
                    <p className="font-mono text-zinc-300 font-semibold">{selectedRfqPreview.deadline}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
