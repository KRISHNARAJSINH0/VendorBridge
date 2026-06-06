"use server";

import { db, RFQ, RFQItem } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getRFQsAction() {
  return db.getRFQs();
}

export async function getRFQByIdAction(id: string) {
  return db.getRFQById(id);
}

export async function createRFQAction(
  data: Omit<RFQ, "id" | "createdAt" | "updatedAt" | "status" | "items"> & {
    status?: RFQ["status"];
    items: Omit<RFQItem, "id">[];
  }
) {
  const rfq = db.createRFQ(data);
  revalidatePath("/rfqs");
  revalidatePath("/quotations/submit"); // RFQ dropdown lists
  return rfq;
}

export async function updateRFQAction(id: string, data: Partial<RFQ>) {
  const rfq = db.updateRFQ(id, data);
  revalidatePath("/rfqs");
  revalidatePath(`/rfqs/${id}`);
  return rfq;
}
