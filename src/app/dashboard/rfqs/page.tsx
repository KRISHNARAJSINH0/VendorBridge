"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Calendar, Wallet, Layers, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RFQ } from "@/lib/types";
import { useAppState } from "@/context/StateContext";

export default function RFQListPage() {
  const pathname = usePathname();
  const { rfqs } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");

  const loading = false;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search");
    if (search !== null) {
      setSearchQuery(search);
    }
  }, [pathname]);

  const getStatusBadge = (status: RFQ["status"]) => {
    switch (status) {
      case "Published":
        return "bg-brand-green-muted/20 text-brand-green border-brand-green-border/20 shadow-[0_0_8px_rgba(74,222,128,0.05)]";
      case "Draft":
        return "bg-zinc-800 text-zinc-400 border-zinc-700/40";
      case "Closed":
        return "bg-destructive/15 text-destructive border-destructive/20";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  const filteredRfqs = rfqs.filter((rfq: RFQ) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      query === "" ||
      rfq.title.toLowerCase().includes(query) ||
      rfq.category.toLowerCase().includes(query) ||
      rfq.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Request For Quotations
          </h2>
          <p className="text-xs text-muted-foreground">
            Initiate, manage, and dispatch RFQ tenders to your partner suppliers.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/rfqs/create">
            <Button className="bg-brand-green text-zinc-950 font-semibold hover:bg-brand-green-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg green-glow-button h-10 px-4">
              <Plus className="mr-2 h-4 w-4" /> Create RFQ
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      {rfqs.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search RFQs by title, category, or description..."
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
      ) : rfqs.length === 0 ? (
        <Card className="bg-card/25 border-border/40 text-center py-12 flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-muted-foreground mb-4">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">No RFQs created yet</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-6">
            Get started by launching your first RFQ bidding event for supplier partners.
          </p>
          <Link href="/rfqs/create">
            <Button className="bg-brand-green text-zinc-950 hover:bg-brand-green-hover text-xs font-semibold cursor-pointer">
              Launch Wizard
            </Button>
          </Link>
        </Card>
      ) : filteredRfqs.length === 0 ? (
        <Card className="bg-card/25 border-border/40 text-center py-12 flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-muted-foreground mb-4">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">No matching RFQs found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            Try refining your search terms or clearing the search bar.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {filteredRfqs.map((rfq: RFQ) => (
            <Card key={rfq.id} className="bg-card/10 border-border/40 overflow-hidden hover:border-brand-green-border/30 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(74,222,128,0.02)]">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors">
                        {rfq.title}
                      </h3>
                      <Badge variant="outline" className={`text-[9px] font-bold rounded-full py-0.5 px-2 ${getStatusBadge(rfq.status)}`}>
                        {rfq.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">
                      {rfq.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground shrink-0 border-t border-border/40 pt-4 sm:border-t-0 sm:pt-0">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Budget: <strong className="text-foreground font-mono">₹{rfq.budget.toLocaleString("en-IN")}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Deadline: <strong className="text-foreground">{new Date(rfq.deadline).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{rfq.items.length} Line Items</span>
                    </div>
                    {rfq.status === "Published" && (
                      <Link href={`/quotations/submit?rfqId=${rfq.id}`} className="inline-flex items-center gap-1 bg-brand-green-muted/20 text-brand-green border border-brand-green-border/30 hover:bg-brand-green/10 px-3 py-1.5 rounded-lg text-xs font-semibold select-none">
                        Bid <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
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
