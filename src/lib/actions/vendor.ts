"use server";
import { db, Vendor } from "@/lib/db";

export async function getVendorsAction(): Promise<Vendor[]> { return db.getVendors(); }
export async function getVendorByIdAction(id: string) { return db.getVendorById(id); }

export async function createVendorAction(vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">): Promise<Vendor> {
  const v = db.createVendor(vendor);
  db.addLog({ userName: "System", role: "Admin", action: "ADD_VENDOR", description: `Registered vendor: ${v.name}` });
  return v;
}

export async function updateVendorAction(id: string, updates: Partial<Vendor>) { return db.updateVendor(id, updates); }
export async function deleteVendorAction(id: string) { return db.deleteVendor(id); }
