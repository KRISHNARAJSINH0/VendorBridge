"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Building2, FileText, ReceiptText, CheckSquare,
  ShoppingCart, Receipt, BarChart3, Bell, ClipboardList, Settings, LogOut, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/db";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const NAV_MAP: Record<UserRole, NavItem[]> = {
  Admin: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/dashboard/users", icon: Users },
    { name: "Vendor Management", href: "/dashboard/vendors", icon: Building2 },
    { name: "RFQs", href: "/dashboard/rfqs", icon: FileText },
    { name: "Quotations", href: "/dashboard/quotations", icon: ReceiptText },
    { name: "Approvals", href: "/dashboard/approvals", icon: CheckSquare },
    { name: "Purchase Orders", href: "/dashboard/purchase-orders", icon: ShoppingCart },
    { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Audit Logs", href: "/dashboard/logs", icon: ClipboardList },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  "Procurement Officer": [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Vendors", href: "/dashboard/vendors", icon: Building2 },
    { name: "RFQs", href: "/dashboard/rfqs", icon: FileText },
    { name: "Quotations", href: "/dashboard/quotations", icon: ReceiptText },
    { name: "Approvals", href: "/dashboard/approvals", icon: CheckSquare },
    { name: "Purchase Orders", href: "/dashboard/purchase-orders", icon: ShoppingCart },
    { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Activity Logs", href: "/dashboard/logs", icon: ClipboardList },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ],
  Vendor: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "RFQs", href: "/dashboard/rfqs", icon: FileText },
    { name: "Quotations", href: "/dashboard/quotations", icon: ReceiptText },
    { name: "Purchase Orders", href: "/dashboard/purchase-orders", icon: ShoppingCart },
    { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ],
  Manager: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Approvals", href: "/dashboard/approvals", icon: CheckSquare },
    { name: "RFQs", href: "/dashboard/rfqs", icon: FileText },
    { name: "Quotations", href: "/dashboard/quotations", icon: ReceiptText },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Activity Logs", href: "/dashboard/logs", icon: ClipboardList },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = NAV_MAP[user.role] || NAV_MAP.Admin;
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/40 bg-card/65 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex h-16 items-center px-6 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green/10 border border-brand-green-border">
            <div className="h-2 w-2 rounded-full bg-brand-green animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">VendorBridge</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {items.map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-200 outline-none",
                active ? "text-brand-green bg-brand-green-muted/30 border border-brand-green-border/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}>
              {active && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-md bg-brand-green"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }} />
              )}
              <Icon className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", active ? "text-brand-green" : "text-muted-foreground group-hover:text-foreground")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-border/40 p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green-muted/20 text-xs font-semibold text-brand-green border border-brand-green-border/30">
            {initials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate text-xs font-semibold text-foreground">{user.firstName} {user.lastName}</span>
            <span className="truncate text-[10px] text-muted-foreground">{user.role}</span>
          </div>
          <button onClick={() => { logout(); window.location.href = "/"; }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Logout">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
