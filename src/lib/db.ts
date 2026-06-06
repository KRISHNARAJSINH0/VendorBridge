import fs from "fs";
import path from "path";

// ─── Types ───────────────────────────────────────────────────────────
export type UserRole = "Admin" | "Procurement Officer" | "Vendor" | "Manager";

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  status: "Active" | "Inactive";
  vendorId?: string; // only for Vendor role
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  gstNumber: string;
  contactEmail: string;
  contactPhone: string;
  status: "Active" | "Pending" | "Blacklisted";
  riskScore: "Low" | "Medium" | "High";
  rating?: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RFQItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export interface RFQ {
  id: string;
  title: string;
  category: string;
  budget: number;
  deadline: string;
  description: string;
  status: "Draft" | "Published" | "Closed";
  createdById: string;
  createdAt: string;
  updatedAt: string;
  items: RFQItem[];
  vendorIds: string[];
  attachments: Attachment[];
}

export interface QuotationItem {
  id: string;
  rfqItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  deliveryDays: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  rfqTitle: string;
  vendorId: string;
  vendorName: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  subtotal: number;
  gstPercent: number;
  grandTotal: number;
  paymentTerms: string;
  warranty: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: QuotationItem[];
}

export interface Approval {
  id: string;
  quotationId: string;
  rfqId: string;
  rfqTitle: string;
  vendorName: string;
  managerId: string;
  managerName: string;
  status: "Pending" | "Approved" | "Rejected";
  remarks: string;
  totalAmount: number;
  createdAt: string;
  decidedAt?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId: string;
  rfqTitle: string;
  quotationId: string;
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  status: "Generated" | "Confirmed" | "Delivered" | "Cancelled";
  createdById: string;
  createdAt: string;
  items: QuotationItem[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: "Pending" | "Sent" | "Paid" | "Overdue";
  dueDate: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName: string;
  role: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: AppUser[];
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  approvals: Approval[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
}

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

// ─── Full Demo Dataset ────────────────────────────────────────────────
// Seeds 6 users, 4 vendors, 3 RFQs, 4 quotations, 2 approvals,
// 2 POs, 2 invoices, activity logs and notifications for a rich demo.
function getInitialDb(): DatabaseSchema {
  return {
    users: [
      { id: "u-1", firstName: "Admin", lastName: "User", email: "admin@vendorbridge.com", password: "admin123", role: "Admin", status: "Active", createdAt: new Date("2026-01-01").toISOString() },
      { id: "u-2", firstName: "Rahul", lastName: "Kumar", email: "rahul@vendorbridge.com", password: "rahul123", role: "Procurement Officer", status: "Active", createdAt: new Date("2026-01-05").toISOString() },
      { id: "u-3", firstName: "Amit", lastName: "Shah", email: "amit@vendorbridge.com", password: "amit123", role: "Manager", status: "Active", createdAt: new Date("2026-01-05").toISOString() },
      { id: "u-4", firstName: "Dell", lastName: "Technologies", email: "dell@vendor.com", password: "dell123", role: "Vendor", status: "Active", vendorId: "v-1-dell", createdAt: new Date("2026-02-01").toISOString() },
      { id: "u-5", firstName: "HP", lastName: "India", email: "hp@vendor.com", password: "hp123", role: "Vendor", status: "Active", vendorId: "v-2-hp", createdAt: new Date("2026-02-05").toISOString() },
      { id: "u-6", firstName: "Priya", lastName: "Mehta", email: "priya@vendorbridge.com", password: "priya123", role: "Procurement Officer", status: "Active", createdAt: new Date("2026-02-10").toISOString() },
    ],
    vendors: [
      { id: "v-1-dell", name: "Dell Technologies", category: "IT & Hardware", gstNumber: "27AADCD1234B1Z0", contactEmail: "dell@vendor.com", contactPhone: "+91 98765 11111", status: "Active", riskScore: "Low", rating: 4.5, address: "Cyber City, Gurgaon, Haryana", createdAt: new Date("2026-02-01").toISOString(), updatedAt: new Date("2026-02-01").toISOString() },
      { id: "v-2-hp", name: "HP India Pvt Ltd", category: "IT & Hardware", gstNumber: "29AABCH5678C1Z3", contactEmail: "hp@vendor.com", contactPhone: "+91 99887 22222", status: "Active", riskScore: "Low", rating: 4.2, address: "Whitefield, Bengaluru, Karnataka", createdAt: new Date("2026-02-05").toISOString(), updatedAt: new Date("2026-02-05").toISOString() },
      { id: "v-3-lenovo", name: "Lenovo India", category: "IT & Hardware", gstNumber: "07AABCL9012D1Z5", contactEmail: "lenovo@vendor.com", contactPhone: "+91 99001 33333", status: "Pending", riskScore: "Medium", rating: 4.0, address: "Connaught Place, New Delhi", createdAt: new Date("2026-03-01").toISOString(), updatedAt: new Date("2026-03-01").toISOString() },
      { id: "v-4-godrej", name: "Godrej Interio", category: "Office Infrastructure", gstNumber: "27AAACG3456E1Z8", contactEmail: "godrej@vendor.com", contactPhone: "+91 98001 44444", status: "Active", riskScore: "Low", rating: 4.7, address: "Vikhroli, Mumbai, Maharashtra", createdAt: new Date("2026-01-20").toISOString(), updatedAt: new Date("2026-01-20").toISOString() },
    ],
    rfqs: [
      {
        id: "rfq-1", title: "Laptop Procurement 2026", category: "IT & Hardware",
        budget: 500000, deadline: new Date("2026-06-30").toISOString(),
        description: "Procure 10 high-performance laptops for the IT department.",
        status: "Closed", createdById: "u-2", createdAt: new Date("2026-05-01").toISOString(), updatedAt: new Date("2026-05-20").toISOString(),
        items: [{ id: "ri-1", itemName: "Dell XPS 15 Laptop", quantity: 10, unit: "Units", estimatedCost: 48000 }],
        vendorIds: ["v-1-dell", "v-2-hp"], attachments: [],
      },
      {
        id: "rfq-2", title: "Office Furniture Upgrade", category: "Office Infrastructure",
        budget: 300000, deadline: new Date("2026-07-15").toISOString(),
        description: "Ergonomic chairs and standing desks for 20 workstations.",
        status: "Published", createdById: "u-2", createdAt: new Date("2026-05-15").toISOString(), updatedAt: new Date("2026-05-15").toISOString(),
        items: [
          { id: "ri-2", itemName: "Ergonomic Office Chair", quantity: 20, unit: "Units", estimatedCost: 8000 },
          { id: "ri-3", itemName: "Height-Adjustable Desk", quantity: 10, unit: "Units", estimatedCost: 14000 },
        ],
        vendorIds: ["v-4-godrej"], attachments: [],
      },
      {
        id: "rfq-3", title: "Network Switch Procurement", category: "IT & Hardware",
        budget: 150000, deadline: new Date("2026-07-31").toISOString(),
        description: "24-port managed network switches for server room upgrade.",
        status: "Published", createdById: "u-6", createdAt: new Date("2026-05-20").toISOString(), updatedAt: new Date("2026-05-20").toISOString(),
        items: [{ id: "ri-4", itemName: "24-Port Managed Switch", quantity: 5, unit: "Units", estimatedCost: 28000 }],
        vendorIds: ["v-1-dell", "v-2-hp"], attachments: [],
      },
    ],
    quotations: [
      {
        id: "qt-1", rfqId: "rfq-1", rfqTitle: "Laptop Procurement 2026",
        vendorId: "v-1-dell", vendorName: "Dell Technologies",
        status: "Approved", subtotal: 406780, gstPercent: 18, grandTotal: 480000,
        paymentTerms: "Net 30 Days", warranty: "3 Years On-Site", notes: "Brand new Dell XPS 15 with latest Intel i7 processor.",
        createdAt: new Date("2026-05-05").toISOString(), updatedAt: new Date("2026-05-10").toISOString(),
        items: [{ id: "qi-1", rfqItemId: "ri-1", itemName: "Dell XPS 15 Laptop", quantity: 10, unitPrice: 48000, total: 480000, deliveryDays: 7 }],
      },
      {
        id: "qt-2", rfqId: "rfq-1", rfqTitle: "Laptop Procurement 2026",
        vendorId: "v-2-hp", vendorName: "HP India Pvt Ltd",
        status: "Rejected", subtotal: 423729, gstPercent: 18, grandTotal: 500000,
        paymentTerms: "Net 45 Days", warranty: "2 Years", notes: "HP EliteBook 840 G9 with 16GB RAM.",
        createdAt: new Date("2026-05-06").toISOString(), updatedAt: new Date("2026-05-10").toISOString(),
        items: [{ id: "qi-2", rfqItemId: "ri-1", itemName: "HP EliteBook 840 G9", quantity: 10, unitPrice: 50000, total: 500000, deliveryDays: 10 }],
      },
      {
        id: "qt-3", rfqId: "rfq-2", rfqTitle: "Office Furniture Upgrade",
        vendorId: "v-4-godrej", vendorName: "Godrej Interio",
        status: "Submitted", subtotal: 228814, gstPercent: 18, grandTotal: 270000,
        paymentTerms: "Net 30 Days", warranty: "5 Years Frame Warranty", notes: "Premium ergonomic range with lumbar support.",
        createdAt: new Date("2026-05-18").toISOString(), updatedAt: new Date("2026-05-18").toISOString(),
        items: [
          { id: "qi-3", rfqItemId: "ri-2", itemName: "Ergonomic Office Chair", quantity: 20, unitPrice: 7500, total: 150000, deliveryDays: 14 },
          { id: "qi-4", rfqItemId: "ri-3", itemName: "Height-Adjustable Desk", quantity: 10, unitPrice: 12000, total: 120000, deliveryDays: 21 },
        ],
      },
      {
        id: "qt-4", rfqId: "rfq-3", rfqTitle: "Network Switch Procurement",
        vendorId: "v-1-dell", vendorName: "Dell Technologies",
        status: "Submitted", subtotal: 118644, gstPercent: 18, grandTotal: 140000,
        paymentTerms: "Net 30 Days", warranty: "3 Years NBD", notes: "Dell EMC PowerSwitch N2024 with lifetime hardware warranty.",
        createdAt: new Date("2026-05-22").toISOString(), updatedAt: new Date("2026-05-22").toISOString(),
        items: [{ id: "qi-5", rfqItemId: "ri-4", itemName: "Dell EMC PowerSwitch N2024", quantity: 5, unitPrice: 28000, total: 140000, deliveryDays: 5 }],
      },
    ],
    approvals: [
      {
        id: "ap-1", quotationId: "qt-1", rfqId: "rfq-1", rfqTitle: "Laptop Procurement 2026",
        vendorName: "Dell Technologies", managerId: "u-3", managerName: "Amit Shah",
        status: "Approved", remarks: "Approved — best price with 3-year warranty. Dell preferred vendor.",
        totalAmount: 480000, createdAt: new Date("2026-05-10").toISOString(), decidedAt: new Date("2026-05-12").toISOString(),
      },
      {
        id: "ap-2", quotationId: "qt-3", rfqId: "rfq-2", rfqTitle: "Office Furniture Upgrade",
        vendorName: "Godrej Interio", managerId: "u-3", managerName: "Amit Shah",
        status: "Pending", remarks: "",
        totalAmount: 270000, createdAt: new Date("2026-05-18").toISOString(),
      },
    ],
    purchaseOrders: [
      {
        id: "po-1", poNumber: "PO-2026-0001", rfqId: "rfq-1", rfqTitle: "Laptop Procurement 2026",
        quotationId: "qt-1", vendorId: "v-1-dell", vendorName: "Dell Technologies",
        totalAmount: 480000, status: "Generated", createdById: "u-2",
        createdAt: new Date("2026-05-13").toISOString(),
        items: [{ id: "qi-1", rfqItemId: "ri-1", itemName: "Dell XPS 15 Laptop", quantity: 10, unitPrice: 48000, total: 480000, deliveryDays: 7 }],
      },
    ],
    invoices: [
      {
        id: "inv-1", invoiceNumber: "INV-2026-0001", poId: "po-1", poNumber: "PO-2026-0001",
        vendorId: "v-1-dell", vendorName: "Dell Technologies",
        subtotal: 406780, taxAmount: 73220, grandTotal: 480000,
        status: "Paid", dueDate: new Date("2026-06-13").toISOString(),
        createdAt: new Date("2026-05-14").toISOString(),
      },
    ],
    activityLogs: [
      { id: "log-1", userId: "u-1", userName: "Admin User", role: "Admin", action: "LOGIN", description: "Admin User logged in as Admin", createdAt: new Date("2026-05-01T09:00:00").toISOString() },
      { id: "log-2", userId: "u-2", userName: "Rahul Kumar", role: "Procurement Officer", action: "CREATE_RFQ", description: "Created RFQ-2026: Laptop Procurement 2026", createdAt: new Date("2026-05-01T09:30:00").toISOString() },
      { id: "log-3", userName: "Dell Technologies", role: "Vendor", action: "SUBMIT_QUOTATION", description: "Submitted QT-2026-0001 for Laptop Procurement 2026 — ₹4,80,000", createdAt: new Date("2026-05-05T11:00:00").toISOString() },
      { id: "log-4", userName: "HP India Pvt Ltd", role: "Vendor", action: "SUBMIT_QUOTATION", description: "Submitted QT-2026-0002 for Laptop Procurement 2026 — ₹5,00,000", createdAt: new Date("2026-05-06T14:00:00").toISOString() },
      { id: "log-5", userId: "u-2", userName: "Rahul Kumar", role: "Procurement Officer", action: "SELECT_VENDOR", description: "Selected Dell Technologies for Laptop Procurement 2026 — ₹4,80,000", createdAt: new Date("2026-05-10T10:00:00").toISOString() },
      { id: "log-6", userId: "u-3", userName: "Amit Shah", role: "Manager", action: "APPROVE", description: "Approved quotation for Laptop Procurement 2026 from Dell Technologies — ₹4,80,000", createdAt: new Date("2026-05-12T16:00:00").toISOString() },
      { id: "log-7", userId: "u-2", userName: "Rahul Kumar", role: "Procurement Officer", action: "GENERATE_PO", description: "Generated PO-2026-0001 for Dell Technologies — ₹4,80,000", createdAt: new Date("2026-05-13T09:00:00").toISOString() },
      { id: "log-8", userName: "Dell Technologies", role: "Vendor", action: "GENERATE_INVOICE", description: "Generated INV-2026-0001 for PO-2026-0001 — ₹4,80,000", createdAt: new Date("2026-05-14T11:00:00").toISOString() },
      { id: "log-9", userId: "u-2", userName: "Rahul Kumar", role: "Procurement Officer", action: "INVOICE_STATUS", description: "INV-2026-0001 marked as Paid", createdAt: new Date("2026-05-15T14:00:00").toISOString() },
      { id: "log-10", userId: "u-6", userName: "Priya Mehta", role: "Procurement Officer", action: "CREATE_RFQ", description: "Created RFQ-2026: Network Switch Procurement", createdAt: new Date("2026-05-20T09:00:00").toISOString() },
    ],
    notifications: [
      { id: "n-1", userId: "u-3", title: "Approval Required", message: "Review quotation from Godrej Interio for Office Furniture Upgrade — ₹2,70,000", isRead: false, createdAt: new Date("2026-05-18T10:00:00").toISOString() },
      { id: "n-2", userId: "u-2", title: "Quotation Received", message: "Godrej Interio submitted a quotation for Office Furniture Upgrade — ₹2,70,000", isRead: false, createdAt: new Date("2026-05-18T10:00:00").toISOString() },
      { id: "n-3", userId: "u-4", title: "New RFQ Assigned", message: "You have been invited to bid on: Network Switch Procurement (RFQ-2026-0003)", isRead: false, createdAt: new Date("2026-05-20T09:05:00").toISOString() },
      { id: "n-4", userId: "u-5", title: "New RFQ Assigned", message: "You have been invited to bid on: Network Switch Procurement (RFQ-2026-0003)", isRead: true, createdAt: new Date("2026-05-20T09:05:00").toISOString() },
      { id: "n-5", userId: "u-2", title: "Invoice Paid", message: "INV-2026-0001 from Dell Technologies has been marked as Paid ✅", isRead: true, createdAt: new Date("2026-05-15T14:00:00").toISOString() },
      { id: "n-6", userId: "u-4", title: "Payment Received", message: "Your INV-2026-0001 has been marked as Paid.", isRead: true, createdAt: new Date("2026-05-15T14:00:00").toISOString() },
      { id: "n-7", userId: "u-1", title: "PO Generated", message: "Rahul Kumar generated PO-2026-0001 for Dell Technologies — ₹4,80,000", isRead: true, createdAt: new Date("2026-05-13T09:05:00").toISOString() },
      { id: "n-8", userId: "u-2", title: "Quotation Received", message: "Dell Technologies submitted QT-2026-0004 for Network Switch Procurement — ₹1,40,000", isRead: false, createdAt: new Date("2026-05-22T10:00:00").toISOString() },
    ],
  };
}

// ─── DB Read/Write ───────────────────────────────────────────────────
function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initial = getInitialDb();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const data = fs.readFileSync(DB_FILE_PATH, "utf8");
    const parsed = JSON.parse(data) as DatabaseSchema;
    // Ensure all collections exist (backwards compat)
    return {
      users: parsed.users || [],
      vendors: parsed.vendors || [],
      rfqs: parsed.rfqs || [],
      quotations: parsed.quotations || [],
      approvals: parsed.approvals || [],
      purchaseOrders: parsed.purchaseOrders || [],
      invoices: parsed.invoices || [],
      activityLogs: parsed.activityLogs || [],
      notifications: parsed.notifications || [],
    };
  } catch {
    return getInitialDb();
  }
}

function writeDb(d: DatabaseSchema) {
  try { fs.writeFileSync(DB_FILE_PATH, JSON.stringify(d, null, 2), "utf8"); } catch (e) { console.error("DB write error", e); }
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

// ─── DB Operations ───────────────────────────────────────────────────
export const db = {
  // === Users ===
  getUsers: (): AppUser[] => readDb().users,
  getUserByEmail: (email: string): AppUser | undefined => readDb().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  getUserById: (id: string): AppUser | undefined => readDb().users.find(u => u.id === id),
  createUser: (user: Omit<AppUser, "id" | "createdAt">): AppUser => {
    const d = readDb();
    const n: AppUser = { ...user, id: uid("u"), createdAt: new Date().toISOString() };
    d.users.push(n); writeDb(d); return n;
  },
  deleteUser: (id: string): boolean => {
    const d = readDb(); const len = d.users.length;
    d.users = d.users.filter(u => u.id !== id);
    if (d.users.length === len) return false;
    writeDb(d); return true;
  },

  // === Vendors ===
  getVendors: (): Vendor[] => readDb().vendors,
  getVendorById: (id: string): Vendor | undefined => readDb().vendors.find(v => v.id === id),
  createVendor: (vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">): Vendor => {
    const d = readDb();
    const n: Vendor = { ...vendor, id: uid("v"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    d.vendors.push(n); writeDb(d); return n;
  },
  updateVendor: (id: string, updates: Partial<Vendor>): Vendor | undefined => {
    const d = readDb(); const i = d.vendors.findIndex(v => v.id === id);
    if (i === -1) return undefined;
    d.vendors[i] = { ...d.vendors[i], ...updates, updatedAt: new Date().toISOString() };
    writeDb(d); return d.vendors[i];
  },
  deleteVendor: (id: string): boolean => {
    const d = readDb(); const len = d.vendors.length;
    d.vendors = d.vendors.filter(v => v.id !== id);
    if (d.vendors.length === len) return false;
    writeDb(d); return true;
  },

  // === RFQs ===
  getRFQs: (): RFQ[] => readDb().rfqs,
  getRFQById: (id: string): RFQ | undefined => readDb().rfqs.find(r => r.id === id),
  createRFQ: (rfq: Omit<RFQ, "id" | "createdAt" | "updatedAt" | "status"> & { status?: RFQ["status"]; items: Omit<RFQItem, "id">[] }): RFQ => {
    const d = readDb();
    const items: RFQItem[] = rfq.items.map((item, idx) => ({ ...item, id: `item-${Date.now()}-${idx}` }));
    const n: RFQ = { ...rfq, items, status: rfq.status || "Draft", id: uid("rfq"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    d.rfqs.push(n); writeDb(d); return n;
  },
  updateRFQ: (id: string, updates: Partial<RFQ>): RFQ | undefined => {
    const d = readDb(); const i = d.rfqs.findIndex(r => r.id === id);
    if (i === -1) return undefined;
    d.rfqs[i] = { ...d.rfqs[i], ...updates, updatedAt: new Date().toISOString() };
    writeDb(d); return d.rfqs[i];
  },

  // === Quotations ===
  getQuotations: (): Quotation[] => readDb().quotations,
  getQuotationById: (id: string): Quotation | undefined => readDb().quotations.find(q => q.id === id),
  createQuotation: (q: Omit<Quotation, "id" | "createdAt" | "updatedAt">): Quotation => {
    const d = readDb();
    const n: Quotation = { ...q, id: uid("q"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    d.quotations.push(n); writeDb(d); return n;
  },
  updateQuotation: (id: string, updates: Partial<Quotation>): Quotation | undefined => {
    const d = readDb(); const i = d.quotations.findIndex(q => q.id === id);
    if (i === -1) return undefined;
    d.quotations[i] = { ...d.quotations[i], ...updates, updatedAt: new Date().toISOString() };
    writeDb(d); return d.quotations[i];
  },

  // === Approvals ===
  getApprovals: (): Approval[] => readDb().approvals,
  createApproval: (a: Omit<Approval, "id" | "createdAt">): Approval => {
    const d = readDb();
    const n: Approval = { ...a, id: uid("apr"), createdAt: new Date().toISOString() };
    d.approvals.push(n); writeDb(d); return n;
  },
  updateApproval: (id: string, updates: Partial<Approval>): Approval | undefined => {
    const d = readDb(); const i = d.approvals.findIndex(a => a.id === id);
    if (i === -1) return undefined;
    d.approvals[i] = { ...d.approvals[i], ...updates };
    writeDb(d); return d.approvals[i];
  },

  // === Purchase Orders ===
  getPurchaseOrders: (): PurchaseOrder[] => readDb().purchaseOrders,
  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "createdAt">): PurchaseOrder => {
    const d = readDb();
    const n: PurchaseOrder = { ...po, id: uid("po"), createdAt: new Date().toISOString() };
    d.purchaseOrders.push(n); writeDb(d); return n;
  },
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>): PurchaseOrder | undefined => {
    const d = readDb(); const i = d.purchaseOrders.findIndex(p => p.id === id);
    if (i === -1) return undefined;
    d.purchaseOrders[i] = { ...d.purchaseOrders[i], ...updates };
    writeDb(d); return d.purchaseOrders[i];
  },

  // === Invoices ===
  getInvoices: (): Invoice[] => readDb().invoices,
  createInvoice: (inv: Omit<Invoice, "id" | "createdAt">): Invoice => {
    const d = readDb();
    const n: Invoice = { ...inv, id: uid("inv"), createdAt: new Date().toISOString() };
    d.invoices.push(n); writeDb(d); return n;
  },
  updateInvoice: (id: string, updates: Partial<Invoice>): Invoice | undefined => {
    const d = readDb(); const i = d.invoices.findIndex(inv => inv.id === id);
    if (i === -1) return undefined;
    d.invoices[i] = { ...d.invoices[i], ...updates };
    writeDb(d); return d.invoices[i];
  },

  // === Activity Logs ===
  getActivityLogs: (): ActivityLog[] => readDb().activityLogs,
  addLog: (log: Omit<ActivityLog, "id" | "createdAt">): ActivityLog => {
    const d = readDb();
    const n: ActivityLog = { ...log, id: uid("log"), createdAt: new Date().toISOString() };
    d.activityLogs.push(n); writeDb(d); return n;
  },

  // === Notifications ===
  getNotifications: (userId?: string): Notification[] => {
    const all = readDb().notifications;
    return userId ? all.filter(n => n.userId === userId) : all;
  },
  addNotification: (n: Omit<Notification, "id" | "createdAt">): Notification => {
    const d = readDb();
    const notif: Notification = { ...n, id: uid("n"), createdAt: new Date().toISOString() };
    d.notifications.push(notif); writeDb(d); return notif;
  },
  markNotificationRead: (id: string): void => {
    const d = readDb(); const n = d.notifications.find(n => n.id === id);
    if (n) { n.isRead = true; writeDb(d); }
  },

  // === Reset ===
  resetDb: (): void => {
    writeDb(getInitialDb());
  },
};
