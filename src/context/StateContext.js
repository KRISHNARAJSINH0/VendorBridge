"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext();

const INITIAL_USERS = [
  { id: "u1", name: "Sarah Jenkins", email: "admin@vendorbridge.com", role: "Admin", status: "Active" },
  { id: "u2", name: "David Miller", email: "procurement@vendorbridge.com", role: "Procurement Officer", status: "Active" },
  { id: "u3", name: "Arthur Pendelton", email: "manager@vendorbridge.com", role: "Manager", status: "Active" },
  { id: "u4", name: "Acme Corporate Sales", email: "acme@vendorbridge.com", role: "Vendor", vendorId: "v1", status: "Active" },
  { id: "u5", name: "TechSupply Logistics", email: "techsupply@vendorbridge.com", role: "Vendor", vendorId: "v2", status: "Active" },
  { id: "u6", name: "Globex Supplier Services", email: "globex@vendorbridge.com", role: "Vendor", vendorId: "v3", status: "Active" }
];

const INITIAL_VENDORS = [
  { id: "v1", name: "Acme Corp", email: "acme@vendorbridge.com", category: "IT & Hardware", status: "Active", rating: 4.8, dateAdded: "2026-01-10" },
  { id: "v2", name: "TechSupply LLC", email: "techsupply@vendorbridge.com", category: "IT & Hardware", status: "Active", rating: 4.5, dateAdded: "2026-02-14" },
  { id: "v3", name: "Globex Corp", email: "globex@vendorbridge.com", category: "Office Supplies", status: "Active", rating: 4.2, dateAdded: "2026-03-05" },
  { id: "v4", name: "Vanguard Catering", email: "vanguard@vendorbridge.com", category: "Facility Management", status: "Suspended", rating: 3.9, dateAdded: "2026-04-12" }
];

const INITIAL_CATEGORIES = ["IT & Hardware", "Office Supplies", "Facility Management", "Marketing Services"];

const INITIAL_RFQS = [
  {
    id: "RFQ-2026-001",
    title: "Office Furniture Upgrade",
    description: "Procuring ergonomic workstations and seating for the new 4th-floor layout.",
    category: "Office Supplies",
    deadline: "2026-06-20",
    status: "Active", // Active, Under Review (Selected), Approved, Rejected, Closed
    items: [
      { name: "Ergonomic Chairs", qty: 25, unit: "pcs", targetPrice: 150 },
      { name: "Adjustable Standing Desks", qty: 20, unit: "pcs", targetPrice: 350 }
    ],
    assignedVendors: ["v1", "v3"], // Acme Corp, Globex Corp
    createdDate: "2026-06-01",
    selectedQuotationId: null,
    managerRemarks: ""
  },
  {
    id: "RFQ-2026-002",
    title: "Server Room Modernization",
    description: "Upgrade the primary data center infrastructure with energy-efficient servers.",
    category: "IT & Hardware",
    deadline: "2026-06-10",
    status: "Under Review",
    items: [
      { name: "Rack-mount Server Nodes", qty: 4, unit: "units", targetPrice: 4500 },
      { name: "Cat6a Cable Spools (1000ft)", qty: 6, unit: "spools", targetPrice: 200 }
    ],
    assignedVendors: ["v1", "v2"], // Acme, TechSupply
    createdDate: "2026-06-02",
    selectedQuotationId: "Q-002",
    managerRemarks: ""
  }
];

const INITIAL_QUOTATIONS = [
  {
    id: "Q-001",
    rfqId: "RFQ-2026-002",
    vendorId: "v1",
    vendorName: "Acme Corp",
    items: [
      { name: "Rack-mount Server Nodes", price: 4700, deliveryDays: 14 },
      { name: "Cat6a Cable Spools (1000ft)", price: 210, deliveryDays: 5 }
    ],
    totalPrice: 20060,
    deliveryDays: 14,
    remarks: "Tier 1 vendor warranty included.",
    status: "Submitted", // Submitted, Selected, Rejected
    submittedDate: "2026-06-04"
  },
  {
    id: "Q-002",
    rfqId: "RFQ-2026-002",
    vendorId: "v2",
    vendorName: "TechSupply LLC",
    items: [
      { name: "Rack-mount Server Nodes", price: 4400, deliveryDays: 10 },
      { name: "Cat6a Cable Spools (1000ft)", price: 180, deliveryDays: 4 }
    ],
    totalPrice: 18680,
    deliveryDays: 10,
    remarks: "Includes full installation support.",
    status: "Selected",
    submittedDate: "2026-06-05"
  }
];

const INITIAL_POS = [
  {
    id: "PO-2026-001",
    rfqId: "RFQ-2026-002",
    quotationId: "Q-002",
    vendorId: "v2",
    vendorName: "TechSupply LLC",
    total: 18680,
    createdDate: "2026-06-05",
    status: "Approved" // Pending, Approved, Completed
  }
];

const INITIAL_INVOICES = [
  {
    id: "INV-2026-001",
    poId: "PO-2026-001",
    vendorId: "v2",
    vendorName: "TechSupply LLC",
    total: 18680,
    createdDate: "2026-06-05",
    status: "Sent" // Generated, Sent, Paid
  }
];

const INITIAL_LOGS = [
  { timestamp: "2026-06-01 10:00:00", role: "Admin", message: "User Sarah Jenkins added David Miller as Procurement Officer.", type: "success" },
  { timestamp: "2026-06-01 11:30:00", role: "Procurement Officer", message: "RFQ-2026-001 'Office Furniture Upgrade' created and assigned to Acme Corp and Globex Corp.", type: "info" },
  { timestamp: "2026-06-02 09:15:00", role: "Procurement Officer", message: "RFQ-2026-002 'Server Room Modernization' created and assigned to Acme Corp and TechSupply LLC.", type: "info" },
  { timestamp: "2026-06-04 14:20:00", role: "Vendor (Acme Corp)", message: "Quotation Q-001 submitted for RFQ-2026-002.", type: "success" },
  { timestamp: "2026-06-05 10:10:00", role: "Vendor (TechSupply LLC)", message: "Quotation Q-002 submitted for RFQ-2026-002.", type: "success" },
  { timestamp: "2026-06-05 13:45:00", role: "Procurement Officer", message: "Quotation Q-002 (TechSupply LLC) selected for RFQ-2026-002 after comparison.", type: "info" }
];

export function StateProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [rfqs, setRfqs] = useState(INITIAL_RFQS);
  const [quotations, setQuotations] = useState(INITIAL_QUOTATIONS);
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_POS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  // Load state from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("vb_currentUser");
      const storedUsers = localStorage.getItem("vb_users");
      const storedVendors = localStorage.getItem("vb_vendors");
      const storedRfqs = localStorage.getItem("vb_rfqs");
      const storedQuotations = localStorage.getItem("vb_quotations");
      const storedPOs = localStorage.getItem("vb_pos");
      const storedInvoices = localStorage.getItem("vb_invoices");
      const storedLogs = localStorage.getItem("vb_logs");
      const storedActiveView = localStorage.getItem("vb_activeView");

      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedVendors) setVendors(JSON.parse(storedVendors));
      if (storedRfqs) setRfqs(JSON.parse(storedRfqs));
      if (storedQuotations) setQuotations(JSON.parse(storedQuotations));
      if (storedPOs) setPurchaseOrders(JSON.parse(storedPOs));
      if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
      if (storedLogs) setLogs(JSON.parse(storedLogs));
      if (storedActiveView) setActiveView(JSON.parse(storedActiveView));
    }
  }, []);

  // Save to local storage when state changes
  const saveState = (key, val) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  const loginUser = (email) => {
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      throw new Error("Invalid email. Please register first.");
    }
    setCurrentUser(user);
    saveState("vb_currentUser", user);
    setActiveView("dashboard");
    saveState("vb_activeView", "dashboard");
    addLog(user.role, `${user.name} logged into the system.`, "info");
    return user;
  };

  const registerUser = (userData) => {
    const existing = users.find(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (existing) {
      throw new Error("User with this email already exists.");
    }

    const newUser = {
      id: "u" + (users.length + 1),
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email.trim(),
      role: userData.role,
      status: "Active"
    };

    let updatedUsers = [...users, newUser];

    if (userData.role === "Vendor") {
      const newVendor = {
        id: "v" + (vendors.length + 1),
        name: userData.companyName || `${userData.firstName} Supplies`,
        email: userData.email.trim(),
        category: userData.category || "IT & Hardware",
        status: "Active",
        rating: 5.0,
        dateAdded: new Date().toISOString().split("T")[0]
      };
      
      newUser.vendorId = newVendor.id;
      
      const updatedVendors = [...vendors, newVendor];
      setVendors(updatedVendors);
      saveState("vb_vendors", updatedVendors);
    }

    setUsers(updatedUsers);
    saveState("vb_users", updatedUsers);
    addLog("System", `Registered new user: ${newUser.name} as ${newUser.role}.`, "success");
    return newUser;
  };

  const logoutUser = () => {
    if (currentUser) {
      addLog(currentUser.role, `${currentUser.name} logged out.`, "info");
    }
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("vb_currentUser");
    }
  };

  const addLog = (role, message, type = "info") => {
    const timestamp = new Date().toLocaleString();
    setLogs((prev) => {
      const updated = [{ timestamp, role, message, type }, ...prev];
      saveState("vb_logs", updated);
      return updated;
    });
  };

  // 1. Admin Actions
  const createUser = (userData) => {
    const newUser = {
      id: "u" + (users.length + 1),
      status: "Active",
      ...userData
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveState("vb_users", updated);
    addLog("Admin", `Created user ${newUser.name} with role ${newUser.role}.`, "success");
  };

  const deleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    saveState("vb_users", updated);
    if (user) {
      addLog("Admin", `Deleted user ${user.name}.`, "warning");
    }
  };

  const toggleVendorStatus = (vendorId) => {
    const updated = vendors.map((v) => {
      if (v.id === vendorId) {
        const nextStatus = v.status === "Active" ? "Suspended" : "Active";
        addLog("Admin", `Changed Vendor ${v.name} status to ${nextStatus}.`, nextStatus === "Active" ? "success" : "warning");
        return { ...v, status: nextStatus };
      }
      return v;
    });
    setVendors(updated);
    saveState("vb_vendors", updated);
  };

  const addVendor = (vendorData) => {
    const newVendor = {
      id: "v" + (vendors.length + 1),
      status: "Active",
      rating: 5.0,
      dateAdded: new Date().toISOString().split("T")[0],
      ...vendorData
    };
    const updatedVendors = [...vendors, newVendor];
    setVendors(updatedVendors);
    saveState("vb_vendors", updatedVendors);

    // Also create a vendor user accounts for quick logins
    const newUser = {
      id: "u" + (users.length + 1),
      name: `${newVendor.name} Representative`,
      email: newVendor.email,
      role: "Vendor",
      vendorId: newVendor.id,
      status: "Active"
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveState("vb_users", updatedUsers);

    addLog("Procurement Officer", `Registered new vendor ${newVendor.name} in category ${newVendor.category}.`, "success");
  };

  // 2. Procurement Officer Actions
  const createRFQ = (rfqData) => {
    const newRFQ = {
      id: `RFQ-2026-00${rfqs.length + 1}`,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Active",
      selectedQuotationId: null,
      managerRemarks: "",
      ...rfqData
    };
    const updated = [newRFQ, ...rfqs];
    setRfqs(updated);
    saveState("vb_rfqs", updated);
    addLog("Procurement Officer", `Created RFQ '${newRFQ.title}' assigned to ${newRFQ.assignedVendors.length} vendors.`, "success");
  };

  const selectBestQuotation = (rfqId, quoteId) => {
    const updatedRfqs = rfqs.map((r) => {
      if (r.id === rfqId) {
        return { ...r, status: "Under Review", selectedQuotationId: quoteId };
      }
      return r;
    });
    setRfqs(updatedRfqs);
    saveState("vb_rfqs", updatedRfqs);

    const updatedQuotes = quotations.map((q) => {
      if (q.rfqId === rfqId) {
        return { ...q, status: q.id === quoteId ? "Selected" : "Rejected" };
      }
      return q;
    });
    setQuotations(updatedQuotes);
    saveState("vb_quotations", updatedQuotes);

    const selectedQuote = quotations.find((q) => q.id === quoteId);
    addLog(
      "Procurement Officer",
      `Selected quotation ${quoteId} from ${selectedQuote?.vendorName || "supplier"} for ${rfqId}. Sent to Manager for approval.`,
      "info"
    );
  };

  const generatePOAndInvoice = (rfqId, quoteId) => {
    const selectedQuote = quotations.find((q) => q.id === quoteId);
    const newPO = {
      id: `PO-2026-00${purchaseOrders.length + 1}`,
      rfqId,
      quotationId: quoteId,
      vendorId: selectedQuote?.vendorId,
      vendorName: selectedQuote?.vendorName,
      total: selectedQuote?.totalPrice || 0,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Approved"
    };

    const newInvoice = {
      id: `INV-2026-00${invoices.length + 1}`,
      poId: newPO.id,
      vendorId: selectedQuote?.vendorId,
      vendorName: selectedQuote?.vendorName,
      total: selectedQuote?.totalPrice || 0,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Sent"
    };

    const updatedPOs = [newPO, ...purchaseOrders];
    setPurchaseOrders(updatedPOs);
    saveState("vb_pos", updatedPOs);

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    saveState("vb_invoices", updatedInvoices);

    const updatedRfqs = rfqs.map((r) => {
      if (r.id === rfqId) {
        return { ...r, status: "Closed" };
      }
      return r;
    });
    setRfqs(updatedRfqs);
    saveState("vb_rfqs", updatedRfqs);

    addLog(
      "Procurement Officer",
      `Generated Purchase Order ${newPO.id} and Invoice ${newInvoice.id} for ${selectedQuote?.vendorName}.`,
      "success"
    );
  };

  // 3. Vendor Actions
  const submitQuotation = (quoteData) => {
    const newQuote = {
      id: `Q-00${quotations.length + 1}`,
      submittedDate: new Date().toISOString().split("T")[0],
      status: "Submitted",
      ...quoteData
    };
    const updated = [newQuote, ...quotations];
    setQuotations(updated);
    saveState("vb_quotations", updated);
    addLog(
      `Vendor (${quoteData.vendorName})`,
      `Submitted quotation ${newQuote.id} for RFQ ${quoteData.rfqId} with bid amount $${quoteData.totalPrice}.`,
      "success"
    );
  };

  const updateInvoiceStatus = (invoiceId, status) => {
    const updated = invoices.map((i) => {
      if (i.id === invoiceId) {
        addLog("System", `Invoice ${invoiceId} status updated to ${status}.`, "success");
        return { ...i, status };
      }
      return i;
    });
    setInvoices(updated);
    saveState("vb_invoices", updated);
  };

  // 4. Manager Actions
  const approveOrRejectRFQ = (rfqId, approvalStatus, remarks) => {
    const updatedRfqs = rfqs.map((r) => {
      if (r.id === rfqId) {
        return { ...r, status: approvalStatus, managerRemarks: remarks };
      }
      return r;
    });
    setRfqs(updatedRfqs);
    saveState("vb_rfqs", updatedRfqs);

    const selectedRFQ = rfqs.find((r) => r.id === rfqId);
    const selectedQuote = quotations.find((q) => q.id === selectedRFQ?.selectedQuotationId);

    addLog(
      "Manager",
      `Manager ${approvalStatus} procurement request for ${rfqId}. Remarks: "${remarks}"`,
      approvalStatus === "Approved" ? "success" : "warning"
    );

    if (approvalStatus === "Rejected" && selectedQuote) {
      // Revert quotation status so they can be re-evaluated
      const updatedQuotes = quotations.map((q) => {
        if (q.id === selectedQuote.id) {
          return { ...q, status: "Submitted" };
        }
        return q;
      });
      setQuotations(updatedQuotes);
      saveState("vb_quotations", updatedQuotes);
    }
  };

  const resetDemoData = () => {
    setCurrentUser(null);
    setUsers(INITIAL_USERS);
    setVendors(INITIAL_VENDORS);
    setRfqs(INITIAL_RFQS);
    setQuotations(INITIAL_QUOTATIONS);
    setPurchaseOrders(INITIAL_POS);
    setInvoices(INITIAL_INVOICES);
    setLogs(INITIAL_LOGS);

    if (typeof window !== "undefined") {
      localStorage.removeItem("vb_currentUser");
      localStorage.removeItem("vb_users");
      localStorage.removeItem("vb_vendors");
      localStorage.removeItem("vb_rfqs");
      localStorage.removeItem("vb_quotations");
      localStorage.removeItem("vb_pos");
      localStorage.removeItem("vb_invoices");
      localStorage.removeItem("vb_logs");
    }
    addLog("System", "Demo database reset to default values.", "warning");
  };

  const clearTransactions = () => {
    setRfqs([]);
    setQuotations([]);
    setPurchaseOrders([]);
    setInvoices([]);
    setLogs([]);
    if (typeof window !== "undefined") {
      localStorage.setItem("vb_rfqs", JSON.stringify([]));
      localStorage.setItem("vb_quotations", JSON.stringify([]));
      localStorage.setItem("vb_pos", JSON.stringify([]));
      localStorage.setItem("vb_invoices", JSON.stringify([]));
      localStorage.setItem("vb_logs", JSON.stringify([]));
    }
    addLog("System", "All transactional records cleared. Database is empty.", "warning");
  };

  return (
    <StateContext.Provider
      value={{
        currentUser,
        activeView,
        setActiveView,
        users,
        vendors,
        categories,
        rfqs,
        quotations,
        purchaseOrders,
        invoices,
        logs,
        loginUser,
        registerUser,
        logoutUser,
        createUser,
        deleteUser,
        toggleVendorStatus,
        addVendor,
        createRFQ,
        selectBestQuotation,
        approveOrRejectRFQ,
        generatePOAndInvoice,
        submitQuotation,
        updateInvoiceStatus,
        resetDemoData,
        clearTransactions,
        addLog
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useAppState must be used within a StateProvider");
  }
  return context;
}
