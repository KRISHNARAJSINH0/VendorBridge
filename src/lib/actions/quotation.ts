"use server";

import { db, Quotation } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getQuotationsAction() {
  return db.getQuotations();
}

export async function getQuotationByIdAction(id: string) {
  return db.getQuotationById(id);
}

export async function createQuotationAction(
  data: Omit<Quotation, "id" | "createdAt" | "updatedAt">
) {
  const quotation = db.createQuotation(data);
  revalidatePath("/quotations");
  return quotation;
}

export async function updateQuotationAction(id: string, data: Partial<Quotation>) {
  const quotation = db.updateQuotation(id, data);
  revalidatePath("/quotations");
  return quotation;
}
