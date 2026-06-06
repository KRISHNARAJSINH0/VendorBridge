"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getApprovalsAction, approveAction, rejectAction } from "@/lib/actions/workflow";
import { Approval } from "@/lib/db";
import { CheckSquare, CheckCircle2, XCircle, AlertCircle, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"Approve" | "Reject">("Approve");

  const loadApprovals = async () => {
    try {
      const data = await getApprovalsAction();
      setApprovals(data);
    } catch {
      toast.error("Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
    const interval = setInterval(loadApprovals, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async () => {
    if (!selectedApproval) return;
    setSubmitting(true);
    try {
      if (actionType === "Approve") {
        await approveAction(selectedApproval.id, remarks);
        toast.success("Quotation request approved successfully");
      } else {
        await rejectAction(selectedApproval.id, remarks);
        toast.error("Quotation request rejected");
      }
      setDialogOpen(false);
      setRemarks("");
      loadApprovals();
    } catch {
      toast.error("Workflow operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Approvals & Workflows</h2>
        <p className="text-xs text-muted-foreground">Review vendor quotations, verify tender pricing models, and authorize purchase order issues.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-secondary/20 animate-pulse border border-border/20" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-border/40 overflow-hidden bg-card/10">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-secondary/35 border-b border-border/40 text-muted-foreground font-semibold">
                <tr>
                  <th className="px-6 py-4">RFQ Title</th>
                  <th className="px-6 py-4">Selected Supplier</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Remarks</th>
                  {user.role === "Manager" && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25">
                {approvals.map(a => (
                  <tr key={a.id} className="hover:bg-secondary/15 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">{a.rfqTitle}</td>
                    <td className="px-6 py-4 text-muted-foreground">{a.vendorName}</td>
                    <td className="px-6 py-4 font-mono font-medium text-foreground">₹{a.totalAmount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        a.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        a.status === "Rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}>
                        {a.status === "Approved" ? <CheckCircle2 className="h-3 w-3" /> :
                         a.status === "Rejected" ? <XCircle className="h-3 w-3" /> :
                         <AlertCircle className="h-3 w-3 animate-pulse" />}
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground italic flex items-center gap-1">
                      {a.remarks ? <><MessageSquare className="h-3.5 w-3.5 shrink-0" /> {a.remarks}</> : <span className="opacity-45">No comments</span>}
                    </td>
                    {user.role === "Manager" && (
                      <td className="px-6 py-4 text-right">
                        {a.status === "Pending" ? (
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" className="bg-brand-green hover:bg-brand-green-hover text-zinc-950 text-[10px] h-7 font-bold cursor-pointer"
                              onClick={() => { setSelectedApproval(a); setActionType("Approve"); setDialogOpen(true); }}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="text-[10px] h-7 font-bold cursor-pointer"
                              onClick={() => { setSelectedApproval(a); setActionType("Reject"); setDialogOpen(true); }}>
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60 italic">Completed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {approvals.length === 0 && (
                  <tr>
                    <td colSpan={user.role === "Manager" ? 6 : 5} className="px-6 py-10 text-center text-muted-foreground">
                      No approvals or authorization requests recorded in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decision Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card border border-border/40 text-foreground">
          <DialogHeader>
            <DialogTitle>{actionType} Procurement Request</DialogTitle>
            <DialogDescription className="text-xs">
              Confirm authorization parameters for {selectedApproval?.rfqTitle} bid submitted by {selectedApproval?.vendorName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Decision Remarks / Notes *</Label>
              <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} required
                placeholder="Include cost justification, quality check confirmation, or rejection reason..."
                className="bg-secondary/40 border-border/60 text-xs min-h-[80px]" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-xs h-9">Cancel</Button>
            <Button onClick={handleAction} disabled={submitting || !remarks.trim()}
              className={actionType === "Approve" ? "bg-brand-green text-zinc-950 hover:bg-brand-green-hover h-9 text-xs font-semibold" : "bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 text-xs font-semibold"}>
              {submitting ? <Loader2 className="animate-spin mr-1 h-3.5 w-3.5" /> : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
