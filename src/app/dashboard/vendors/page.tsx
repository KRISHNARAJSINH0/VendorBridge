"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getVendorsAction } from "@/lib/actions/vendor";
import { VendorStats } from "@/components/vendors/vendor-stats";
import { VendorFilters } from "@/components/vendors/vendor-filters";
import { VendorTable } from "@/components/vendors/vendor-table";
import { AddVendorDialog } from "@/components/vendors/add-vendor-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Vendor } from "@/lib/db";

export default function VendorsPage() {
  const pathname = usePathname();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Load vendors
  const loadVendors = async () => {
    try {
      const data = await getVendorsAction();
      setVendors(data);
    } catch (error) {
      console.error("Failed to load vendors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search");
    if (search !== null) {
      setSearchQuery(search);
    }
  }, [pathname]);

  // Filtered vendors
  const filteredVendors = vendors.filter((vendor) => {
    const matchesStatus =
      selectedStatus === "All" || vendor.status === selectedStatus;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      vendor.name.toLowerCase().includes(query) ||
      vendor.category.toLowerCase().includes(query) ||
      vendor.gstNumber.toLowerCase().includes(query) ||
      vendor.contactEmail.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Vendor Management
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage supplier profiles, registration certifications, and compliance risk parameters.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <AddVendorDialog onSuccess={loadVendors} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {/* Stats skeleton */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl bg-secondary/30" />
            ))}
          </div>
          {/* Table filter skeleton */}
          <Skeleton className="h-11 w-full rounded-lg bg-secondary/30" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full bg-secondary/30" />
            ))}
          </div>
          {/* Table skeleton */}
          <div className="rounded-xl border border-border/40 overflow-hidden bg-card/10">
            <div className="h-10 bg-secondary/35 border-b border-border/40" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 border-b border-border/40 px-6 flex items-center justify-between">
                <Skeleton className="h-4 w-28 bg-secondary/35" />
                <Skeleton className="h-4 w-20 bg-secondary/35" />
                <Skeleton className="h-4 w-28 bg-secondary/35" />
                <Skeleton className="h-4 w-12 bg-secondary/35" />
                <Skeleton className="h-8 w-8 rounded-full bg-secondary/35" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Stats Counters */}
          <VendorStats vendors={vendors} />

          {/* Search + Filter Chip Section */}
          <VendorFilters
            vendors={vendors}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />

          {/* Core Data Listing */}
          <VendorTable vendors={filteredVendors} />
        </div>
      )}
    </div>
  );
}
