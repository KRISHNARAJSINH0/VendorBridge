import { NextResponse } from "next/server";
import getPrisma from "../../../lib/prisma";

// Seed logic for clean environments
async function seedDatabase(prisma) {
  // 1. Create Roles
  const adminRole = await prisma.role.create({ data: { name: "Admin" } });
  const procRole = await prisma.role.create({ data: { name: "Procurement Officer" } });
  const mgrRole = await prisma.role.create({ data: { name: "Manager" } });
  const vendorRole = await prisma.role.create({ data: { name: "Vendor" } });

  // 2. Create Default Vendors
  const acmeVendor = await prisma.vendor.create({
    data: {
      companyName: "Acme Corp",
      email: "acme@vendorbridge.com",
      category: "IT & Hardware",
      rating: 4.8,
      status: "ACTIVE",
      vendorCode: "VND-ACME"
    }
  });

  const techSupplyVendor = await prisma.vendor.create({
    data: {
      companyName: "TechSupply LLC",
      email: "techsupply@vendorbridge.com",
      category: "IT & Hardware",
      rating: 4.5,
      status: "ACTIVE",
      vendorCode: "VND-TECH"
    }
  });

  const globexVendor = await prisma.vendor.create({
    data: {
      companyName: "Globex Corp",
      email: "globex@vendorbridge.com",
      category: "Office Supplies",
      rating: 4.2,
      status: "ACTIVE",
      vendorCode: "VND-GLOBEX"
    }
  });

  await prisma.vendor.create({
    data: {
      companyName: "Vanguard Catering",
      email: "vanguard@vendorbridge.com",
      category: "Facility Management",
      rating: 3.9,
      status: "SUSPENDED",
      vendorCode: "VND-VANGUARD"
    }
  });

  // 3. Create Default Users
  await prisma.user.create({
    data: {
      fullName: "Sarah Jenkins",
      email: "admin@vendorbridge.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      roleId: adminRole.id
    }
  });

  const procurementUser = await prisma.user.create({
    data: {
      fullName: "David Miller",
      email: "procurement@vendorbridge.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      roleId: procRole.id
    }
  });

  await prisma.user.create({
    data: {
      fullName: "Arthur Pendelton",
      email: "manager@vendorbridge.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      roleId: mgrRole.id
    }
  });

  // Create Users for Vendors
  await prisma.user.create({
    data: {
      fullName: "Acme Corporate Sales Representative",
      email: "acme@vendorbridge.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      roleId: vendorRole.id
    }
  });

  await prisma.user.create({
    data: {
      fullName: "TechSupply Logistics Representative",
      email: "techsupply@vendorbridge.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      roleId: vendorRole.id
    }
  });

  await prisma.user.create({
    data: {
      fullName: "Globex Supplier Services Representative",
      email: "globex@vendorbridge.com",
      passwordHash: "PBKDF2_MOCK_HASH",
      roleId: vendorRole.id
    }
  });

  // 4. Create initial RFQs & Bids to demonstrate the workflow out-of-the-box
  const rfq1 = await prisma.rFQ.create({
    data: {
      rfqNumber: "RFQ-2026-001",
      title: "Office Furniture Upgrade",
      description: "Procuring ergonomic workstations and seating for the new 4th-floor layout.",
      deadline: new Date("2026-06-20"),
      status: "Active",
      createdById: procurementUser.id
    }
  });

  await prisma.rFQItem.createMany({
    data: [
      { rfqId: rfq1.id, itemName: "Ergonomic Chairs", quantity: 25, unit: "pcs", description: "Office Supplies" },
      { rfqId: rfq1.id, itemName: "Adjustable Standing Desks", quantity: 20, unit: "pcs", description: "Office Supplies" }
    ]
  });

  await prisma.rFQVendor.createMany({
    data: [
      { rfqId: rfq1.id, vendorId: acmeVendor.id, status: "INVITED" },
      { rfqId: rfq1.id, vendorId: globexVendor.id, status: "INVITED" }
    ]
  });

  const rfq2 = await prisma.rFQ.create({
    data: {
      rfqNumber: "RFQ-2026-002",
      title: "Server Room Modernization",
      description: "Upgrade the primary data center infrastructure with energy-efficient servers.",
      deadline: new Date("2026-06-10"),
      status: "Under Review",
      createdById: procurementUser.id
    }
  });

  await prisma.rFQItem.createMany({
    data: [
      { rfqId: rfq2.id, itemName: "Rack-mount Server Nodes", quantity: 4, unit: "units", description: "IT & Hardware" },
      { rfqId: rfq2.id, itemName: "Cat6a Cable Spools (1000ft)", quantity: 6, unit: "spools", description: "IT & Hardware" }
    ]
  });

  await prisma.rFQVendor.createMany({
    data: [
      { rfqId: rfq2.id, vendorId: acmeVendor.id, status: "INVITED" },
      { rfqId: rfq2.id, vendorId: techSupplyVendor.id, status: "INVITED" }
    ]
  });

  // Create Quotes
  const quote1 = await prisma.quotation.create({
    data: {
      quotationNumber: "Q-001",
      rfqId: rfq2.id,
      vendorId: acmeVendor.id,
      totalAmount: 20060.00,
      deliveryDays: 14,
      notes: "Tier 1 vendor warranty included.",
      status: "Submitted",
      submittedAt: new Date("2026-06-04")
    }
  });

  await prisma.quotationItem.createMany({
    data: [
      { quotationId: quote1.id, itemName: "Rack-mount Server Nodes", quantity: 4, unitPrice: 4700, subtotal: 18800 },
      { quotationId: quote1.id, itemName: "Cat6a Cable Spools (1000ft)", quantity: 6, unitPrice: 210, subtotal: 1260 }
    ]
  });

  const quote2 = await prisma.quotation.create({
    data: {
      quotationNumber: "Q-002",
      rfqId: rfq2.id,
      vendorId: techSupplyVendor.id,
      totalAmount: 18680.00,
      deliveryDays: 10,
      notes: "Includes full installation support.",
      status: "Selected",
      submittedAt: new Date("2026-06-05")
    }
  });

  await prisma.quotationItem.createMany({
    data: [
      { quotationId: quote2.id, itemName: "Rack-mount Server Nodes", quantity: 4, unitPrice: 4400, subtotal: 17600 },
      { quotationId: quote2.id, itemName: "Cat6a Cable Spools (1000ft)", quantity: 6, unitPrice: 180, subtotal: 1080 }
    ]
  });

  // Create PO
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-001",
      quotationId: quote2.id,
      vendorId: techSupplyVendor.id,
      createdById: procurementUser.id,
      totalAmount: 18680.00,
      status: "Approved"
    }
  });

  await prisma.purchaseOrderItem.createMany({
    data: [
      { purchaseOrderId: po1.id, itemName: "Rack-mount Server Nodes", quantity: 4, unitPrice: 4400, total: 17600 },
      { purchaseOrderId: po1.id, itemName: "Cat6a Cable Spools (1000ft)", quantity: 6, unitPrice: 180, total: 1080 }
    ]
  });

  // Create Invoice
  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-001",
      purchaseOrderId: po1.id,
      vendorId: techSupplyVendor.id,
      subtotal: 18680.00,
      grandTotal: 18680.00,
      status: "GENERATED",
      invoiceDate: new Date("2026-06-05")
    }
  });

  // Seed default Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { userId: procurementUser.id, action: "success", description: "User Sarah Jenkins added David Miller as Procurement Officer.", createdAt: new Date("2026-06-01T10:00:00Z") },
      { userId: procurementUser.id, action: "info", description: "RFQ-2026-001 'Office Furniture Upgrade' created and assigned to Acme Corp and Globex Corp.", createdAt: new Date("2026-06-01T11:30:00Z") },
      { userId: procurementUser.id, action: "info", description: "RFQ-2026-002 'Server Room Modernization' created and assigned to Acme Corp and TechSupply LLC.", createdAt: new Date("2026-06-02T09:15:00Z") },
      { action: "success", description: "Quotation Q-001 submitted for RFQ-2026-002.", createdAt: new Date("2026-06-04T14:20:00Z") },
      { action: "success", description: "Quotation Q-002 submitted for RFQ-2026-002.", createdAt: new Date("2026-06-05T10:10:00Z") },
      { userId: procurementUser.id, action: "info", description: "Quotation Q-002 (TechSupply LLC) selected for RFQ-2026-002 after comparison.", createdAt: new Date("2026-06-05T13:45:00Z") }
    ]
  });
}

export async function GET() {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Prisma client not available in edge runtime" }, { status: 500 });
  }

  try {
    const roleCount = await prisma.role.count();
    if (roleCount === 0) {
      await seedDatabase(prisma);
    }

    // Query all entities from the Neon database
    const roles = await prisma.role.findMany();
    const vendors = await prisma.vendor.findMany({
      orderBy: { id: "asc" }
    });
    const usersRaw = await prisma.user.findMany({
      include: { role: true },
      orderBy: { id: "asc" }
    });

    // Map users to UI format
    const users = usersRaw.map((u) => {
      const v = vendors.find((vend) => vend.email === u.email);
      return {
        id: "u" + u.id,
        name: u.fullName,
        email: u.email,
        role: u.role.name,
        status: u.isActive ? "Active" : "Suspended",
        vendorId: v ? "v" + v.id : null
      };
    });

    // Map vendors to UI format
    const mappedVendors = vendors.map((v) => ({
      id: "v" + v.id,
      name: v.companyName,
      email: v.email || "",
      category: v.category || "IT & Hardware",
      status: v.status === "ACTIVE" ? "Active" : "Suspended",
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
      return {
        id: q.quotationNumber,
        rfqId: rfqMatch ? rfqMatch.rfqNumber : "Unknown",
        vendorId: "v" + q.vendorId,
        vendorName: q.vendor.companyName,
        totalPrice: Number(q.totalAmount || 0),
        deliveryDays: q.deliveryDays || 30,
        remarks: q.notes || "",
        status: q.status || "Submitted",
        submittedDate: q.submittedAt ? q.submittedAt.toISOString().split("T")[0] : q.createdAt.toISOString().split("T")[0],
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
      status: po.status || "Approved"
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
      status: inv.status === "GENERATED" ? "Sent" : inv.status === "PAID" ? "Paid" : "Sent"
    }));

    // Fetch Logs
    const logsRaw = await prisma.activityLog.findMany({
      include: {
        user: {
          include: { role: true }
        }
      },
      orderBy: { id: "desc" },
      take: 50
    });

    const logs = logsRaw.map((log) => ({
      timestamp: log.createdAt.toISOString().replace("T", " ").split(".")[0],
      role: log.user?.role.name || "System",
      message: log.description || "",
      type: log.action || "info"
    }));

    // Build the mapped RFQs
    const rfqs = rfqsRaw.map((r) => {
      // Find selected quotation ID if any
      const selectedQuote = quotationsRaw.find((q) => q.rfqId === r.id && (q.status === "Selected" || q.status === "Approved" || q.status === "Closed"));
      
      return {
        id: r.rfqNumber,
        title: r.title,
        description: r.description || "",
        category: r.items[0]?.description || "IT & Hardware",
        deadline: r.deadline ? r.deadline.toISOString().split("T")[0] : "",
        status: r.status || "Active",
        items: r.items.map((it) => ({
          name: it.itemName,
          qty: Number(it.quantity),
          unit: it.unit || "pcs",
          targetPrice: 0
        })),
        assignedVendors: r.rfqVendors.map((rv) => "v" + rv.vendorId),
        selectedQuotationId: selectedQuote ? selectedQuote.quotationNumber : null,
        managerRemarks: "" // dynamically resolved later
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
      categories: ["IT & Hardware", "Office Supplies", "Facility Management", "Marketing Services"],
      rfqs,
      quotations,
      purchaseOrders,
      invoices,
      logs
    });
  } catch (err) {
    console.error("API GET Sync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Prisma client not available in edge runtime" }, { status: 500 });
  }

  try {
    const { action, data } = await req.json();

    switch (action) {
      case "registerUser": {
        const { firstName, fullName, lastName, email, role, companyName, category } = data;
        const roleRecord = await prisma.role.findFirst({ where: { name: role } });
        if (!roleRecord) throw new Error("Role " + role + " not found in database.");

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new Error("User with this email already exists.");

        // Create User
        const user = await prisma.user.create({
          data: {
            fullName: fullName || `${firstName} ${lastName}`,
            email,
            passwordHash: "PBKDF2_MOCK_HASH",
            roleId: roleRecord.id
          }
        });

        // If Role is Vendor, create Vendor
        if (role === "Vendor") {
          await prisma.vendor.create({
            data: {
              companyName: companyName || `${firstName} Supplies`,
              email,
              category: category || "IT & Hardware",
              status: "ACTIVE",
              vendorCode: "VND-" + Math.floor(1000 + Math.random() * 9000)
            }
          });
        }

        // Add Log
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: "success",
            description: `Registered new user: ${user.fullName} as ${role}.`
          }
        });
        break;
      }

      case "createUser": {
        const { name, email, role } = data;
        const roleRecord = await prisma.role.findFirst({ where: { name: role } });
        if (!roleRecord) throw new Error("Role " + role + " not found.");

        const user = await prisma.user.create({
          data: {
            fullName: name,
            email,
            passwordHash: "PBKDF2_MOCK_HASH",
            roleId: roleRecord.id
          }
        });

        await prisma.activityLog.create({
          data: {
            action: "success",
            description: `Created user ${user.fullName} with role ${role}.`
          }
        });
        break;
      }

      case "deleteUser": {
        const { id } = data;
        const dbId = parseInt(id.replace("u", ""));
        const user = await prisma.user.findUnique({ where: { id: dbId } });
        if (user) {
          await prisma.user.delete({ where: { id: dbId } });
          await prisma.activityLog.create({
            data: {
              action: "warning",
              description: `Deleted user ${user.fullName}.`
            }
          });
        }
        break;
      }

      case "toggleVendorStatus": {
        const { id } = data;
        const dbId = parseInt(id.replace("v", ""));
        const vendor = await prisma.vendor.findUnique({ where: { id: dbId } });
        if (vendor) {
          const nextStatus = vendor.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
          await prisma.vendor.update({
            where: { id: dbId },
            data: { status: nextStatus }
          });
          await prisma.activityLog.create({
            data: {
              action: nextStatus === "ACTIVE" ? "success" : "warning",
              description: `Changed Vendor ${vendor.companyName} status to ${nextStatus === "ACTIVE" ? "Active" : "Suspended"}.`
            }
          });
        }
        break;
      }

      case "addVendor": {
        const { name, email, category } = data;
        const vendorRole = await prisma.role.findFirst({ where: { name: "Vendor" } });

        const vendor = await prisma.vendor.create({
          data: {
            companyName: name,
            email,
            category,
            status: "ACTIVE",
            vendorCode: "VND-" + Math.floor(1000 + Math.random() * 9000)
          }
        });

        const user = await prisma.user.create({
          data: {
            fullName: `${name} Representative`,
            email,
            passwordHash: "PBKDF2_MOCK_HASH",
            roleId: vendorRole.id
          }
        });

        await prisma.activityLog.create({
          data: {
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

        const rfq = await prisma.rFQ.create({
          data: {
            rfqNumber,
            title,
            description,
            deadline: deadline ? new Date(deadline) : null,
            status: "Active"
          }
        });

        // Insert line items
        for (const it of items) {
          await prisma.rFQItem.create({
            data: {
              rfqId: rfq.id,
              itemName: it.name,
              quantity: Number(it.qty),
              unit: it.unit || "pcs",
              description: category // Category stored in line description
            }
          });
        }

        // Assigned vendors
        for (const vId of assignedVendors) {
          const dbVendorId = parseInt(vId.replace("v", ""));
          await prisma.rFQVendor.create({
            data: {
              rfqId: rfq.id,
              vendorId: dbVendorId,
              status: "INVITED"
            }
          });
        }

        await prisma.activityLog.create({
          data: {
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

        const dbVendorId = parseInt(vendorId.replace("v", ""));
        const vendor = await prisma.vendor.findUnique({ where: { id: dbVendorId } });

        const count = await prisma.quotation.count();
        const quotationNumber = `Q-00${count + 1}`;

        const quote = await prisma.quotation.create({
          data: {
            quotationNumber,
            rfqId: rfqRecord.id,
            vendorId: dbVendorId,
            totalAmount: Number(totalPrice),
            deliveryDays: Number(deliveryDays),
            notes: remarks,
            status: "Submitted",
            submittedAt: new Date()
          }
        });

        for (const it of items) {
          await prisma.quotationItem.create({
            data: {
              quotationId: quote.id,
              itemName: it.name,
              quantity: 1, // Mock qty
              unitPrice: Number(it.price),
              subtotal: Number(it.price)
            }
          });
        }

        await prisma.activityLog.create({
          data: {
            action: "success",
            description: `Vendor (${vendor?.companyName}) submitted quotation ${quotationNumber} for RFQ ${rfqId}.`
          }
        });
        break;
      }

      case "selectBestQuotation": {
        const { rfqId, quotationId } = data;
        const rfqRecord = await prisma.rFQ.findUnique({ where: { rfqNumber: rfqId } });

        // Update selected quotation status to Selected
        const selectedQuote = await prisma.quotation.update({
          where: { quotationNumber: quotationId },
          data: { status: "Selected" }
        });

        // Reject other quotations for this RFQ
        await prisma.quotation.updateMany({
          where: {
            rfqId: rfqRecord.id,
            NOT: { quotationNumber: quotationId }
          },
          data: { status: "Rejected" }
        });

        // Set RFQ status to Under Review
        await prisma.rFQ.update({
          where: { id: rfqRecord.id },
          data: { status: "Under Review" }
        });

        const vendor = await prisma.vendor.findUnique({ where: { id: selectedQuote.vendorId } });

        await prisma.activityLog.create({
          data: {
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

        const selectedQuote = rfqRecord.quotations.find((q) => q.status === "Selected");
        if (!selectedQuote) throw new Error("No quotation currently selected for this RFQ.");

        const manager = await prisma.user.findFirst({
          where: { role: { name: "Manager" } }
        });

        // Create approval audit trail
        await prisma.approval.create({
          data: {
            quotationId: selectedQuote.id,
            managerId: manager ? manager.id : 3,
            status: status.toUpperCase(),
            remarks,
            approvedAt: new Date()
          }
        });

        // Update RFQ status
        await prisma.rFQ.update({
          where: { id: rfqRecord.id },
          data: { status }
        });

        // Update selected quote status
        await prisma.quotation.update({
          where: { id: selectedQuote.id },
          data: { status }
        });

        if (status === "Rejected") {
          // Reset other quotes back to Submitted so they can be re-evaluated
          await prisma.quotation.updateMany({
            where: { rfqId: rfqRecord.id },
            data: { status: "Submitted" }
          });
        }

        await prisma.activityLog.create({
          data: {
            action: status === "Approved" ? "success" : "warning",
            description: `Manager ${status} procurement request for ${rfqId}. Remarks: "${remarks}"`
          }
        });
        break;
      }

      case "generatePOAndInvoice": {
        const { rfqId, quotationId } = data;
        const rfqRecord = await prisma.rFQ.findUnique({ where: { rfqNumber: rfqId } });
        const quote = await prisma.quotation.findUnique({ where: { quotationNumber: quotationId } });

        const poCount = await prisma.purchaseOrder.count();
        const poNumber = `PO-2026-00${poCount + 1}`;

        const invoiceCount = await prisma.invoice.count();
        const invoiceNumber = `INV-2026-00${invoiceCount + 1}`;

        // Create PO
        const po = await prisma.purchaseOrder.create({
          data: {
            poNumber,
            quotationId: quote.id,
            vendorId: quote.vendorId,
            totalAmount: quote.totalAmount,
            status: "Approved"
          }
        });

        // Create Invoice
        await prisma.invoice.create({
          data: {
            invoiceNumber,
            purchaseOrderId: po.id,
            vendorId: quote.vendorId,
            subtotal: quote.totalAmount,
            grandTotal: quote.totalAmount,
            status: "GENERATED",
            invoiceDate: new Date()
          }
        });

        // Close RFQ
        await prisma.rFQ.update({
          where: { id: rfqRecord.id },
          data: { status: "Closed" }
        });

        const vendor = await prisma.vendor.findUnique({ where: { id: quote.vendorId } });

        await prisma.activityLog.create({
          data: {
            action: "success",
            description: `Generated Purchase Order ${poNumber} and Invoice ${invoiceNumber} for ${vendor?.companyName}.`
          }
        });
        break;
      }

      case "updateInvoiceStatus": {
        const { invoiceId, status } = data; // Paid
        await prisma.invoice.update({
          where: { invoiceNumber: invoiceId },
          data: { status: status === "Paid" ? "PAID" : "GENERATED" }
        });

        await prisma.activityLog.create({
          data: {
            action: "success",
            description: `Invoice ${invoiceId} status updated to ${status}.`
          }
        });
        break;
      }

      case "clearTransactions": {
        await prisma.approval.deleteMany();
        await prisma.invoice.deleteMany();
        await prisma.purchaseOrderItem.deleteMany();
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
        await prisma.purchaseOrderItem.deleteMany();
        await prisma.purchaseOrder.deleteMany();
        await prisma.quotationItem.deleteMany();
        await prisma.quotation.deleteMany();
        await prisma.rFQVendor.deleteMany();
        await prisma.rFQItem.deleteMany();
        await prisma.rFQ.deleteMany();
        await prisma.activityLog.deleteMany();
        await prisma.user.deleteMany();
        await prisma.vendor.deleteMany();
        await prisma.role.deleteMany();

        // Seed fresh copy
        await seedDatabase(prisma);
        break;
      }

      case "addLog": {
        const { role, message, type } = data;
        const user = await prisma.user.findFirst({
          where: { role: { name: role } }
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
  } catch (err) {
    console.error("API POST Sync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
