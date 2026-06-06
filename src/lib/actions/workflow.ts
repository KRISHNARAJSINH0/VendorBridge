"use server";
import { db, Approval, PurchaseOrder, Invoice } from "@/lib/db";

export async function getApprovalsAction(): Promise<Approval[]> { return db.getApprovals(); }

export async function approveAction(approvalId: string, remarks: string): Promise<void> {
  const approval = db.getApprovals().find(a => a.id === approvalId);
  if (!approval) return;
  db.updateApproval(approvalId, { status: "Approved", remarks, decidedAt: new Date().toISOString() });
  db.addLog({ userId: approval.managerId, userName: approval.managerName, role: "Manager", action: "APPROVE", description: `Approved quotation for ${approval.rfqTitle} from ${approval.vendorName} — ₹${approval.totalAmount.toLocaleString("en-IN")}` });
  // Notify procurement officers
  db.getUsers().filter(u => u.role === "Procurement Officer").forEach(u => {
    db.addNotification({ userId: u.id, title: "Request Approved", message: `${approval.managerName} approved ${approval.vendorName} for ${approval.rfqTitle}. You can now generate PO.`, isRead: false });
  });
  // Notify vendor
  const quote = db.getQuotationById(approval.quotationId);
  if (quote) {
    db.getUsers().filter(u => u.vendorId === quote.vendorId).forEach(u => {
      db.addNotification({ userId: u.id, title: "Bid Approved", message: `Your bid for ${approval.rfqTitle} has been approved by ${approval.managerName}!`, isRead: false });
    });
  }
}

export async function rejectAction(approvalId: string, remarks: string): Promise<void> {
  const approval = db.getApprovals().find(a => a.id === approvalId);
  if (!approval) return;
  db.updateApproval(approvalId, { status: "Rejected", remarks, decidedAt: new Date().toISOString() });
  db.addLog({ userId: approval.managerId, userName: approval.managerName, role: "Manager", action: "REJECT", description: `Rejected quotation for ${approval.rfqTitle}: ${remarks}` });
  // Notify procurement officers
  db.getUsers().filter(u => u.role === "Procurement Officer").forEach(u => {
    db.addNotification({ userId: u.id, title: "Request Rejected", message: `${approval.managerName} rejected ${approval.vendorName} for ${approval.rfqTitle}. Reason: ${remarks}`, isRead: false });
  });
}

// === Purchase Orders ===
export async function getPurchaseOrdersAction(): Promise<PurchaseOrder[]> { return db.getPurchaseOrders(); }

export async function generatePOAction(approvalId: string, createdById: string): Promise<PurchaseOrder | null> {
  const approval = db.getApprovals().find(a => a.id === approvalId);
  if (!approval || approval.status !== "Approved") return null;
  const quote = db.getQuotationById(approval.quotationId);
  if (!quote) return null;

  // Generate auto PO Number: PO-YYYY-NNNN
  const year = new Date().getFullYear();
  const poCount = db.getPurchaseOrders().length + 1;
  const poNumber = `PO-${year}-${String(poCount).padStart(4, "0")}`;

  const creator = db.getUserById(createdById);
  const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : "Procurement";

  const po = db.createPurchaseOrder({
    poNumber, rfqId: approval.rfqId, rfqTitle: approval.rfqTitle,
    quotationId: approval.quotationId, vendorId: quote.vendorId, vendorName: quote.vendorName,
    totalAmount: quote.grandTotal, status: "Generated", createdById, items: quote.items,
  });

  db.updateRFQ(approval.rfqId, { status: "Closed" });
  db.addLog({ userId: createdById, userName: creatorName, role: "Procurement Officer", action: "GENERATE_PO", description: `Generated ${poNumber} for ${po.vendorName} — ₹${po.totalAmount.toLocaleString("en-IN")}` });

  // Notify vendor
  db.getUsers().filter(u => u.vendorId === po.vendorId).forEach(u => {
    db.addNotification({ userId: u.id, title: "Purchase Order Generated", message: `${poNumber} has been generated for your quotation on ${po.rfqTitle}.`, isRead: false });
  });

  // Notify admins
  db.getUsers().filter(u => u.role === "Admin").forEach(u => {
    db.addNotification({ userId: u.id, title: "PO Generated", message: `${creatorName} generated ${poNumber} for ${po.vendorName} — ₹${po.totalAmount.toLocaleString("en-IN")}`, isRead: false });
  });

  return po;
}

// === Invoices ===
export async function getInvoicesAction(): Promise<Invoice[]> { return db.getInvoices(); }

export async function generateInvoiceAction(poId: string): Promise<Invoice | null> {
  const po = db.getPurchaseOrders().find(p => p.id === poId);
  if (!po) return null;

  // Generate auto Invoice Number: INV-YYYY-NNNN
  const year = new Date().getFullYear();
  const invCount = db.getInvoices().length + 1;
  const invoiceNumber = `INV-${year}-${String(invCount).padStart(4, "0")}`;

  const taxAmount = po.totalAmount * 0.18;
  const inv = db.createInvoice({
    invoiceNumber, poId: po.id, poNumber: po.poNumber,
    vendorId: po.vendorId, vendorName: po.vendorName, subtotal: po.totalAmount - taxAmount,
    taxAmount, grandTotal: po.totalAmount, status: "Pending",
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
  });

  db.addLog({ userName: po.vendorName, role: "Vendor", action: "GENERATE_INVOICE", description: `Generated ${invoiceNumber} for PO ${po.poNumber} — ₹${po.totalAmount.toLocaleString("en-IN")}` });

  // Notify procurement officers
  db.getUsers().filter(u => u.role === "Procurement Officer").forEach(u => {
    db.addNotification({ userId: u.id, title: "Invoice Generated", message: `${po.vendorName} issued ${invoiceNumber} for PO ${po.poNumber}. Please settle payment.`, isRead: false });
  });

  return inv;
}

export async function updateInvoiceStatusAction(id: string, status: Invoice["status"]): Promise<void> {
  db.updateInvoice(id, { status });
  const inv = db.getInvoices().find(i => i.id === id);
  if (inv) {
    db.addLog({ userName: "Procurement", role: "Procurement Officer", action: "INVOICE_STATUS", description: `${inv.invoiceNumber} marked as ${status}` });
    // Notify vendor
    db.getUsers().filter(u => u.vendorId === inv.vendorId).forEach(u => {
      db.addNotification({ userId: u.id, title: "Payment Update", message: `Your ${inv.invoiceNumber} has been marked as ${status}.`, isRead: false });
    });
  }
}

// === Logs & Notifications ===
export async function getActivityLogsAction() { return db.getActivityLogs(); }
export async function getNotificationsAction(userId: string) { return db.getNotifications(userId); }
export async function markNotificationReadAction(id: string) { db.markNotificationRead(id); }
export async function resetDbAction() { db.resetDb(); }
