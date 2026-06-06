"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { getNotificationsAction } from "@/lib/actions/workflow";
import Link from "next/link";

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const list = await getNotificationsAction(user.id);
        const count = list.filter(n => !n.isRead).length;
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

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return `${user.role} Dashboard`;
    if (pathname.includes("/users")) return "User Management";
    if (pathname.includes("/vendors")) return "Vendor Management";
    if (pathname.includes("/rfqs/create")) return "Create RFQ";
    if (pathname.includes("/rfqs")) return "Request For Quotations";
    if (pathname.includes("/quotations/submit")) return "Submit Quotation";
    if (pathname.includes("/quotations")) return "Quotations";
    if (pathname.includes("/approvals")) return "Approvals";
    if (pathname.includes("/purchase-orders")) return "Purchase Orders";
    if (pathname.includes("/invoices")) return "Invoices";
    if (pathname.includes("/reports")) return "Reports & Analytics";
    if (pathname.includes("/logs")) return "Activity Logs";
    if (pathname.includes("/notifications")) return "Notifications";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/profile")) return "My Profile";
    return "VendorBridge";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-8 backdrop-blur-md">
      <div>
        <h1 className="text-sm font-semibold tracking-tight text-foreground">{getPageTitle()}</h1>
        <p className="text-[10px] text-muted-foreground">Welcome back, {user.firstName}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/notifications">
          <button className="relative h-9 w-9 rounded-lg border border-border/40 hover:bg-secondary/50 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-green text-[9px] font-extrabold text-zinc-950 shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                {unreadCount}
              </span>
            )}
          </button>
        </Link>

        <div className="flex items-center gap-2 pl-2 border-l border-border/40">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-brand-green-muted/20 text-brand-green text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium">{user.firstName} {user.lastName}</span>
            <span className="text-[10px] text-muted-foreground">{user.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
