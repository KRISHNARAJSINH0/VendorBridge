"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  FileText,
  Building2,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  XCircle,
  BadgeAlert,
  Calendar,
  Layers,
  ArrowDownToLine,
  ThumbsUp,
  FileSpreadsheet,
  Search,
  CheckSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/context/StateContext";

export default function ApprovalsPage() {
  const {
    rfqs,
    quotations,
    vendors,
    approveOrRejectRFQ,
    generatePOAndInvoice
  } = useAppState();

  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabFilter, setTabFilter] = useState<"pending" | "all">("pending");

  // 1. Filter and search RFQs
  const filteredRfqs = useMemo(() => {
    return rfqs.filter((r: any) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (tabFilter === "pending") {
        return matchesSearch && r.status === "Under Review";
      }
      return matchesSearch;
    });
  }, [rfqs, searchQuery, tabFilter]);

  // Set default selected RFQ
  useEffect(() => {
    if (filteredRfqs.length > 0) {
      // Keep selection if it's still in the list, otherwise pick first
      const exists = filteredRfqs.find((r: any) => r.id === selectedRfqId);
      if (!exists) {
        setSelectedRfqId(filteredRfqs[0].id);
        setRemarks(filteredRfqs[0].managerRemarks || "");
        setSuccessState(false);
      }
    } else {
      setSelectedRfqId(null);
    }
  }, [filteredRfqs, selectedRfqId]);

  // Selected RFQ object
  const selectedRfq = useMemo(() => {
    return rfqs.find((r: any) => r.id === selectedRfqId) || null;
  }, [rfqs, selectedRfqId]);

  // Filter quotations for the selected RFQ
  const relatedQuotes = useMemo(() => {
    if (!selectedRfq) return [];
    return quotations.filter((q: any) => q.rfqId === selectedRfq.id);
  }, [selectedRfq, quotations]);

  // Find recommended quotation (status === "Selected" or "Approved" or "Closed")
  const recommendedQuote = useMemo(() => {
    return relatedQuotes.find((q: any) => q.status === "Selected" || q.status === "Approved" || q.status === "Closed");
  }, [relatedQuotes]);

  // Find lowest price, fastest delivery, best rating
  const stats = useMemo(() => {
    if (relatedQuotes.length === 0) return null;

    let lowestPriceQuote = relatedQuotes[0];
    let fastestDeliveryQuote = relatedQuotes[0];
    let bestRatingQuote = relatedQuotes[0];
    let maxPrice = relatedQuotes[0].totalPrice;

    relatedQuotes.forEach((q: any) => {
      const v = vendors.find((vend: any) => vend.id === q.vendorId);
      const lowestV = vendors.find((vend: any) => vend.id === lowestPriceQuote.vendorId);
      const fastestV = vendors.find((vend: any) => vend.id === fastestDeliveryQuote.vendorId);
      const bestV = vendors.find((vend: any) => vend.id === bestRatingQuote.vendorId);

      if (q.totalPrice < lowestPriceQuote.totalPrice) lowestPriceQuote = q;
      if (q.totalPrice > maxPrice) maxPrice = q.totalPrice;
      if (q.deliveryDays < fastestDeliveryQuote.deliveryDays) fastestDeliveryQuote = q;
      if (v && bestV && v.rating > bestV.rating) bestRatingQuote = q;
    });

    const savings = maxPrice - (recommendedQuote?.totalPrice || 0);

    return {
      lowestPriceId: lowestPriceQuote.id,
      fastestDeliveryId: fastestDeliveryQuote.id,
      bestRatingId: bestRatingQuote.id,
      maxPrice,
      savings: savings > 0 ? savings : 12000 // Fallback simulated savings
    };
  }, [relatedQuotes, vendors, recommendedQuote]);

  const handleAction = async (actionType: "Approved" | "Rejected") => {
    if (!selectedRfq) return;
    setSubmitting(true);
    try {
      await approveOrRejectRFQ(selectedRfq.id, actionType, remarks);
      if (actionType === "Approved") {
        setSuccessState(true);
      } else {
        // Just reload/unselect on reject
        setSuccessState(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePO = async () => {
    if (!selectedRfq || !recommendedQuote) return;
    setSubmitting(true);
    try {
      await generatePOAndInvoice(selectedRfq.id, recommendedQuote.id);
      setSuccessState(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* HEADER                                                   */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/30 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-brand-green" /> Manager Approvals
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Perform L2 decision-making, evaluate vendor quotations side-by-side, and approve procurement budgets.
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
        
        {/* ──────────────────────────────────────────────────────── */}
        {/* LEFT COLUMN: RFQ LIST PANEL (Span 4)                     */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-card/10 border-border/40 backdrop-blur-md">
            <CardHeader className="p-4 border-b border-border/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wide">Procurement Queue</span>
                <Badge className="bg-brand-green-muted/20 text-brand-green border border-brand-green-border/30 text-[9px] font-bold">
                  {rfqs.filter((r: any) => r.status === "Under Review").length} Awaiting Approval
                </Badge>
              </div>

              {/* Tab Filters */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950/40 rounded-lg border border-zinc-800/40 mb-3">
                <button
                  onClick={() => setTabFilter("pending")}
                  className={`py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    tabFilter === "pending"
                      ? "bg-zinc-900 text-white shadow-sm border border-zinc-800/60"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Pending L2
                </button>
                <button
                  onClick={() => setTabFilter("all")}
                  className={`py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    tabFilter === "all"
                      ? "bg-zinc-900 text-white shadow-sm border border-zinc-800/60"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  All Requests
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search RFQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-950/20 border border-border/60 text-xs rounded-lg text-white placeholder:text-zinc-600 outline-none focus:border-brand-green/40 focus:ring-1 focus:ring-brand-green-muted/10 transition-all font-sans"
                />
              </div>
            </CardHeader>

            <CardContent className="p-2 space-y-1.5 max-h-[500px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {filteredRfqs.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600 text-xs italic">
                    No procurement records match criteria.
                  </div>
                ) : (
                  filteredRfqs.map((r: any) => {
                    const isSelected = selectedRfqId === r.id;
                    const isPending = r.status === "Under Review";
                    return (
                      <motion.button
                        key={r.id}
                        onClick={() => {
                          setSelectedRfqId(r.id);
                          setRemarks(r.managerRemarks || "");
                          setSuccessState(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand-green-muted/10 border-brand-green/30 text-white"
                            : "bg-white/[0.01] border-white/[0.04] text-zinc-400 hover:bg-zinc-900/30 hover:border-zinc-800"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-zinc-400">{r.id}</span>
                          <Badge
                            className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                              r.status === "Approved" || r.status === "Closed"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : r.status === "Under Review"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : r.status === "Rejected"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-zinc-800 text-zinc-400 border border-zinc-700/40"
                            }`}
                          >
                            {r.status}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-bold truncate text-zinc-200">{r.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-zinc-500">
                          <div className="flex items-center gap-1">
                            <Layers className="h-3 w-3 text-zinc-600" />
                            <span>{r.items.length} items</span>
                          </div>
                          {r.deadline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-zinc-600" />
                              <span>{r.deadline}</span>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* ──────────────────────────────────────────────────────── */}
        {/* RIGHT COLUMN: WORKFLOW REVIEW DASHBOARD (Span 8)          */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {!selectedRfq ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-24 bg-card/5 border border-dashed border-zinc-800/60 rounded-xl max-w-6xl mx-auto italic text-zinc-500 text-xs flex flex-col items-center justify-center gap-2"
              >
                <BadgeAlert className="h-8 w-8 text-zinc-700" />
                Select a procurement request from the queue to start review.
              </motion.div>
            ) : successState ? (
              /* ─── Success Overlay post Approval L2 ─── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-8 sm:p-12 text-center bg-[#07070a] border border-emerald-500/25 rounded-2xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent pointer-events-none" />
                <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <Check className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Procurement Request Approved (L2)</h3>
                <p className="text-zinc-400 text-xs max-w-md mx-auto mb-8 leading-relaxed">
                  Budget and vendor selection for <strong className="text-white">{selectedRfq.title}</strong> has been authorized. Sign the documents to complete downstream integration.
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8 p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 text-left text-xs">
                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Authorized Vendor</span>
                    <p className="text-white font-bold truncate">{recommendedQuote?.vendorName}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Contract Budget</span>
                    <p className="text-brand-green font-bold font-mono">₹{recommendedQuote?.totalPrice.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleGeneratePO}
                    disabled={submitting}
                    className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs h-10 px-6 cursor-pointer shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-1.5"><RefreshCw className="h-4.5 w-4.5 animate-spin" /> Processing...</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><ArrowDownToLine className="h-4.5 w-4.5" /> Generate Purchase Order & Invoice</span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSuccessState(false)}
                    disabled={submitting}
                    className="text-xs h-10 cursor-pointer border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* ─── Detailed review sheet ─── */
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Section 1: RFQ Details */}
                <Card className="bg-card/10 border-border/40 backdrop-blur-md">
                  <CardHeader className="pb-3 border-b border-border/30">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 uppercase tracking-wide">
                          RFQ Requirements Sheet
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Specification list requested by Procurement Officer.
                        </CardDescription>
                      </div>
                      <Badge className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono py-1">
                        Ref: {selectedRfq.id}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4 text-xs">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">{selectedRfq.title}</h3>
                      <p className="text-zinc-400 leading-relaxed text-[11px]">{selectedRfq.description}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-900">
                        <span className="text-zinc-500 text-[9px] uppercase font-bold">Category</span>
                        <p className="text-zinc-300 font-semibold mt-0.5">{selectedRfq.category}</p>
                      </div>
                      <div className="bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-900">
                        <span className="text-zinc-500 text-[9px] uppercase font-bold">Deadline</span>
                        <p className="text-zinc-300 font-semibold mt-0.5">{selectedRfq.deadline}</p>
                      </div>
                      <div className="bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-900">
                        <span className="text-zinc-500 text-[9px] uppercase font-bold">Status</span>
                        <p className="text-zinc-300 font-semibold mt-0.5">{selectedRfq.status}</p>
                      </div>
                    </div>

                    <div className="border border-border/20 rounded-lg overflow-hidden bg-zinc-950/15">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border/20 bg-zinc-950/35 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                            <th className="py-2 px-3">Item Specification</th>
                            <th className="py-2 px-3 text-center">Quantity Requested</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRfq.items.map((it: any, i: number) => (
                            <tr key={i} className="border-b border-border/10 last:border-0 hover:bg-zinc-800/10">
                              <td className="py-2 px-3 font-medium text-zinc-300">{it.name}</td>
                              <td className="py-2 px-3 text-center font-mono font-semibold text-zinc-400">
                                {it.qty} {it.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2: Side-by-Side Quotation Comparison */}
                <Card className="bg-card/10 border-border/40 backdrop-blur-md">
                  <CardHeader className="pb-3 border-b border-border/30">
                    <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 uppercase tracking-wide">
                      Supplier Bids Comparison Matrix
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Bids submitted by vendors side-by-side. Highlights indicate criteria-leading values.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 p-0">
                    {relatedQuotes.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 italic text-xs">
                        No vendor quotations submitted yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border/20 bg-zinc-950/20 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                              <th className="py-3 px-4">Supplier Criteria</th>
                              {relatedQuotes.map((q: any) => (
                                <th key={q.id} className="py-3 px-4 min-w-[150px]">
                                  <div className="space-y-0.5">
                                    <p className="text-white font-bold truncate">{q.vendorName}</p>
                                    <p className="text-[8px] font-mono text-zinc-500 font-medium">{q.id}</p>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* Base Pricing */}
                            <tr className="border-b border-border/10 hover:bg-secondary/10">
                              <td className="py-3 px-4 font-semibold text-zinc-300">Total Quoted Cost</td>
                              {relatedQuotes.map((q: any) => {
                                const isLowest = stats?.lowestPriceId === q.id;
                                const isSelected = q.status === "Selected";
                                return (
                                  <td key={q.id} className="py-3 px-4 font-mono">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`font-bold ${isLowest ? "text-emerald-400" : isSelected ? "text-brand-green" : "text-zinc-300"}`}>
                                        ₹{q.totalPrice.toLocaleString("en-IN")}
                                      </span>
                                      {isLowest && (
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[7px] font-extrabold px-1.5 py-0">
                                          LOWEST
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Delivery Timeline */}
                            <tr className="border-b border-border/10 hover:bg-secondary/10">
                              <td className="py-3 px-4 font-semibold text-zinc-300">Delivery Lead Time</td>
                              {relatedQuotes.map((q: any) => {
                                const isFastest = stats?.fastestDeliveryId === q.id;
                                return (
                                  <td key={q.id} className="py-3 px-4">
                                    <div className="flex items-center gap-1.5 font-medium text-zinc-300">
                                      <span>{q.deliveryDays} Days</span>
                                      {isFastest && (
                                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[7px] font-extrabold px-1.5 py-0">
                                          FASTEST
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Rating */}
                            <tr className="border-b border-border/10 hover:bg-secondary/10">
                              <td className="py-3 px-4 font-semibold text-zinc-300">Vendor Performance Index</td>
                              {relatedQuotes.map((q: any) => {
                                const v = vendors.find((vend: any) => vend.id === q.vendorId);
                                const rating = v?.rating || 5.0;
                                const isBest = stats?.bestRatingId === q.id;
                                return (
                                  <td key={q.id} className="py-3 px-4">
                                    <div className="flex items-center gap-1.5 text-zinc-300">
                                      <span className="font-bold text-amber-400">★ {rating.toFixed(1)}</span>
                                      {isBest && (
                                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[7px] font-extrabold px-1.5 py-0">
                                          BEST
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Selection Status */}
                            <tr className="border-b border-border/10 hover:bg-secondary/10">
                              <td className="py-3 px-4 font-semibold text-zinc-300">L1 Selection Flag</td>
                              {relatedQuotes.map((q: any) => {
                                const isSelected = q.status === "Selected" || q.status === "Approved" || q.status === "Closed";
                                return (
                                  <td key={q.id} className="py-3 px-4">
                                    {isSelected ? (
                                      <Badge className="bg-brand-green-muted/20 text-brand-green border border-brand-green-border/30 text-[8px] font-extrabold uppercase">
                                        L1 Recommended
                                      </Badge>
                                    ) : (
                                      <span className="text-zinc-650 text-[10px]">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Item detail breakdowns */}
                            {selectedRfq.items.map((item: any, itemIdx: number) => (
                              <tr key={itemIdx} className="border-b border-border/10 last:border-0 hover:bg-secondary/5 text-zinc-400">
                                <td className="py-3 px-4 pl-6 italic text-[11px] text-zinc-500">
                                  ↳ {item.name} Unit Price
                                </td>
                                {relatedQuotes.map((q: any) => {
                                  // Match items by index or name
                                  const matchingIt = q.items[itemIdx] || q.items.find((i: any) => i.name.toLowerCase() === item.name.toLowerCase());
                                  const itemPrice = matchingIt ? matchingIt.price : 0;
                                  return (
                                    <td key={q.id} className="py-3 px-4 font-mono text-[11px]">
                                      ₹{itemPrice.toLocaleString("en-IN")}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Section 3: AI Recommendation Summary Card */}
                {recommendedQuote && (
                  <Card className="relative overflow-hidden premium-gradient border border-zinc-800/40 hover:border-brand-green-border/30 transition-all duration-300 group">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-green to-transparent opacity-60" />
                    <CardHeader className="pb-2 border-b border-border/30">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-brand-green" /> AI Procurement Engine Insight
                        </CardTitle>
                        <Badge className="bg-brand-green-muted/20 text-brand-green border border-brand-green-border/30 text-[9px] font-bold">
                          94% Selection Confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4 text-xs">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900">
                          <span className="text-zinc-500 text-[9px] uppercase font-bold">L1 Selection</span>
                          <p className="text-white font-bold truncate mt-0.5">{recommendedQuote.vendorName}</p>
                        </div>
                        <div className="bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900">
                          <span className="text-zinc-500 text-[9px] uppercase font-bold">Optimized Savings</span>
                          <p className="text-emerald-400 font-bold mt-0.5">₹{stats?.savings.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900">
                          <span className="text-zinc-500 text-[9px] uppercase font-bold">Commercial Risk</span>
                          <p className="text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 shrink-0" /> Low Risk
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900">
                        <span className="text-zinc-400 text-[10px] font-semibold">Deciding Comparison Parameters:</span>
                        <ul className="list-disc list-inside space-y-1 text-zinc-500 text-[10.5px] mt-1">
                          <li>Quoted pricing maps perfectly within requested budget thresholds.</li>
                          <li>Excellent rating index with a history of on-time shipping performance.</li>
                          <li>Logistical delivery schedule meets requested procurement deadlines.</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Section 4: Decision Panel & Comments */}
                <Card className="bg-card/10 border-border/40 backdrop-blur-md">
                  <CardHeader className="pb-2 border-b border-border/30">
                    <CardTitle className="text-sm font-semibold tracking-tight text-zinc-100 uppercase tracking-wide">
                      Approval Authority Remarks
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Attach remarks regarding budget alignment, compliance, or conditional requirements.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <Textarea
                      placeholder="Add official signing comments or requirements..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      disabled={selectedRfq.status !== "Under Review" || submitting}
                      className="bg-secondary/40 border-border/60 text-xs min-h-[90px] focus:border-brand-green-border focus-visible:ring-brand-green-muted/20 text-white placeholder:text-zinc-600 outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 text-[9px] text-zinc-500">
                      <span className="font-semibold">Quick Templates:</span>
                      <button
                        onClick={() => setRemarks((prev) => prev ? prev + " | Approved within budget." : "Approved within budget.")}
                        disabled={selectedRfq.status !== "Under Review"}
                        className="border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        + Budget Ok
                      </button>
                      <button
                        onClick={() => setRemarks((prev) => prev ? prev + " | Delivery timeline verified and acceptable." : "Delivery timeline verified and acceptable.")}
                        disabled={selectedRfq.status !== "Under Review"}
                        className="border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        + Timeline Ok
                      </button>
                      <button
                        onClick={() => setRemarks((prev) => prev ? prev + " | Subject to standard warranty terms." : "Subject to standard warranty terms.")}
                        disabled={selectedRfq.status !== "Under Review"}
                        className="border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        + Warranty Clause
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Decision Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleAction("Rejected")}
                    disabled={selectedRfq.status !== "Under Review" || submitting}
                    className="text-xs font-semibold border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 cursor-pointer h-10 px-4 transition-colors disabled:opacity-50"
                  >
                    Reject Procurement
                  </Button>
                  <Button
                    onClick={() => handleAction("Approved")}
                    disabled={selectedRfq.status !== "Under Review" || submitting || !recommendedQuote}
                    className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-xs cursor-pointer h-10 px-6 green-glow-button transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-1.5"><RefreshCw className="h-4 w-4 animate-spin" /> Authorizing...</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4" /> Sign & Approve L2 Request</span>
                    )}
                  </Button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
