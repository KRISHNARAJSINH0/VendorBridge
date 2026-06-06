export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Procurement Officer" | "Manager" | "Vendor";
  status: "Active" | "Suspended";
  vendorId: string | null;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  category: string;
  status: "Active" | "Suspended" | "Pending" | "Blacklisted";
  rating: number;
  dateAdded: string;
  gstNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  riskScore: "Low" | "Medium" | "High";
}

export interface RFQItem {
  name: string;
  qty: number;
  unit: string;
  targetPrice?: number;
}

export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  status: "Active" | "Under Review" | "Approved" | "Rejected" | "Closed" | "Draft" | "Published";
  budget: number;
  items: RFQItem[];
  assignedVendors: string[];
  selectedQuotationId: string | null;
  managerRemarks: string;
}

export interface QuotationItem {
  name: string;
  price: number;
  deliveryDays?: number; // fallback
}

export interface Quotation {
  id: string;
  rfqId: string;
  rfqTitle: string;
  vendorId: string;
  vendorName: string;
  totalPrice: number;
  grandTotal: number;
  deliveryDays: number;
  remarks: string;
  status: "Submitted" | "Selected" | "Rejected" | "Approved" | "Draft";
  submittedDate: string;
  items: QuotationItem[];
  paymentTerms?: string;
  warranty?: string;
  gstPercent?: number;
}

export interface PurchaseOrder {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  total: number;
  createdDate: string;
  status: string;
}

export interface Invoice {
  id: string;
  poId: string;
  vendorId: string;
  vendorName: string;
  total: number;
  createdDate: string;
  status: "Sent" | "Paid";
}

export interface ActivityLog {
  id: string;
  type: "rfq_created" | "vendor_added" | "quotation_submitted" | "ai_recommendation" | "approval_action" | "po_generated" | "invoice_generated" | "payment_completed";
  title: string;
  description: string;
  user: string;
  date: string;
  time: string;
  timestamp: string;
  referenceId?: string;
}
