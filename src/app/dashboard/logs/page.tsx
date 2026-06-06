"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getActivityLogsAction } from "@/lib/actions/workflow";
import { ActivityLog } from "@/lib/db";
import { ClipboardList, Filter, Clock, User, Shield } from "lucide-react";
import { toast } from "sonner";

export default function LogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("All");

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await getActivityLogsAction();
        setLogs(data);
      } catch {
        toast.error("Failed to load activity log audit trail");
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  if (!user) return null;

  const filteredLogs = logs.filter(log => {
    if (filterAction === "All") return true;
    return log.action.toLowerCase().includes(filterAction.toLowerCase()) || log.role.toLowerCase() === filterAction.toLowerCase();
  });

  const actionsList = ["All", "Admin", "Procurement Officer", "Vendor", "Manager"];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">System Activity Logs</h2>
        <p className="text-xs text-muted-foreground font-light">Trace organizational access sequences, database sync records, and workflow decisions.</p>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Filter className="h-3.5 w-3.5" /> Filter by:</span>
        {actionsList.map(act => (
          <button key={act} onClick={() => setFilterAction(act)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
              filterAction === act
                ? "bg-brand-green text-zinc-950 border-brand-green"
                : "border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}>
            {act}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-secondary/20 animate-pulse border border-border/20" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-card/10 overflow-hidden">
          <div className="divide-y divide-border/20">
            {filteredLogs.slice().reverse().map(log => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center p-4 gap-3 text-xs hover:bg-secondary/10 transition-colors">
                <div className="flex items-center gap-2 w-48 shrink-0 text-muted-foreground font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(log.createdAt).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-1.5 w-48 shrink-0">
                  <User className="h-3.5 w-3.5 text-brand-green" />
                  <span className="font-semibold text-foreground truncate">{log.userName}</span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-[9px] font-semibold text-muted-foreground">{log.role}</span>
                </div>
                <div className="flex-1 text-muted-foreground">
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[10px] mr-2 inline-block px-1.5 py-0.5 border border-border/50 rounded bg-card/40">{log.action}</span>
                  <span>{log.description}</span>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-12">No trace matches in history logs.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
