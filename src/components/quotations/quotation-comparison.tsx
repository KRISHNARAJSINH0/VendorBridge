"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  RefreshCw,
  FileText,
  ChevronDown,
  ShieldAlert,
  Percent,
  CheckSquare
} from "lucide-react";
import { Quotation, RFQ, Vendor } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface QuotationComparisonProps {
  onBack: () => void;
  rfqs: RFQ[];
  quotations: Quotation[];
  vendors: Vendor[];
  onSelectVendor: (quotationId: string) => Promise<void>;
}

export default function QuotationComparison({
  onBack,
  rfqs,
  quotations,
  vendors,
  onSelectVendor
}: QuotationComparisonProps) {
  // We'll focus on rfq-1 by default as specified by the "Office Furniture Procurement Q2" demo data.
  const [selectedRfqId, setSelectedRfqId] = useState<string>("rfq-1");
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<Quotation | null>(null);
  const [confirmedQuote, setConfirmedQuote] = useState<Quotation | null>(null);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);

  const activeRfq = useMemo(() => {
    return rfqs.find((r) => r.id === selectedRfqId) || rfqs[0] || null;
  }, [rfqs, selectedRfqId]);

  // Filter quotations submitted for this RFQ
  const rfqQuotations = useMemo(() => {
    return quotations.filter((q) => q.rfqId === selectedRfqId && q.status !== "Draft");
  }, [quotations, selectedRfqId]);

  // Map and calculate stats
  const comparisonData = useMemo(() => {
    if (rfqQuotations.length === 0) return [];

    // Resolve vendor records
    const mapped = rfqQuotations.map((quote) => {
      const vendor = vendors.find((v) => v.id === quote.vendorId);
      const deliveryDays = Math.max(...quote.items.map((i) => i.deliveryDays), 7);
      return {
        quote,
        vendor,
        deliveryDays,
        price: quote.grandTotal,
        rating: vendor?.rating || 4.0,
        risk: vendor?.riskScore || "Medium",
        paymentTerms: quote.paymentTerms || "30 Days Net",
        warranty: quote.warranty || "1 Year"
      };
    });

    const prices = mapped.map((m) => m.price);
    const deliveries = mapped.map((m) => m.deliveryDays);
    const ratings = mapped.map((m) => m.rating);

    const minPrice = Math.min(...prices);
    const minDelivery = Math.min(...deliveries);
    const maxRating = Math.max(...ratings);

    // Compute dynamic scores
    return mapped.map((item) => {
      const priceScore = (minPrice / item.price) * 100;
      const deliveryScore = (minDelivery / item.deliveryDays) * 100;
      
      let riskScore = 60;
      if (item.risk === "Low") riskScore = 100;
      else if (item.risk === "High") riskScore = 20;

      const finalScore = Math.round(
        priceScore * 0.50 +
        deliveryScore * 0.30 +
        riskScore * 0.20
      );

      return {
        ...item,
        priceScore,
        deliveryScore,
        riskScore,
        finalScore,
        isLowestPrice: item.price === minPrice,
        isFastestDelivery: item.deliveryDays === minDelivery,
        isHighestRating: item.rating === maxRating,
        isLowestRisk: item.risk === "Low"
      };
    }).sort((a, b) => b.finalScore - a.finalScore); // Sort by highest score first
  }, [rfqQuotations, vendors]);

  const recommendedVendor = useMemo(() => {
    if (comparisonData.length === 0) return null;
    return comparisonData[0]; // sorted by finalScore desc
  }, [comparisonData]);



  const handleSelectVendorClick = (quote: Quotation) => {
    setSelectedQuoteForModal(quote);
  };

  const handleConfirmSelection = async () => {
    if (!selectedQuoteForModal) return;
    setIsSubmittingApproval(true);
    try {
      await onSelectVendor(selectedQuoteForModal.id);
      setConfirmedQuote(selectedQuoteForModal);
      setSelectedQuoteForModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const getConfirmedData = useMemo(() => {
    if (!confirmedQuote) return null;
    return comparisonData.find((c) => c.quote.id === confirmedQuote.id);
  }, [confirmedQuote, comparisonData]);

  if (confirmedQuote && getConfirmedData) {
    const { vendor, price, deliveryDays, finalScore } = getConfirmedData;
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-card/10 border border-brand-green/30 rounded-2xl p-8 md:p-12 text-center shadow-[0_0_50px_rgba(74,222,128,0.08)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-radial-gradient from-brand-green/5 to-transparent pointer-events-none" />
          
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="h-20 w-20 bg-brand-green/20 rounded-full flex items-center justify-center border border-brand-green/40 text-brand-green shadow-[0_0_20px_rgba(74,222,128,0.2)]"
            >
              <Check className="h-10 w-10 stroke-[3]" />
            </motion.div>
          </div>

          <span className="text-brand-green font-bold text-xs uppercase tracking-widest bg-brand-green/10 border border-brand-green/30 px-3 py-1 rounded-full">
            Approved For Procurement
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-6">
            Vendor Selected Successfully
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            The quotation has been finalized, and a Purchase Order (PO) has been initialized for dispatch to the vendor.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-10 border border-border/30 bg-zinc-900/30 backdrop-blur-md rounded-xl p-6 text-left">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Selected Supplier</p>
              <h3 className="text-sm font-semibold text-foreground mt-1 truncate">{vendor?.name}</h3>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Final Value</p>
              <h3 className="text-sm font-bold text-brand-green mt-1">₹{price.toLocaleString("en-IN")}</h3>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Expected Delivery</p>
              <h3 className="text-sm font-semibold text-foreground mt-1">{deliveryDays} Days</h3>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Decision Score</p>
              <h3 className="text-sm font-semibold text-amber-400 mt-1">{finalScore} / 100</h3>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onBack}
              className="bg-brand-green text-zinc-950 font-semibold hover:bg-brand-green-hover hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Return to Quotations
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!activeRfq) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Quotation Comparison
              </h2>
            </div>
            <p className="text-xs text-muted-foreground pl-10">
              Loading comparison data...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Quotation Comparison
            </h2>
          </div>
          <p className="text-xs text-muted-foreground pl-10">
            Compare vendor quotations side-by-side and select the most suitable supplier.
          </p>
        </div>

        {/* RFQ selector */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground font-medium">Select RFQ:</span>
          <div className="relative">
            <select
              value={selectedRfqId}
              onChange={(e) => {
                setSelectedRfqId(e.target.value);
              }}
              className="bg-card/45 border border-border/40 text-xs text-foreground font-semibold rounded-lg h-9 px-3 pr-8 focus:outline-none focus:border-brand-green-border appearance-none cursor-pointer"
            >
              {rfqs.map((rfq) => (
                <option key={rfq.id} value={rfq.id} className="bg-zinc-950">
                  {rfq.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* RFQ Meta Info Bar */}
      <div className="bg-card/25 border border-border/30 rounded-xl p-4 flex flex-wrap gap-6 items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-zinc-800/40 rounded-lg flex items-center justify-center border border-zinc-700/35 text-brand-green">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Active RFQ</p>
            <h3 className="font-bold text-foreground mt-0.5">{activeRfq.title}</h3>
          </div>
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Bids Received</p>
            <h3 className="font-bold text-foreground text-center mt-0.5">{rfqQuotations.length}</h3>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Target Budget</p>
            <h3 className="font-bold text-foreground mt-0.5">₹{activeRfq.budget.toLocaleString("en-IN")}</h3>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deadline</p>
            <h3 className="font-bold text-foreground mt-0.5">{activeRfq.deadline}</h3>
          </div>
        </div>
      </div>

      {rfqQuotations.length === 0 ? (
        <Card className="bg-card/25 border-border/40 text-center py-16 flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-muted-foreground mb-4">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">No Submissions Found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            There are no submitted quotes for this RFQ yet to compare.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <div className="bg-card/10 border border-border/40 rounded-xl overflow-hidden backdrop-blur-md">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/40 bg-zinc-900/40">
                    <th className="p-4 text-xs font-semibold text-muted-foreground w-1/4">Criteria</th>
                    {comparisonData.map((data, index) => {
                      const isRecommended = recommendedVendor && data.quote.id === recommendedVendor.quote.id;
                      return (
                        <th
                          key={data.quote.id}
                          className={`p-4 text-xs font-bold text-foreground w-1/4 relative ${
                            isRecommended ? "bg-brand-green-muted/5 border-x border-brand-green/20" : ""
                          }`}
                        >
                          {isRecommended && (
                            <div className="absolute top-0 inset-x-0 h-1 bg-brand-green shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                          )}
                          <div className="flex flex-col gap-1">
                            <span className="truncate">{data.vendor?.name}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              {isRecommended ? "(Score Recommendation)" : `Vendor ${String.fromCharCode(65 + index)}`}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {/* Row: Grand Total */}
                  <tr>
                    <td className="p-4 font-medium text-foreground">Grand Total</td>
                    {comparisonData.map((data) => (
                      <td
                        key={data.quote.id}
                        className={`p-4 ${
                          recommendedVendor && data.quote.id === recommendedVendor.quote.id
                            ? "bg-brand-green-muted/5 border-x border-brand-green/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground font-mono">
                            ₹{data.price.toLocaleString("en-IN")}
                          </span>
                          {data.isLowestPrice && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded-md">
                              Lowest Price
                            </Badge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: GST % */}
                  <tr>
                    <td className="p-4 font-medium text-foreground">GST %</td>
                    {comparisonData.map((data) => (
                      <td
                        key={data.quote.id}
                        className={`p-4 font-mono text-muted-foreground ${
                          recommendedVendor && data.quote.id === recommendedVendor.quote.id
                            ? "bg-brand-green-muted/5 border-x border-brand-green/20"
                            : ""
                        }`}
                      >
                        {data.quote.gstPercent}%
                      </td>
                    ))}
                  </tr>

                  {/* Row: Delivery Days */}
                  <tr>
                    <td className="p-4 font-medium text-foreground">Delivery Days</td>
                    {comparisonData.map((data) => (
                      <td
                        key={data.quote.id}
                        className={`p-4 ${
                          recommendedVendor && data.quote.id === recommendedVendor.quote.id
                            ? "bg-brand-green-muted/5 border-x border-brand-green/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{data.deliveryDays} days</span>
                          {data.isFastestDelivery && (
                            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] px-1.5 py-0.5 rounded-md">
                              Fastest Delivery
                            </Badge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Vendor Rating */}
                  <tr>
                    <td className="p-4 font-medium text-foreground">Vendor Rating</td>
                    {comparisonData.map((data) => (
                      <td
                        key={data.quote.id}
                        className={`p-4 ${
                          recommendedVendor && data.quote.id === recommendedVendor.quote.id
                            ? "bg-brand-green-muted/5 border-x border-brand-green/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{data.rating}/5</span>
                          {data.isHighestRating && (
                            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-1.5 py-0.5 rounded-md">
                              Highest Rating
                            </Badge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Payment Terms */}
                  <tr>
                    <td className="p-4 font-medium text-foreground">Payment Terms</td>
                    {comparisonData.map((data) => (
                      <td
                        key={data.quote.id}
                        className={`p-4 text-muted-foreground truncate max-w-[150px] ${
                          recommendedVendor && data.quote.id === recommendedVendor.quote.id
                            ? "bg-brand-green-muted/5 border-x border-brand-green/20"
                            : ""
                        }`}
                        title={data.paymentTerms}
                      >
                        {data.paymentTerms}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Warranty */}
                  <tr>
                    <td className="p-4 font-medium text-foreground">Warranty</td>
                    {comparisonData.map((data) => (
                      <td
                        key={data.quote.id}
                        className={`p-4 text-muted-foreground ${
                          recommendedVendor && data.quote.id === recommendedVendor.quote.id
                            ? "bg-brand-green-muted/5 border-x border-brand-green/20"
                            : ""
                        }`}
                      >
                        {data.warranty}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Risk Score */}
                  <tr>
                    <td className="p-4 font-medium text-foreground">Risk Score</td>
                    {comparisonData.map((data) => (
                      <td
                        key={data.quote.id}
                        className={`p-4 ${
                          recommendedVendor && data.quote.id === recommendedVendor.quote.id
                            ? "bg-brand-green-muted/5 border-x border-brand-green/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              data.risk === "Low"
                                ? "text-emerald-400"
                                : data.risk === "Medium"
                                ? "text-amber-400"
                                : "text-rose-400"
                            }`}
                          >
                            {data.risk}
                          </span>
                          {data.isLowestRisk && (
                            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] px-1.5 py-0.5 rounded-md">
                              Lowest Risk
                            </Badge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Status */}
                  <tr>
                    <td className="p-4 font-medium text-foreground">Status</td>
                    {comparisonData.map((data) => (
                      <td
                        key={data.quote.id}
                        className={`p-4 ${
                          recommendedVendor && data.quote.id === recommendedVendor.quote.id
                            ? "bg-brand-green-muted/5 border-x border-brand-green/20"
                            : ""
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-green-muted/20 text-brand-green border border-brand-green-border/20">
                          {data.quote.status}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Decision Score (Dynamic weighted bar) */}
                  <tr>
                    <td className="p-4 font-medium text-foreground">Decision Score</td>
                    {comparisonData.map((data) => {
                      const isRecommended = recommendedVendor && data.quote.id === recommendedVendor.quote.id;
                      return (
                        <td
                          key={data.quote.id}
                          className={`p-4 ${
                            isRecommended ? "bg-brand-green-muted/5 border-x border-brand-green/20" : ""
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center font-mono">
                              <span className="font-bold text-foreground">{data.finalScore} / 100</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.finalScore}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  isRecommended
                                    ? "bg-brand-green shadow-[0_0_8px_rgba(74,222,128,0.4)]"
                                    : "bg-zinc-500"
                                }`}
                              />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Selection CTA */}
                  <tr className="bg-zinc-900/20">
                    <td className="p-4 font-medium text-foreground">Selection Action</td>
                    {comparisonData.map((data) => {
                      const isRecommended = recommendedVendor && data.quote.id === recommendedVendor.quote.id;
                      return (
                        <td
                          key={data.quote.id}
                          className={`p-4 ${
                            isRecommended ? "bg-brand-green-muted/5 border-x border-brand-green/20" : ""
                          }`}
                        >
                          <Button
                            onClick={() => handleSelectVendorClick(data.quote)}
                            className={`w-full text-xs font-semibold h-9 transition-all cursor-pointer ${
                              isRecommended
                                ? "bg-brand-green text-zinc-950 hover:bg-brand-green-hover hover:scale-[1.02] active:scale-[0.98] shadow-md green-glow-button"
                                : "bg-zinc-800 text-foreground border border-zinc-700/50 hover:bg-zinc-700 hover:text-white"
                            }`}
                          >
                            {isRecommended ? "Select & Approve" : "Select Vendor"}
                          </Button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Score Weights Guide */}
            <div className="bg-zinc-900/30 border border-border/20 rounded-xl p-4 text-[11px] text-muted-foreground space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-brand-green" /> Decision Scoring Algorithm Weights
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="font-bold text-foreground">Price (50%)</span>: Linear scale based on cheapest bid.
                </div>
                <div>
                  <span className="font-bold text-foreground">Delivery (30%)</span>: Normalization of delivery lead time.
                </div>
                <div>
                  <span className="font-bold text-foreground">Risk (20%)</span>: Score mapped on supplier credit risk.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={selectedQuoteForModal !== null} onOpenChange={(open) => { if(!open) setSelectedQuoteForModal(null); }}>
        <DialogContent className="bg-popover border border-border/80 text-foreground w-full max-w-md p-6 rounded-xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-brand-green" /> Confirm Vendor Selection
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              You are selecting the following vendor quotation for contract finalization. This will initiate PO generation.
            </DialogDescription>
          </DialogHeader>

          {selectedQuoteForModal && (
            <div className="border border-border/40 rounded-lg p-4 space-y-3 bg-zinc-900/30 text-xs my-4">
              <div className="flex justify-between items-center pb-2 border-b border-border/20">
                <span className="text-muted-foreground">Selected Vendor</span>
                <span className="font-bold text-foreground truncate max-w-[200px]">
                  {selectedQuoteForModal.vendorName}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/20">
                <span className="text-muted-foreground">Bid Price</span>
                <span className="font-bold text-brand-green font-mono">
                  ₹{selectedQuoteForModal.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/20">
                <span className="text-muted-foreground">Expected Delivery</span>
                <span className="font-bold text-foreground">
                  {Math.max(...selectedQuoteForModal.items.map((i) => i.deliveryDays), 7)} Days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Decision Score</span>
                <span className="font-bold text-amber-400">
                  {
                    (() => {
                      const quoteData = comparisonData.find(c => c.quote.id === selectedQuoteForModal.id);
                      return quoteData ? quoteData.finalScore : 0;
                    })()
                  } / 100
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3 pt-2">
            <Button
              variant="outline"
              disabled={isSubmittingApproval}
              onClick={() => setSelectedQuoteForModal(null)}
              className="text-xs font-semibold border border-zinc-700/50 bg-zinc-800 text-foreground hover:bg-zinc-700 cursor-pointer h-9"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmittingApproval}
              onClick={handleConfirmSelection}
              className="bg-brand-green text-zinc-950 font-semibold hover:bg-brand-green-hover text-xs cursor-pointer h-9 flex items-center justify-center gap-1.5"
            >
              {isSubmittingApproval && <RefreshCw className="h-3 w-3 animate-spin" />}
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
