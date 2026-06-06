"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, ReceiptText, ShieldCheck, Landmark, CalendarRange, ArrowRight, Search, Sparkles } from "lucide-react";
import { getQuotationsAction, updateQuotationAction } from "@/lib/actions/quotation";
import { getRFQsAction } from "@/lib/actions/rfq";
import { getVendorsAction } from "@/lib/actions/vendor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Quotation, RFQ, Vendor } from "@/lib/db";
import QuotationComparison from "@/components/quotations/quotation-comparison";

export default function QuotationListPage() {
  const pathname = usePathname();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showComparison, setShowComparison] = useState(false);

  const loadData = async () => {
    try {
      const [quotesData, rfqsData, vendorsData] = await Promise.all([
        getQuotationsAction(),
        getRFQsAction(),
        getVendorsAction()
      ]);
      setQuotations(quotesData);
      setRfqs(rfqsData);
      setVendors(vendorsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search");
    if (search !== null) {
      setSearchQuery(search);
    }
  }, [pathname]);

  const getStatusBadge = (status: Quotation["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-brand-green/20 text-brand-green border-brand-green-border/30 shadow-[0_0_8px_rgba(74,222,128,0.1)]";
      case "Submitted":
        return "bg-brand-green-muted/20 text-brand-green border-brand-green-border/20 shadow-[0_0_8px_rgba(74,222,128,0.05)]";
      case "Draft":
        return "bg-zinc-800 text-zinc-400 border-zinc-700/40";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  if (showComparison) {
    return (
      <QuotationComparison
        onBack={() => setShowComparison(false)}
        rfqs={rfqs}
        quotations={quotations}
        vendors={vendors}
        onSelectVendor={async (quotationId) => {
          await updateQuotationAction(quotationId, { status: "Approved" });
          await loadData();
        }}
      />
    );
  }

  const filteredQuotations = quotations.filter((quote) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      query === "" ||
      quote.vendorName.toLowerCase().includes(query) ||
      quote.rfqTitle.toLowerCase().includes(query) ||
      (quote.notes && quote.notes.toLowerCase().includes(query)) ||
      (quote.paymentTerms && quote.paymentTerms.toLowerCase().includes(query)) ||
      (quote.warranty && quote.warranty.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Supplier Quotations
          </h2>
          <p className="text-xs text-muted-foreground">
            Review incoming supplier bids, billing tables, tax terms, and warranty timelines.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <Button
            onClick={() => setShowComparison(true)}
            className="bg-zinc-900 border border-brand-green/30 text-brand-green font-semibold hover:bg-brand-green-muted/10 h-10 px-4 cursor-pointer"
          >
            <Sparkles className="mr-2 h-4 w-4" /> Compare Quotations
          </Button>
          <Link href="/quotations/submit">
            <Button className="bg-brand-green text-zinc-950 font-semibold hover:bg-brand-green-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg green-glow-button h-10 px-4">
              <Plus className="mr-2 h-4 w-4" /> Submit Quotation
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      {quotations.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search quotations by supplier, reference RFQ, terms, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-lg border border-border/40 bg-card/45 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-green-border focus:bg-card/75 focus:outline-none transition-all duration-200"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-secondary/30" />
          ))}
        </div>
      ) : quotations.length === 0 ? (
        <Card className="bg-card/25 border-border/40 text-center py-12 flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-muted-foreground mb-4">
            <ReceiptText className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">No quotations submitted</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-6">
            Review incoming RFQs and submit quotation pricing forms to begin.
          </p>
          <Link href="/quotations/submit">
            <Button className="bg-brand-green text-zinc-950 hover:bg-brand-green-hover text-xs font-semibold cursor-pointer">
              Submit Price Quote
            </Button>
          </Link>
        </Card>
      ) : filteredQuotations.length === 0 ? (
        <Card className="bg-card/25 border-border/40 text-center py-12 flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-muted-foreground mb-4">
            <ReceiptText className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">No matching quotations found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            Try refining your search terms or clearing the search bar.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {filteredQuotations.map((quote) => (
            <Card key={quote.id} className="bg-card/10 border-border/40 overflow-hidden hover:border-brand-green-border/30 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(74,222,128,0.02)]">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors truncate">
                        {quote.vendorName}
                      </h3>
                      <Badge variant="outline" className={`text-[9px] font-bold rounded-full py-0.5 px-2 ${getStatusBadge(quote.status)}`}>
                        {quote.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      RFQ Reference: <span className="text-foreground font-semibold">{quote.rfqTitle}</span>
                    </p>
                    {quote.notes && (
                      <p className="text-[11px] text-muted-foreground italic line-clamp-1 mt-1">
                        &quot;{quote.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground shrink-0 border-t border-border/40 pt-4 sm:border-t-0 sm:pt-0">
                    <div className="flex items-center gap-1.5">
                      <Landmark className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Net Terms: <strong className="text-foreground">{quote.paymentTerms || "N/A"}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Warranty: <strong className="text-foreground">{quote.warranty || "N/A"}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-brand-green-muted/10 border border-brand-green-border/20 px-2.5 py-1 rounded-lg">
                      <span className="text-brand-green font-bold font-mono">₹{quote.grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
