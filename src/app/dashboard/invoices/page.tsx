"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Printer,
  Mail,
  CheckCircle2,
  RefreshCw,
  Coins,
  ShieldCheck,
  Award,
  Sparkles,
  Building2,
  FileText,
  FileCheck,
  BadgeAlert,
  ListFilter
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/context/StateContext";

export default function InvoicesPage() {
  const {
    invoices,
    purchaseOrders,
    rfqs,
    updateInvoiceStatus,
    addLog
  } = useAppState();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [successPaidState, setSuccessPaidState] = useState(false);

  // Set default selected invoice
  useEffect(() => {
    if (invoices.length > 0) {
      const exists = invoices.find((inv: any) => inv.id === selectedInvoiceId);
      if (!exists) {
        // Find latest pending/sent or first invoice
        const pending = invoices.find((i: any) => i.status === "Sent");
        setSelectedInvoiceId(pending ? pending.id : invoices[0].id);
      }
    } else {
      setSelectedInvoiceId(null);
    }
  }, [invoices, selectedInvoiceId]);

  const selectedInvoice = useMemo(() => {
    return invoices.find((inv: any) => inv.id === selectedInvoiceId) || null;
  }, [invoices, selectedInvoiceId]);

  // Find matching PO
  const matchingPo = useMemo(() => {
    if (!selectedInvoice) return null;
    return purchaseOrders.find((po: any) => po.id === selectedInvoice.poId) || null;
  }, [selectedInvoice, purchaseOrders]);

  // Find matching RFQ for items list
  const matchingRfq = useMemo(() => {
    if (!matchingPo) return null;
    return rfqs.find((r: any) => r.id === matchingPo.rfqId) || null;
  }, [matchingPo, rfqs]);

  // Compute item lines with distributed pricing
  const invoiceItems = useMemo(() => {
    if (!selectedInvoice) return [];
    if (!matchingRfq || matchingRfq.items.length === 0) {
      // Return fallback item matching the total price
      const sub = selectedInvoice.total / 1.18;
      return [{
        name: "General Procurement Order Deliverables",
        qty: 1,
        unit: "pkg",
        unitPrice: sub,
        total: sub
      }];
    }

    const totalQty = matchingRfq.items.reduce((sum: number, item: any) => sum + item.qty, 0);
    const invoiceSubtotal = selectedInvoice.total / 1.18;

    // Distribute total cost proportionally based on item qty ratio
    return matchingRfq.items.map((item: any) => {
      const proportion = item.qty / (totalQty || 1);
      const itemTotal = invoiceSubtotal * proportion;
      const itemUnitPrice = itemTotal / (item.qty || 1);
      
      return {
        name: item.name,
        qty: item.qty,
        unit: item.unit,
        unitPrice: itemUnitPrice,
        total: itemTotal
      };
    });
  }, [selectedInvoice, matchingRfq]);

  // Compute financial numbers
  const financials = useMemo(() => {
    if (!selectedInvoice) return { subtotal: 0, cgst: 0, sgst: 0, grandTotal: 0 };
    const grandTotal = selectedInvoice.total;
    const subtotal = grandTotal / 1.18;
    const tax = grandTotal - subtotal;
    return {
      subtotal,
      cgst: tax / 2,
      sgst: tax / 2,
      grandTotal
    };
  }, [selectedInvoice]);

  const handleMarkAsPaid = async () => {
    if (!selectedInvoice) return;
    setMarkingPaid(true);
    try {
      await updateInvoiceStatus(selectedInvoice.id, "Paid");
      await addLog(
        "Manager",
        `Invoice ${selectedInvoice.id} verified and marked as PAID. Amount: ₹${selectedInvoice.total.toLocaleString("en-IN")}.`,
        "success"
      );
      toast.success("Invoice payment marked successfully!");
      setSuccessPaidState(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update invoice payment status.");
    } finally {
      setMarkingPaid(false);
    }
  };

  const triggerExport = (format: "pdf" | "print" | "email") => {
    if (!selectedInvoice) return;
    if (format === "pdf") {
      toast.info(`Generating and downloading PDF for ${selectedInvoice.id}...`);
      setTimeout(() => {
        toast.success("PDF Downloaded successfully!");
      }, 1200);
    } else if (format === "print") {
      window.print();
    } else if (format === "email") {
      toast.info(`Emailing invoice ${selectedInvoice.id} to Accounts department...`);
      setTimeout(() => {
        toast.success(`Sent to accounts@${selectedInvoice.vendorName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`);
      }, 1500);
    }
  };

  if (!selectedInvoice) {
    return (
      <div className="text-center py-20 bg-zinc-950/20 border border-zinc-800/40 rounded-xl max-w-6xl mx-auto italic text-zinc-500 text-xs">
        No active invoices found in the ERP database. Approve RFQ recommendations to generate invoices.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* HEADER & ACTIONS                                         */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/30 pb-6 print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
            <Coins className="h-6 w-6 text-brand-green" /> Invoices Ledger
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Manage auto-generated supplier invoices, review billing matching, and authorize payments.
          </p>
        </div>
        
        {/* Document Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => triggerExport("pdf")}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold h-9 px-4 cursor-pointer"
          >
            <Download className="mr-2 h-3.5 w-3.5 text-brand-green" /> Download PDF
          </Button>
          <Button 
            onClick={() => triggerExport("print")}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold h-9 px-4 cursor-pointer"
          >
            <Printer className="mr-2 h-3.5 w-3.5 text-brand-green" /> Print Document
          </Button>
          <Button 
            onClick={() => triggerExport("email")}
            className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-9 px-4 cursor-pointer shadow-md green-glow-button"
          >
            <Mail className="mr-2 h-3.5 w-3.5" /> Email Vendor
          </Button>
        </div>
      </div>

      {/* Payment Success Alert */}
      <AnimatePresence>
        {successPaidState && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-between text-xs max-w-7xl mx-auto shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold">Payment Status Updated</p>
                <p className="text-[10px] text-emerald-500/80 mt-0.5">Invoice {selectedInvoice.id} has been marked as PAID on the central ledger.</p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => setSuccessPaidState(false)}
              className="text-[10px] h-7 border-emerald-500/30 bg-transparent text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 cursor-pointer"
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        
        {/* ──────────────────────────────────────────────────────── */}
        {/* ERP INVOICE SHEET (Span 2)                               */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6 print:col-span-3">
          <Card className="bg-card/10 border-border/40 overflow-hidden relative shadow-lg print:border-0 print:bg-white print:text-zinc-950 print:shadow-none backdrop-blur-md">
            {/* Top header glow indicator */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-brand-green print:hidden" />
            
            <CardContent className="p-8 space-y-8 print:p-0">
              
              {/* Logo / Title */}
              <div className="flex justify-between items-start border-b border-border/30 pb-6 print:border-zinc-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight font-sans print:text-zinc-900">
                    VendorBridge Corporation
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest print:text-zinc-500">
                    Procurement Billing & Accounts Sheet
                  </p>
                </div>
                <div className="text-right">
                  <Badge 
                    className={`text-[10px] font-bold px-3 py-1 font-mono uppercase tracking-wider rounded-lg ${
                      selectedInvoice.status === "Paid" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {selectedInvoice.status}
                  </Badge>
                </div>
              </div>

              {/* Bill To & Seller Addresses */}
              <div className="grid grid-cols-2 gap-8 text-xs border-b border-border/30 pb-6 print:border-zinc-200">
                
                {/* Buyer */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 print:text-zinc-500">Bill To (Buyer)</h4>
                  <div className="space-y-1 font-medium text-zinc-300 print:text-zinc-800">
                    <p className="font-bold text-zinc-100 print:text-zinc-950">VendorBridge Corp HQ</p>
                    <p>123 Business Park, S.G. Highway</p>
                    <p>Ahmedabad, Gujarat - 380054</p>
                    <p className="font-mono text-[10px] text-zinc-400 mt-1 print:text-zinc-500">GSTIN: 25383438AFB</p>
                  </div>
                </div>

                {/* Seller */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 print:text-zinc-500">Supplier (Seller)</h4>
                  <div className="space-y-1 font-medium text-zinc-300 print:text-zinc-800">
                    <p className="font-bold text-zinc-100 print:text-zinc-950">{selectedInvoice.vendorName}</p>
                    <p>456 Industrial GIDC Estate</p>
                    <p>Surat, Gujarat - 395003</p>
                    <p className="font-mono text-[10px] text-zinc-400 mt-1 print:text-zinc-500">GSTIN: 343434DB4523</p>
                  </div>
                </div>

              </div>

              {/* Metadata details table */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-zinc-950/20 border border-zinc-800/40 rounded-xl text-xs print:bg-zinc-100 print:border-zinc-200 print:text-zinc-900">
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold print:text-zinc-500">PO Link</span>
                  <p className="font-bold text-zinc-200 font-mono print:text-zinc-950">{selectedInvoice.poId}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold print:text-zinc-500">Invoice Ref</span>
                  <p className="font-bold text-zinc-200 font-mono print:text-zinc-950">{selectedInvoice.id}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold print:text-zinc-500">Invoice Date</span>
                  <p className="font-semibold text-zinc-300 print:text-zinc-900">{selectedInvoice.createdDate}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold print:text-zinc-500">Payment Due</span>
                  <p className="font-semibold text-zinc-300 print:text-zinc-900">Net 30 Days</p>
                </div>
              </div>

              {/* Itemized list of invoice items */}
              <div className="border border-border/30 rounded-lg overflow-hidden bg-zinc-950/10 text-xs print:border-zinc-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 bg-zinc-950/30 text-[9px] text-zinc-400 font-bold uppercase print:bg-zinc-100 print:text-zinc-700">
                      <th className="py-2.5 px-4">Procured Deliverables</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Unit Rate</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-border/20 last:border-0 hover:bg-zinc-800/20 print:border-zinc-200 print:text-zinc-900">
                        <td className="py-3 px-4 font-medium text-zinc-200 print:text-zinc-950">{item.name}</td>
                        <td className="py-3 px-4 text-center font-mono text-zinc-300 print:text-zinc-900">{item.qty} {item.unit}</td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-400 print:text-zinc-600">₹{Math.round(item.unitPrice).toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-zinc-200 print:text-zinc-950">₹{Math.round(item.total).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals computation */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-2 text-xs border-t border-border/30 pt-4 print:border-zinc-200 print:text-zinc-900">
                  <div className="flex justify-between text-zinc-400 print:text-zinc-600">
                    <span>Taxable Subtotal</span>
                    <span className="font-mono font-semibold text-zinc-200 print:text-zinc-900">₹{Math.round(financials.subtotal).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 print:text-zinc-600">
                    <span>CGST (9%)</span>
                    <span className="font-mono font-semibold text-zinc-200 print:text-zinc-900">₹{Math.round(financials.cgst).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 print:text-zinc-600">
                    <span>SGST (9%)</span>
                    <span className="font-mono font-semibold text-zinc-200 print:text-zinc-900">₹{Math.round(financials.sgst).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-zinc-800/80 pt-2 flex justify-between font-bold text-white print:border-zinc-200 print:text-zinc-950">
                    <span>Grand Total</span>
                    <span className="font-mono text-brand-green text-sm print:text-zinc-900">₹{Math.round(financials.grandTotal).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Actions row inside card */}
              {selectedInvoice.status !== "Paid" && (
                <div className="pt-6 border-t border-border/30 flex justify-between items-center print:hidden">
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                    <BadgeAlert className="h-4 w-4 shrink-0" /> Awaiting payment verification and release.
                  </div>
                  <Button
                    onClick={handleMarkAsPaid}
                    disabled={markingPaid}
                    className="bg-brand-green hover:bg-brand-green-hover text-zinc-950 font-bold text-xs h-9 px-5 cursor-pointer green-glow-button"
                  >
                    {markingPaid ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Recording...
                      </span>
                    ) : (
                      "Authorize Payment"
                    )}
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* ──────────────────────────────────────────────────────── */}
        {/* RIGHT COLUMN: SELECTOR & METRICS (Span 1)                */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="space-y-6 print:hidden">
          
          {/* AI Metrics Card */}
          <Card className="relative overflow-hidden premium-gradient border border-zinc-800/40 hover:border-brand-green-border/30 transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-brand-green to-transparent opacity-65" />
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-green animate-pulse" /> Spend Optimization
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Verified financial performance statistics.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-zinc-500">Supplier Name</span>
                  <span className="font-bold text-zinc-200 truncate max-w-[120px]">{selectedInvoice.vendorName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-zinc-500">Project Savings</span>
                  <span className="font-bold text-brand-green font-mono">₹29,800</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-zinc-500">Billing Integrity</span>
                  <span className="font-bold text-brand-green">99% Match</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ERP Sync Log</span>
                  <span className="font-bold text-emerald-400">VERIFIED</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vouchers selector list */}
          <Card className="bg-card/10 border-border/40 backdrop-blur-md">
            <CardHeader className="pb-2 border-b border-border/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                  <ListFilter className="h-4 w-4 text-brand-green" /> Invoices list
                </CardTitle>
                <Badge className="bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400">
                  {invoices.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-0">
              <div className="space-y-2 px-4 max-h-[350px] overflow-y-auto">
                {invoices.map((inv: any) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoiceId(inv.id);
                      setSuccessPaidState(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedInvoiceId === inv.id
                        ? "bg-brand-green-muted/10 border-brand-green/30"
                        : "bg-zinc-950/20 border-zinc-800/40 hover:border-zinc-700/40"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-zinc-200 font-mono">{inv.id}</p>
                      <p className="text-[10px] text-zinc-500 truncate max-w-[120px]">{inv.vendorName}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-brand-green font-mono">₹{inv.total.toLocaleString("en-IN")}</p>
                      <Badge 
                        variant="outline"
                        className={`text-[8px] font-bold py-0 px-1.5 ${
                          inv.status === "Paid" 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
