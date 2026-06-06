"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee,
  Building2,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  ChevronDown,
  Sparkles,
  Filter,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Search,
  PieChart as PieIcon,
  BarChart3 as BarChartIcon
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useAppState } from "@/context/StateContext";
import { Vendor, RFQ } from "@/lib/types";

// Category Colors map
const CATEGORY_COLOR_MAP: Record<string, string> = {
  "IT Hardware": "#3b82f6", // Blue
  "IT & Hardware": "#3b82f6", // Blue
  "Furniture": "#10b981", // Emerald
  "Office Supplies": "#f59e0b", // Amber
  "Stationery": "#f59e0b", // Amber
  "Logistics": "#ef4444", // Red
  "Facility Management": "#8b5cf6", // Violet
  "Industrial": "#8b5cf6", // Violet
  "Marketing Services": "#ec4899", // Pink
  "General": "#71717a" // Gray
};

const formatRupee = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
};

const formatRupeeDetailed = (value: number) => {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
};

// Smooth Counter Component
const AnimatedCounter = ({
  value,
  duration = 800,
  prefix = "",
  suffix = "",
  decimals = 0,
  isLakh = false
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  isLakh?: boolean;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = progress * (value - startValue) + startValue;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  if (isLakh) {
    const lakhVal = displayValue / 100000;
    return <span>{prefix}{lakhVal.toFixed(2)}L{suffix}</span>;
  }

  return <span>{prefix}{displayValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}</span>;
};

export default function ReportsPage() {
  const { purchaseOrders, invoices, vendors, rfqs, quotations } = useAppState();
  
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("All Months");
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Global Filters State
  const [filters, setFilters] = useState({
    vendor: "All",
    category: "All",
    status: "All"
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setIsMonthDropdownOpen(false);
    triggerLoading();
  };

  const handleFilterChange = (key: string, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    triggerLoading();
  };

  const handleResetFilters = () => {
    setFilters({
      vendor: "All",
      category: "All",
      status: "All"
    });
    setSelectedMonth("All Months");
    triggerLoading();
  };

  // Mock Export Simulation
  const handleExport = (format: string) => {
    setIsExportDropdownOpen(false);
    const id = toast.loading(`Compiling VendorBridge Report as ${format}...`);
    
    setTimeout(() => {
      toast.success(`${format} Report compiled successfully! Downloading now.`, {
        id,
        duration: 3000
      });
    }, 1500);
  };

  // Get list of available months in dataset for selector
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    purchaseOrders.forEach((po: any) => {
      if (po.createdDate) {
        try {
          const date = new Date(po.createdDate);
          if (!isNaN(date.getTime())) {
            const formatted = date.toLocaleString("en-US", { month: "long", year: "numeric" });
            months.add(formatted);
          }
        } catch(e) {}
      }
    });
    return ["All Months", ...Array.from(months)];
  }, [purchaseOrders]);

  // Filters POs based on select parameters
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po: any) => {
      // Month check
      if (selectedMonth !== "All Months" && po.createdDate) {
        const mFormatted = new Date(po.createdDate).toLocaleString("en-US", { month: "long", year: "numeric" });
        if (mFormatted !== selectedMonth) return false;
      }
      
      // Vendor check
      if (filters.vendor !== "All" && po.vendorName !== filters.vendor) return false;

      // Category check
      const rfqMatch = rfqs.find((r: any) => r.id === po.rfqId);
      const category = rfqMatch ? rfqMatch.category : "General";
      if (filters.category !== "All" && category !== filters.category) return false;

      // Status check
      if (filters.status !== "All" && po.status !== filters.status) return false;

      return true;
    });
  }, [purchaseOrders, rfqs, selectedMonth, filters]);

  // Computed metrics
  const totalSpend = useMemo(() => {
    return filteredPOs.reduce((acc: number, curr: any) => acc + curr.total, 0);
  }, [filteredPOs]);

  const activeVendorsCount = useMemo(() => {
    return vendors.filter((v: any) => v.status === "Active").length;
  }, [vendors]);

  const fulfillmentRate = useMemo(() => {
    const totalCount = filteredPOs.length;
    if (totalCount === 0) return 0;
    // Map Paid POs as fulfilled
    const fulfilled = filteredPOs.filter((po: any) => {
      // If invoice corresponding to PO is marked Paid
      const matchingInv = invoices.find((inv: any) => inv.poId === po.id);
      return (matchingInv && matchingInv.status === "Paid") || po.status === "Paid";
    }).length;
    return Math.round((fulfilled / totalCount) * 100);
  }, [filteredPOs, invoices]);

  const overdueInvoicesCount = useMemo(() => {
    return invoices.filter((inv: any) => inv.status === "Sent").length;
  }, [invoices]);

  // Group Spend by Category
  const spendByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    filteredPOs.forEach((po: any) => {
      const rfqMatch = rfqs.find((r: any) => r.id === po.rfqId);
      const cat = rfqMatch ? rfqMatch.category : "General";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + po.total;
    });

    const categoriesInDataset = Object.keys(categoryTotals);
    if (categoriesInDataset.length === 0) {
      return [{ name: "General", spend: 0, percentage: 100, color: CATEGORY_COLOR_MAP["General"] }];
    }

    return categoriesInDataset.map((cat: string) => {
      const spend = categoryTotals[cat];
      const percentage = totalSpend > 0 ? Math.round((spend / totalSpend) * 100) : 0;
      return {
        name: cat,
        spend,
        percentage,
        color: CATEGORY_COLOR_MAP[cat] || CATEGORY_COLOR_MAP["General"]
      };
    }).sort((a, b) => b.spend - a.spend);
  }, [filteredPOs, totalSpend, rfqs]);

  // Group Spend by Vendor
  const vendorRankings = useMemo(() => {
    const vendorTotals: Record<string, { spend: number; poCount: number }> = {};
    
    filteredPOs.forEach((po: any) => {
      const entry = vendorTotals[po.vendorName] || { spend: 0, poCount: 0 };
      entry.spend += po.total;
      entry.poCount += 1;
      vendorTotals[po.vendorName] = entry;
    });

    return Object.keys(vendorTotals).map((name: string) => {
      const entry = vendorTotals[name];
      const matchV = vendors.find((v: any) => v.name === name);
      const rating = matchV ? matchV.rating : 4.5;
      
      return {
        name,
        spend: entry.spend,
        poCount: entry.poCount,
        performanceScore: Math.round(rating * 20), // Map 5 star to 100
        riskLevel: rating >= 4.5 ? "Low" : rating >= 4.0 ? "Medium" : "High"
      };
    }).sort((a, b) => b.spend - a.spend);
  }, [filteredPOs, vendors]);

  // Monthly Trend mapping for the area chart
  const monthlyTrends = useMemo(() => {
    const trendMap: Record<string, { spend: number; poCount: number }> = {};
    
    // Last 6 months boilerplate
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      trendMap[key] = { spend: 0, poCount: 0 };
    }

    purchaseOrders.forEach((po: any) => {
      if (po.createdDate) {
        try {
          const date = new Date(po.createdDate);
          if (!isNaN(date.getTime())) {
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            if (trendMap[key] !== undefined) {
              trendMap[key].spend += po.total;
              trendMap[key].poCount += 1;
            } else {
              // Add dynamic month if outside last 6 months but valid
              trendMap[key] = { spend: po.total, poCount: 1 };
            }
          }
        } catch(e) {}
      }
    });

    return Object.keys(trendMap).map((key: string) => ({
      name: key.split(" ")[0],
      "Spend": trendMap[key].spend,
      "PO Count": trendMap[key].poCount
    }));
  }, [purchaseOrders]);

  // Donut chart distribution data
  const donutData = useMemo(() => {
    return spendByCategory.filter((item: any) => item.spend > 0);
  }, [spendByCategory]);

  // Efficiency Statistics
  const efficiency = useMemo(() => {
    // Calculate average delivery days from submitted/approved quotes
    const relevantQuotes = quotations.filter((q: any) => q.status === "Selected" || q.status === "Approved" || q.status === "Closed");
    const avgDelivery = relevantQuotes.length > 0 
      ? (relevantQuotes.reduce((acc: number, curr: any) => acc + curr.deliveryDays, 0) / relevantQuotes.length).toFixed(1)
      : "10.0";
    
    return {
      avgDelivery,
      avgApproval: "1.5",
      avgRfq: "2.4"
    };
  }, [quotations]);

  // AI recommendations
  const aiInsights = useMemo(() => {
    const highestRatingVendor = [...vendors].sort((a: any, b: any) => b.rating - a.rating)[0];
    const topVendorName = highestRatingVendor ? highestRatingVendor.name : "Acme Corp";
    const topVendorScore = highestRatingVendor ? Math.round(highestRatingVendor.rating * 20) : 96;

    const riskVendor = vendors.find((v: any) => v.status === "Suspended") || vendors.find((v: any) => v.rating < 4.0);
    const riskVendorName = riskVendor ? riskVendor.name : "Vanguard Catering";
    const riskLevel = riskVendor ? (riskVendor.status === "Suspended" ? "High" : "Medium") : "Medium";
    const riskReason = riskVendor ? (riskVendor.status === "Suspended" ? "Supplier account suspended due to L1 breaches." : "Below standard SLA fulfillment ratings.") : "Late delivery pattern spotted on past 3 procurement nodes.";

    return {
      topVendorName,
      topVendorScore,
      expectedSavings: Math.round(totalSpend * 0.072), // 7.2% optimization saving
      riskVendorName,
      riskLevel,
      riskReason
    };
  }, [vendors, totalSpend]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-md border border-zinc-800/80 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[140px]">
          <p className="font-semibold text-zinc-300">{label}</p>
          <div className="space-y-1">
            {payload.map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center gap-4">
                <span className="text-zinc-500 capitalize" style={{ color: p.color || p.fill }}>
                  {p.name}:
                </span>
                <span className="font-semibold text-zinc-100 font-mono">
                  {p.name.includes("Spend") ? formatRupeeDetailed(p.value) : p.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 text-brand-green animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">Initializing Intelligence Feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 select-none">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visual intelligence dashboard, spend breakdown, and supplier risk reports.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Month Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-850 hover:border-zinc-700 transition-all cursor-pointer"
            >
              <span>{selectedMonth}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isMonthDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMonthDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-xl p-1.5 z-50 text-xs text-zinc-300"
                  >
                    {availableMonths.map((month) => (
                      <button
                        key={month}
                        onClick={() => handleMonthChange(month)}
                        className={`w-full text-left rounded-md px-3 py-2 transition-all cursor-pointer hover:bg-zinc-850 hover:text-white ${selectedMonth === month ? 'bg-brand-green/10 text-brand-green border-l-2 border-brand-green font-bold' : ''}`}
                      >
                        {month}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Export Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center gap-2 rounded-lg bg-brand-green text-black px-4 py-2.5 text-xs font-bold hover:shadow-[0_0_15px_rgba(114,213,99,0.3)] transition-all cursor-pointer green-glow-button border border-transparent"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Report</span>
            </button>

            <AnimatePresence>
              {isExportDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsExportDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-36 rounded-lg bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-xl p-1.5 z-50 text-xs text-zinc-300"
                  >
                    {["PDF", "Excel", "CSV"].map((format) => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className="w-full text-left rounded-md px-3 py-2 hover:bg-zinc-850 hover:text-white transition-all cursor-pointer"
                      >
                        Export to {format}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Panel Toggle */}
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center justify-center p-2.5 rounded-lg border transition-all cursor-pointer ${
              isFilterPanelOpen 
                ? 'bg-brand-green/10 border-brand-green/20 text-brand-green' 
                : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* FILTER PANEL SECTION */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 backdrop-blur-lg grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
              <div className="absolute top-3 right-3 text-[9px] font-mono text-zinc-650 uppercase tracking-widest pointer-events-none">Locks</div>
              
              {/* Vendor Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Supplier Vendor</label>
                <select
                  value={filters.vendor}
                  onChange={(e) => handleFilterChange("vendor", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-brand-green transition-all"
                >
                  <option value="All">All Suppliers</option>
                  {vendors.map((v: Vendor) => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Procurement Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-brand-green transition-all"
                >
                  <option value="All">All Categories</option>
                  {rfqs.map((r: RFQ) => r.category).filter((val: string, idx: number, self: string[]) => self.indexOf(val) === idx).map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">PO Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-brand-green transition-all"
                >
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                  <option value="CREATED">Pending</option>
                </select>
              </div>

              {/* Clear Toggles Bar */}
              {(filters.vendor !== "All" || filters.category !== "All" || filters.status !== "All" || selectedMonth !== "All Months") && (
                <div className="col-span-full flex justify-end pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-700/50"
                  >
                    Clear Filter Locks
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE STATS CARD & REPORT BODY */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-zinc-900/40 border border-zinc-800/60" />
              ))}
            </div>
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 h-80 rounded-xl bg-zinc-900/40 border border-zinc-800/60" />
              <div className="lg:col-span-4 h-80 rounded-xl bg-zinc-900/40 border border-zinc-800/60" />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {filteredPOs.length === 0 ? (
              <div className="border border-dashed border-zinc-800/80 rounded-2xl p-16 text-center max-w-md mx-auto space-y-4">
                <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h3 className="font-bold text-zinc-200 text-sm">No Transaction Records Found</h3>
                  <p className="text-xs text-zinc-500">
                    No purchase orders match this filter structure. Try broadening the search.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-zinc-800 text-xs font-semibold text-zinc-200 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  Clear Locks
                </button>
              </div>
            ) : (
              <>
                {/* SECTION 1: 4 KPI SUMMARY CARDS */}
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  
                  {/* Spend KPI */}
                  <div className="relative group overflow-hidden bg-zinc-900/30 border border-zinc-850 hover:border-blue-500/25 rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px] green-glow-card backdrop-blur-md">
                    <div className="absolute top-0 right-0 h-[3px] w-[50px] bg-blue-500/50 rounded-bl group-hover:w-full transition-all duration-300" />
                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Total Spend</span>
                      <div className="p-1.5 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-900/30">
                        <IndianRupee className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                        <AnimatedCounter value={totalSpend} prefix="₹" isLakh />
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        Allocated capital commitments
                      </p>
                    </div>
                  </div>

                  {/* Active Vendors KPI */}
                  <div className="relative group overflow-hidden bg-zinc-900/30 border border-zinc-850 hover:border-emerald-500/25 rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px] green-glow-card backdrop-blur-md">
                    <div className="absolute top-0 right-0 h-[3px] w-[50px] bg-emerald-500/50 rounded-bl group-hover:w-full transition-all duration-300" />
                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Active Vendors</span>
                      <div className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                        <Building2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                        <AnimatedCounter value={activeVendorsCount} />
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold flex items-center gap-1">
                        Verified active vendor pool
                      </p>
                    </div>
                  </div>

                  {/* PO Fulfillment KPI */}
                  <div className="relative group overflow-hidden bg-zinc-900/30 border border-zinc-850 hover:border-amber-500/25 rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px] green-glow-card backdrop-blur-md">
                    <div className="absolute top-0 right-0 h-[3px] w-[50px] bg-amber-500/50 rounded-bl group-hover:w-full transition-all duration-300" />
                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Fulfillment Rate</span>
                      <div className="p-1.5 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-900/30">
                        <PackageCheck className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                        <AnimatedCounter value={fulfillmentRate} suffix="%" />
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold flex items-center gap-1">
                        Contracts completed & paid
                      </p>
                    </div>
                  </div>

                  {/* Overdue Invoices KPI */}
                  <div className="relative group overflow-hidden bg-zinc-900/30 border border-zinc-850 hover:border-red-500/25 rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px] green-glow-card backdrop-blur-md">
                    <div className="absolute top-0 right-0 h-[3px] w-[50px] bg-red-500/50 rounded-bl group-hover:w-full transition-all duration-300" />
                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Pending Invoices</span>
                      <div className="p-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-900/30">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                        <AnimatedCounter value={overdueInvoicesCount} />
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold flex items-center gap-1">
                        Invoices awaiting L2 payment
                      </p>
                    </div>
                  </div>

                </div>

                {/* GRAPH SECTION: MONTHLY TREND & CATEGORY PIE */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                  
                  {/* Monthly Trend Area Chart */}
                  <div className="lg:col-span-8 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm relative">
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 mb-5">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest font-mono">Procurement Trend</h3>
                        <p className="text-[11px] text-zinc-500">Monthly capital spend commitment trend</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-brand-green" />
                          <span>Spend volume</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-72 w-full text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="#52525b" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#52525b" 
                            fontSize={10} 
                            tickFormatter={(v) => formatRupee(v)} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="Spend" 
                            stroke="#22C55E" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#spendGrad)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Spend share category donut */}
                  <div className="lg:col-span-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between">
                    <div className="border-b border-zinc-800/50 pb-3 mb-4">
                      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest font-mono">Spend Distribution</h3>
                      <p className="text-[11px] text-zinc-500">Capital split by business unit</p>
                    </div>

                    <div className="h-44 w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="spend"
                          >
                            {donutData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Total</span>
                        <span className="text-sm font-black text-white font-mono">{formatRupee(totalSpend)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4 border-t border-zinc-800/50">
                      {donutData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-semibold text-zinc-200 font-mono">
                            {item.percentage}% ({formatRupee(item.spend)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* ROW 3: VENDOR RANKING & CATEGORY BARS */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                  
                  {/* Top Vendors Table */}
                  <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm">
                    <div className="border-b border-zinc-800/50 pb-3 mb-4">
                      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest font-mono">Top Vendors by Spend</h3>
                      <p className="text-[11px] text-zinc-500">Fulfillment statistics and performance scoring</p>
                    </div>

                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-850 text-zinc-500 font-bold font-mono">
                            <th className="py-2.5 px-3 w-10">Rank</th>
                            <th className="py-2.5 px-3">Vendor Name</th>
                            <th className="py-2.5 px-3 text-right">Aggregate Spend</th>
                            <th className="py-2.5 px-3 text-center">POs</th>
                            <th className="py-2.5 px-3 text-center">Score</th>
                            <th className="py-2.5 px-3 text-center">Risk</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850/40">
                          {vendorRankings.slice(0, 5).map((vend, idx) => (
                            <tr key={vend.name} className="hover:bg-zinc-800/20 group transition-all">
                              <td className="py-3 px-3 font-semibold text-zinc-400 group-hover:text-white font-mono">{idx + 1}</td>
                              <td className="py-3 px-3 font-bold text-zinc-200 group-hover:text-white">{vend.name}</td>
                              <td className="py-3 px-3 text-right font-semibold text-zinc-200 group-hover:text-white font-mono">
                                {formatRupeeDetailed(vend.spend)}
                              </td>
                              <td className="py-3 px-3 text-center text-zinc-400 group-hover:text-zinc-200 font-mono">{vend.poCount}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                  vend.performanceScore >= 90 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                                    : vend.performanceScore >= 80
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                                }`}>
                                  {vend.performanceScore}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                  vend.riskLevel === "Low" 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                                    : vend.riskLevel === "Medium"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                                    : "bg-red-500/10 text-red-400 border border-red-500/10"
                                }`}>
                                  {vend.riskLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Horizontal Cost progress bars */}
                  <div className="lg:col-span-5 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm">
                    <div className="border-b border-zinc-800/50 pb-3 mb-5">
                      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest font-mono">Category Volume</h3>
                      <p className="text-[11px] text-zinc-500">Horizontal cost distributions & share</p>
                    </div>

                    <div className="space-y-4">
                      {spendByCategory.map((item) => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 font-bold text-zinc-300">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span>{item.name}</span>
                            </div>
                            <div className="space-x-1.5 font-mono">
                              <span className="font-bold text-zinc-100">{formatRupeeDetailed(item.spend)}</span>
                              <span className="text-zinc-500 text-[10px]">({item.percentage}%)</span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* ROW 4: AI INSIGHTS & PERFORMANCE SCORECARD */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                  
                  {/* AI Procurement Insights */}
                  <div className="lg:col-span-5 relative group overflow-hidden bg-zinc-900/30 border border-brand-green/20 hover:border-brand-green/35 rounded-xl p-5 backdrop-blur-sm transition-all duration-300">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-brand-green/5 blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-brand-green/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-brand-green/15 text-brand-green border border-brand-green/20">
                          <Sparkles className="h-4 w-4 animate-pulse" />
                        </div>
                        <h3 className="text-sm font-bold text-brand-green uppercase tracking-widest font-mono">AI Engine Diagnostics</h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Top Supplier */}
                      <div className="flex items-start gap-3 bg-black/30 border border-zinc-850/50 p-3 rounded-lg">
                        <div className="p-1.5 rounded bg-emerald-950/40 text-emerald-400 mt-0.5 border border-emerald-900/30">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Premium Vendor Index</span>
                          <p className="text-xs font-black text-zinc-200">{aiInsights.topVendorName}</p>
                          <p className="text-[10px] text-zinc-400">Maintains premium performance index score of {aiInsights.topVendorScore}/100.</p>
                        </div>
                      </div>

                      {/* Potential Expected Savings */}
                      <div className="flex items-start gap-3 bg-black/30 border border-zinc-850/50 p-3 rounded-lg">
                        <div className="p-1.5 rounded bg-blue-950/40 text-blue-400 mt-0.5 border border-blue-900/30">
                          <TrendingUp className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Estimated Consolidation Savings</span>
                          <p className="text-xs font-black text-zinc-200">₹{aiInsights.expectedSavings.toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-zinc-400">Potential monthly savings calculated if categories consolidated with Top Vendors.</p>
                        </div>
                      </div>

                      {/* Risk Alert */}
                      <div className="flex items-start gap-3 bg-black/30 border border-red-500/10 p-3 rounded-lg">
                        <div className="p-1.5 rounded bg-red-950/40 text-red-400 mt-0.5 border border-red-900/30">
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Supplier Risk Warnings</span>
                          <p className="text-xs font-black text-zinc-200">{aiInsights.riskVendorName} ({aiInsights.riskLevel} Risk)</p>
                          <p className="text-[10px] text-red-400/80 font-medium">{aiInsights.riskReason}</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="text-[10px] bg-brand-green/5 text-brand-green/90 border border-brand-green/15 rounded p-2.5 text-center font-mono">
                          DECISION PATH: Consolidate IT categories to optimize spend volume rates.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Efficiency metrics scorecard */}
                  <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between">
                    <div className="border-b border-zinc-800/50 pb-3 mb-4">
                      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest font-mono">SLA Efficiency Scorecard</h3>
                      <p className="text-[11px] text-zinc-500">Quality score comparisons for top active suppliers</p>
                    </div>

                    <div className="h-44 w-full text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={vendorRankings.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="#52525b" 
                            fontSize={9}
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(v) => v.split(" ")[0]}
                          />
                          <YAxis 
                            stroke="#52525b" 
                            fontSize={9} 
                            domain={[0, 100]}
                            tickLine={false} 
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="performanceScore" name="Performance Score" fill="#10B981" radius={[4, 4, 0, 0]}>
                            {vendorRankings.slice(0, 5).map((entry: any, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.performanceScore >= 90 ? "#10B981" : entry.performanceScore >= 80 ? "#3B82F6" : "#F59E0B"} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800/50 mt-4">
                      
                      {/* Delivery Time */}
                      <div className="bg-black/20 border border-zinc-850/50 p-2.5 rounded-lg text-center space-y-1">
                        <Clock className="h-3.5 w-3.5 text-zinc-500 mx-auto" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Avg Delivery</p>
                          <h4 className="text-sm font-black text-zinc-200 font-mono">{efficiency.avgDelivery} Days</h4>
                        </div>
                      </div>

                      {/* Approval Time */}
                      <div className="bg-black/20 border border-zinc-850/50 p-2.5 rounded-lg text-center space-y-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500 mx-auto" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Avg Approval</p>
                          <h4 className="text-sm font-black text-zinc-200 font-mono">{efficiency.avgApproval} Days</h4>
                        </div>
                      </div>

                      {/* RFQ Response */}
                      <div className="bg-black/20 border border-zinc-850/50 p-2.5 rounded-lg text-center space-y-1">
                        <RefreshCw className="h-3.5 w-3.5 text-zinc-500 mx-auto" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">RFQ Response</p>
                          <h4 className="text-sm font-black text-zinc-200 font-mono">{efficiency.avgRfq} Days</h4>
                        </div>
                      </div>

                      {/* Success Rate */}
                      <div className="bg-black/20 border border-zinc-850/50 p-2.5 rounded-lg text-center space-y-1">
                        <TrendingUp className="h-3.5 w-3.5 text-zinc-500 mx-auto" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Success Rate</p>
                          <h4 className="text-sm font-black text-zinc-200 font-mono">92%</h4>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
