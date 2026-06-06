"use server";
import { db, Quotation } from "@/lib/db";

export async function getQuotationsAction(): Promise<Quotation[]> { return db.getQuotations(); }
export async function getQuotationByIdAction(id: string) { return db.getQuotationById(id); }

export async function createQuotationAction(q: Omit<Quotation, "id" | "createdAt" | "updatedAt">): Promise<Quotation> {
  // Generate auto Quotation Number: QT-YYYY-NNNN
  const year = new Date().getFullYear();
  const count = db.getQuotations().length + 1;
  const qtNumber = `QT-${year}-${String(count).padStart(4, "0")}`;

  const quote = db.createQuotation(q);
  db.addLog({ userId: q.vendorId, userName: q.vendorName, role: "Vendor", action: "SUBMIT_QUOTATION", description: `Submitted ${qtNumber} for ${q.rfqTitle} — ₹${q.grandTotal.toLocaleString("en-IN")}` });

  // Notify procurement officers
  db.getUsers().filter(u => u.role === "Procurement Officer").forEach(u => {
    db.addNotification({ userId: u.id, title: "Quotation Received", message: `${q.vendorName} submitted a quotation (${qtNumber}) for ${q.rfqTitle} — ₹${q.grandTotal.toLocaleString("en-IN")}`, isRead: false });
  });

  return quote;
}

export async function updateQuotationAction(id: string, updates: Partial<Quotation>) { return db.updateQuotation(id, updates); }

export async function selectQuotationAction(quotationId: string, rfqId: string): Promise<void> {
  db.updateQuotation(quotationId, { status: "Approved" });
  // Reject other quotations for same RFQ
  const allQuotes = db.getQuotations().filter(q => q.rfqId === rfqId && q.id !== quotationId);
  allQuotes.forEach(q => db.updateQuotation(q.id, { status: "Rejected" }));

  // Create approval request for managers
  const quote = db.getQuotationById(quotationId);
  if (quote) {
    const managers = db.getUsers().filter(u => u.role === "Manager");
    if (managers.length === 0) {
      // No managers registered yet — auto-log warning
      db.addLog({ userName: "System", role: "System", action: "WARNING", description: `No manager found for approval of quotation from ${quote.vendorName}` });
      return;
    }
    managers.forEach(m => {
      db.createApproval({ quotationId, rfqId, rfqTitle: quote.rfqTitle, vendorName: quote.vendorName, managerId: m.id, managerName: `${m.firstName} ${m.lastName}`, status: "Pending", remarks: "", totalAmount: quote.grandTotal });
      db.addNotification({ userId: m.id, title: "Approval Required", message: `Review quotation from ${quote.vendorName} for ${quote.rfqTitle} — ₹${quote.grandTotal.toLocaleString("en-IN")}`, isRead: false });
    });

    // Lookup the procurement officer who selected
    const procUsers = db.getUsers().filter(u => u.role === "Procurement Officer");
    const procName = procUsers.length > 0 ? `${procUsers[0].firstName} ${procUsers[0].lastName}` : "Procurement";
    db.addLog({ userName: procName, role: "Procurement Officer", action: "SELECT_VENDOR", description: `Selected ${quote.vendorName} for ${quote.rfqTitle} — ₹${quote.grandTotal.toLocaleString("en-IN")}` });
  }
}
