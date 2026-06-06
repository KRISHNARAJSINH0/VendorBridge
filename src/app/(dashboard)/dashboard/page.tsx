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
  HelpCircle
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
import { getVendorsAction } from "@/lib/actions/vendor";
import { getRFQsAction } from "@/lib/actions/rfq";
import { getQuotationsAction } from "@/lib/actions/quotation";
import { Vendor, RFQ, Quotation } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

// ----------------------------------------------------
// Mock details to supplement database data for visual completeness
// ----------------------------------------------------
const MOCK_TIMELINE_EVENTS = [
  {
    id: "evt-1",
    date: "June 06, 2026",
    time: "11:45 AM",
    title: "Quotation Comparison Complete",
    description: "Office Furniture Q2 comparison processed by scoring engine.",
    type: "comparison",
    icon: Award,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  },
  {
    id: "evt-2",
    date: "June 05, 2026",
    time: "03:10 PM",
    title: "Quotation Received",
    description: "Office Need Co. submitted a bid of ₹2,14,800 for Office Furniture.",
    type: "quotation",
    icon: ReceiptText,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "evt-3",
    date: "June 04, 2026",
    time: "02:15 PM",
    title: "Quotation Received",
    description: "TechCore Ltd submitted a bid of ₹2,00,010 for Office Furniture.",
    type: "quotation",
    icon: ReceiptText,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "evt-4",
    date: "June 04, 2026",
    time: "09:30 AM",
    title: "Quotation Received",
    description: "Infra Supplies Pvt Ltd submitted a bid of ₹1,85,000 for Office Furniture.",
    type: "quotation",
    icon: ReceiptText,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "evt-5",
    date: "June 01, 2026",
    time: "10:00 AM",
    title: "RFQ Published",
    description: "Office Furniture Procurement Q2 published with budget ₹2,50,000.",
    type: "rfq",
    icon: FileText,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  },
  {
    id: "evt-6",
    date: "May 28, 2026",
    time: "04:30 PM",
    title: "Supplier Approved",
    description: "Office Need Co. approved as Active vendor for Office Infrastructure.",
    type: "vendor",
    icon: Building2,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
  },
  {
    id: "evt-7",
    date: "May 20, 2026",
    time: "11:20 AM",
    title: "Supplier Pending Registration",
    description: "OfficePro Furnitures submitted vendor onboarding paperwork.",
    type: "vendor",
    icon: Building2,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  }
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  
  // Selection dialog for RFQ preview
  const [selectedRfqPreview, setSelectedRfqPreview] = useState<RFQ | null>(null);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      try {
        const [v, r, q] = await Promise.all([
          getVendorsAction(),
          getRFQsAction(),
          getQuotationsAction()
        ]);
        setVendors(v);
        setRfqs(r);
        setQuotations(q);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Format today's date dynamically
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }, []);

  // Section 3: Vendor Performance Data mapping
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

  // Section 4: RFQ Status Donut Chart Data
  const donutChartData = [
    { name: "Active / Published", value: 12, color: "#4ade80" },
    { name: "Draft", value: 5, color: "#71717a" },
    { name: "Under Review", value: 4, color: "#fbbf24" },
    { name: "Awarded / Completed", value: 8, color: "#3b82f6" }
  ];

  // Section 5: Supplement database RFQs for realistic high-fidelity active RFQs list
  const activeRfqsList = useMemo(() => {
    const dbActive = rfqs.map(r => {
      const subCount = quotations.filter(q => q.rfqId === r.id).length;
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

    // Supplement to ensure 4 items are visible
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
          status: "Published" as const,
          createdAt: new Date("2026-06-02").toISOString(),
          updatedAt: new Date("2026-06-02").toISOString(),
          items: [
            { id: "item-m1-1", itemName: "Ready Mix Concrete M25", quantity: 80, unit: "Cu.m", estimatedCost: 4000 },
            { id: "item-m1-2", itemName: "TMT Steel Rebars 12mm", quantity: 3, unit: "Tons", estimatedCost: 43000 }
          ],
          vendorIds: ["v-2"],
          attachments: []
        } as RFQ
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
          status: "Published" as const,
          createdAt: new Date("2026-06-03").toISOString(),
          updatedAt: new Date("2026-06-03").toISOString(),
          items: [
            { id: "item-m2-1", itemName: "Weekly Distribution Truck (10 Ton)", quantity: 4, unit: "Weeks", estimatedCost: 75000 }
          ],
          vendorIds: ["v-3"],
          attachments: []
        } as RFQ
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
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 bg-secondary/30" />
            <Skeleton className="h-10 w-28 bg-secondary/30" />
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* ---------------------------------------------------- */}
      {/* HEADER SECTION                                       */}
      {/* ---------------------------------------------------- */}
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

      {/* ---------------------------------------------------- */}
      {/* SECTION 1: PROCUREMENT KPI CARDS                    */}
      {/* ---------------------------------------------------- */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* KPI 1: Active RFQs */}
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
                9 target tenders published, 3 under review
              </p>
            </div>
            {/* Sparkline Visual */}
            <div className="w-full h-4 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,8 L20,6 L40,9 L60,4 L80,2 L100,5" fill="none" stroke="#4ade80" strokeWidth="1.5" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Total Vendors */}
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
                <span className="text-3xl font-extrabold tracking-tight font-mono">28</span>
                <span className="text-[10px] font-bold text-brand-green bg-brand-green-muted/10 border border-brand-green-border/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" /> +4 this week
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-blue-400/80 transition-colors">
                24 verified active, 4 pending paperwork
              </p>
            </div>
            {/* Sparkline Visual */}
            <div className="w-full h-4 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,9 L20,8 L40,7 L60,5 L80,3 L100,1" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Total Spend */}
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
            {/* Sparkline Visual */}
            <div className="w-full h-4 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,7 L20,9 L40,6 L60,4 L80,5 L100,2" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Vendor Performance */}
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
            {/* Sparkline Visual */}
            <div className="w-full h-4 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,9 L20,8 L40,9 L60,6 L80,3 L100,2" fill="none" stroke="#c084fc" strokeWidth="1.5" />
              </svg>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ---------------------------------------------------- */}
      {/* TWO COLUMN CONTENT LAYOUT                            */}
      {/* ---------------------------------------------------- */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        
        {/* LEFT COLUMN: PRIMARY VISUALS (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 3: VENDOR PERFORMANCE BAR CHART */}
          <Card className="bg-card/10 border-border/40">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-green" /> Vendor Performance Evaluation
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Supplier efficiency index calculated based on delivery timelines, pricing deviations, and risk compliance.
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
                        formatter={(value: any, name: any, props: any) => [
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-brand-green font-bold">{value}%</span>
                            <span className="text-[10px] text-zinc-500">(Rating {props.payload.rating} ★)</span>
                          </div>,
                          "Score"
                        ]}
                      />
                      <Bar dataKey="percentage" fill="url(#brandGreenGradient)" radius={[0, 4, 4, 0]} barSize={16}>
                        {barChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.percentage > 85 ? "url(#brandGreenGradient)" : entry.percentage > 70 ? "url(#orangeGradient)" : "url(#redGradient)"}
                          />
                        ))}
                      </Bar>
                      
                      {/* Define Gradients */}
                      <defs>
                        <linearGradient id="brandGreenGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="oklch(0.72 0.20 144.2 / 30%)" />
                          <stop offset="100%" stopColor="oklch(0.72 0.20 144.2)" />
                        </linearGradient>
                        <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="rgba(251, 191, 36, 0.3)" />
                          <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                        <linearGradient id="redGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
                          <stop offset="100%" stopColor="#ef4444" />
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

          {/* SECTION 5: ACTIVE RFQS TABLE */}
          <Card className="bg-card/10 border-border/40">
            <CardHeader className="pb-2 border-b border-border/30 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-green" /> Ongoing Active RFQ Tenders
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Click on an RFQ record row to display a quick spec summary drawer and quote submittals.
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

          {/* SECTION 2: PROCUREMENT ACTIVITY TIMELINE */}
          <Card className="bg-card/10 border-border/40">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-green" /> Live Procurement Activity Stream
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Real-time chronological log of incoming bids, approvals, and RFQ publishes.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative pl-6 border-l border-zinc-800/80 space-y-6">
                {MOCK_TIMELINE_EVENTS.map((evt) => {
                  const IconComponent = evt.icon;
                  return (
                    <div key={evt.id} className="relative group">
                      
                      {/* Timeline dot */}
                      <span className={`absolute -left-[35px] top-1 flex h-6.5 w-6.5 items-center justify-center rounded-full border ${evt.color} shadow-sm group-hover:scale-105 transition-transform`}>
                        <IconComponent className="h-3 w-3" />
                      </span>
                      
                      {/* Event Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-brand-green transition-colors">
                            {evt.title}
                          </h4>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {evt.date} • {evt.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {evt.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: SECONDARY CHARTS & INTEL (Span 1) */}
        <div className="space-y-8">
          

          {/* SECTION 4: RFQ STATUS DONUT CHART */}
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          borderColor: "rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                          fontSize: "11px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Total Value Overlay in center of Donut */}
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
              
              {/* Legend checklist */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-zinc-400">
                {donutChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}</span>
                    <span className="font-mono font-bold text-zinc-200 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* SECTION 8: PROCUREMENT SUMMARY STATS */}
          <Card className="bg-card/10 border-border/40">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-green" /> Procurement Metrics Summary
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Aggregated system operational targets.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              
              {/* Savings */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Cumulative Tender Savings</span>
                  <span className="font-mono font-bold text-zinc-200">₹4.8L (17.5% Avg)</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-green rounded-full" style={{ width: "70%" }} />
                </div>
              </div>

              {/* Quotation response */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Avg Quotation Response Time</span>
                  <span className="font-mono font-bold text-zinc-200">2.8 Days (Target: 3.5d)</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              {/* Contract cycle */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Avg Contract Cycle Time</span>
                  <span className="font-mono font-bold text-zinc-200">14.5 Days (Target: 18d)</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* PREVIEW DIALOG FOR TABLE ROWS                       */}
      {/* ---------------------------------------------------- */}
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
                <DialogDescription className="text-xs text-muted-foreground">
                  Reference Tender ID: <span className="font-mono text-zinc-300 font-semibold">{selectedRfqPreview.id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4 text-xs">
                
                {/* Description */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1">Description</h4>
                  <p className="text-zinc-300 leading-relaxed bg-zinc-950/40 p-3 rounded-lg border border-zinc-980 border-zinc-800/40">
                    {selectedRfqPreview.description}
                  </p>
                </div>

                {/* Tender Stats Row */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-zinc-950/20 rounded-lg border border-zinc-850 border-zinc-850/30">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Tender Budget</span>
                    <p className="font-mono text-sm text-brand-green font-extrabold">₹{selectedRfqPreview.budget.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Category / Department</span>
                    <p className="text-zinc-300 font-semibold truncate">{selectedRfqPreview.category}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Submission Deadline</span>
                    <p className="font-mono text-zinc-300 font-semibold">{selectedRfqPreview.deadline}</p>
                  </div>
                </div>

                {/* Items Specification */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-2">Item Specifications Checklist</h4>
                  <div className="border border-border/30 rounded-lg overflow-hidden bg-zinc-950/10">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border/30 bg-zinc-950/30 text-[9px] text-zinc-400 font-bold uppercase">
                          <th className="py-2 px-3">Item Specification</th>
                          <th className="py-2 px-3 text-center">Req Qty</th>
                          <th className="py-2 px-3 text-right">Est Unit Cost</th>
                          <th className="py-2 px-3 text-right">Est Total Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRfqPreview.items?.map((item) => (
                          <tr key={item.id} className="border-b border-border/20 last:border-0 hover:bg-zinc-800/20">
                            <td className="py-2.5 px-3 font-medium text-zinc-200">{item.itemName}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-medium text-zinc-300">{item.quantity} {item.unit}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-zinc-400">₹{item.estimatedCost.toLocaleString("en-IN")}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-300">₹{(item.quantity * item.estimatedCost).toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bids received for RFQ */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-2">Received Quotations Bids</h4>
                  <div className="space-y-2">
                    {quotations.filter(q => q.rfqId === selectedRfqPreview.id).length === 0 ? (
                      <div className="text-center py-6 border border-zinc-800/40 rounded-lg bg-zinc-950/20 text-zinc-500 italic">
                        No quotations received for this tender yet.
                      </div>
                    ) : (
                      quotations.filter(q => q.rfqId === selectedRfqPreview.id).map(q => (
                        <div key={q.id} className="flex items-center justify-between p-3 bg-zinc-950/30 border border-zinc-800/40 rounded-lg hover:border-zinc-700/40">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-zinc-200">{q.vendorName}</span>
                              <Badge variant="outline" className={`text-[8px] font-bold py-0.5 px-1 ${q.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-brand-green-muted/20 text-brand-green border border-brand-green-border/20'}`}>
                                {q.status}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono">Terms: {q.paymentTerms} • Warranty: {q.warranty}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-brand-green font-bold text-sm">₹{q.grandTotal.toLocaleString("en-IN")}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">Submitted: {new Date(q.createdAt).toLocaleDateString("en-IN")}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Close Button / Compare direct action */}
              <div className="flex justify-end pt-4 mt-4 border-t border-border/30 gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedRfqPreview(null)}
                  className="text-xs h-9 cursor-pointer hover:bg-secondary/40 border border-border/30 text-zinc-400 hover:text-zinc-200"
                >
                  Close Preview
                </Button>
                {quotations.filter(q => q.rfqId === selectedRfqPreview.id).length > 0 && (
                  <Link href="/quotations?compare=true">
                    <Button className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-9 px-4 cursor-pointer">
                      Open Comparison Workspace
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
