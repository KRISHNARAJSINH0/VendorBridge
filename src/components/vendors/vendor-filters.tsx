"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Vendor } from "@/lib/db";

interface VendorFiltersProps {
  vendors: Vendor[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

export function VendorFilters({
  vendors,
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
}: VendorFiltersProps) {
  // Counts per status
  const counts = {
    All: vendors.length,
    Active: vendors.filter((v) => v.status === "Active").length,
    Pending: vendors.filter((v) => v.status === "Pending").length,
    Blacklisted: vendors.filter((v) => v.status === "Blacklisted").length,
  };

  const tabs = [
    { label: "All", value: "All", count: counts.All },
    { label: "Active", value: "Active", count: counts.Active },
    { label: "Pending", value: "Pending", count: counts.Pending },
    { label: "Blacklisted", value: "Blacklisted", count: counts.Blacklisted },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by vendor name, category, GST number or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-lg border border-border/40 bg-card/45 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-green-border focus:bg-card/75 focus:outline-none transition-all duration-200"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer outline-none",
                isActive
                  ? "bg-brand-green text-zinc-950 border-brand-green shadow-[0_0_10px_rgba(74,222,128,0.15)] scale-[1.02]"
                  : "bg-card/40 border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[9px] font-bold font-mono",
                  isActive ? "bg-zinc-950 text-brand-green" : "bg-secondary text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
