import { NextResponse } from "next/server";
import getPrisma from "../../../lib/prisma";
import { 
  Role, 
  VendorStatus, 
  RFQStatus, 
  QuotationStatus, 
  ApprovalStatus, 
  POStatus, 
  InvoiceStatus 
} from "@prisma/client";

// Seed logic for clean environments matching prisma/seed.ts
async function seedDatabase(prisma: any) {
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
      { userId: officer.id, action: "success", description: "Created RFQ 'Office Furniture Upgrade' (RFQ-2026-0001)." },
      { userId: vendorUser1.id, action: "success", description: "TechCore Ltd submitted quotation QT-2026-0001." },
      { userId: vendorUser2.id, action: "success", description: "Infra Supplies Ltd submitted quotation QT-2026-0002." },
      { userId: manager.id, action: "success", description: "Approved quotation QT-2026-0003 for Server Room Modernization." },
      { userId: officer.id, action: "success", description: "Generated Purchase Order PO-2026-0001 for TechCore Ltd." },
    ],
  });
}

// Helper to convert DB enum to Display Role
function mapRoleEnumToDisplay(role: Role): string {
  switch (role) {
    case Role.ADMIN: return "Admin";
    case Role.PROCUREMENT_OFFICER: return "Procurement Officer";
    case Role.MANAGER: return "Manager";
    case Role.VENDOR: return "Vendor";
    default: return "Vendor";
  }
}

// Helper to convert Display Role to DB enum
function mapDisplayToRoleEnum(display: string): Role {
  const normalized = display.trim().toLowerCase();
  if (normalized.includes("admin")) return Role.ADMIN;
  if (normalized.includes("procurement") || normalized.includes("officer")) return Role.PROCUREMENT_OFFICER;
  if (normalized.includes("manager") || normalized.includes("approver")) return Role.MANAGER;
  return Role.VENDOR;
}

export async function GET() {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Prisma client not available" }, { status: 500 });
  }

  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      await seedDatabase(prisma);
    }

    const vendors = await prisma.vendor.findMany({
      orderBy: { id: "asc" }
    });

    const usersRaw = await prisma.user.findMany({
      orderBy: { id: "asc" }
    });

    // Map users to UI format
    const users = usersRaw.map((u) => {
      const v = vendors.find((vend) => vend.contactEmail === u.email);
      return {
        id: "u" + u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: mapRoleEnumToDisplay(u.role),
        status: u.isActive ? "Active" : "Suspended",
        vendorId: v ? "v" + v.id : null
      };
    });

    // Map vendors to UI format
    const mappedVendors = vendors.map((v) => ({
      id: "v" + v.id,
      name: v.companyName,
      email: v.contactEmail || "",
      category: v.category || "IT Hardware",
      status: v.status === VendorStatus.ACTIVE ? "Active" : "Suspended",
      rating: Number(v.rating || 5.0),
      dateAdded: v.createdAt.toISOString().split("T")[0]
    }));

    // Fetch RFQs
    const rfqsRaw = await prisma.rFQ.findMany({
      include: {
        items: true,
        rfqVendors: true
      },
      orderBy: { id: "desc" }
    });

    // Fetch Quotations
    const quotationsRaw = await prisma.quotation.findMany({
      include: {
        items: true,
        vendor: true
      },
      orderBy: { id: "desc" }
    });

    const quotations = quotationsRaw.map((q) => {
      const rfqMatch = rfqsRaw.find((r) => r.id === q.rfqId);
      let displayStatus = "Submitted";
      if (q.status === QuotationStatus.UNDER_REVIEW) displayStatus = "Selected";
      else if (q.status === QuotationStatus.APPROVED) displayStatus = "Approved";
      else if (q.status === QuotationStatus.REJECTED) displayStatus = "Rejected";

      return {
        id: q.quotationNumber,
        rfqId: rfqMatch ? rfqMatch.rfqNumber : "Unknown",
        vendorId: "v" + q.vendorId,
        vendorName: q.vendor.companyName,
        totalPrice: Number(q.grandTotal || 0),
        deliveryDays: q.items[0]?.deliveryDays || 30, // Fallback to item delivery
        remarks: q.notes || "",
        status: displayStatus,
        submittedDate: q.createdAt.toISOString().split("T")[0],
        items: q.items.map((it) => ({
          name: it.itemName || "",
          price: Number(it.unitPrice || 0)
        }))
      };
    });

    // Fetch POs
    const posRaw = await prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        quotation: {
          include: {
            rfq: true
          }
        }
      },
      orderBy: { id: "desc" }
    });

    const purchaseOrders = posRaw.map((po) => ({
      id: po.poNumber,
      rfqId: po.quotation.rfq.rfqNumber,
      vendorId: "v" + po.vendorId,
      vendorName: po.vendor.companyName,
      total: Number(po.totalAmount || 0),
      createdDate: po.createdAt.toISOString().split("T")[0],
      status: po.status === POStatus.DELIVERED ? "Delivered" : "Approved"
    }));

    // Fetch Invoices
    const invoicesRaw = await prisma.invoice.findMany({
      include: {
        vendor: true,
        purchaseOrder: true
      },
      orderBy: { id: "desc" }
    });

    const invoices = invoicesRaw.map((inv) => ({
      id: inv.invoiceNumber,
      poId: inv.purchaseOrder.poNumber,
      vendorId: "v" + inv.vendorId,
      vendorName: inv.vendor.companyName,
      total: Number(inv.grandTotal || 0),
      createdDate: inv.createdAt.toISOString().split("T")[0],
      status: inv.status === InvoiceStatus.PAID ? "Paid" : "Sent"
    }));

    // Fetch Logs
    const logsRaw = await prisma.activityLog.findMany({
      include: {
        user: true
      },
      orderBy: { id: "desc" },
      take: 50
    });

    const logs = logsRaw.map((log) => ({
      timestamp: log.createdAt.toISOString().replace("T", " ").split(".")[0],
      role: log.user ? mapRoleEnumToDisplay(log.user.role) : "System",
      message: log.description || "",
      type: log.action || "info"
    }));

    // Build the mapped RFQs
    const rfqs = rfqsRaw.map((r) => {
      // Find selected quotation ID if any
      const selectedQuote = quotationsRaw.find((q) => q.rfqId === r.id && (q.status === QuotationStatus.UNDER_REVIEW || q.status === QuotationStatus.APPROVED));
      
      let displayStatus = "Active";
      if (r.status === RFQStatus.CLOSED) {
        displayStatus = "Closed";
      } else if (r.status === RFQStatus.CANCELLED) {
        displayStatus = "Cancelled";
      } else if (selectedQuote) {
        if (selectedQuote.status === QuotationStatus.UNDER_REVIEW) {
          displayStatus = "Under Review";
        } else if (selectedQuote.status === QuotationStatus.APPROVED) {
          displayStatus = "Approved";
        }
      }

      return {
        id: r.rfqNumber,
        title: r.title,
        description: r.description || "",
        category: r.items[0]?.itemName ? "IT Hardware" : "Furniture", // Mapped category
        deadline: r.deadline ? r.deadline.toISOString().split("T")[0] : "",
        status: displayStatus,
        items: r.items.map((it) => ({
          name: it.itemName,
          qty: Number(it.quantity),
          unit: it.unit || "pcs",
          targetPrice: Number(it.estimatedCost)
        })),
        assignedVendors: r.rfqVendors.map((rv) => "v" + rv.vendorId),
        selectedQuotationId: selectedQuote ? selectedQuote.quotationNumber : null,
        managerRemarks: "" // dynamically resolved next
      };
    });

    // Populate Manager Remarks on RFQs
    for (const r of rfqs) {
      const dbRfq = rfqsRaw.find((rec) => rec.rfqNumber === r.id);
      if (dbRfq) {
        const matchingQuoteIds = quotationsRaw.filter(q => q.rfqId === dbRfq.id).map(q => q.id);
        const approvalRecord = await prisma.approval.findFirst({
          where: { quotationId: { in: matchingQuoteIds } },
          orderBy: { id: "desc" }
        });
        if (approvalRecord) {
          r.managerRemarks = approvalRecord.remarks || "";
        }
      }
    }

    return NextResponse.json({
      users,
      vendors: mappedVendors,
      categories: ["IT Hardware", "Office Supplies", "Furniture", "Logistics"],
      rfqs,
      quotations,
      purchaseOrders,
      invoices,
      logs
    });
  } catch (err: any) {
    console.error("API GET Sync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Prisma client not available" }, { status: 500 });
  }

  try {
    const { action, data } = await req.json();

    switch (action) {
      case "registerUser": {
        const { firstName, lastName, fullName, email, role, companyName, category } = data;
        const roleEnum = mapDisplayToRoleEnum(role);

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new Error("User with this email already exists.");

        const fName = firstName || fullName?.split(" ")[0] || "Vendor";
        const lName = lastName || fullName?.split(" ").slice(1).join(" ") || "Representative";

        // Create User
        const user = await prisma.user.create({
          data: {
            email,
            passwordHash: "PBKDF2_MOCK_HASH",
            firstName: fName,
            lastName: lName,
            role: roleEnum,
            isActive: true
          }
        });

        // If Role is Vendor, create Vendor
        if (roleEnum === Role.VENDOR) {
          await prisma.vendor.create({
            data: {
              companyName: companyName || `${fName} Supplies`,
              contactEmail: email,
              category: category || "IT Hardware",
              gstNumber: "27AA" + Math.floor(100000 + Math.random() * 900000) + "A1Z" + Math.floor(Math.random() * 9),
              contactPhone: "+91 99999 88888",
              address: "Registered Online Office",
              status: VendorStatus.ACTIVE,
              rating: 5.0
            }
          });
        }

        // Add Log
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: "success",
            description: `Registered new user: ${user.firstName} ${user.lastName} as ${role}.`
          }
        });
        break;
      }

      case "createUser": {
        const { name, email, role } = data;
        const roleEnum = mapDisplayToRoleEnum(role);
        const fName = name.split(" ")[0] || "User";
        const lName = name.split(" ").slice(1).join(" ") || "Member";

        const user = await prisma.user.create({
          data: {
            email,
            passwordHash: "PBKDF2_MOCK_HASH",
            firstName: fName,
            lastName: lName,
            role: roleEnum,
            isActive: true
          }
        });

        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: "success",
            description: `Created user ${user.firstName} ${user.lastName} with role ${role}.`
          }
        });
        break;
      }

      case "deleteUser": {
        const { id } = data;
        const dbId = id.startsWith("u") ? id.slice(1) : id;
        const user = await prisma.user.findUnique({ where: { id: dbId } });
        if (user) {
          await prisma.user.delete({ where: { id: dbId } });
          await prisma.activityLog.create({
            data: {
              action: "warning",
              description: `Deleted user ${user.firstName} ${user.lastName}.`
            }
          });
        }
        break;
      }

      case "toggleVendorStatus": {
        const { id } = data;
        const dbId = id.startsWith("v") ? id.slice(1) : id;
        const vendor = await prisma.vendor.findUnique({ where: { id: dbId } });
        if (vendor) {
          const nextStatus = vendor.status === VendorStatus.ACTIVE ? VendorStatus.INACTIVE : VendorStatus.ACTIVE;
          await prisma.vendor.update({
            where: { id: dbId },
            data: { status: nextStatus }
          });
          await prisma.activityLog.create({
            data: {
              action: nextStatus === VendorStatus.ACTIVE ? "success" : "warning",
              description: `Changed Vendor ${vendor.companyName} status to ${nextStatus === VendorStatus.ACTIVE ? "Active" : "Suspended"}.`
            }
          });
        }
        break;
      }

      case "addVendor": {
        const { name, email, category } = data;

        const vendor = await prisma.vendor.create({
          data: {
            companyName: name,
            contactEmail: email,
            category: category || "IT Hardware",
            gstNumber: "27AA" + Math.floor(100000 + Math.random() * 900000) + "A1Z" + Math.floor(Math.random() * 9),
            contactPhone: "+91 99999 88888",
            address: "Added via Admin Portal",
            status: VendorStatus.ACTIVE,
            rating: 5.0
          }
        });

        const user = await prisma.user.create({
          data: {
            email,
            passwordHash: "PBKDF2_MOCK_HASH",
            firstName: name,
            lastName: "Representative",
            role: Role.VENDOR,
            isActive: true
          }
        });

        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: "success",
            description: `Registered new vendor ${vendor.companyName} in category ${vendor.category}.`
          }
        });
        break;
      }

      case "createRFQ": {
        const { title, description, category, deadline, items, assignedVendors } = data;
        const count = await prisma.rFQ.count();
        const rfqNumber = `RFQ-2026-00${count + 1}`;

        const officer = await prisma.user.findFirst({
          where: { role: Role.PROCUREMENT_OFFICER }
        });
        if (!officer) throw new Error("No Procurement Officer found to assign RFQ.");

        const rfq = await prisma.rFQ.create({
          data: {
            rfqNumber,
            title,
            description,
            budget: 0, // Mock budget
            deadline: deadline ? new Date(deadline) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: RFQStatus.SENT,
            createdById: officer.id
          }
        });

        // Insert line items
        for (const it of items) {
          await prisma.rFQItem.create({
            data: {
              rfqId: rfq.id,
              itemName: it.name,
              quantity: Number(it.qty),
              unit: it.unit || "units",
              estimatedCost: Number(it.targetPrice || 0)
            }
          });
        }

        // Assigned vendors
        for (const vId of assignedVendors) {
          const dbVendorId = vId.startsWith("v") ? vId.slice(1) : vId;
          await prisma.rFQVendor.create({
            data: {
              rfqId: rfq.id,
              vendorId: dbVendorId
            }
          });
        }

        await prisma.activityLog.create({
          data: {
            userId: officer.id,
            action: "success",
            description: `Created RFQ '${title}' assigned to ${assignedVendors.length} vendors.`
          }
        });
        break;
      }

      case "submitQuotation": {
        const { rfqId, vendorId, totalPrice, deliveryDays, remarks, items } = data;
        const rfqRecord = await prisma.rFQ.findUnique({ where: { rfqNumber: rfqId } });
        if (!rfqRecord) throw new Error("RFQ " + rfqId + " not found.");

        const dbVendorId = vendorId.startsWith("v") ? vendorId.slice(1) : vendorId;
        const vendor = await prisma.vendor.findUnique({ where: { id: dbVendorId } });
        if (!vendor) throw new Error("Vendor not found.");

        const count = await prisma.quotation.count();
        const quotationNumber = `QT-2026-00${count + 1}`;

        const quote = await prisma.quotation.create({
          data: {
            quotationNumber,
            rfqId: rfqRecord.id,
            vendorId: dbVendorId,
            subtotal: Number(totalPrice),
            gstPercent: 18.0,
            grandTotal: Number(totalPrice),
            paymentTerms: "Net 30",
            warranty: "1 Year",
            notes: remarks,
            status: QuotationStatus.SUBMITTED
          }
        });

        for (const it of items) {
          await prisma.quotationItem.create({
            data: {
              quotationId: quote.id,
              itemName: it.name,
              quantity: 1,
              unitPrice: Number(it.price),
              total: Number(it.price),
              deliveryDays: Number(deliveryDays || 30)
            }
          });
        }

        // Log vendor user if found
        const vendorUser = await prisma.user.findFirst({ where: { email: vendor.contactEmail } });

        await prisma.activityLog.create({
          data: {
            userId: vendorUser ? vendorUser.id : null,
            action: "success",
            description: `Vendor (${vendor.companyName}) submitted quotation ${quotationNumber} for RFQ ${rfqId}.`
          }
        });
        break;
      }

      case "selectBestQuotation": {
        const { rfqId, quotationId } = data;
        const rfqRecord = await prisma.rFQ.findUnique({ where: { rfqNumber: rfqId } });
        if (!rfqRecord) throw new Error("RFQ not found.");

        // Update selected quotation status to Selected
        const selectedQuote = await prisma.quotation.update({
          where: { quotationNumber: quotationId },
          data: { status: QuotationStatus.UNDER_REVIEW }
        });

        // Reject other quotations for this RFQ
        await prisma.quotation.updateMany({
          where: {
            rfqId: rfqRecord.id,
            NOT: { quotationNumber: quotationId }
          },
          data: { status: QuotationStatus.REJECTED }
        });

        const vendor = await prisma.vendor.findUnique({ where: { id: selectedQuote.vendorId } });
        const officer = await prisma.user.findFirst({ where: { role: Role.PROCUREMENT_OFFICER } });

        await prisma.activityLog.create({
          data: {
            userId: officer ? officer.id : null,
            action: "info",
            description: `Quotation ${quotationId} (${vendor?.companyName}) selected for RFQ ${rfqId}. Sent to Manager.`
          }
        });
        break;
      }

      case "approveOrRejectRFQ": {
        const { rfqId, status, remarks } = data; // Approved or Rejected
        const rfqRecord = await prisma.rFQ.findUnique({
          where: { rfqNumber: rfqId },
          include: { quotations: true }
        });
        if (!rfqRecord) throw new Error("RFQ not found.");

        const selectedQuote = rfqRecord.quotations.find((q) => q.status === QuotationStatus.UNDER_REVIEW);
        if (!selectedQuote) throw new Error("No quotation currently selected for this RFQ.");

        const manager = await prisma.user.findFirst({
          where: { role: Role.MANAGER }
        });
        if (!manager) throw new Error("No Manager found for approval.");

        // Create approval audit trail
        await prisma.approval.create({
          data: {
            quotationId: selectedQuote.id,
            managerId: manager.id,
            status: status === "Approved" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
            remarks,
            approvedAt: new Date()
          }
        });

        // Update selected quote status
        await prisma.quotation.update({
          where: { id: selectedQuote.id },
          data: { status: status === "Approved" ? QuotationStatus.APPROVED : QuotationStatus.REJECTED }
        });

        if (status === "Rejected") {
          // Reset other quotes back to Submitted so they can be re-evaluated
          await prisma.quotation.updateMany({
            where: { rfqId: rfqRecord.id },
            data: { status: QuotationStatus.SUBMITTED }
          });
        }

        await prisma.activityLog.create({
          data: {
            userId: manager.id,
            action: status === "Approved" ? "success" : "warning",
            description: `Manager ${status} procurement request for ${rfqId}. Remarks: "${remarks}"`
          }
        });
        break;
      }

      case "generatePOAndInvoice": {
        const { rfqId, quotationId } = data;
        const rfqRecord = await prisma.rFQ.findUnique({ where: { rfqNumber: rfqId } });
        if (!rfqRecord) throw new Error("RFQ not found.");

        const quote = await prisma.quotation.findUnique({ where: { quotationNumber: quotationId } });
        if (!quote) throw new Error("Quotation not found.");

        const poCount = await prisma.purchaseOrder.count();
        const poNumber = `PO-2026-00${poCount + 1}`;

        const invoiceCount = await prisma.invoice.count();
        const invoiceNumber = `INV-2026-00${invoiceCount + 1}`;

        const officer = await prisma.user.findFirst({ where: { role: Role.PROCUREMENT_OFFICER } });
        if (!officer) throw new Error("No Procurement Officer found.");

        // Create PO
        const po = await prisma.purchaseOrder.create({
          data: {
            poNumber,
            quotationId: quote.id,
            vendorId: quote.vendorId,
            createdById: officer.id,
            totalAmount: quote.grandTotal,
            status: POStatus.GENERATED
          }
        });

        // Create Invoice
        await prisma.invoice.create({
          data: {
            invoiceNumber,
            purchaseOrderId: po.id,
            vendorId: quote.vendorId,
            subtotal: quote.subtotal,
            taxAmount: quote.grandTotal - quote.subtotal,
            grandTotal: quote.grandTotal,
            status: InvoiceStatus.PENDING,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });

        // Close RFQ
        await prisma.rFQ.update({
          where: { id: rfqRecord.id },
          data: { status: RFQStatus.CLOSED }
        });

        const vendor = await prisma.vendor.findUnique({ where: { id: quote.vendorId } });

        await prisma.activityLog.create({
          data: {
            userId: officer.id,
            action: "success",
            description: `Generated Purchase Order ${poNumber} and Invoice ${invoiceNumber} for ${vendor?.companyName}.`
          }
        });
        break;
      }

      case "updateInvoiceStatus": {
        const { invoiceId, status } = data; // Paid
        const nextStatus = status === "Paid" ? InvoiceStatus.PAID : InvoiceStatus.PENDING;
        await prisma.invoice.update({
          where: { invoiceNumber: invoiceId },
          data: { status: nextStatus }
        });

        const officer = await prisma.user.findFirst({ where: { role: Role.PROCUREMENT_OFFICER } });

        await prisma.activityLog.create({
          data: {
            userId: officer ? officer.id : null,
            action: "success",
            description: `Invoice ${invoiceId} status updated to ${status}.`
          }
        });
        break;
      }

      case "clearTransactions": {
        await prisma.approval.deleteMany();
        await prisma.invoice.deleteMany();
        await prisma.purchaseOrder.deleteMany();
        await prisma.quotationItem.deleteMany();
        await prisma.quotation.deleteMany();
        await prisma.rFQVendor.deleteMany();
        await prisma.rFQItem.deleteMany();
        await prisma.rFQ.deleteMany();
        await prisma.activityLog.deleteMany();

        await prisma.activityLog.create({
          data: {
            action: "warning",
            description: "All transactional records cleared."
          }
        });
        break;
      }

      case "resetDemoData": {
        // Clear all transactional and master records
        await prisma.approval.deleteMany();
        await prisma.invoice.deleteMany();
        await prisma.purchaseOrder.deleteMany();
        await prisma.quotationItem.deleteMany();
        await prisma.quotation.deleteMany();
        await prisma.rFQVendor.deleteMany();
        await prisma.rFQItem.deleteMany();
        await prisma.rFQ.deleteMany();
        await prisma.activityLog.deleteMany();
        await prisma.user.deleteMany();
        await prisma.vendor.deleteMany();

        // Seed fresh copy
        await seedDatabase(prisma);
        break;
      }

      case "addLog": {
        const { role, message, type } = data;
        const roleEnum = mapDisplayToRoleEnum(role);
        const user = await prisma.user.findFirst({
          where: { role: roleEnum }
        });

        await prisma.activityLog.create({
          data: {
            userId: user ? user.id : null,
            action: type || "info",
            description: message
          }
        });
        break;
      }

      default:
        throw new Error("Action not recognized.");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API POST Sync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
