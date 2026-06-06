"use server";
import { db, RFQ } from "@/lib/db";

export async function getRFQsAction(): Promise<RFQ[]> { return db.getRFQs(); }
export async function getRFQByIdAction(id: string) { return db.getRFQById(id); }

export async function createRFQAction(rfq: Omit<RFQ, "id" | "createdAt" | "updatedAt" | "status" | "items"> & { status?: RFQ["status"]; items: { itemName: string; quantity: number; unit: string; estimatedCost: number }[] }): Promise<RFQ> {
  // Generate auto RFQ Number: RFQ-YYYY-NNNN
  const year = new Date().getFullYear();
  const count = db.getRFQs().length + 1;
  const rfqNumber = `RFQ-${year}-${String(count).padStart(4, "0")}`;

  const r = db.createRFQ({ ...rfq, title: rfq.title || rfqNumber } as any);

  // Log the creator's name from the DB
  const creator = db.getUserById(rfq.createdById);
  const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : "Procurement";
  db.addLog({ userId: rfq.createdById, userName: creatorName, role: "Procurement Officer", action: "CREATE_RFQ", description: `Created ${rfqNumber}: ${r.title}` });

  // Notify assigned vendors
  r.vendorIds.forEach(vid => {
    const users = db.getUsers().filter(u => u.vendorId === vid);
    users.forEach(u => {
      db.addNotification({ userId: u.id, title: "New RFQ Assigned", message: `You have been invited to bid on: ${r.title} (${rfqNumber})`, isRead: false });
    });
  });

  // Notify all managers about new RFQ
  db.getUsers().filter(u => u.role === "Manager").forEach(m => {
    db.addNotification({ userId: m.id, title: "New RFQ Created", message: `${creatorName} created ${rfqNumber}: ${r.title}`, isRead: false });
  });

  return r;
}

export async function updateRFQAction(id: string, updates: Partial<RFQ>) { return db.updateRFQ(id, updates); }
