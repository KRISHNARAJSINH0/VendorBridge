"use server";

import { db, Vendor } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getVendorsAction() {
  return db.getVendors();
}

export async function createVendorAction(
  data: Omit<Vendor, "id" | "createdAt" | "updatedAt">
) {
  const vendor = db.createVendor(data);
  revalidatePath("/vendors");
  return vendor;
}

export async function updateVendorAction(id: string, data: Partial<Vendor>) {
  const vendor = db.updateVendor(id, data);
  revalidatePath("/vendors");
  return vendor;
}

export async function deleteVendorAction(id: string) {
  const success = db.deleteVendor(id);
  revalidatePath("/vendors");
  return success;
}
