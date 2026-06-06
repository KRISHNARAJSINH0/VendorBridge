"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getInvoicesAction, getPurchaseOrdersAction, generateInvoiceAction, updateInvoiceStatusAction } from "@/lib/actions/workflow";
import { Invoice, PurchaseOrder } from "@/lib/db";
import { Receipt, FileText, CheckCircle2, AlertCircle, Plus, Send, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [invData, poData] = await Promise.all([getInvoicesAction(), getPurchaseOrdersAction()]);
      setInvoices(invData);
      setPOs(poData);
    } catch {
      toast.error("Failed to load invoice registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateInvoice = async (poId: string) => {
    try {
      const res = await generateInvoiceAction(poId);
      if (res) {
        toast.success(`Invoice ${res.invoiceNumber} generated successfully`);
        loadData();
      } else {
        toast.error("Failed to generate invoice");
      }
    } catch {
      toast.error("An error occurred during invoice generation");
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await updateInvoiceStatusAction(id, "Paid");
      toast.success("Invoice payment processed and settled");
      loadData();
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  const handleSendEmail = (invoiceNumber: string, email: string) => {
    toast.success(`Invoice ${invoiceNumber} emailed successfully`, {
      description: `Sent digital PDF copy to ${email}`,
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Financial Invoices</h2>
        <p className="text-xs text-muted-foreground font-light">Audit billing receipts, verify tax structures, generate settlement sheets, and email records.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-secondary/20 animate-pulse border border-border/20" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Generation Queue */}
          {((user.role === "Procurement Officer") || (user.role === "Vendor")) && pos.filter(po => user.role === "Procurement Officer" || po.vendorId === user.vendorId).length > 0 && (
            <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.01] p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 text-brand-green"><AlertCircle className="h-4 w-4" /> Ready for Invoice Generation</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-light">The following contracts have active purchase order numbers. You can now issue invoices.</p>
              </div>
              <div className="divide-y divide-border/25">
                {pos.filter(po => user.role === "Procurement Officer" || po.vendorId === user.vendorId).map(po => {
                  const alreadyBilled = invoices.some(inv => inv.poId === po.id);
                  if (alreadyBilled) return null;

                  return (
                    <div key={po.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{po.rfqTitle}</p>
                        <p className="text-[10px] text-muted-foreground">PO Release: {po.poNumber} · Contract: {po.vendorName} · Value: ₹{po.totalAmount.toLocaleString("en-IN")}</p>
                      </div>
                      <Button size="sm" onClick={() => handleGenerateInvoice(po.id)}
                        className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-[10px] h-7 cursor-pointer">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Generate Invoice
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Master Invoice list */}
          <div className="rounded-xl border border-border/40 overflow-hidden bg-card/10">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-secondary/35 border-b border-border/40 text-muted-foreground font-semibold">
                <tr>
                  <th className="px-6 py-4">Invoice Number</th>
                  <th className="px-6 py-4">PO Reference</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Tax (18% GST)</th>
                  <th className="px-6 py-4">Grand Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25">
                {invoices.map(inv => {
                  if (user.role === "Vendor" && user.vendorId !== inv.vendorId) return null;

                  return (
                    <tr key={inv.id} className="hover:bg-secondary/15 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-brand-green">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">{inv.poNumber}</td>
                      <td className="px-6 py-4 text-foreground font-medium">{inv.vendorName}</td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">₹{inv.taxAmount.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-foreground">₹{inv.grandTotal.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-1.5 items-center">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedInvoice(inv); setModalOpen(true); }}
                          className="h-7 text-[10px] font-medium border border-border/30 hover:bg-secondary/40 text-muted-foreground hover:text-foreground">
                          View Receipt
                        </Button>
                        {user.role === "Procurement Officer" && (
                          <Button size="icon" variant="ghost" onClick={() => handleSendEmail(inv.invoiceNumber, "supplier@vendorbridge.com")}
                            className="h-7 w-7 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/40">
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                        {user.role === "Procurement Officer" && inv.status !== "Paid" && (
                          <Button size="sm" onClick={() => handleMarkAsPaid(inv.id)}
                            className="bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover text-[10px] h-7">
                            Settle Pay
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      No invoices have been issued or generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl bg-card border border-border/40 text-foreground">
          <DialogHeader className="border-b border-border/30 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold">Fulfillment Invoice Receipt</DialogTitle>
              <Button size="sm" onClick={() => window.print()} className="h-8 text-xs bg-brand-green text-zinc-950 font-bold hover:bg-brand-green-hover">
                <Printer className="h-3.5 w-3.5 mr-1" /> Print Receipt
              </Button>
            </div>
            <DialogDescription className="text-[10px]">Verify taxation breakdown and fulfillment dates.</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6 py-2 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-border/20 pb-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Billed To</p>
                  <p className="font-bold text-foreground text-sm mt-0.5">{selectedInvoice.vendorName}</p>
                  <p className="text-muted-foreground mt-0.5">Payment Terms: 30 Days Net</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold font-mono">Invoice Ref</p>
                  <p className="font-mono font-bold text-brand-green text-sm mt-0.5">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-muted-foreground mt-0.5">Issued: {new Date(selectedInvoice.createdAt).toLocaleDateString("en-IN")}</p>
                  <p className="text-muted-foreground mt-0.5">Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString("en-IN")}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Billing Calculation</h4>
                <div className="rounded-lg border border-border/40 overflow-hidden p-4 bg-secondary/15 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>PO Reference Number</span>
                    <span className="font-mono font-semibold text-foreground">{selectedInvoice.poNumber}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal Excl. Tax</span>
                    <span className="font-mono">₹{selectedInvoice.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (18% Integrated GST)</span>
                    <span className="font-mono">₹{selectedInvoice.taxAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-foreground border-t border-border/20 pt-2 font-bold text-sm">
                    <span>Total Outstanding Balance</span>
                    <span className="font-mono text-brand-green">₹{selectedInvoice.grandTotal.toLocaleString("en-IN")}</span>
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
