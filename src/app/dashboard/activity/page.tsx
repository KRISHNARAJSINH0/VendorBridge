"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Building2,
  Receipt,
  Sparkles,
  CheckCircle,
  PackageCheck,
  FileSpreadsheet,
  BadgeCheck,
  Clock,
  Search,
  ChevronDown,
  Download,
  FileDown,
  User,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  CalendarDays,
  ExternalLink,
  ChevronRight,
  Info,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ActivityLog } from "@/lib/types";
import { useAppState } from "@/context/StateContext";

export default function ActivityLogsPage() {
  const { logs, clearTransactions } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("30"); // days
  const [selectedLogForDrawer, setSelectedLogForDrawer] = useState<ActivityLog | null>(null);

  const loading = false;

  const handleClearLogs = async () => {
    if (confirm("Are you sure you want to clear all system activity logs? This action is irreversible.")) {
      try {
        await clearTransactions();
        toast.success("Audit trail logs cleared successfully");
      } catch (e) {
        toast.error("Failed to clear logs");
      }
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log: ActivityLog) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.referenceId && log.referenceId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        selectedType === "All" ||
        (selectedType === "RFQs" && log.type === "rfq_created") ||
        (selectedType === "Quotations" && log.type === "quotation_submitted") ||
        (selectedType === "Vendors" && log.type === "vendor_added") ||
        (selectedType === "Approvals" && log.type === "approval_action") ||
        (selectedType === "Purchase Orders" && log.type === "po_generated") ||
        (selectedType === "Invoices" && log.type === "invoice_generated") ||
        (selectedType === "Payments" && log.type === "payment_completed");

      // Time range filtering
      const logTime = new Date(log.timestamp).getTime();
      const cutoffTime = new Date().getTime() - parseInt(selectedTimeRange) * 24 * 60 * 60 * 1000;
      const matchesTime = selectedTimeRange === "all" || logTime >= cutoffTime;

      return matchesSearch && matchesType && matchesTime;
    });
  }, [logs, searchQuery, selectedType, selectedTimeRange]);

  const handleExport = (format: "pdf" | "csv" | "excel") => {
    toast.info(`Preparing ${format.toUpperCase()} export of activity audit trail...`);
    setTimeout(() => {
      toast.success(`${format.toUpperCase()} report exported successfully! Includes ${filteredLogs.length} activity records.`);
    }, 1500);
  };

  const getLogTypeVisuals = (type: ActivityLog["type"]) => {
    switch (type) {
      case "rfq_created":
        return {
          icon: FileText,
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
          border: "hover:border-blue-500/30"
        };
      case "vendor_added":
        return {
          icon: Building2,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          border: "hover:border-emerald-500/30"
        };
      case "quotation_submitted":
        return {
          icon: Receipt,
          color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
          border: "hover:border-purple-500/30"
        };
      case "ai_recommendation":
        return {
          icon: Sparkles,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          border: "hover:border-amber-500/30"
        };
      case "approval_action":
        return {
          icon: CheckCircle,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          border: "hover:border-emerald-500/30"
        };
      case "po_generated":
        return {
          icon: PackageCheck,
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
          border: "hover:border-blue-500/30"
        };
      case "invoice_generated":
        return {
          icon: FileSpreadsheet,
          color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
          border: "hover:border-orange-500/30"
        };
      case "payment_completed":
        return {
          icon: BadgeCheck,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          border: "hover:border-emerald-500/30"
        };
      default:
        return {
          icon: Info,
          color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
          border: "hover:border-zinc-700/30"
        };
    }
  };

  // Visual procurement timeline sequence
  const pipelineSteps = [
    { label: "RFQ Created", key: "rfq_created" },
    { label: "Vendor Registered", key: "vendor_added" },
    { label: "Quote Submitted", key: "quotation_submitted" },
    { label: "AI Analysis", key: "ai_recommendation" },
    { label: "Approved", key: "approval_action" },
    { label: "PO Generated", key: "po_generated" },
    { label: "Invoice Issued", key: "invoice_generated" },
    { label: "Payment Paid", key: "payment_completed" }
  ];

  const activePipelineIndex = useMemo(() => {
    // Return highest index completed based on database log availability
    let maxIdx = 0;
    pipelineSteps.forEach((step, idx) => {
      if (logs.some((l: ActivityLog) => l.type === step.key)) {
        maxIdx = idx;
      }
    });
    return maxIdx;
  }, [logs]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto py-8">
        <div className="flex justify-between items-center pb-4 border-b border-border/20">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 w-64 bg-zinc-800 animate-pulse rounded" />
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/30 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Activity Logs
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Procurement Audit Trail & System Activity
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleClearLogs}
            className="text-xs h-9 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 cursor-pointer"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Clear Audit Trail
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExport("csv")}
            className="text-xs h-9 border-border/30 bg-zinc-900 text-zinc-300 hover:text-white cursor-pointer"
          >
            <FileDown className="mr-2 h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button 
            onClick={() => handleExport("pdf")}
            className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-9 px-4 cursor-pointer shadow-md green-glow-button"
          >
            <Download className="mr-2 h-3.5 w-3.5" /> Export PDF Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* KPI 1 */}
        <Card className="bg-card/10 border-border/40 relative overflow-hidden hover:border-zinc-700/50 transition-all duration-300">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Actions Logged</span>
              <div className="h-7 w-7 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight font-mono">128</span>
              <p className="text-[9px] text-zinc-500 mt-1">Audit log database scope</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="bg-card/10 border-border/40 relative overflow-hidden hover:border-zinc-700/50 transition-all duration-300">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today's Activities</span>
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight font-mono">12</span>
              <p className="text-[9px] text-zinc-500 mt-1">Actions executed since midnight</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="bg-card/10 border-border/40 relative overflow-hidden hover:border-zinc-700/50 transition-all duration-300">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pending Authorizations</span>
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight font-mono">4</span>
              <p className="text-[9px] text-zinc-500 mt-1">Approvals awaiting manager reviews</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="bg-card/10 border-border/40 relative overflow-hidden hover:border-zinc-700/50 transition-all duration-300">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Completed Purchases</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <BadgeCheck className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight font-mono">124</span>
              <p className="text-[9px] text-zinc-500 mt-1">Paid vouchers and closed RFQs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Procurement Journey Visual Workflow */}
      <Card className="bg-card/10 border-border/40">
        <CardHeader className="pb-2 border-b border-border/30">
          <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-green" /> Procurement Cycle Progress
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Complete lifecycle milestones, highlighted from RFQ creation to final payment log.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 overflow-x-auto">
          <div className="flex items-center min-w-[800px] justify-between px-4 pb-4">
            {pipelineSteps.map((step, idx) => {
              const isCompleted = idx <= activePipelineIndex;
              const isActive = idx === activePipelineIndex;
              
              return (
                <div key={idx} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center space-y-1.5 relative">
                    <div 
                      className={`h-7 w-7 rounded-full flex items-center justify-center border font-mono text-[10px] font-bold transition-all duration-300 ${
                        isCompleted 
                          ? "bg-brand-green-muted/20 border-brand-green text-brand-green"
                          : "bg-zinc-950 border-zinc-800 text-zinc-500"
                      }`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <span className={`text-[10px] font-semibold ${isCompleted ? "text-zinc-200" : "text-zinc-500"}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < pipelineSteps.length - 1 && (
                    <div className={`h-[1px] flex-1 mx-2 ${isCompleted ? "bg-brand-green/40" : "bg-zinc-800"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Actions Bar */}
      <Card className="bg-card/10 border-border/40 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search reference, vendor, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/10 border-border/60 text-xs focus:border-brand-green-border focus-visible:ring-brand-green-muted/20"
            />
          </div>

          {/* Time range selector & Filter Chips */}
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32 bg-card/15 border-border/60 text-xs h-9">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/40 text-xs">
                <SelectItem value="1" className="cursor-pointer">Today</SelectItem>
                <SelectItem value="7" className="cursor-pointer">Last 7 Days</SelectItem>
                <SelectItem value="30" className="cursor-pointer">Last 30 Days</SelectItem>
                <SelectItem value="all" className="cursor-pointer">Custom / All</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 overflow-x-auto py-1">
              {["All", "RFQs", "Quotations", "Vendors", "Approvals", "Purchase Orders", "Invoices", "Payments"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                    selectedType === type
                      ? "bg-brand-green/10 border-brand-green-border/40 text-brand-green"
                      : "bg-zinc-950/20 border-zinc-800/40 text-zinc-400 hover:border-zinc-700/40 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid View */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-4">
        
        {/* TIMELINE LIST (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          
          <AnimatePresence mode="popLayout">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-16 bg-zinc-950/20 border border-zinc-800/40 rounded-xl italic text-zinc-500 text-xs">
                No activity logs match the selected filter parameters.
              </div>
            ) : (
              filteredLogs.map((log: ActivityLog) => {
                const visual = getLogTypeVisuals(log.type);
                const IconComponent = visual.icon;
                
                return (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedLogForDrawer(log)}
                    className={`p-4 bg-card/10 border border-border/40 rounded-xl transition-all duration-200 cursor-pointer flex gap-4 items-start group ${visual.border}`}
                  >
                    {/* Circle Icon Badge */}
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 ${visual.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-brand-green transition-colors">
                          {log.title}
                        </h4>
                        <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                          {log.date} • {log.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{log.description}</p>
                      
                      {/* Meta Tags Footer */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[9px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <User className="h-2.5 w-2.5" /> Executed by: <strong className="text-zinc-400">{log.user}</strong>
                        </span>
                        {log.referenceId && (
                          <span className="bg-zinc-800/50 border border-zinc-700/30 px-1.5 py-0.5 rounded text-[8.5px] font-mono text-zinc-300">
                            Ref: {log.referenceId}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors self-center shrink-0" />
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>

        </div>

        {/* RIGHT PANEL: AUDIT STATS (Span 1) */}
        <div className="space-y-8">
          
          <Card className="bg-card/10 border-border/40">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Audit Trail Statistics
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                Current system metrics summary.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-500 text-[9px] uppercase font-bold">Most Active Auditor</span>
                <p className="text-zinc-200 font-semibold flex items-center gap-1.5 mt-0.5">
                  <User className="h-3.5 w-3.5 text-brand-green" /> Priya Shah (Finance)
                </p>
              </div>
              <div className="space-y-1 border-t border-zinc-800/40 pt-3">
                <span className="text-zinc-500 text-[9px] uppercase font-bold">Most Engaged Vendor</span>
                <p className="text-zinc-200 font-semibold flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-400" /> Infra Supplies Pvt Ltd
                </p>
              </div>
              <div className="space-y-1 border-t border-zinc-800/40 pt-3">
                <span className="text-zinc-500 text-[9px] uppercase font-bold">Latest System Event</span>
                <p className="text-zinc-200 font-semibold truncate mt-0.5">Invoice Marked Paid</p>
                <p className="text-[9px] text-zinc-500 font-mono">June 06, 2026</p>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* EXPANDABLE DETAILS DIALOG                            */}
      {/* ---------------------------------------------------- */}
      <Dialog open={selectedLogForDrawer !== null} onOpenChange={(open) => !open && setSelectedLogForDrawer(null)}>
        <DialogContent className="max-w-md bg-card border border-border/40 text-foreground">
          {selectedLogForDrawer && (
            <>
              <DialogHeader className="border-b border-border/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${getLogTypeVisuals(selectedLogForDrawer.type).color}`}>
                    {(() => {
                      const Icon = getLogTypeVisuals(selectedLogForDrawer.type).icon;
                      return <Icon className="h-4.5 w-4.5" />;
                    })()}
                  </div>
                  <div>
                    <DialogTitle className="text-sm font-semibold tracking-tight text-white">
                      {selectedLogForDrawer.title}
                    </DialogTitle>
                    <DialogDescription className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                      Timestamp: {selectedLogForDrawer.date} • {selectedLogForDrawer.time}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                
                {/* Description */}
                <div className="space-y-1">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold">Details Log</span>
                  <p className="p-3 bg-zinc-950/40 border border-zinc-800/40 text-zinc-300 rounded-lg leading-relaxed">
                    {selectedLogForDrawer.description}
                  </p>
                </div>

                {/* Meta details table */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950/20 border border-zinc-800/20 rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[9px] uppercase font-bold">Action By</span>
                    <p className="font-semibold text-zinc-200">{selectedLogForDrawer.user}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[9px] uppercase font-bold">Reference Key</span>
                    <p className="font-semibold text-zinc-200 font-mono">{selectedLogForDrawer.referenceId || "N/A"}</p>
                  </div>
                </div>

                {/* Extra simulated log details */}
                <div className="space-y-1">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold">Audit Meta Credentials</span>
                  <div className="p-2.5 bg-zinc-950/10 border border-border/20 rounded-lg font-mono text-[9.5px] text-zinc-500 space-y-1 leading-relaxed">
                    <p>IP Address: 192.168.1.108</p>
                    <p>Browser UserAgent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)</p>
                    <p>Voucher Verification Status: VERIFIED OK</p>
                  </div>
                </div>

              </div>

              <DialogFooter className="border-t border-border/30 pt-4">
                <Button
                  onClick={() => setSelectedLogForDrawer(null)}
                  className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-9 px-5 cursor-pointer ml-auto"
                >
                  Close Details
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
