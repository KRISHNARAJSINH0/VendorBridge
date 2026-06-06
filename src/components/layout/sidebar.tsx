"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  ReceiptText,
  LayoutDashboard,
  CheckSquare,
  PackageCheck,
  Coins,
  BarChart3,
  History,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Vendors",
    href: "/dashboard/vendors",
    icon: Building2,
  },
  {
    name: "RFQs",
    href: "/dashboard/rfqs",
    icon: FileText,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/rfqs"),
  },
  {
    name: "Quotations",
    href: "/dashboard/quotations",
    icon: ReceiptText,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/quotations"),
  },
  {
    name: "Approvals",
    href: "/dashboard/approvals",
    icon: CheckSquare,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/approvals"),
  },
  {
    name: "Purchase orders",
    href: "/dashboard/purchase-orders",
    icon: PackageCheck,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/purchase-orders"),
  },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: Coins,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/invoices"),
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/reports"),
  },
  {
    name: "Activity",
    href: "/dashboard/activity",
    icon: History,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/activity"),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role || "Procurement Officer";

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (role === "Vendor") {
      return ["Dashboard", "RFQs", "Quotations", "Purchase orders", "Invoices"].includes(item.name);
    } else if (role === "Manager") {
      return ["Dashboard", "Approvals", "RFQs", "Quotations", "Reports", "Activity"].includes(item.name);
    } else if (role === "Procurement Officer") {
      return [
        "Dashboard",
        "Vendors",
        "RFQs",
        "Quotations",
        "Approvals",
        "Purchase orders",
        "Invoices",
        "Reports",
        "Activity",
      ].includes(item.name);
    }
    return true; // Admin sees everything
  });

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "VB";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/40 bg-card/65 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green/10 border border-brand-green-border">
            <div className="h-2 w-2 rounded-full bg-brand-green animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            VendorBridge
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const active = item.isActive ? item.isActive(pathname) : pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 outline-none",
                active
                  ? "text-brand-green bg-brand-green-muted/30 border border-brand-green-border/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              {active && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-md bg-brand-green"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                  active ? "text-brand-green" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="border-t border-border/40 p-4">
        <div className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green-muted/20 text-brand-green text-xs font-semibold border border-brand-green-border/20 flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">{role}</span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

