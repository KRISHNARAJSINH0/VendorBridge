import "dotenv/config";
import { Role, VendorStatus, RFQStatus, QuotationStatus, ApprovalStatus, POStatus, InvoiceStatus } from "@prisma/client";
import getPrisma from "../src/lib/prisma";

const _prisma = getPrisma();
if (!_prisma) {
  throw new Error("Failed to initialize Prisma Client");
}
const prisma = _prisma;

async function main() {
  console.log("Seeding database...");

  // Clear existing database
  await prisma.activityLog.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.rFQVendor.deleteMany({});
  await prisma.rFQItem.deleteMany({});
  await prisma.rFQ.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      id: "usr_admin",
      email: "admin@vendorbridge.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      firstName: "Sarah",
      lastName: "Jenkins",
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const officer = await prisma.user.create({
    data: {
      id: "usr_officer",
      email: "officer@vendorbridge.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      firstName: "David",
      lastName: "Miller",
      role: Role.PROCUREMENT_OFFICER,
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      id: "usr_manager",
      email: "manager@vendorbridge.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      firstName: "Arthur",
      lastName: "Pendelton",
      role: Role.MANAGER,
      isActive: true,
    },
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      id: "usr_vendor1",
      email: "vendor1@techcore.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      firstName: "TechCore",
      lastName: "Sales",
      role: Role.VENDOR,
      isActive: true,
    },
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      id: "usr_vendor2",
      email: "vendor2@infrasupp.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      firstName: "InfraSupp",
      lastName: "Bidding",
      role: Role.VENDOR,
      isActive: true,
    },
  });

  // 2. Create Vendors
  const techCore = await prisma.vendor.create({
    data: {
      id: "vnd_techcore",
      companyName: "TechCore Ltd",
      category: "IT Hardware",
      gstNumber: "27AADCT4291B1Z0",
      contactEmail: "vendor1@techcore.com",
      contactPhone: "+91 98765 43210",
      address: "Tech Park, Phase 2, Pune, Maharashtra",
      status: VendorStatus.ACTIVE,
      riskScore: "Low",
      rating: 4.8,
    },
  });

  const infraSupplies = await prisma.vendor.create({
    data: {
      id: "vnd_infrasupp",
      companyName: "Infra Supplies Ltd",
      category: "Furniture",
      gstNumber: "27AAACS1429B2Z0",
      contactEmail: "vendor2@infrasupp.com",
      contactPhone: "+91 91234 56789",
      address: "Industrial Area, Sector 4, Gurgaon, Haryana",
      status: VendorStatus.ACTIVE,
      riskScore: "Medium",
      rating: 4.2,
    },
  });

  const fonsLip = await prisma.vendor.create({
    data: {
      id: "vnd_fonslip",
      companyName: "Fons-Lip",
      category: "Logistics",
      gstNumber: "27AAIFL8924C1Z9",
      contactEmail: "logistics@fonslip.com",
      contactPhone: "+91 88888 77777",
      address: "Port Road, Block B, Navi Mumbai, Maharashtra",
      status: VendorStatus.ACTIVE,
      riskScore: "High",
      rating: 3.5,
    },
  });

  // 3. Create RFQs
  // RFQ 1: SENT with 2 quotations
  const rfq1 = await prisma.rFQ.create({
    data: {
      id: "rfq_furniture",
      rfqNumber: "RFQ-2026-0001",
      title: "Office Furniture Upgrade",
      description: "Procuring ergonomic workstations and seating for the new 4th-floor layout.",
      budget: 250000.0,
      deadline: new Date("2026-06-20"),
      status: RFQStatus.SENT,
      createdById: officer.id,
    },
  });

  await prisma.rFQItem.createMany({
    data: [
      { rfqId: rfq1.id, itemName: "Ergonomic Chairs", quantity: 25.0, unit: "units", estimatedCost: 6000.0 },
      { rfqId: rfq1.id, itemName: "Adjustable Standing Desks", quantity: 20.0, unit: "units", estimatedCost: 10000.0 },
    ],
  });

  await prisma.rFQVendor.createMany({
    data: [
      { rfqId: rfq1.id, vendorId: techCore.id },
      { rfqId: rfq1.id, vendorId: infraSupplies.id },
    ],
  });

  // Quotations for RFQ 1
  const quote1 = await prisma.quotation.create({
    data: {
      id: "qt_techcore_furn",
      quotationNumber: "QT-2026-0001",
      rfqId: rfq1.id,
      vendorId: techCore.id,
      status: QuotationStatus.SUBMITTED,
      subtotal: 240000.0,
      gstPercent: 18.0,
      grandTotal: 283200.0,
      paymentTerms: "Net 30",
      warranty: "3 Years",
      notes: "High premium build quality with custom mesh back support.",
    },
  });

  await prisma.quotationItem.createMany({
    data: [
      { quotationId: quote1.id, itemName: "Ergonomic Chairs", quantity: 25.0, unitPrice: 5600.0, total: 140000.0, deliveryDays: 14 },
      { quotationId: quote1.id, itemName: "Adjustable Standing Desks", quantity: 20.0, unitPrice: 5000.0, total: 100000.0, deliveryDays: 14 },
    ],
  });

  const quote2 = await prisma.quotation.create({
    data: {
      id: "qt_infrasupp_furn",
      quotationNumber: "QT-2026-0002",
      rfqId: rfq1.id,
      vendorId: infraSupplies.id,
      status: QuotationStatus.SUBMITTED,
      subtotal: 210000.0,
      gstPercent: 18.0,
      grandTotal: 247800.0,
      paymentTerms: "Net 15",
      warranty: "2 Years",
      notes: "Eco-friendly wood materials. Fast delivery.",
    },
  });

  await prisma.quotationItem.createMany({
    data: [
      { quotationId: quote2.id, itemName: "Ergonomic Chairs", quantity: 25.0, unitPrice: 4800.0, total: 120000.0, deliveryDays: 7 },
      { quotationId: quote2.id, itemName: "Adjustable Standing Desks", quantity: 20.0, unitPrice: 4500.0, total: 90000.0, deliveryDays: 7 },
    ],
  });

  // RFQ 2: CLOSED with approved quotation + PO + Invoice
  const rfq2 = await prisma.rFQ.create({
    data: {
      id: "rfq_servers",
      rfqNumber: "RFQ-2026-0002",
      title: "Server Room Modernization",
      description: "Upgrade the primary data center infrastructure with energy-efficient servers.",
      budget: 1200000.0,
      deadline: new Date("2026-06-10"),
      status: RFQStatus.CLOSED,
      createdById: officer.id,
    },
  });

  await prisma.rFQItem.createMany({
    data: [
      { rfqId: rfq2.id, itemName: "Rack-mount Server Nodes", quantity: 4.0, unit: "units", estimatedCost: 250000.0 },
      { rfqId: rfq2.id, itemName: "Cat6a Cable Spools (1000ft)", quantity: 6.0, unit: "spools", estimatedCost: 30000.0 },
    ],
  });

  await prisma.rFQVendor.createMany({
    data: [
      { rfqId: rfq2.id, vendorId: techCore.id },
    ],
  });

  // Quotation for RFQ 2
  const quote3 = await prisma.quotation.create({
    data: {
      id: "qt_techcore_serv",
      quotationNumber: "QT-2026-0003",
      rfqId: rfq2.id,
      vendorId: techCore.id,
      status: QuotationStatus.APPROVED,
      subtotal: 1000000.0,
      gstPercent: 18.0,
      grandTotal: 1180000.0,
      paymentTerms: "Net 30",
      warranty: "5 Years",
      notes: "Enterprise server blades with lifetime enterprise support.",
    },
  });

  await prisma.quotationItem.createMany({
    data: [
      { quotationId: quote3.id, itemName: "Rack-mount Server Nodes", quantity: 4.0, unitPrice: 220000.0, total: 880000.0, deliveryDays: 10 },
      { quotationId: quote3.id, itemName: "Cat6a Cable Spools (1000ft)", quantity: 6.0, unitPrice: 20000.0, total: 120000.0, deliveryDays: 5 },
    ],
  });

  // Approval for RFQ 2 Quotation
  await prisma.approval.create({
    data: {
      id: "app_servers",
      quotationId: quote3.id,
      managerId: manager.id,
      status: ApprovalStatus.APPROVED,
      remarks: "Crucial infrastructure upgrade, approved TechCore bid due to extended warranty.",
      approvedAt: new Date(),
    },
  });

  // PO for RFQ 2
  const po = await prisma.purchaseOrder.create({
    data: {
      id: "po_servers",
      poNumber: "PO-2026-0001",
      quotationId: quote3.id,
      vendorId: techCore.id,
      createdById: officer.id,
      totalAmount: 1180000.0,
      status: POStatus.CONFIRMED,
    },
  });

  // Invoice for RFQ 2
  await prisma.invoice.create({
    data: {
      id: "inv_servers",
      invoiceNumber: "INV-2026-0001",
      purchaseOrderId: po.id,
      vendorId: techCore.id,
      subtotal: 1000000.0,
      taxAmount: 180000.0,
      grandTotal: 1180000.0,
      status: InvoiceStatus.SENT,
      dueDate: new Date("2026-07-05"),
    },
  });

  // 4. Seed default Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { userId: officer.id, action: "CREATE_RFQ", description: "Created RFQ 'Office Furniture Upgrade' (RFQ-2026-0001)." },
      { userId: vendorUser1.id, action: "SUBMIT_QUOTATION", description: "TechCore Ltd submitted quotation QT-2026-0001." },
      { userId: vendorUser2.id, action: "SUBMIT_QUOTATION", description: "Infra Supplies Ltd submitted quotation QT-2026-0002." },
      { userId: manager.id, action: "APPROVE_QUOTATION", description: "Approved quotation QT-2026-0003 for Server Room Modernization." },
      { userId: officer.id, action: "CREATE_PO", description: "Generated Purchase Order PO-2026-0001 for TechCore Ltd." },
    ],
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
