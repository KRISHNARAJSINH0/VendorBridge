"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
import { useAuth } from "@/context/auth-context";
import { useAppState } from "@/context/StateContext";
import { getNotificationsAction } from "@/lib/actions/workflow";
import { Vendor, RFQ, Quotation } from "@/lib/types";

export function Navbar() {
  const { user, logout } = useAuth();
  const { vendors = [], rfqs = [], quotations = [] } = useAppState();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Keyboard shortcut listener for Command Palette (Ctrl+K or Cmd+K)
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

  // Fetch database notifications count
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const list = await getNotificationsAction(user.id);
        const count = list.filter((n) => !n.isRead).length;
        setUnreadCount(count);
      } catch (e) {
        console.error("Navbar notifications load failed", e);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 3000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "VB";

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  // Resolve Page Title dynamically based on path
  const getPageTitle = () => {
    if (pathname === "/dashboard") return `${user.role} Dashboard`;
    if (pathname.includes("/users")) return "User Management";
    if (pathname.includes("/vendors")) return "Vendor Management";
    if (pathname.includes("/rfqs/create")) return "Create RFQ";
    if (pathname.includes("/rfqs")) return "Request For Quotations";
    if (pathname.includes("/quotations/submit")) return "Submit Quotation";
    if (pathname.includes("/quotations")) return "Vendor Quotations";
    if (pathname.includes("/approvals")) return "Approval Workflow";
    if (pathname.includes("/purchase-orders")) return "Purchase Orders";
    if (pathname.includes("/invoices")) return "Purchase Order & Invoice";
    if (pathname.includes("/reports")) return "Procurement Reports";
    if (pathname.includes("/activity")) return "Activity & Logs";
    if (pathname.includes("/notifications")) return "Notifications";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/profile")) return "My Profile";
    return "VendorBridge";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-8 backdrop-blur-md">
      {/* Title */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">
          {getPageTitle()}
        </h1>
        {pathname === "/dashboard" ? (
          <p className="text-[10px] text-muted-foreground font-medium animate-in fade-in slide-in-from-left-1 duration-300">
            Welcome back, {user.firstName}
          </p>
        ) : null}
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
        <Link href="/dashboard/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg border border-border/40 hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-green text-[9px] font-extrabold text-zinc-950 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>
        </Link>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border/40">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-brand-green-muted/20 text-brand-green text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border border-border/40" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="border-border/40" />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="text-xs focus:bg-secondary/50 focus:text-foreground gap-2 cursor-pointer"
            >
              <User className="h-3.5 w-3.5" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
              className="text-xs focus:bg-secondary/50 focus:text-foreground gap-2 cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="border-border/40" />
            <DropdownMenuItem
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="text-xs focus:bg-destructive/10 focus:text-destructive text-destructive gap-2 cursor-pointer"
            >
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
              onSelect={() => handleSelect("/dashboard/vendors")}
              className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2"
            >
              <Building2 className="h-4 w-4 text-brand-green" />
              <span>Go to Vendors Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/dashboard/rfqs")}
              className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2"
            >
              <FileText className="h-4 w-4 text-brand-green" />
              <span>Go to RFQs Directory</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/dashboard/quotations")}
              className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2"
            >
              <ReceiptText className="h-4 w-4 text-brand-green" />
              <span>Go to Supplier Quotations</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/dashboard/rfqs/create")}
              className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2"
            >
              <Plus className="h-4 w-4 text-brand-green" />
              <span>Create New RFQ Tender</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/dashboard/quotations/submit")}
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
                {vendors.map((vendor: Vendor) => (
                  <CommandItem
                    key={vendor.id}
                    onSelect={() =>
                      handleSelect(
                        `/dashboard/vendors?search=${encodeURIComponent(
                          vendor.name
                        )}&viewVendor=${vendor.id}`
                      )
                    }
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
                {rfqs.map((rfq: RFQ) => (
                  <CommandItem
                    key={rfq.id}
                    onSelect={() => handleSelect(`/dashboard/rfqs?search=${encodeURIComponent(rfq.title)}`)}
                    className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      <span>{rfq.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ₹{rfq.budget.toLocaleString("en-IN")}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {quotations.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Supplier Quotations">
                {quotations.map((quote: Quotation) => (
                  <CommandItem
                    key={quote.id}
                    onSelect={() =>
                      handleSelect(`/dashboard/quotations?search=${encodeURIComponent(quote.vendorName)}`)
                    }
                    className="cursor-pointer focus:bg-secondary/50 focus:text-foreground text-xs py-2 px-3 gap-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ReceiptText className="h-4 w-4 text-zinc-400" />
                      <span>
                        {quote.vendorName} — {quote.rfqTitle}
                      </span>
                    </div>
                    <span className="text-[10px] text-brand-green font-mono font-semibold">
                      ₹{quote.grandTotal.toLocaleString("en-IN")}
                    </span>
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

