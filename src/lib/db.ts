import fs from "fs";
import path from "path";

// Define Types that match Prisma Schema
export interface Vendor {
  id: string;
  name: string;
  category: string;
  gstNumber: string;
  contactEmail: string;
  contactPhone: string;
  status: "Active" | "Pending" | "Blacklisted";
  riskScore: "Low" | "Medium" | "High";
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
  createdAt: string;
  updatedAt: string;
  items: RFQItem[];
  vendorIds: string[]; // references Vendor.id
  attachments: Attachment[];
}

export interface QuotationItem {
  id: string;
  rfqItemId: string;
  itemName: string; // denormalized for easy UI display
  quantity: number;
  unitPrice: number;
  total: number;
  deliveryDays: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  rfqTitle: string; // denormalized for UI
  vendorId: string;
  vendorName: string; // denormalized for UI
  status: "Draft" | "Submitted";
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

interface DatabaseSchema {
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
}

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

const INITIAL_VENDORS: Vendor[] = [
  {
    id: "v-1",
    name: "TechCore Ltd",
    category: "IT & Software",
    gstNumber: "27AADCT4291B1Z0",
    contactEmail: "info@techcore.com",
    contactPhone: "+91 98765 43210",
    status: "Active",
    riskScore: "Low",
    address: "Tech Park, Phase 2, Pune, Maharashtra",
    createdAt: new Date("2026-01-15").toISOString(),
    updatedAt: new Date("2026-01-15").toISOString(),
  },
  {
    id: "v-2",
    name: "Infra Supplies Pvt Ltd",
    category: "Construction & Raw Materials",
    gstNumber: "27AAACS1429B2Z0",
    contactEmail: "sales@infrasupplies.in",
    contactPhone: "+91 91234 56789",
    status: "Active",
    riskScore: "Medium",
    address: "Industrial Area, Sector 4, Gurgaon, Haryana",
    createdAt: new Date("2026-02-10").toISOString(),
    updatedAt: new Date("2026-02-10").toISOString(),
  },
  {
    id: "v-3",
    name: "FastLog Transport",
    category: "Logistics & Shipping",
    gstNumber: "27AAIFL8924C1Z9",
    contactEmail: "logistics@fastlog.co",
    contactPhone: "+91 88888 77777",
    status: "Blacklisted",
    riskScore: "High",
    address: "Port Road, Block B, Navi Mumbai, Maharashtra",
    createdAt: new Date("2025-11-05").toISOString(),
    updatedAt: new Date("2026-04-12").toISOString(),
  },
  {
    id: "v-4",
    name: "OfficePro Furnitures",
    category: "Office Infrastructure",
    gstNumber: "27AABCO2941D3ZA",
    contactEmail: "orders@officepro.com",
    contactPhone: "+91 77777 66666",
    status: "Pending",
    riskScore: "Medium",
    address: "Kirti Nagar Furniture Market, New Delhi",
    createdAt: new Date("2026-05-20").toISOString(),
    updatedAt: new Date("2026-05-20").toISOString(),
  },
  {
    id: "v-5",
    name: "Smart Industrial Solutions",
    category: "Industrial Equipment",
    gstNumber: "27AAESI7742E1ZS",
    contactEmail: "support@smartind.org",
    contactPhone: "+91 99999 88888",
    status: "Active",
    riskScore: "Low",
    address: "MIDC Industrial Area, Bhosari, Pune",
    createdAt: new Date("2026-03-01").toISOString(),
    updatedAt: new Date("2026-03-01").toISOString(),
  }
];

const INITIAL_RFQS: RFQ[] = [
  {
    id: "rfq-1",
    title: "Office Furniture Procurement Q2",
    category: "Office Infrastructure",
    budget: 250000,
    deadline: "2026-06-15",
    description: "Procurement of ergonomic mesh office chairs and motorized height-adjustable standing desks for the 3rd floor office expansion.",
    status: "Published",
    createdAt: new Date("2026-06-01").toISOString(),
    updatedAt: new Date("2026-06-01").toISOString(),
    items: [
      { id: "item-1-1", itemName: "Ergonomic Mesh Chair", quantity: 25, unit: "Nos", estimatedCost: 6000 },
      { id: "item-1-2", itemName: "Motorized Standing Desk", quantity: 10, unit: "Nos", estimatedCost: 10000 }
    ],
    vendorIds: ["v-4", "v-2"],
    attachments: [
      {
        id: "att-1",
        fileName: "office_layout_spec.pdf",
        fileUrl: "/mock-files/office_layout_spec.pdf",
        fileSize: 2450000,
        createdAt: new Date("2026-06-01").toISOString()
      }
    ]
  },
  {
    id: "rfq-2",
    title: "High Performance Server Hardware",
    category: "IT & Software",
    budget: 1200000,
    deadline: "2026-06-30",
    description: "Purchase of high-performance database servers with dual Intel Xeon processors, 512GB RAM, and NVMe SSD RAID storage arrays.",
    status: "Draft",
    createdAt: new Date("2026-06-05").toISOString(),
    updatedAt: new Date("2026-06-05").toISOString(),
    items: [
      { id: "item-2-1", itemName: "Database Server Node A", quantity: 2, unit: "Nos", estimatedCost: 500000 },
      { id: "item-2-2", itemName: "Gigabit Ethernet Switch 24-Port", quantity: 4, unit: "Nos", estimatedCost: 50000 }
    ],
    vendorIds: ["v-1", "v-5"],
    attachments: []
  }
];

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: "q-1",
    rfqId: "rfq-1",
    rfqTitle: "Office Furniture Procurement Q2",
    vendorId: "v-4",
    vendorName: "OfficePro Furnitures",
    status: "Submitted",
    subtotal: 169500,
    gstPercent: 18,
    grandTotal: 200010,
    paymentTerms: "30 Days Net from date of invoice delivery",
    warranty: "3 Years on frame and cylinders, 1 year on mesh fabrics",
    notes: "Delivery can be completed in stages. Sourced from local certified suppliers.",
    createdAt: new Date("2026-06-04").toISOString(),
    updatedAt: new Date("2026-06-04").toISOString(),
    items: [
      { id: "qi-1-1", rfqItemId: "item-1-1", itemName: "Ergonomic Mesh Chair", quantity: 25, unitPrice: 3500, total: 87500, deliveryDays: 7 },
      { id: "qi-1-2", rfqItemId: "item-1-2", itemName: "Motorized Standing Desk", quantity: 10, unitPrice: 8200, total: 82000, deliveryDays: 14 }
    ]
  }
];

// Read DB file
function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const db: DatabaseSchema = {
        vendors: INITIAL_VENDORS,
        rfqs: INITIAL_RFQS,
        quotations: INITIAL_QUOTATIONS,
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf8");
      return db;
    }
    const data = fs.readFileSync(DB_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file", error);
    return { vendors: INITIAL_VENDORS, rfqs: INITIAL_RFQS, quotations: INITIAL_QUOTATIONS };
  }
}

// Write DB file
function writeDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database file", error);
  }
}

// DB Operations export
export const db = {
  // Vendor Operations
  getVendors: (): Vendor[] => {
    return readDb().vendors;
  },
  getVendorById: (id: string): Vendor | undefined => {
    return readDb().vendors.find((v) => v.id === id);
  },
  createVendor: (vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">): Vendor => {
    const database = readDb();
    const newVendor: Vendor = {
      ...vendor,
      id: "v-" + (database.vendors.length + 1) + "-" + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    database.vendors.push(newVendor);
    writeDb(database);
    return newVendor;
  },
  updateVendor: (id: string, updates: Partial<Vendor>): Vendor | undefined => {
    const database = readDb();
    const index = database.vendors.findIndex((v) => v.id === id);
    if (index === -1) return undefined;
    const updatedVendor = {
      ...database.vendors[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    database.vendors[index] = updatedVendor;
    writeDb(database);
    return updatedVendor;
  },
  deleteVendor: (id: string): boolean => {
    const database = readDb();
    const initialLength = database.vendors.length;
    database.vendors = database.vendors.filter((v) => v.id !== id);
    if (database.vendors.length === initialLength) return false;
    writeDb(database);
    return true;
  },

  // RFQ Operations
  getRFQs: (): RFQ[] => {
    return readDb().rfqs;
  },
  getRFQById: (id: string): RFQ | undefined => {
    return readDb().rfqs.find((r) => r.id === id);
  },
  createRFQ: (
    rfq: Omit<RFQ, "id" | "createdAt" | "updatedAt" | "status" | "items"> & {
      status?: RFQ["status"];
      items: Omit<RFQItem, "id">[];
    }
  ): RFQ => {
    const database = readDb();
    const itemsWithIds: RFQItem[] = rfq.items.map((item, index) => ({
      ...item,
      id: `item-${database.rfqs.length + 1}-${index + 1}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    const newRFQ: RFQ = {
      ...rfq,
      items: itemsWithIds,
      status: rfq.status || "Draft",
      id: "rfq-" + (database.rfqs.length + 1) + "-" + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    database.rfqs.push(newRFQ);
    writeDb(database);
    return newRFQ;
  },
  updateRFQ: (id: string, updates: Partial<RFQ>): RFQ | undefined => {
    const database = readDb();
    const index = database.rfqs.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    const updatedRFQ = {
      ...database.rfqs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    database.rfqs[index] = updatedRFQ;
    writeDb(database);
    return updatedRFQ;
  },

  // Quotation Operations
  getQuotations: (): Quotation[] => {
    return readDb().quotations;
  },
  getQuotationById: (id: string): Quotation | undefined => {
    return readDb().quotations.find((q) => q.id === id);
  },
  createQuotation: (quotation: Omit<Quotation, "id" | "createdAt" | "updatedAt">): Quotation => {
    const database = readDb();
    const newQuotation: Quotation = {
      ...quotation,
      id: "q-" + (database.quotations.length + 1) + "-" + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    database.quotations.push(newQuotation);
    writeDb(database);
    return newQuotation;
  },
  updateQuotation: (id: string, updates: Partial<Quotation>): Quotation | undefined => {
    const database = readDb();
    const index = database.quotations.findIndex((q) => q.id === id);
    if (index === -1) return undefined;
    const updated = {
      ...database.quotations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    database.quotations[index] = updated;
    writeDb(database);
    return updated;
  }
};
