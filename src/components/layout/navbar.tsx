"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Shield,
  Building2,
  FileText,
  ReceiptText,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { getVendorsAction } from "@/lib/actions/vendor";
import { getRFQsAction } from "@/lib/actions/rfq";
import { getQuotationsAction } from "@/lib/actions/quotation";
import { Vendor, RFQ, Quotation } from "@/lib/db";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Load search index data
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const [v, r, q] = await Promise.all([
          getVendorsAction(),
          getRFQsAction(),
          getQuotationsAction(),
        ]);
        setVendors(v);
        setRFQs(r);
        setQuotations(q);
      } catch (err) {
        console.error("Failed to load search index", err);
      }
    };
    if (open) {
      loadSearchData();
    }
  }, [open]);

  // Keyboard shortcut listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  // Resolve Page Title
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/vendors")) return "Vendor Management";
    if (pathname.startsWith("/rfqs/create")) return "Create RFQ";
    if (pathname.startsWith("/rfqs")) return "Request For Quotations";
    if (pathname.startsWith("/quotations/submit")) return "Submit Quotation";
    if (pathname.startsWith("/quotations")) return "Vendor Quotations";
    return "VendorBridge";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-8 backdrop-blur-md">
      {/* Title */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">
          {getPageTitle()}
        </h1>
        {pathname === "/" && (
          <p className="text-[10px] text-muted-foreground font-medium animate-in fade-in slide-in-from-left-1 duration-300">
            Welcome back, Procurement Officer
          </p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search Bar Trigger Button */}
        <button
          onClick={() => setOpen(true)}
          className="relative w-64 h-9 rounded-md border border-border/40 bg-secondary/35 hover:bg-secondary/50 text-left px-9 text-xs text-muted-foreground cursor-pointer transition-all duration-200 outline-none focus:ring-1 focus:ring-brand-green/30"
        >
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <span>Search vendors, RFQs...</span>
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/40 bg-background px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-80">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg border border-border/40 hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 flex h-1.5 w-1.5 rounded-full bg-brand-green" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border/40">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-brand-green-muted/20 text-brand-green text-xs font-semibold">
                  HJ
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border border-border/40" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground">Henil Joshi</p>
                <p className="text-xs text-muted-foreground">admin@vendorbridge.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="border-border/40" />
            <DropdownMenuItem className="text-xs focus:bg-secondary/50 focus:text-foreground gap-2 cursor-pointer">
              <User className="h-3.5 w-3.5" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs focus:bg-secondary/50 focus:text-foreground gap-2 cursor-pointer">
              <Shield className="h-3.5 w-3.5" /> Security
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs focus:bg-secondary/50 focus:text-foreground gap-2 cursor-pointer">
              <Settings className="h-3.5 w-3.5" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="border-border/40" />
            <DropdownMenuItem className="text-xs focus:bg-destructive/10 focus:text-destructive text-destructive gap-2 cursor-pointer">
              <LogOut className="h-3.5 w-3.5" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Command Palette Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search vendors, RFQs, quotations, or actions..." />
        <CommandList className="bg-card border border-border/40 text-foreground">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions & Pages">
            <CommandItem
              onSelect={() => handleSelect("/vendors")}
              className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2"
            >
              <Building2 className="h-4 w-4 text-brand-green" />
              <span>Go to Vendors Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/rfqs")}
              className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2"
            >
              <FileText className="h-4 w-4 text-brand-green" />
              <span>Go to RFQs Directory</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/quotations")}
              className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2"
            >
              <ReceiptText className="h-4 w-4 text-brand-green" />
              <span>Go to Supplier Quotations</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/rfqs/create")}
              className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2"
            >
              <Plus className="h-4 w-4 text-brand-green" />
              <span>Create New RFQ Tender</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/quotations/submit")}
              className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2"
            >
              <Plus className="h-4 w-4 text-brand-green" />
              <span>Submit Quotation Bid</span>
            </CommandItem>
          </CommandGroup>
          
          {vendors.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Vendors">
                {vendors.map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    onSelect={() => handleSelect(`/vendors?search=${encodeURIComponent(vendor.name)}&viewVendor=${vendor.id}`)}
                    className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-zinc-400" />
                      <span>{vendor.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{vendor.category}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {rfqs.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Request For Quotations (RFQs)">
                {rfqs.map((rfq) => (
                  <CommandItem
                    key={rfq.id}
                    onSelect={() => handleSelect(`/rfqs?search=${encodeURIComponent(rfq.title)}`)}
                    className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      <span>{rfq.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">₹{rfq.budget.toLocaleString("en-IN")}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {quotations.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Supplier Quotations">
                {quotations.map((quote) => (
                  <CommandItem
                    key={quote.id}
                    onSelect={() => handleSelect(`/quotations?search=${encodeURIComponent(quote.vendorName)}`)}
                    className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ReceiptText className="h-4 w-4 text-zinc-400" />
                      <span>{quote.vendorName} — {quote.rfqTitle}</span>
                    </div>
                    <span className="text-[10px] text-brand-green font-mono font-semibold">₹{quote.grandTotal.toLocaleString("en-IN")}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
