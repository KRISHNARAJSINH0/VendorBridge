"use client";

import React, { useState, useEffect } from "react";
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
  Cell,
  Legend
} from "recharts";

// TypeScript Interfaces
interface Transaction {
  id: string;
  month: string; // "December 2024" to "May 2025"
  vendor: string;
  spend: number;
  poCount: number;
  category: "IT Hardware" | "Furniture" | "Stationery" | "Logistics" | "Industrial";
  status: "Fulfilled" | "In Progress" | "Delayed";
  riskLevel: "Low" | "Medium" | "High";
  performanceScore: number;
  deliveryDays: number;
  approvalDays: number;
  rfqResponseDays: number;
}

// Master Realistic Data
const MASTER_TRANSACTIONS: Transaction[] = [
  // December 2024
  { id: "T1", month: "December 2024", vendor: "TechCore Ltd", spend: 380000, poCount: 5, category: "IT Hardware", status: "Fulfilled", riskLevel: "Low", performanceScore: 94, deliveryDays: 6, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T2", month: "December 2024", vendor: "Infra Supplies", spend: 280000, poCount: 3, category: "Furniture", status: "Fulfilled", riskLevel: "Low", performanceScore: 87, deliveryDays: 8, approvalDays: 2, rfqResponseDays: 3 },
  { id: "T3", month: "December 2024", vendor: "FastLog Transport", spend: 150000, poCount: 2, category: "Logistics", status: "Fulfilled", riskLevel: "Medium", performanceScore: 83, deliveryDays: 7, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T4", month: "December 2024", vendor: "OfficeNeed Co", spend: 90000, poCount: 2, category: "Stationery", status: "Fulfilled", riskLevel: "Low", performanceScore: 78, deliveryDays: 5, approvalDays: 1, rfqResponseDays: 1 },
  { id: "T5", month: "December 2024", vendor: "Smart Industrial", spend: 120000, poCount: 2, category: "Industrial", status: "Fulfilled", riskLevel: "Low", performanceScore: 90, deliveryDays: 6, approvalDays: 1, rfqResponseDays: 2 },

  // January 2025
  { id: "T6", month: "January 2025", vendor: "TechCore Ltd", spend: 400000, poCount: 6, category: "IT Hardware", status: "Fulfilled", riskLevel: "Low", performanceScore: 93, deliveryDays: 7, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T7", month: "January 2025", vendor: "Infra Supplies", spend: 300000, poCount: 4, category: "Furniture", status: "Fulfilled", riskLevel: "Low", performanceScore: 88, deliveryDays: 9, approvalDays: 2, rfqResponseDays: 3 },
  { id: "T8", month: "January 2025", vendor: "FastLog Transport", spend: 180000, poCount: 3, category: "Logistics", status: "Delayed", riskLevel: "Medium", performanceScore: 82, deliveryDays: 10, approvalDays: 1, rfqResponseDays: 3 },
  { id: "T9", month: "January 2025", vendor: "OfficeNeed Co", spend: 110000, poCount: 3, category: "Stationery", status: "Fulfilled", riskLevel: "Low", performanceScore: 79, deliveryDays: 4, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T10", month: "January 2025", vendor: "Smart Industrial", spend: 150000, poCount: 3, category: "Industrial", status: "Fulfilled", riskLevel: "Medium", performanceScore: 89, deliveryDays: 7, approvalDays: 2, rfqResponseDays: 2 },

  // February 2025
  { id: "T11", month: "February 2025", vendor: "TechCore Ltd", spend: 350000, poCount: 5, category: "IT Hardware", status: "Fulfilled", riskLevel: "Low", performanceScore: 95, deliveryDays: 5, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T12", month: "February 2025", vendor: "Infra Supplies", spend: 250000, poCount: 3, category: "Furniture", status: "Fulfilled", riskLevel: "Low", performanceScore: 86, deliveryDays: 8, approvalDays: 1, rfqResponseDays: 3 },
  { id: "T13", month: "February 2025", vendor: "FastLog Transport", spend: 160000, poCount: 3, category: "Logistics", status: "Fulfilled", riskLevel: "Medium", performanceScore: 84, deliveryDays: 7, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T14", month: "February 2025", vendor: "OfficeNeed Co", spend: 100000, poCount: 2, category: "Stationery", status: "Fulfilled", riskLevel: "Low", performanceScore: 77, deliveryDays: 5, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T15", month: "February 2025", vendor: "Smart Industrial", spend: 130000, poCount: 2, category: "Industrial", status: "In Progress", riskLevel: "Low", performanceScore: 91, deliveryDays: 6, approvalDays: 1, rfqResponseDays: 2 },

  // March 2025
  { id: "T16", month: "March 2025", vendor: "TechCore Ltd", spend: 450000, poCount: 7, category: "IT Hardware", status: "Fulfilled", riskLevel: "Low", performanceScore: 92, deliveryDays: 8, approvalDays: 2, rfqResponseDays: 2 },
  { id: "T17", month: "March 2025", vendor: "Infra Supplies", spend: 320000, poCount: 4, category: "Furniture", status: "Fulfilled", riskLevel: "Low", performanceScore: 89, deliveryDays: 8, approvalDays: 1, rfqResponseDays: 3 },
  { id: "T18", month: "March 2025", vendor: "FastLog Transport", spend: 200000, poCount: 4, category: "Logistics", status: "Delayed", riskLevel: "High", performanceScore: 80, deliveryDays: 11, approvalDays: 2, rfqResponseDays: 3 },
  { id: "T19", month: "March 2025", vendor: "OfficeNeed Co", spend: 130000, poCount: 3, category: "Stationery", status: "Fulfilled", riskLevel: "Low", performanceScore: 80, deliveryDays: 4, approvalDays: 1, rfqResponseDays: 1 },
  { id: "T20", month: "March 2025", vendor: "Smart Industrial", spend: 170000, poCount: 3, category: "Industrial", status: "Fulfilled", riskLevel: "Low", performanceScore: 92, deliveryDays: 6, approvalDays: 1, rfqResponseDays: 2 },

  // April 2025
  { id: "T21", month: "April 2025", vendor: "TechCore Ltd", spend: 410000, poCount: 6, category: "IT Hardware", status: "Fulfilled", riskLevel: "Low", performanceScore: 94, deliveryDays: 6, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T22", month: "April 2025", vendor: "Infra Supplies", spend: 290000, poCount: 3, category: "Furniture", status: "In Progress", riskLevel: "Low", performanceScore: 87, deliveryDays: 9, approvalDays: 2, rfqResponseDays: 3 },
  { id: "T23", month: "April 2025", vendor: "FastLog Transport", spend: 170000, poCount: 3, category: "Logistics", status: "Fulfilled", riskLevel: "Medium", performanceScore: 85, deliveryDays: 8, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T24", month: "April 2025", vendor: "OfficeNeed Co", spend: 120000, poCount: 3, category: "Stationery", status: "Fulfilled", riskLevel: "Low", performanceScore: 78, deliveryDays: 5, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T25", month: "April 2025", vendor: "Smart Industrial", spend: 160000, poCount: 3, category: "Industrial", status: "Fulfilled", riskLevel: "Low", performanceScore: 90, deliveryDays: 6, approvalDays: 1, rfqResponseDays: 2 },

  // May 2025
  { id: "T26", month: "May 2025", vendor: "TechCore Ltd", spend: 480000, poCount: 7, category: "IT Hardware", status: "Fulfilled", riskLevel: "Low", performanceScore: 95, deliveryDays: 6, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T27", month: "May 2025", vendor: "Infra Supplies", spend: 320000, poCount: 4, category: "Furniture", status: "Fulfilled", riskLevel: "Low", performanceScore: 89, deliveryDays: 8, approvalDays: 2, rfqResponseDays: 3 },
  { id: "T28", month: "May 2025", vendor: "FastLog Transport", spend: 230000, poCount: 4, category: "Logistics", status: "Delayed", riskLevel: "High", performanceScore: 79, deliveryDays: 12, approvalDays: 2, rfqResponseDays: 3 },
  { id: "T29", month: "May 2025", vendor: "OfficeNeed Co", spend: 210000, poCount: 4, category: "Stationery", status: "Fulfilled", riskLevel: "Low", performanceScore: 81, deliveryDays: 4, approvalDays: 1, rfqResponseDays: 2 },
  { id: "T30", month: "May 2025", vendor: "Smart Industrial", spend: 180000, poCount: 3, category: "Industrial", status: "In Progress", riskLevel: "Medium", performanceScore: 91, deliveryDays: 7, approvalDays: 1, rfqResponseDays: 2 }
];

// Helper Functions
const formatRupee = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
};

const formatRupeeDetailed = (value: number) => {
  return `₹${value.toLocaleString("en-IN")}`;
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
    return <span>{prefix}{lakhVal.toFixed(1)}L{suffix}</span>;
  }

  return <span>{prefix}{displayValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}</span>;
};

// Main Component
export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("May 2025");
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Global Filters State
  const [filters, setFilters] = useState({
    vendor: "All",
    category: "All",
    status: "All",
    riskLevel: "All"
  });

  // Unique Filter Options
  const vendorsList = ["All", "TechCore Ltd", "Infra Supplies", "FastLog Transport", "OfficeNeed Co", "Smart Industrial"];
  const categoriesList = ["All", "IT Hardware", "Furniture", "Stationery", "Logistics", "Industrial"];
  const statusesList = ["All", "Fulfilled", "In Progress", "Delayed"];
  const riskLevelsList = ["All", "Low", "Medium", "High"];

  // Prevent SSR Hydration Issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate a loading shimmer when filters change
  const triggerLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 350);
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
      status: "All",
      riskLevel: "All"
    });
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
    }, 1800);
  };

  // 1. Core filtered transactions for the selected month
  const filteredData = MASTER_TRANSACTIONS.filter(t => {
    if (selectedMonth && t.month !== selectedMonth) return false;
    if (filters.vendor !== "All" && t.vendor !== filters.vendor) return false;
    if (filters.category !== "All" && t.category !== filters.category) return false;
    if (filters.status !== "All" && t.status !== filters.status) return false;
    if (filters.riskLevel !== "All" && t.riskLevel !== filters.riskLevel) return false;
    return true;
  });

  // 2. Trend data over ALL months (ignores selectedMonth filter but respects others)
  const filteredTrendData = MASTER_TRANSACTIONS.filter(t => {
    if (filters.vendor !== "All" && t.vendor !== filters.vendor) return false;
    if (filters.category !== "All" && t.category !== filters.category) return false;
    if (filters.status !== "All" && t.status !== filters.status) return false;
    if (filters.riskLevel !== "All" && t.riskLevel !== filters.riskLevel) return false;
    return true;
  });

  // Calculate Metrics
  const totalSpend = filteredData.reduce((acc, curr) => acc + curr.spend, 0);
  const activeVendors = Array.from(new Set(filteredData.map(t => t.vendor))).length;
  
  const totalPOs = filteredData.reduce((acc, curr) => acc + curr.poCount, 0);
  const fulfilledPOs = filteredData.filter(t => t.status === "Fulfilled").reduce((acc, curr) => acc + curr.poCount, 0);
  const fulfillmentRate = totalPOs > 0 ? Math.round((fulfilledPOs / totalPOs) * 100) : 0;
  
  const overdueInvoices = filteredData.filter(t => t.status === "Delayed").length;

  // Category Colors
  const categoryColorMap: Record<string, string> = {
    "IT Hardware": "#3b82f6", // Blue
    "Furniture": "#10b981", // Emerald
    "Stationery": "#f59e0b", // Amber
    "Logistics": "#ef4444", // Red
    "Industrial": "#8b5cf6" // Violet
  };

  // 1. Spend by Category Horizontal Chart Data
  const categoriesInDataset = ["IT Hardware", "Furniture", "Stationery", "Logistics", "Industrial"] as const;
  const spendByCategory = categoriesInDataset.map(cat => {
    const catTotal = filteredData.filter(t => t.category === cat).reduce((acc, curr) => acc + curr.spend, 0);
    return {
      name: cat,
      spend: catTotal,
      percentage: totalSpend > 0 ? Math.round((catTotal / totalSpend) * 100) : 0,
      color: categoryColorMap[cat]
    };
  }).sort((a, b) => b.spend - a.spend);

  // 2. Top Vendors by Spend
  const vendorsInDataset = Array.from(new Set(MASTER_TRANSACTIONS.map(t => t.vendor)));
  const vendorRankings = vendorsInDataset.map(vend => {
    const vendorEntries = filteredData.filter(t => t.vendor === vend);
    const spendSum = vendorEntries.reduce((acc, curr) => acc + curr.spend, 0);
    const poSum = vendorEntries.reduce((acc, curr) => acc + curr.poCount, 0);
    
    // Average scores
    const avgScore = vendorEntries.length > 0 
      ? Math.round(vendorEntries.reduce((acc, curr) => acc + curr.performanceScore, 0) / vendorEntries.length)
      : 0;

    // Minimum risk
    const risks = vendorEntries.map(e => e.riskLevel);
    let risk: "Low" | "Medium" | "High" = "Low";
    if (risks.includes("High")) risk = "High";
    else if (risks.includes("Medium")) risk = "Medium";

    return {
      name: vend,
      spend: spendSum,
      poCount: poSum,
      performanceScore: avgScore || (vend === "TechCore Ltd" ? 92 : vend === "Infra Supplies" ? 88 : vend === "FastLog Transport" ? 80 : vend === "OfficeNeed Co" ? 78 : 90),
      riskLevel: risk,
    };
  }).filter(v => v.spend > 0 || filters.vendor === v.name || filters.vendor === "All").sort((a, b) => b.spend - a.spend);

  // 3. Monthly trend mapping (ordered Dec -> May)
  const monthOrder = ["December 2024", "January 2025", "February 2025", "March 2025", "April 2025", "May 2025"];
  const monthlyTrends = monthOrder.map(m => {
    const monthData = filteredTrendData.filter(t => t.month === m);
    return {
      name: m.split(" ")[0], // Just display Month name
      "Spend": monthData.reduce((acc, curr) => acc + curr.spend, 0),
      "PO Count": monthData.reduce((acc, curr) => acc + curr.poCount, 0)
    };
  });

  // 4. Donut Chart spend data
  const donutData = spendByCategory.filter(item => item.spend > 0);

  // 5. Efficiency calculations (weighted average by spend or direct mean)
  const avgDelivery = filteredData.length > 0
    ? (filteredData.reduce((acc, curr) => acc + curr.deliveryDays, 0) / filteredData.length).toFixed(1)
    : "0.0";
  const avgApproval = filteredData.length > 0
    ? (filteredData.reduce((acc, curr) => acc + curr.approvalDays, 0) / filteredData.length).toFixed(1)
    : "0.0";
  const avgRfq = filteredData.length > 0
    ? (filteredData.reduce((acc, curr) => acc + curr.rfqResponseDays, 0) / filteredData.length).toFixed(1)
    : "0.0";

  // AI Insights Custom Recommendations & Logic
  // Derive top performing vendor based on score
  const topVendor = vendorRankings.length > 0 
    ? [...vendorRankings].sort((a, b) => b.performanceScore - a.performanceScore)[0]
    : { name: "TechCore Ltd", performanceScore: 92 };

  // Calculate potential expected savings
  const expectedSavings = Math.round(totalSpend * 0.068); // ~6.8% procurement savings optimization suggestion

  // Identify high-risk vendor
  const highRiskVendor = vendorRankings.find(v => v.riskLevel === "High") || vendorRankings.find(v => v.riskLevel === "Medium") || { name: "FastLog Transport", riskLevel: "Medium" };
  const riskReason = highRiskVendor.name === "FastLog Transport" 
    ? "Late deliveries increasing over past 60 days." 
    : "Fluctuating fulfillment quality metrics.";

  // Recharts Custom Tooltip
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
                <span className="font-semibold text-zinc-100">
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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Procurement Insights & Vendor Intelligence for {selectedMonth}
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
                  {/* Backdrop Clicker */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsMonthDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-xl p-1.5 z-50 text-xs text-zinc-300"
                  >
                    {["January 2025", "February 2025", "March 2025", "April 2025", "May 2025"].map((month) => (
                      <button
                        key={month}
                        onClick={() => handleMonthChange(month)}
                        className={`w-full text-left rounded-md px-3 py-2 transition-all cursor-pointer hover:bg-zinc-850 hover:text-white ${selectedMonth === month ? 'bg-brand-green/10 text-brand-green border-l-2 border-brand-green' : ''}`}
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
                    className="absolute right-0 mt-2 w-36 rounded-lg bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-xl p-1.5 z-50 text-xs"
                  >
                    {["PDF", "Excel", "CSV"].map((format) => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className="w-full text-left rounded-md px-3 py-2 text-zinc-300 hover:bg-zinc-850 hover:text-white transition-all cursor-pointer"
                      >
                        Export to {format}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Collapse Toggle */}
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
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 backdrop-blur-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              <div className="absolute top-3 right-3 text-[9px] font-mono text-zinc-600 uppercase tracking-widest pointer-events-none">Filter Matrix</div>
              
              {/* Vendor Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Supplier Vendor</label>
                <select
                  value={filters.vendor}
                  onChange={(e) => handleFilterChange("vendor", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-brand-green transition-all"
                >
                  {vendorsList.map(v => (
                    <option key={v} value={v}>{v === "All" ? "All Suppliers" : v}</option>
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
                  {categoriesList.map(c => (
                    <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">RFQ / PO Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-brand-green transition-all"
                >
                  {statusesList.map(s => (
                    <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
                  ))}
                </select>
              </div>

              {/* Risk Level Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Supplier Risk Level</label>
                <select
                  value={filters.riskLevel}
                  onChange={(e) => handleFilterChange("riskLevel", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-brand-green transition-all"
                >
                  {riskLevelsList.map(r => (
                    <option key={r} value={r}>{r === "All" ? "All Risk Levels" : `${r} Risk`}</option>
                  ))}
                </select>
              </div>

              {/* Clear Toggles Bar */}
              {(filters.vendor !== "All" || filters.category !== "All" || filters.status !== "All" || filters.riskLevel !== "All") && (
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

      {/* CORE STATS CARD & REPORT BODY CONTAINER */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            {/* KPI skeleton */}
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-zinc-900/40 border border-zinc-800/60" />
              ))}
            </div>
            {/* Table/Chart layout skeleton */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 h-80 rounded-xl bg-zinc-900/40 border border-zinc-800/60" />
              <div className="lg:col-span-4 h-80 rounded-xl bg-zinc-900/40 border border-zinc-800/60" />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            
            {/* Empty States Handling */}
            {filteredData.length === 0 ? (
              <div className="border border-dashed border-zinc-800/80 rounded-2xl p-16 text-center max-w-md mx-auto space-y-4">
                <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h3 className="font-bold text-zinc-200">No Intelligence Data Compiled</h3>
                  <p className="text-xs text-zinc-500">
                    No transactions match the selected filter configuration. Try resetting parameters.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-zinc-800 text-xs font-semibold text-zinc-200 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  Reset Filter Locks
                </button>
              </div>
            ) : (
              <>
                {/* SECTION 1: 4 KPI CARD SUMMARY */}
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  
                  {/* Spend KPI */}
                  <div className="relative group overflow-hidden bg-zinc-900/35 border border-zinc-850 hover:border-blue-500/25 rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px] green-glow-card">
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
                        <span className="text-emerald-400 font-semibold">+18%</span> vs prev month
                      </p>
                    </div>
                  </div>

                  {/* Active Vendors KPI */}
                  <div className="relative group overflow-hidden bg-zinc-900/35 border border-zinc-850 hover:border-emerald-500/25 rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px] green-glow-card">
                    <div className="absolute top-0 right-0 h-[3px] w-[50px] bg-emerald-500/50 rounded-bl group-hover:w-full transition-all duration-300" />
                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Active Vendors</span>
                      <div className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                        <Building2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                        <AnimatedCounter value={activeVendors} />
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">+4</span> active suppliers
                      </p>
                    </div>
                  </div>

                  {/* Fulfillment KPI */}
                  <div className="relative group overflow-hidden bg-zinc-900/35 border border-zinc-850 hover:border-amber-500/25 rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px] green-glow-card">
                    <div className="absolute top-0 right-0 h-[3px] w-[50px] bg-amber-500/50 rounded-bl group-hover:w-full transition-all duration-300" />
                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">PO Fulfillment</span>
                      <div className="p-1.5 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-900/30">
                        <PackageCheck className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                        <AnimatedCounter value={fulfillmentRate} suffix="%" />
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">+3%</span> fulfillment rate
                      </p>
                    </div>
                  </div>

                  {/* Overdue Invoices KPI */}
                  <div className="relative group overflow-hidden bg-zinc-900/35 border border-zinc-850 hover:border-red-500/25 rounded-xl p-5 transition-all duration-300 hover:translate-y-[-2px] green-glow-card">
                    <div className="absolute top-0 right-0 h-[3px] w-[50px] bg-red-500/50 rounded-bl group-hover:w-full transition-all duration-300" />
                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Overdue Invoices</span>
                      <div className="p-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-900/30">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                        <AnimatedCounter value={overdueInvoices} />
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">-2</span> delayed cases
                      </p>
                    </div>
                  </div>

                </div>

                {/* GRAPH SECTION: MONTHLY TREND & DONUT CHART */}
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
                  
                  {/* SECTION 4: LINE/AREA CHART MONTHLY TREND */}
                  <div className="lg:col-span-8 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm relative">
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 mb-5">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest font-mono">Monthly Procurement Trend</h3>
                        <p className="text-[11px] text-zinc-500">Aggregate spend volume & PO frequencies</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-brand-green" />
                          <span>Spend Volume</span>
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

                  {/* SECTION 8: PIE/DONUT SPEND DISTRIBUTION */}
                  <div className="lg:col-span-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between">
                    <div className="border-b border-zinc-800/50 pb-3 mb-4">
                      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest font-mono">Spend Distribution</h3>
                      <p className="text-[11px] text-zinc-500">Percentage share by cost group</p>
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
                      {/* Center Indicator */}
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Total</span>
                        <span className="text-sm font-black text-white font-mono">{formatRupee(totalSpend)}</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
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
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
                  
                  {/* SECTION 3: TOP VENDORS TABLE */}
                  <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm">
                    <div className="border-b border-zinc-800/50 pb-3 mb-4">
                      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest font-mono">Top Vendors by Spend</h3>
                      <p className="text-[11px] text-zinc-500">Comprehensive supplier performance & risk list</p>
                    </div>

                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-850 text-zinc-500 font-bold font-mono">
                            <th className="py-2.5 px-3 w-10">Rank</th>
                            <th className="py-2.5 px-3">Vendor Name</th>
                            <th className="py-2.5 px-3 text-right">Spend</th>
                            <th className="py-2.5 px-3 text-center">POs</th>
                            <th className="py-2.5 px-3 text-center">Perf. Score</th>
                            <th className="py-2.5 px-3 text-center">Risk Level</th>
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

                  {/* SECTION 2: SPEND BY CATEGORY PROGRESS BARS */}
                  <div className="lg:col-span-5 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm">
                    <div className="border-b border-zinc-800/50 pb-3 mb-5">
                      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest font-mono">Spend by Category</h3>
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
                          
                          {/* Animated Progress Bar */}
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
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
                  
                  {/* SECTION 7: AI PROCUREMENT INSIGHTS */}
                  <div className="lg:col-span-5 relative group overflow-hidden bg-zinc-900/30 border border-brand-green/20 hover:border-brand-green/35 rounded-xl p-5 backdrop-blur-sm transition-all duration-300">
                    {/* Glowing background gradient */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-brand-green/5 blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-brand-green/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-brand-green/15 text-brand-green border border-brand-green/20">
                          <Sparkles className="h-4 w-4 animate-pulse" />
                        </div>
                        <h3 className="text-sm font-bold text-brand-green uppercase tracking-widest font-mono">AI Procurement Insights</h3>
                      </div>
                      <span className="text-[8px] font-mono bg-brand-green/10 text-brand-green border border-brand-green/20 rounded px-1.5 py-0.5 tracking-wider uppercase">Procurement Engine</span>
                    </div>

                    <div className="space-y-4">
                      {/* Top Supplier */}
                      <div className="flex items-start gap-3 bg-black/30 border border-zinc-850/50 p-3 rounded-lg">
                        <div className="p-1.5 rounded bg-emerald-950/40 text-emerald-400 mt-0.5 border border-emerald-900/30">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Top Vendor Recommendation</span>
                          <p className="text-xs font-black text-zinc-200">{topVendor.name}</p>
                          <p className="text-[10px] text-zinc-400">Maintains premium performance index score of {topVendor.performanceScore}.</p>
                        </div>
                      </div>

                      {/* Potential Expected Savings */}
                      <div className="flex items-start gap-3 bg-black/30 border border-zinc-850/50 p-3 rounded-lg">
                        <div className="p-1.5 rounded bg-blue-950/40 text-blue-400 mt-0.5 border border-blue-900/30">
                          <TrendingUp className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Estimated Consolidation Savings</span>
                          <p className="text-xs font-black text-zinc-200">₹{expectedSavings.toLocaleString("en-IN")}</p>
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
                          <p className="text-xs font-black text-zinc-200">{highRiskVendor.name} ({highRiskVendor.riskLevel} Risk)</p>
                          <p className="text-[10px] text-red-400/80 font-medium">{riskReason}</p>
                        </div>
                      </div>

                      {/* AI Next Action Actionable Advice */}
                      <div className="pt-2">
                        <div className="text-[10px] bg-brand-green/5 text-brand-green/90 border border-brand-green/15 rounded p-2.5 text-center font-mono">
                          RECOMMENDED NEXT ACTION: Increase procurement allocation toward high-performing vendors.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: PERFORMANCE BAR CHART & COMPACT STATS */}
                  <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between">
                    <div className="border-b border-zinc-800/50 pb-3 mb-4">
                      <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest font-mono">Vendor Performance Index</h3>
                      <p className="text-[11px] text-zinc-500">Quality score comparisons for top active suppliers</p>
                    </div>

                    {/* Score Bar Chart */}
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
                            tickFormatter={(v) => v.split(" ")[0]} // Shorten name
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
                            {vendorRankings.slice(0, 5).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.performanceScore >= 90 ? "#10B981" : entry.performanceScore >= 80 ? "#3B82F6" : "#F59E0B"} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* SECTION 6: COMPACT EFFICIENCY STATS ROW */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800/50 mt-4">
                      
                      {/* Delivery Time */}
                      <div className="bg-black/20 border border-zinc-850/50 p-2.5 rounded-lg text-center space-y-1">
                        <Clock className="h-3.5 w-3.5 text-zinc-500 mx-auto" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Avg Delivery</p>
                          <h4 className="text-sm font-black text-zinc-200 font-mono">{avgDelivery} Days</h4>
                        </div>
                      </div>

                      {/* Approval Time */}
                      <div className="bg-black/20 border border-zinc-850/50 p-2.5 rounded-lg text-center space-y-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500 mx-auto" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Avg Approval</p>
                          <h4 className="text-sm font-black text-zinc-200 font-mono">{avgApproval} Days</h4>
                        </div>
                      </div>

                      {/* RFQ Response */}
                      <div className="bg-black/20 border border-zinc-850/50 p-2.5 rounded-lg text-center space-y-1">
                        <RefreshCw className="h-3.5 w-3.5 text-zinc-500 mx-auto" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">RFQ Response</p>
                          <h4 className="text-sm font-black text-zinc-200 font-mono">{avgRfq} Days</h4>
                        </div>
                      </div>

                      {/* Success Rate */}
                      <div className="bg-black/20 border border-zinc-850/50 p-2.5 rounded-lg text-center space-y-1">
                        <TrendingUp className="h-3.5 w-3.5 text-zinc-500 mx-auto" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Success Rate</p>
                          <h4 className="text-sm font-black text-zinc-200 font-mono">89%</h4>
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
