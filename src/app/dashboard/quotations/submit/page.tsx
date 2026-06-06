"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ReceiptText,
  FileSpreadsheet,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle,
  HelpCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRFQsAction } from "@/lib/actions/rfq";
import { getVendorsAction } from "@/lib/actions/vendor";
import { createQuotationAction } from "@/lib/actions/quotation";
import { RFQ, Vendor } from "@/lib/db";

interface QuoteItemInput {
  rfqItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  deliveryDays: number;
}

export default function SubmitQuotationPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-10 w-48 bg-secondary/35 rounded-lg" />
        <div className="h-24 w-full bg-secondary/35 rounded-lg" />
        <div className="h-64 w-full bg-secondary/35 rounded-lg" />
      </div>
    }>
      <SubmitQuotationPageContent />
    </Suspense>
  );
}

function SubmitQuotationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL Pre-selection
  const preSelectedRfqId = searchParams.get("rfqId") || "";

  // Data lists
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedRfqId, setSelectedRfqId] = useState<string>("");
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [paymentTerms, setPaymentTerms] = useState<string>("30 Days Net");
  const [warranty, setWarranty] = useState<string>("1 Year warranty");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Editable quotation table items
  const [quoteItems, setQuoteItems] = useState<QuoteItemInput[]>([]);

  // Fetch RFQs and Vendors
  useEffect(() => {
    const loadData = async () => {
      try {
        const [rfqList, vendorList] = await Promise.all([
          getRFQsAction(),
          getVendorsAction(),
        ]);
        
        // Only allow bidding on published RFQs
        const publishedRfqs = rfqList.filter(r => r.status === "Published");
        setRfqs(publishedRfqs);
        
        // Only allow active vendors to bid
        const activeVendors = vendorList.filter(v => v.status === "Active");
        setVendors(activeVendors);

        // Handle pre-selection from URL query parameter
        if (preSelectedRfqId && publishedRfqs.some(r => r.id === preSelectedRfqId)) {
          setSelectedRfqId(preSelectedRfqId);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load reference data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [preSelectedRfqId]);

  // Selected RFQ object
  const selectedRfq = useMemo(() => {
    return rfqs.find((r) => r.id === selectedRfqId);
  }, [rfqs, selectedRfqId]);

  // Populate line items table when RFQ changes
  useEffect(() => {
    if (selectedRfq) {
      const inputs = selectedRfq.items.map((item) => ({
        rfqItemId: item.id,
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: 0, // start with 0
        deliveryDays: 7, // default delivery days
      }));
      setQuoteItems(inputs);

      // Try to auto-select vendor if there's only one assigned (or default to first assigned)
      if (selectedRfq.vendorIds && selectedRfq.vendorIds.length > 0) {
        const primaryVendor = selectedRfq.vendorIds[0];
        if (vendors.some((v) => v.id === primaryVendor)) {
          setSelectedVendorId(primaryVendor);
        }
      }
    } else {
      setQuoteItems([]);
    }
  }, [selectedRfq, vendors]);

  // Update item field dynamically
  const handleItemFieldChange = (index: number, field: keyof QuoteItemInput, value: any) => {
    const updated = [...quoteItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setQuoteItems(updated);
  };

  // Calculations
  const calculatedTotals = useMemo(() => {
    const subtotal = quoteItems.reduce((acc, item) => {
      const price = Number(item.unitPrice) || 0;
      return acc + item.quantity * price;
    }, 0);

    const gstAmount = subtotal * (Number(gstPercent) / 100);
    const grandTotal = subtotal + gstAmount;

    return {
      subtotal,
      gstAmount,
      grandTotal,
    };
  }, [quoteItems, gstPercent]);

  // Form Submission
  const handleSubmitQuotation = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();

    if (!selectedRfqId) {
      toast.error("Please select an RFQ reference");
      return;
    }
    if (!selectedVendorId) {
      toast.error("Please select a Vendor profile");
      return;
    }

    const unpricedItems = quoteItems.filter((item) => item.unitPrice <= 0);
    if (!isDraft && unpricedItems.length > 0) {
      toast.error("Please enter a valid unit price for all items");
      return;
    }

    setSubmitting(true);
    
    const selectedVendorName = vendors.find((v) => v.id === selectedVendorId)?.name || "Vendor";

    const quotationData = {
      rfqId: selectedRfqId,
      rfqTitle: selectedRfq?.title || "RFQ Reference",
      vendorId: selectedVendorId,
      vendorName: selectedVendorName,
      status: isDraft ? ("Draft" as const) : ("Submitted" as const),
      subtotal: calculatedTotals.subtotal,
      gstPercent,
      grandTotal: calculatedTotals.grandTotal,
      paymentTerms,
      warranty,
      notes,
      items: quoteItems.map((item) => ({
        id: "qi-" + Math.random().toString(36).substring(7),
        rfqItemId: item.rfqItemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
        deliveryDays: item.deliveryDays,
      })),
    };

    try {
      await createQuotationAction(quotationData);
      toast.success(isDraft ? "Quotation saved as draft" : "Quotation submitted successfully", {
        description: `Bid sent to procurement desk for "${selectedRfq?.title}".`,
      });
      router.push("/dashboard/quotations");
    } catch (err) {
      toast.error("Failed to submit quotation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48 bg-secondary/35" />
        <Skeleton className="h-24 w-full bg-secondary/35" />
        <Skeleton className="h-64 w-full bg-secondary/35" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Submit Quotation
        </h2>
        <p className="text-xs text-muted-foreground">
          Prepare and file vendor pricing bids against active RFQ requests.
        </p>
      </div>

      <form onSubmit={(e) => handleSubmitQuotation(e, false)} className="grid gap-6 lg:grid-cols-3">
        {/* Left Columns (Form) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Reference selection */}
          <Card className="bg-card/15 border-border/40 backdrop-blur-md green-glow-card">
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Select RFQ */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Select Reference RFQ *</Label>
                  <Select value={selectedRfqId} onValueChange={setSelectedRfqId}>
                    <SelectTrigger className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border">
                      <SelectValue placeholder="Select active RFQ..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border/40 text-xs">
                      {rfqs.map((rfq) => (
                        <SelectItem key={rfq.id} value={rfq.id} className="text-xs cursor-pointer">
                          {rfq.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Vendor Identity */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Select Bidding Vendor *</Label>
                  <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                    <SelectTrigger className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border">
                      <SelectValue placeholder="Select vendor profile..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border/40 text-xs">
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id} className="text-xs cursor-pointer">
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RFQ Details summary overlay */}
          <AnimatePresence mode="wait">
            {selectedRfq && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-brand-green-muted/5 border-l-4 border-l-brand-green border-y-border/40 border-r-border/40">
                  <CardContent className="p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-green">
                      Reference RFQ Overview
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Deadline: <strong className="text-foreground">{new Date(selectedRfq.deadline).toLocaleDateString("en-IN")}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Category: <strong className="text-foreground">{selectedRfq.category}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Target Budget: <strong className="text-foreground font-mono">₹{selectedRfq.budget.toLocaleString("en-IN")}</strong></span>
                      </div>
                    </div>
                    {selectedRfq.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/20 pt-2">
                        {selectedRfq.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quotation editable itemized billing grid */}
          <Card className="bg-card/15 border-border/40 backdrop-blur-md overflow-hidden green-glow-card">
            <CardContent className="p-0">
              <div className="border-b border-border/40 bg-secondary/25 p-4 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-brand-green" /> Bill of Quantities (BOQ)
                </h3>
              </div>

              {!selectedRfqId ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Select a reference RFQ from the dropdown above to load the billing table.
                </div>
              ) : quoteItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  This RFQ does not contain any line items.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-secondary/10 border-b border-border/40 text-muted-foreground font-semibold">
                      <th className="p-3">Item Details</th>
                      <th className="p-3 w-20 text-center">Qty</th>
                      <th className="p-3 w-32">Unit Price *</th>
                      <th className="p-3 w-28">Total Cost</th>
                      <th className="p-3 w-28">Delivery (Days)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteItems.map((item, index) => {
                      const total = item.quantity * (item.unitPrice || 0);
                      return (
                        <tr key={item.rfqItemId} className="border-b border-border/30 hover:bg-secondary/10">
                          <td className="p-3 font-medium text-foreground">{item.itemName}</td>
                          <td className="p-3 text-center font-mono">{item.quantity}</td>
                          <td className="p-3">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-semibold font-mono">₹</span>
                              <Input
                                type="number"
                                value={item.unitPrice || ""}
                                onChange={(e) =>
                                  handleItemFieldChange(index, "unitPrice", Number(e.target.value) || 0)
                                }
                                className="bg-secondary/30 border-border/40 text-xs h-8 pl-6 focus:border-brand-green-border focus:bg-background/80"
                                placeholder="0.00"
                                required
                              />
                            </div>
                          </td>
                          <td className="p-3 font-bold font-mono text-foreground">
                            ₹{total.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.deliveryDays || ""}
                              onChange={(e) =>
                                handleItemFieldChange(index, "deliveryDays", Number(e.target.value) || 0)
                              }
                              className="bg-secondary/30 border-border/40 text-xs h-8 focus:border-brand-green-border focus:bg-background/80"
                              placeholder="e.g. 7"
                              required
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Invoice side summary card) */}
        <div className="space-y-6">
          <Card className="bg-card/15 border-border/40 backdrop-blur-md sticky top-24 green-glow-card">
            <CardContent className="p-6 space-y-5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border/35 pb-2 flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-brand-green" /> Bid Pricing Summary
              </h3>

              {/* Price list */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-foreground">
                    ₹{calculatedTotals.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Editable GST Input */}
                <div className="flex items-center justify-between gap-4 text-muted-foreground py-1 border-y border-border/20">
                  <span className="flex items-center gap-1">
                    GST/Tax Percent
                  </span>
                  <div className="relative w-20 shrink-0">
                    <Input
                      type="number"
                      value={gstPercent}
                      onChange={(e) => setGstPercent(Number(e.target.value) || 0)}
                      className="bg-secondary/40 border-border/60 text-right pr-6 h-7 text-xs font-mono font-bold focus:border-brand-green-border"
                      max={100}
                    />
                    <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>GST Amount ({gstPercent}%)</span>
                  <span className="font-mono font-semibold text-foreground">
                    ₹{calculatedTotals.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-4">
                  <span className="text-xs font-bold text-foreground">Grand Total</span>
                  <span className="text-base font-extrabold text-brand-green font-mono tracking-tight bg-brand-green-muted/10 border border-brand-green-border/20 rounded-md px-2.5 py-0.5">
                    ₹{calculatedTotals.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Payment details inputs */}
              <div className="space-y-3 border-t border-border/40 pt-4 text-xs">
                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment Terms</Label>
                  <Input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="bg-secondary/30 border-border/50 text-xs h-8 focus:border-brand-green-border"
                    placeholder="e.g. 30 Days Net"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Warranty Period</Label>
                  <Input
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="bg-secondary/30 border-border/50 text-xs h-8 focus:border-brand-green-border"
                    placeholder="e.g. 1 Year warranty"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bid Notes / Terms</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-secondary/30 border-border/50 text-xs min-h-[60px] focus:border-brand-green-border"
                    placeholder="Provide additional terms, packaging options, logistics exclusions..."
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col gap-2 border-t border-border/40 pt-4">
                <Button
                  type="submit"
                  disabled={submitting || !selectedRfqId}
                  className="bg-brand-green text-zinc-950 hover:bg-brand-green-hover text-xs font-semibold cursor-pointer h-9 px-4 w-full shadow-md green-glow-button"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Quotation"
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  disabled={submitting || !selectedRfqId}
                  onClick={(e) => handleSubmitQuotation(e, true)}
                  className="text-xs h-9 border border-zinc-850 hover:bg-secondary/40 text-muted-foreground hover:text-foreground cursor-pointer w-full"
                >
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
