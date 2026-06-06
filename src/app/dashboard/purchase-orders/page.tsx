"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getApprovalsAction, getPurchaseOrdersAction, generatePOAction } from "@/lib/actions/workflow";
import { PurchaseOrder, Approval } from "@/lib/db";
import { ShoppingCart, FileText, CheckCircle2, AlertCircle, Plus, ReceiptText, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PurchaseOrdersPage() {
  const { user } = useAuth();
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [poData, appData] = await Promise.all([getPurchaseOrdersAction(), getApprovalsAction()]);
      setPOs(poData);
      setApprovals(appData.filter(a => a.status === "Approved"));
    } catch {
      toast.error("Failed to load PO information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGeneratePO = async (approvalId: string) => {
    if (!user) return;
    try {
      const res = await generatePOAction(approvalId, user.id);
      if (res) {
        toast.success(`Purchase Order ${res.poNumber} generated successfully`);
        loadData();
      } else {
        toast.error("Failed to generate purchase order");
      }
    } catch {
      toast.error("An error occurred during PO generation");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Purchase Orders</h2>
        <p className="text-xs text-muted-foreground font-light">Issue legally binding contract releases, trace fulfillment milestones, and review purchase logs.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-secondary/20 animate-pulse border border-border/20" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Generation Queue (Procurement Officer only) */}
          {user.role === "Procurement Officer" && approvals.length > 0 && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.02] p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 text-yellow-500"><AlertCircle className="h-4 w-4" /> Ready for PO Release</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Managers have approved the following bids. You can now authorize and generate official Purchase Orders.</p>
              </div>
              <div className="divide-y divide-border/25">
                {approvals.map(a => {
                  const alreadyReleased = pos.some(po => po.quotationId === a.quotationId);
                  if (alreadyReleased) return null;

                  return (
                    <div key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{a.rfqTitle}</p>
                        <p className="text-[10px] text-muted-foreground">Supplier: {a.vendorName} · Approved Value: ₹{a.totalAmount.toLocaleString("en-IN")}</p>
                      </div>
                      <Button size="sm" onClick={() => handleGeneratePO(a.id)}
                        className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-[10px] h-7 cursor-pointer">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Generate PO
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Master PO List */}
          <div className="rounded-xl border border-border/40 overflow-hidden bg-card/10">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-secondary/35 border-b border-border/40 text-muted-foreground font-semibold">
                <tr>
                  <th className="px-6 py-4">PO Number</th>
                  <th className="px-6 py-4">RFQ Release</th>
                  <th className="px-6 py-4">Vendor Partner</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25">
                {pos.map(po => {
                  if (user.role === "Vendor" && user.vendorId !== po.vendorId) return null;

                  return (
                    <tr key={po.id} className="hover:bg-secondary/15 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-brand-green">{po.poNumber}</td>
                      <td className="px-6 py-4 text-foreground font-medium">{po.rfqTitle}</td>
                      <td className="px-6 py-4 text-muted-foreground">{po.vendorName}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-foreground">₹{po.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedPO(po); setModalOpen(true); }}
                          className="h-7 text-[10px] font-medium border border-border/30 hover:bg-secondary/40 text-muted-foreground hover:text-foreground">
                          View PDF
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {pos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      No Purchase Orders have been generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PO View Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl bg-card border border-border/40 text-foreground">
          <DialogHeader className="border-b border-border/30 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold">Purchase Contract releases</DialogTitle>
              <Button size="sm" onClick={() => window.print()} className="h-8 text-xs bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover">
                <Printer className="h-3.5 w-3.5 mr-1" /> Print Contract
              </Button>
            </div>
            <DialogDescription className="text-[10px]">Release confirmation and audit trail specifications.</DialogDescription>
          </DialogHeader>

          {selectedPO && (
            <div className="space-y-6 py-2 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-border/20 pb-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Vendor</p>
                  <p className="font-bold text-foreground text-sm mt-0.5">{selectedPO.vendorName}</p>
                  <p className="text-muted-foreground mt-0.5">Procurement Partner ID: {selectedPO.vendorId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">PO Details</p>
                  <p className="font-mono font-bold text-brand-green text-sm mt-0.5">{selectedPO.poNumber}</p>
                  <p className="text-muted-foreground mt-0.5">Date Issued: {new Date(selectedPO.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 uppercase tracking-wider text-[10px]">Line Items Description</h4>
                <div className="rounded-lg border border-border/40 overflow-hidden">
                  <table className="w-full border-collapse text-[11px] text-left">
                    <thead className="bg-secondary/40 text-muted-foreground font-semibold border-b border-border/40">
                      <tr>
                        <th className="p-3">Item Description</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/25">
                      {selectedPO.items.map(item => (
                        <tr key={item.id}>
                          <td className="p-3 font-medium text-foreground">{item.itemName}</td>
                          <td className="p-3 text-right text-muted-foreground">{item.quantity}</td>
                          <td className="p-3 text-right text-muted-foreground">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                          <td className="p-3 text-right font-mono font-semibold text-foreground">₹{item.total.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between border-t border-border/30 pt-4">
                <div className="text-muted-foreground">
                  <p className="font-semibold text-[10px] uppercase text-foreground">Terms and Conditions</p>
                  <p className="text-[10px] mt-0.5">Fulfillment required within contract delivery window. Payment net 30 days.</p>
                </div>
                <div className="text-right w-48 space-y-1 text-sm font-semibold">
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>Tax (18% GST)</span>
                    <span className="font-mono">₹{(selectedPO.totalAmount * 0.18).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-foreground border-t border-border/20 pt-1.5 font-bold">
                    <span>Contract Total</span>
                    <span className="font-mono text-brand-green">₹{selectedPO.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
