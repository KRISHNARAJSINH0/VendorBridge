"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  TrendingUp,
  Coins,
  Clock,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Download,
  Printer,
  Mail,
  X,
  FileText,
  User,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Building
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAppState } from "@/context/StateContext";
import { toast } from "sonner";

export default function PurchaseOrdersPage() {
  const { purchaseOrders, rfqs, addLog } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Find selected PO
  const selectedPo = useMemo(() => {
    return purchaseOrders.find((po: any) => po.id === selectedPoId) || null;
  }, [purchaseOrders, selectedPoId]);

  // Find matching RFQ details for the selected PO
  const matchingRfq = useMemo(() => {
    if (!selectedPo) return null;
    return rfqs.find((r: any) => r.id === selectedPo.rfqId) || null;
  }, [selectedPo, rfqs]);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po: any) => {
      const query = searchQuery.toLowerCase().trim();
      const rfqMatch = rfqs.find((r: any) => r.id === po.rfqId);
      const rfqTitle = rfqMatch ? rfqMatch.title.toLowerCase() : "";

      return (
        query === "" ||
        po.id.toLowerCase().includes(query) ||
        po.vendorName.toLowerCase().includes(query) ||
        rfqTitle.includes(query)
      );
    });
  }, [purchaseOrders, rfqs, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
      case "Closed":
      case "Paid":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Pending":
      case "CREATED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Overdue":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  // Triggers print view
  const handlePrint = () => {
    if (!selectedPo) return;
    toast.info("Preparing print spooler...");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Simulates PDF download
  const handleDownload = async () => {
    if (!selectedPo) return;
    setIsDownloading(true);
    const promise = new Promise((resolve) => setTimeout(resolve, 1500));
    toast.promise(promise, {
      loading: "Generating cryptographically secure PO PDF...",
      success: `Purchase Order ${selectedPo.id} PDF downloaded successfully!`,
      error: "Failed to download PDF.",
    });
    await promise;
    setIsDownloading(false);
  };

  // Simulates email sending & records log
  const handleSendEmail = async () => {
    if (!selectedPo) return;
    setIsSendingEmail(true);
    const promise = new Promise((resolve) => setTimeout(resolve, 1800));
    toast.promise(promise, {
      loading: `Encrypting and dispatching PO to ${selectedPo.vendorName}...`,
      success: `PO successfully sent to procurement representatives!`,
      error: "Failed to send email.",
    });
    await promise;
    try {
      await addLog(
        "Manager",
        `Purchase Order ${selectedPo.id} dispatched via secure email to ${selectedPo.vendorName}.`,
        "success"
      );
    } catch (err) {
      console.error(err);
    }
    setIsSendingEmail(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/30 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-brand-green" /> Purchase Orders
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Review authorized ERP purchase orders and download cryptographic dispatch vouchers.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-card/10 border-border/40 relative overflow-hidden backdrop-blur-md">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Purchase Orders</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileCheck className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight font-mono text-white">{purchaseOrders.length}</span>
              <p className="text-[9px] text-zinc-500 mt-1">Legally authorized procurement documents</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/10 border-border/40 relative overflow-hidden backdrop-blur-md">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Authorized Capital Spend</span>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight font-mono text-white">
                ₹{purchaseOrders.reduce((sum: number, po: any) => sum + po.total, 0).toLocaleString("en-IN")}
              </span>
              <p className="text-[9px] text-zinc-500 mt-1">Cumulative contract values committed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/10 border-border/40 relative overflow-hidden backdrop-blur-md">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pending Release</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight font-mono text-white">
                {purchaseOrders.filter((p: any) => p.status === "Pending" || p.status === "CREATED").length}
              </span>
              <p className="text-[9px] text-zinc-500 mt-1">Orders awaiting ledger close or invoices</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search PO number, vendor name, or RFQ title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card/10 border-border/60 text-xs focus:border-brand-green-border focus-visible:ring-brand-green-muted/20 text-white placeholder:text-zinc-600 outline-none"
          />
        </div>
      </div>

      {/* PO List Table */}
      <Card className="bg-card/10 border-border/40 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border/30 bg-zinc-950/20 text-muted-foreground font-medium text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-5">PO Number</th>
                  <th className="py-3.5 px-4">Authorized Vendor</th>
                  <th className="py-3.5 px-4">RFQ Title</th>
                  <th className="py-3.5 px-4 text-right">Order Date</th>
                  <th className="py-3.5 px-4 text-right">Aggregate Cost</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-zinc-500 italic">
                      No purchase orders match your search parameters.
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map((po: any) => {
                    const rfqMatch = rfqs.find((r: any) => r.id === po.rfqId);
                    return (
                      <tr
                        key={po.id}
                        className="border-b border-border/20 hover:bg-secondary/20 transition-colors duration-150 group"
                      >
                        <td className="py-3.5 px-5 font-bold font-mono text-zinc-200 group-hover:text-brand-green">
                          {po.id}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-zinc-300">{po.vendorName}</td>
                        <td className="py-3.5 px-4 text-zinc-400 truncate max-w-[220px]">
                          {rfqMatch ? rfqMatch.title : "Direct PO Acquisition"}
                        </td>
                        <td className="py-3.5 px-4 text-right text-zinc-400 font-mono">{po.createdDate}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-brand-green">
                          ₹{po.total.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant="outline" className={`text-[8.5px] font-bold px-2 py-0.5 ${getStatusBadge(po.status)}`}>
                            {po.status === "CREATED" ? "Pending" : po.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setSelectedPoId(po.id);
                              setIsDetailOpen(true);
                            }}
                            className="h-7 text-[10px] text-zinc-400 hover:text-white cursor-pointer px-2.5 border border-zinc-800/40 hover:bg-zinc-800/20"
                          >
                            Review Details <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ──────────────────────────────────────────────────────── */}
      {/* PURCHASE ORDER DETAIL DIALOG                             */}
      {/* ──────────────────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl bg-zinc-950 border border-zinc-800 text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/[0.01] to-transparent pointer-events-none" />
          
          <DialogHeader className="border-b border-zinc-900 pb-4 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-green" /> Purchase Order Sheet
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Official procurement voucher generated from L2 authorization.
              </DialogDescription>
            </div>
            <button
              onClick={() => setIsDetailOpen(false)}
              className="rounded-full p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          {selectedPo && (
            <div className="space-y-6 my-4 text-xs">
              
              {/* Metadata Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">PO Number</span>
                  <p className="text-white font-mono font-bold">{selectedPo.id}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Date Released</span>
                  <p className="text-zinc-300 font-mono">{selectedPo.createdDate}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Supplier Code</span>
                  <p className="text-zinc-300 font-mono">{selectedPo.vendorId}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Status Flag</span>
                  <Badge className={`text-[8px] font-bold px-1.5 py-0 ${getStatusBadge(selectedPo.status)}`}>
                    {selectedPo.status === "CREATED" ? "Pending" : selectedPo.status}
                  </Badge>
                </div>
              </div>

              {/* Vendor & Client Details */}
              <div className="grid grid-cols-2 gap-6 border-b border-zinc-900 pb-5">
                <div className="space-y-2">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Building className="h-3 w-3 text-zinc-600" /> Supplier Information
                  </span>
                  <div>
                    <h4 className="text-zinc-200 font-bold text-sm">{selectedPo.vendorName}</h4>
                    <p className="text-zinc-500 mt-1">Authorized Vendor Network</p>
                    <p className="text-zinc-500">Secure Dispatch Partner</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-zinc-600" /> Client Entity
                  </span>
                  <div>
                    <h4 className="text-zinc-200 font-bold text-sm">VendorBridge Corporation</h4>
                    <p className="text-zinc-500 mt-1">Procurement Department</p>
                    <p className="text-zinc-500">Security Node: VB-ERP-HQ</p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <Layers className="h-3 w-3 text-zinc-600" /> Itemized Procurement
                </span>
                
                <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-900/30 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Line Description</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchingRfq?.items.map((it: any, idx: number) => (
                        <tr key={idx} className="border-b border-zinc-900/60 last:border-0 hover:bg-zinc-900/20">
                          <td className="py-3 px-4 font-semibold text-zinc-300">{it.name}</td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-zinc-400">
                            {it.qty} {it.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-zinc-400">
                            -
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals panel */}
              <div className="flex justify-between items-center bg-zinc-900/20 p-4 border border-zinc-900 rounded-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-green" />
                  <span className="text-zinc-400 font-medium">L2 Authorized Value:</span>
                </div>
                <span className="text-lg font-black font-mono text-brand-green">
                  ₹{selectedPo.total.toLocaleString("en-IN")}
                </span>
              </div>

            </div>
          )}

          <DialogFooter className="gap-2 border-t border-zinc-900 pt-4 flex flex-wrap justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="text-xs h-9 cursor-pointer border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print PO
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading}
                className="text-xs h-9 cursor-pointer border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white flex items-center gap-1.5"
              >
                {isDownloading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-zinc-500" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>
            <Button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-9 px-4 cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(74,222,128,0.1)]"
            >
              {isSendingEmail ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Email Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
