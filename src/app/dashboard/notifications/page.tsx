"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getNotificationsAction, markNotificationReadAction } from "@/lib/actions/workflow";
import { Notification } from "@/lib/db";
import { Bell, Check, MailOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await getNotificationsAction(user.id);
      setNotifications(data);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationReadAction(id);
      toast.success("Notification marked as read");
      loadNotifications();
    } catch {
      toast.error("Failed to update notification");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Notification Center</h2>
        <p className="text-xs text-muted-foreground font-light">Trace invitations, approval remarks,PO updates, and invoice payments.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/20 animate-pulse border border-border/20" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-card/10 overflow-hidden">
          <div className="divide-y divide-border/20">
            {notifications.slice().reverse().map(n => (
              <div key={n.id} className={`flex items-start justify-between p-4 gap-4 transition-colors ${n.isRead ? "opacity-60" : "bg-brand-green/[0.02]"}`}>
                <div className="flex items-start gap-3 text-xs">
                  <div className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center ${n.isRead ? "bg-secondary text-muted-foreground" : "bg-brand-green-muted/20 text-brand-green border border-brand-green-border/30"}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      {n.title}
                      {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />}
                    </h4>
                    <p className="text-muted-foreground mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-muted-foreground/60 block mt-1.5">{new Date(n.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                {!n.isRead && (
                  <button onClick={() => handleMarkAsRead(n.id)} className="p-1.5 rounded-md hover:bg-secondary/40 border border-border/35 text-muted-foreground hover:text-foreground transition-all" title="Mark as read">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-16">No notifications received.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
