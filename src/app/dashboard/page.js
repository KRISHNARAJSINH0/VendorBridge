"use client";
import React, { useState } from "react";
import { useAppState } from "../../context/StateContext";
import {
  Users,
  Building2,
  FileText,
  MessageSquareQuote,
  CheckSquare,
  ShoppingCart,
  Receipt,
  BarChart3,
  ClipboardList,
  Plus,
  Trash2,
  Check,
  X,
  Eye,
  AlertTriangle,
  ArrowRight,
  Send,
  PlusCircle,
  FileSpreadsheet
} from "lucide-react";

export default function DashboardPage() {
  const {
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
    clearTransactions
  } = useAppState();

  // Active RFQ or Quotation detail view (for modals / detailed subpanels)
  const [selectedRfqId, setSelectedRfqId] = useState(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  // Form States
  // 1. User Form
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", role: "Procurement Officer" });
  // 2. Vendor Form
  const [newVendorForm, setNewVendorForm] = useState({ name: "", email: "", category: "IT & Hardware" });
  // 3. RFQ Builder Wizard State
  const [rfqWizardStep, setRfqWizardStep] = useState(1);
  const [newRfqForm, setNewRfqForm] = useState({
    title: "",
    description: "",
    category: "IT & Hardware",
    deadline: "",
    items: [{ name: "", qty: 1, unit: "pcs", targetPrice: 0 }],
    assignedVendors: []
  });
  // 4. Vendor Quotation Submission State
  const [selectedRfqForQuote, setSelectedRfqForQuote] = useState("");
  const [quoteItems, setQuoteItems] = useState([]);
  const [quoteRemarks, setQuoteRemarks] = useState("");
  // 5. Manager Remarks State
  const [managerRemarks, setManagerRemarks] = useState("");

  if (!currentUser) return null;

  const role = currentUser.role;

  // --- SUB-COMPONENT RENDERERS ---

  // 1. DASHBOARD VIEW (Overview Cards & Summaries)
  const renderDashboardOverview = () => {
    switch (role) {
      case "Admin": {
        const totalUsers = users.length;
        const totalV = vendors.length;
        const totalR = rfqs.length;
        const pendingApprovals = rfqs.filter(r => r.status === "Under Review").length;
        const posCount = purchaseOrders.length;
        const invCount = invoices.length;
        const spend = invoices.reduce((sum, inv) => sum + (inv.status === "Paid" ? inv.total : 0), 0);

        return (
          <div className="animate-fade-in">
            <div className="card-grid">
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Total Users</span>
                  <span className="stat-value">{totalUsers}</span>
                </div>
                <div className="stat-icon"><Users size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Total Vendors</span>
                  <span className="stat-value">{totalV}</span>
                </div>
                <div className="stat-icon"><Building2 size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Total RFQs</span>
                  <span className="stat-value">{totalR}</span>
                </div>
                <div className="stat-icon"><FileText size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Pending Approvals</span>
                  <span className="stat-value">{pendingApprovals}</span>
                </div>
                <div className="stat-icon" style={{ color: "var(--warning)" }}><CheckSquare size={24} /></div>
              </div>
            </div>

            <div className="card-grid">
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Purchase Orders</span>
                  <span className="stat-value">{posCount}</span>
                </div>
                <div className="stat-icon"><ShoppingCart size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Invoices Tracker</span>
                  <span className="stat-value">{invCount}</span>
                </div>
                <div className="stat-icon"><Receipt size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Paid Procurement Spend</span>
                  <span className="stat-value">${spend.toLocaleString()}</span>
                </div>
                <div className="stat-icon" style={{ color: "var(--success)" }}><BarChart3 size={24} /></div>
              </div>
            </div>

            <div className="dashboard-double-column">
              <div className="glass-panel detail-card">
                <h3>System Activities Overview</h3>
                <div className="logs-timeline" style={{ marginTop: "1rem" }}>
                  {logs.slice(0, 4).map((log, index) => (
                    <div className="log-item" key={index}>
                      <span className="log-time">{log.timestamp}</span>
                      <span className={`log-role badge badge-info`}>{log.role}</span>
                      <p className="log-text">{log.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "Procurement Officer": {
        const activeRfqs = rfqs.filter(r => r.status === "Active").length;
        const reviewRfqs = rfqs.filter(r => r.status === "Under Review").length;
        const totalQuotes = quotations.length;
        const pendingPos = purchaseOrders.filter(p => p.status === "Approved").length;
        const invoicesTotal = invoices.length;
        const totalSpent = invoices.reduce((acc, curr) => acc + curr.total, 0);

        return (
          <div className="animate-fade-in">
            <div className="card-grid">
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Active RFQs</span>
                  <span className="stat-value">{activeRfqs}</span>
                </div>
                <div className="stat-icon"><FileText size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">RFQs Under Review</span>
                  <span className="stat-value">{reviewRfqs}</span>
                </div>
                <div className="stat-icon" style={{ color: "var(--warning)" }}><CheckSquare size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Quotations Received</span>
                  <span className="stat-value">{totalQuotes}</span>
                </div>
                <div className="stat-icon"><MessageSquareQuote size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Invoices Generated</span>
                  <span className="stat-value">{invoicesTotal}</span>
                </div>
                <div className="stat-icon"><Receipt size={24} /></div>
              </div>
            </div>

            <div className="card-grid" style={{ gridTemplateColumns: "1fr 2fr" }}>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Monthly Spent Volume</span>
                  <span className="stat-value">${totalSpent.toLocaleString()}</span>
                </div>
                <div className="stat-icon" style={{ color: "var(--success)" }}><BarChart3 size={24} /></div>
              </div>
              <div className="stat-card glass-panel" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
                <span className="stat-label">Quick Actions Shortcut</span>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                  <button onClick={() => { setActiveView("rfqs"); setRfqWizardStep(1); }} className="btn btn-primary btn-sm">
                    <Plus size={16} /> Create RFQ
                  </button>
                  <button onClick={() => setActiveView("quotations")} className="btn btn-secondary btn-sm">
                    Compare Quotations
                  </button>
                  <button onClick={() => setActiveView("vendors")} className="btn btn-secondary btn-sm">
                    Register Vendor
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-panel detail-card" style={{ marginTop: "1.5rem" }}>
              <h3>Recent Assigned RFQs</h3>
              <div className="table-container" style={{ marginTop: "1rem" }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>RFQ ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfqs.slice(0, 3).map((rfq) => (
                      <tr key={rfq.id}>
                        <td>{rfq.id}</td>
                        <td>{rfq.title}</td>
                        <td>{rfq.category}</td>
                        <td>{rfq.deadline}</td>
                        <td>
                          <span className={`badge badge-${rfq.status.toLowerCase().replace(" ", "")}`}>
                            {rfq.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedRfqId(rfq.id);
                              setActiveView("quotations");
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            <Eye size={14} /> Compare
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      case "Vendor": {
        const myVendorId = currentUser.vendorId;
        const myVendor = vendors.find(v => v.id === myVendorId);
        
        // Assigned RFQs
        const assigned = rfqs.filter(r => r.assignedVendors.includes(myVendorId));
        const quotesSubmitted = quotations.filter(q => q.vendorId === myVendorId);
        const approvedQuotes = quotesSubmitted.filter(q => q.status === "Selected" || q.status === "Approved");
        const myPOsCount = purchaseOrders.filter(p => p.vendorId === myVendorId).length;
        const pendingPayments = invoices.filter(i => i.vendorId === myVendorId && i.status !== "Paid").reduce((acc, curr) => acc + curr.total, 0);

        return (
          <div className="animate-fade-in">
            <div className="card-grid">
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Assigned RFQs</span>
                  <span className="stat-value">{assigned.length}</span>
                </div>
                <div className="stat-icon"><FileText size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Submitted Quotations</span>
                  <span className="stat-value">{quotesSubmitted.length}</span>
                </div>
                <div className="stat-icon"><MessageSquareQuote size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">My Purchase Orders</span>
                  <span className="stat-value">{myPOsCount}</span>
                </div>
                <div className="stat-icon"><ShoppingCart size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Pending Payments</span>
                  <span className="stat-value">${pendingPayments.toLocaleString()}</span>
                </div>
                <div className="stat-icon" style={{ color: "var(--warning)" }}><Receipt size={24} /></div>
              </div>
            </div>

            <div className="glass-panel detail-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3>Welcome, {myVendor?.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
                    Category focus: <strong>{myVendor?.category}</strong> | Registered since: {myVendor?.dateAdded}
                  </p>
                </div>
                <span className={`badge badge-${myVendor?.status.toLowerCase()}`}>{myVendor?.status} Accounts</span>
              </div>
            </div>

            <div className="glass-panel detail-card">
              <h3>Outstanding RFQs Available for Bid</h3>
              <div className="table-container" style={{ marginTop: "1rem" }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>RFQ ID</th>
                      <th>RFQ Title</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>My Bid</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assigned.map((rfq) => {
                      const quote = quotesSubmitted.find(q => q.rfqId === rfq.id);
                      return (
                        <tr key={rfq.id}>
                          <td>{rfq.id}</td>
                          <td>{rfq.title}</td>
                          <td>{rfq.deadline}</td>
                          <td>
                            <span className={`badge badge-${rfq.status.toLowerCase().replace(" ", "")}`}>
                              {rfq.status}
                            </span>
                          </td>
                          <td>
                            {quote ? (
                              <span style={{ color: "var(--success)", fontWeight: 600 }}>
                                ${quote.totalPrice.toLocaleString()} ({quote.status})
                              </span>
                            ) : (
                              <span style={{ color: "var(--danger)" }}>No Bid Yet</span>
                            )}
                          </td>
                          <td>
                            {rfq.status === "Active" && !quote ? (
                              <button
                                onClick={() => {
                                  setSelectedRfqForQuote(rfq.id);
                                  const items = rfq.items.map(it => ({ name: it.name, qty: it.qty, unit: it.unit, targetPrice: it.targetPrice, price: 0, deliveryDays: 1 }));
                                  setQuoteItems(items);
                                  setActiveView("quotations");
                                }}
                                className="btn btn-primary btn-sm"
                              >
                                Submit Quote
                              </button>
                            ) : (
                              <button className="btn btn-secondary btn-sm" disabled>
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      case "Manager": {
        const pending = rfqs.filter(r => r.status === "Under Review");
        const approved = rfqs.filter(r => r.status === "Approved").length;
        const rejected = rfqs.filter(r => r.status === "Rejected").length;
        const totalProcured = purchaseOrders.reduce((acc, curr) => acc + curr.total, 0);

        return (
          <div className="animate-fade-in">
            <div className="card-grid">
              <div className="stat-card glass-panel" style={{ borderLeft: "4px solid var(--warning)" }}>
                <div className="stat-info">
                  <span className="stat-label">Pending Approvals</span>
                  <span className="stat-value">{pending.length}</span>
                </div>
                <div className="stat-icon" style={{ color: "var(--warning)" }}><CheckSquare size={24} /></div>
              </div>
              <div className="stat-card glass-panel" style={{ borderLeft: "4px solid var(--success)" }}>
                <div className="stat-info">
                  <span className="stat-label">Approved RFQs</span>
                  <span className="stat-value">{approved}</span>
                </div>
                <div className="stat-icon" style={{ color: "var(--success)" }}><Check size={24} /></div>
              </div>
              <div className="stat-card glass-panel" style={{ borderLeft: "4px solid var(--danger)" }}>
                <div className="stat-info">
                  <span className="stat-label">Rejected RFQs</span>
                  <span className="stat-value">{rejected}</span>
                </div>
                <div className="stat-icon" style={{ color: "var(--danger)" }}><X size={24} /></div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-label">Total Procurement Value</span>
                  <span className="stat-value">${totalProcured.toLocaleString()}</span>
                </div>
                <div className="stat-icon" style={{ color: "var(--primary)" }}><BarChart3 size={24} /></div>
              </div>
            </div>

            <div className="glass-panel detail-card">
              <h3>Action Required: Pending Approvals</h3>
              <div className="table-container" style={{ marginTop: "1rem" }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>RFQ ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Selected Bidder</th>
                      <th>Total Value</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((rfq) => {
                      const quote = quotations.find(q => q.id === rfq.selectedQuotationId);
                      return (
                        <tr key={rfq.id}>
                          <td>{rfq.id}</td>
                          <td>{rfq.title}</td>
                          <td>{rfq.category}</td>
                          <td>{quote?.vendorName || "Unknown"}</td>
                          <td>${quote?.totalPrice.toLocaleString() || "0"}</td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedRfqId(rfq.id);
                                setManagerRemarks("");
                                setActiveView("approvals");
                              }}
                              className="btn btn-primary btn-sm"
                            >
                              Review & Action
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {pending.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                          No pending approval requests. Great job!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  // 2. USER MANAGEMENT VIEW (Admin Only)
  const renderUserManagement = () => {
    return (
      <div className="animate-fade-in glass-panel detail-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h3>System Users Database</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Manage platform administrative, procurement, and supplier personnel.</p>
          </div>
          <button onClick={() => setShowCreateUserModal(true)} className="btn btn-primary">
            <Plus size={16} /> Create User
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`badge badge-${user.status.toLowerCase()}`}>{user.status}</span>
                  </td>
                  <td>
                    {user.email !== currentUser.email ? (
                      <button onClick={() => deleteUser(user.id)} className="btn btn-danger btn-sm" title="Remove user access">
                        <Trash2 size={14} /> Delete
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Current Session</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 3. VENDOR MANAGEMENT VIEW
  const renderVendorManagement = () => {
    return (
      <div className="animate-fade-in glass-panel detail-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h3>Vendor Registry</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {role === "Admin" ? "Vetting and status control for corporate suppliers." : "View active supplier directory and categories."}
            </p>
          </div>
          {role === "Procurement Officer" && (
            <button onClick={() => setShowAddVendorModal(true)} className="btn btn-primary">
              <Plus size={16} /> Add Vendor
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Company Name</th>
                <th>Corporate Email</th>
                <th>Primary Category</th>
                <th>Rating</th>
                <th>Status</th>
                {role === "Admin" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>{vendor.id}</td>
                  <td style={{ fontWeight: 600 }}>{vendor.name}</td>
                  <td>{vendor.email}</td>
                  <td>{vendor.category}</td>
                  <td style={{ color: "var(--warning)" }}>★ {vendor.rating.toFixed(1)}</td>
                  <td>
                    <span className={`badge badge-${vendor.status.toLowerCase()}`}>{vendor.status}</span>
                  </td>
                  {role === "Admin" && (
                    <td>
                      <button
                        onClick={() => toggleVendorStatus(vendor.id)}
                        className={`btn btn-sm ${vendor.status === "Active" ? "btn-danger" : "btn-success"}`}
                      >
                        {vendor.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 4. RFQ VIEW (Admin, Procurement, Vendor)
  const renderRFQView = () => {
    // 4a. Procurement Officer RFQ creation wizard
    if (role === "Procurement Officer" && rfqWizardStep > 0 && rfqWizardStep <= 3) {
      const handleAddItem = () => {
        setNewRfqForm({
          ...newRfqForm,
          items: [...newRfqForm.items, { name: "", qty: 1, unit: "pcs", targetPrice: 0 }]
        });
      };

      const handleRemoveItem = (index) => {
        const updated = newRfqForm.items.filter((_, i) => i !== index);
        setNewRfqForm({ ...newRfqForm, items: updated });
      };

      const handleItemChange = (index, field, value) => {
        const updatedItems = newRfqForm.items.map((item, i) => {
          if (i === index) {
            return { ...item, [field]: value };
          }
          return item;
        });
        setNewRfqForm({ ...newRfqForm, items: updatedItems });
      };

      const handleVendorToggle = (vendorId) => {
        const current = newRfqForm.assignedVendors;
        const updated = current.includes(vendorId)
          ? current.filter(id => id !== vendorId)
          : [...current, vendorId];
        setNewRfqForm({ ...newRfqForm, assignedVendors: updated });
      };

      const handleRfqSubmit = () => {
        if (!newRfqForm.title || !newRfqForm.deadline || newRfqForm.items.length === 0 || newRfqForm.assignedVendors.length === 0) {
          alert("Please fill out all fields, add items, and assign at least one vendor.");
          return;
        }
        createRFQ(newRfqForm);
        setRfqWizardStep(0); // Return to list view
        // Reset form
        setNewRfqForm({
          title: "",
          description: "",
          category: "IT & Hardware",
          deadline: "",
          items: [{ name: "", qty: 1, unit: "pcs", targetPrice: 0 }],
          assignedVendors: []
        });
      };

      return (
        <div className="animate-fade-in glass-panel detail-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h3>Create New Request for Quotation (RFQ)</h3>
            <button onClick={() => setRfqWizardStep(0)} className="btn btn-secondary btn-sm">Cancel</button>
          </div>

          {/* Progress Indicator */}
          <div className="steps-container" style={{ margin: "1rem auto 2.5rem auto" }}>
            <div className="step-wrapper">
              <div className={`step-node ${rfqWizardStep >= 1 ? "completed" : ""}`}>1</div>
              <span className="step-label">Basic Specs</span>
            </div>
            <div className="step-wrapper">
              <div className={`step-node ${rfqWizardStep >= 2 ? (rfqWizardStep > 2 ? "completed" : "active") : ""}`}>2</div>
              <span className="step-label">Add Items</span>
            </div>
            <div className="step-wrapper">
              <div className={`step-node ${rfqWizardStep === 3 ? "active" : ""}`}>3</div>
              <span className="step-label">Assign Suppliers</span>
            </div>
          </div>

          {/* STEP 1: basic info */}
          {rfqWizardStep === 1 && (
            <div className="animate-fade-in">
              <div className="form-group">
                <label className="form-label">RFQ Project Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newRfqForm.title}
                  onChange={(e) => setNewRfqForm({ ...newRfqForm, title: e.target.value })}
                  placeholder="e.g. Server Rack Acquisition 2026"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={newRfqForm.category}
                  onChange={(e) => setNewRfqForm({ ...newRfqForm, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Submission Deadline Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newRfqForm.deadline}
                  onChange={(e) => setNewRfqForm({ ...newRfqForm, deadline: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Procurement Scope / Description</label>
                <textarea
                  rows="4"
                  className="form-textarea"
                  value={newRfqForm.description}
                  onChange={(e) => setNewRfqForm({ ...newRfqForm, description: e.target.value })}
                  placeholder="Describe technical requirements, warranty specs, or shipment conditions..."
                ></textarea>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button onClick={() => setRfqWizardStep(2)} className="btn btn-primary" disabled={!newRfqForm.title || !newRfqForm.deadline}>
                  Continue to Items &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Items list */}
          {rfqWizardStep === 2 && (
            <div className="animate-fade-in">
              <h4>Define Procurement Line Items</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>Specify unit target prices to baseline bids.</p>
              
              {newRfqForm.items.map((item, index) => (
                <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginBottom: "1rem", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)" }}>
                  <div className="form-group" style={{ flexGrow: 3, marginBottom: 0 }}>
                    <label className="form-label">Item / Service Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      placeholder="Item name"
                    />
                  </div>
                  <div className="form-group" style={{ width: "100px", marginBottom: 0 }}>
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="form-group" style={{ width: "100px", marginBottom: 0 }}>
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                      placeholder="pcs, units, kg..."
                    />
                  </div>
                  <div className="form-group" style={{ width: "140px", marginBottom: 0 }}>
                    <label className="form-label">Target Price ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={item.targetPrice}
                      onChange={(e) => handleItemChange(index, "targetPrice", parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  {newRfqForm.items.length > 1 && (
                    <button onClick={() => handleRemoveItem(index)} className="btn btn-danger btn-sm" style={{ padding: "0.75rem" }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <button onClick={handleAddItem} className="btn btn-secondary btn-sm" style={{ marginTop: "0.5rem" }}>
                <Plus size={14} /> Add Line Item
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                <button onClick={() => setRfqWizardStep(1)} className="btn btn-secondary">
                  &larr; Back
                </button>
                <button
                  onClick={() => setRfqWizardStep(3)}
                  className="btn btn-primary"
                  disabled={newRfqForm.items.some(i => !i.name || i.targetPrice <= 0)}
                >
                  Continue to Suppliers &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: assigned vendors */}
          {rfqWizardStep === 3 && (
            <div className="animate-fade-in">
              <h4>Invite Qualified Suppliers</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>Select vendors authorized to submit bids for this contract.</p>

              <div className="vendor-selection-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", margin: "1.5rem 0" }}>
                {vendors.filter(v => v.status === "Active").map((v) => {
                  const isChecked = newRfqForm.assignedVendors.includes(v.id);
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleVendorToggle(v.id)}
                      className="glass-panel"
                      style={{
                        padding: "1rem",
                        borderRadius: "var(--radius-sm)",
                        border: isChecked ? "2px solid var(--primary)" : "1px solid var(--border-glass)",
                        cursor: "pointer",
                        background: isChecked ? "rgba(99, 102, 241, 0.08)" : "rgba(13, 20, 38, 0.4)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem"
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "white" }}>{v.name}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Category: {v.category}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--warning)" }}>★ {v.rating.toFixed(1)} Rating</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                <button onClick={() => setRfqWizardStep(2)} className="btn btn-secondary">
                  &larr; Back
                </button>
                <button
                  onClick={handleRfqSubmit}
                  className="btn btn-success"
                  disabled={newRfqForm.assignedVendors.length === 0}
                >
                  Publish RFQ &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default RFQ List Render for all roles
    return (
      <div className="animate-fade-in glass-panel detail-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h3>All Request for Quotations (RFQs)</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Track procurement requirements, bid deadlines, and statuses.</p>
          </div>
          {role === "Procurement Officer" && (
            <button onClick={() => setRfqWizardStep(1)} className="btn btn-primary">
              <Plus size={16} /> Create RFQ
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>RFQ ID</th>
                <th>RFQ Title</th>
                <th>Category</th>
                <th>Publish Date</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Supplier Invites</th>
                {role === "Vendor" && <th>My Bid</th>}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq) => {
                const quoteSubmitted = role === "Vendor" ? quotations.find(q => q.rfqId === rfq.id && q.vendorId === currentUser.vendorId) : null;
                const isAssigned = rfq.assignedVendors.includes(currentUser.vendorId);
                
                return (
                  <tr key={rfq.id}>
                    <td>{rfq.id}</td>
                    <td style={{ fontWeight: 600 }}>{rfq.title}</td>
                    <td>{rfq.category}</td>
                    <td>{rfq.createdDate}</td>
                    <td>{rfq.deadline}</td>
                    <td>
                      <span className={`badge badge-${rfq.status.toLowerCase().replace(" ", "")}`}>{rfq.status}</span>
                    </td>
                    <td>{rfq.assignedVendors.length} Suppliers</td>
                    {role === "Vendor" && (
                      <td>
                        {quoteSubmitted ? (
                          <span style={{ color: "var(--success)", fontWeight: 600 }}>Submitted (${quoteSubmitted.totalPrice.toLocaleString()})</span>
                        ) : (
                          <span style={{ color: "var(--danger)" }}>No Bid</span>
                        )}
                      </td>
                    )}
                    <td>
                      {role === "Vendor" ? (
                        rfq.status === "Active" && isAssigned && !quoteSubmitted ? (
                          <button
                            onClick={() => {
                              setSelectedRfqForQuote(rfq.id);
                              const items = rfq.items.map(it => ({ name: it.name, qty: it.qty, unit: it.unit, targetPrice: it.targetPrice, price: 0, deliveryDays: 1 }));
                              setQuoteItems(items);
                              setActiveView("quotations");
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            Bid Now
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedRfqId(rfq.id);
                              // We can open a details modal
                            }}
                            className="btn btn-secondary btn-sm"
                            disabled
                          >
                            Details
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRfqId(rfq.id);
                            setActiveView("quotations");
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={14} /> Bids
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 5. QUOTATIONS VIEW (Side-by-side comparison, and submission form)
  const renderQuotationsView = () => {
    // 5a. Vendor Quotation Submission Screen
    if (role === "Vendor") {
      const myVendorId = currentUser.vendorId;
      const myVendorName = vendors.find(v => v.id === myVendorId)?.name || "Vendor";

      const handleQuoteItemChange = (index, field, value) => {
        const updated = quoteItems.map((item, i) => {
          if (i === index) {
            return { ...item, [field]: value };
          }
          return item;
        });
        setQuoteItems(updated);
      };

      const handleQuoteSubmit = () => {
        if (quoteItems.some(i => i.price <= 0)) {
          alert("Please specify a unit bid price greater than $0 for all line items.");
          return;
        }
        
        const totalSum = quoteItems.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
        const maxDelivery = Math.max(...quoteItems.map(i => i.deliveryDays));

        const quoteData = {
          rfqId: selectedRfqForQuote,
          vendorId: myVendorId,
          vendorName: myVendorName,
          items: quoteItems.map(it => ({ name: it.name, price: it.price, deliveryDays: it.deliveryDays })),
          totalPrice: totalSum,
          deliveryDays: maxDelivery,
          remarks: quoteRemarks
        };

        submitQuotation(quoteData);
        setSelectedRfqForQuote("");
        setQuoteItems([]);
        setQuoteRemarks("");
        setActiveView("dashboard");
      };

      // Get assigned RFQs
      const myRFQs = rfqs.filter(r => r.assignedVendors.includes(myVendorId) && r.status === "Active");

      return (
        <div className="animate-fade-in glass-panel detail-card">
          <h3>Submit Procurement Bid (Quotation)</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Provide binding cost rates and delivery periods for line items.</p>

          {!selectedRfqForQuote ? (
            <div className="form-group">
              <label className="form-label">Select Active Assigned RFQ</label>
              <select
                className="form-select"
                onChange={(e) => {
                  const rId = e.target.value;
                  setSelectedRfqForQuote(rId);
                  const selectedR = rfqs.find(r => r.id === rId);
                  if (selectedR) {
                    const items = selectedR.items.map(it => ({ name: it.name, qty: it.qty, unit: it.unit, targetPrice: it.targetPrice, price: 0, deliveryDays: 1 }));
                    setQuoteItems(items);
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>-- Select RFQ Contract --</option>
                {myRFQs.map((r) => (
                  <option key={r.id} value={r.id}>{r.id} - {r.title}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", border: "1px solid var(--border-glass)" }}>
                <div>
                  <h4 style={{ color: "white" }}>RFQ Contract: {selectedRfqForQuote}</h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{rfqs.find(r => r.id === selectedRfqForQuote)?.description}</p>
                </div>
                <button onClick={() => setSelectedRfqForQuote("")} className="btn btn-secondary btn-sm">Switch RFQ</button>
              </div>

              <h4>Line Items Price Quote</h4>
              {quoteItems.map((item, index) => (
                <div key={index} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end", padding: "1rem", borderBottom: "1px solid var(--border-glass)" }}>
                  <div style={{ flexGrow: 2 }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "white" }}>{item.name}</span>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Requirement: {item.qty} {item.unit} | Target unit price: ${item.targetPrice}</p>
                  </div>
                  <div className="form-group" style={{ width: "180px", marginBottom: 0 }}>
                    <label className="form-label">My Unit Price ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={item.price}
                      onChange={(e) => handleQuoteItemChange(index, "price", parseFloat(e.target.value) || 0)}
                      min="0.1"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group" style={{ width: "180px", marginBottom: 0 }}>
                    <label className="form-label">Delivery (Days)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={item.deliveryDays}
                      onChange={(e) => handleQuoteItemChange(index, "deliveryDays", parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                </div>
              ))}

              <div className="form-group" style={{ marginTop: "1.5rem" }}>
                <label className="form-label">Proposal Remarks</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  value={quoteRemarks}
                  onChange={(e) => setQuoteRemarks(e.target.value)}
                  placeholder="Mention quality guarantees, shipping methods, or terms details..."
                ></textarea>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                <button onClick={() => { setSelectedRfqForQuote(""); setQuoteItems([]); }} className="btn btn-secondary">
                  Back
                </button>
                <button onClick={handleQuoteSubmit} className="btn btn-primary">
                  Submit Binding Proposal
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 5b. Procurement Officer / Admin side-by-side comparison matrix
    const selectedRFQ = selectedRfqId ? rfqs.find(r => r.id === selectedRfqId) : rfqs.find(r => r.status === "Active" || r.status === "Under Review");
    const rfqQuotes = quotations.filter(q => q.rfqId === (selectedRFQ?.id || ""));

    // Simple automatic recommender (Find lowest total bid)
    let recommendedQuoteId = null;
    if (rfqQuotes.length > 0) {
      const sorted = [...rfqQuotes].sort((a, b) => a.totalPrice - b.totalPrice);
      recommendedQuoteId = sorted[0].id;
    }

    return (
      <div className="animate-fade-in">
        <div className="glass-panel detail-card" style={{ marginBottom: "1.5rem" }}>
          <div className="form-group">
            <label className="form-label">Select RFQ to Compare Quotations</label>
            <select
              className="form-select"
              value={selectedRFQ?.id || ""}
              onChange={(e) => setSelectedRfqId(e.target.value)}
            >
              <option value="" disabled>-- Select RFQ Project --</option>
              {rfqs.map((r) => (
                <option key={r.id} value={r.id}>{r.id} - {r.title} ({r.status})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedRFQ && (
          <div className="glass-panel detail-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <h3>Quotation Comparison Matrix</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>RFQ: <strong>{selectedRFQ.title}</strong> | Categories: {selectedRFQ.category}</p>
              </div>
              <span className={`badge badge-${selectedRFQ.status.toLowerCase().replace(" ", "")}`}>{selectedRFQ.status}</span>
            </div>

            {rfqQuotes.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                <AlertTriangle size={32} style={{ color: "var(--warning)", marginBottom: "0.75rem" }} />
                <p>No bids have been submitted by vendors for this RFQ yet.</p>
              </div>
            ) : (
              <div>
                <div className="comparison-matrix">
                  {rfqQuotes.map((quote) => {
                    const isRec = quote.id === recommendedQuoteId;
                    const isSelected = quote.status === "Selected";
                    
                    return (
                      <div key={quote.id} className={`vendor-column ${isRec ? "recommended" : ""}`}>
                        {isRec && <div className="recommended-badge">Best Value</div>}
                        
                        <div className="column-header">
                          <div>
                            <h4 style={{ color: "white" }}>{quote.vendorName}</h4>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Quote ID: {quote.id}</span>
                          </div>
                          <span className={`badge badge-${quote.status.toLowerCase()}`}>{quote.status}</span>
                        </div>

                        <div className="comparison-body" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Delivery Term:</span>
                            <span style={{ fontWeight: 600, color: "white" }}>{quote.deliveryDays} Days</span>
                          </div>

                          <div style={{ margin: "0.5rem 0" }}>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Line Price Breakdown:</p>
                            {quote.items.map((it, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.15rem 0" }}>
                                <span>{it.name}:</span>
                                <span style={{ fontWeight: 500 }}>${it.price}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-glass)", paddingTop: "0.5rem" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "white" }}>Total Contract Bid:</span>
                            <span style={{ fontWeight: 700, fontSize: "1.1rem", color: isRec ? "var(--success)" : "white" }}>
                              ${quote.totalPrice.toLocaleString()}
                            </span>
                          </div>

                          {quote.remarks && (
                            <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.5rem", borderRadius: "4px", fontSize: "0.8rem", color: "var(--text-muted)", border: "1px dashed rgba(255,255,255,0.05)" }}>
                              <strong>Remarks:</strong> {quote.remarks}
                            </div>
                          )}
                        </div>

                        <div className="comparison-footer" style={{ marginTop: "auto", paddingTop: "1rem" }}>
                          {role === "Procurement Officer" && selectedRFQ.status === "Active" && (
                            <button
                              onClick={() => selectBestQuotation(selectedRFQ.id, quote.id)}
                              className="btn btn-primary"
                              style={{ width: "100%" }}
                            >
                              Select Supplier &rarr;
                            </button>
                          )}
                          {isSelected && (
                            <div style={{ textAlign: "center", color: "var(--warning)", fontSize: "0.82rem", fontWeight: 600 }}>
                              Selected (Pending Mgr Review)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 6. APPROVALS WORKFLOW VIEW (Manager evaluation / Procurement tracking)
  const renderApprovalsView = () => {
    // 6a. Manager Review Detail Screen
    if (role === "Manager") {
      const selectedRFQ = selectedRfqId ? rfqs.find(r => r.id === selectedRfqId) : rfqs.find(r => r.status === "Under Review");
      const quote = quotations.find(q => q.id === selectedRFQ?.selectedQuotationId);

      const handleApprovalDecision = (status) => {
        if (!selectedRFQ) return;
        approveOrRejectRFQ(selectedRFQ.id, status, managerRemarks);
        setManagerRemarks("");
        setSelectedRfqId(null);
        setActiveView("dashboard");
      };

      return (
        <div className="animate-fade-in">
          <div className="glass-panel detail-card" style={{ marginBottom: "1.5rem" }}>
            <div className="form-group">
              <label className="form-label">Select Selected Contract for Review</label>
              <select
                className="form-select"
                value={selectedRFQ?.id || ""}
                onChange={(e) => setSelectedRfqId(e.target.value)}
              >
                <option value="" disabled>-- Select Contract Review --</option>
                {rfqs.filter(r => r.status === "Under Review" || r.status === "Approved" || r.status === "Rejected").map((r) => (
                  <option key={r.id} value={r.id}>{r.id} - {r.title} ({r.status})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedRFQ ? (
            <div className="glass-panel detail-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <h3>Procurement Workflow Assessment</h3>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Requested by David Miller (Procurement)</span>
                </div>
                <span className={`badge badge-${selectedRFQ.status.toLowerCase().replace(" ", "")}`}>{selectedRFQ.status}</span>
              </div>

              {/* Progress Flow */}
              <div className="steps-container" style={{ margin: "1rem auto 2.5rem auto" }}>
                <div className="step-wrapper">
                  <div className="step-node completed">1</div>
                  <span className="step-label">Draft Specs</span>
                </div>
                <div className="step-wrapper">
                  <div className="step-node completed">2</div>
                  <span className="step-label">Bidding Closed</span>
                </div>
                <div className="step-wrapper">
                  <div className={`step-node ${selectedRFQ.status === "Under Review" ? "active" : "completed"}`}>3</div>
                  <span className="step-label">Mgr Valuation</span>
                </div>
                <div className="step-wrapper">
                  <div className={`step-node ${selectedRFQ.status === "Approved" ? "completed" : ""}`}>4</div>
                  <span className="step-label">PO Generated</span>
                </div>
              </div>

              <div className="approval-details-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1.5rem" }}>
                <div className="details-col" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h4 style={{ color: "white", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>Contract Specifications</h4>
                  <p><strong>Title:</strong> {selectedRFQ.title}</p>
                  <p><strong>Scope:</strong> {selectedRFQ.description}</p>
                  <p><strong>Category:</strong> {selectedRFQ.category}</p>
                  <p><strong>Items list:</strong></p>
                  <ul style={{ paddingLeft: "1.25rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {selectedRFQ.items.map((it, idx) => (
                      <li key={idx}>{it.name} - Qty: {it.qty} {it.unit} (Target Unit Price: ${it.targetPrice})</li>
                    ))}
                  </ul>
                </div>

                <div className="details-col" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h4 style={{ color: "white", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>Selected Supplier Bid</h4>
                  {quote ? (
                    <div style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.15)", padding: "1.25rem", borderRadius: "var(--radius-sm)" }}>
                      <p><strong>Supplier:</strong> {quote.vendorName}</p>
                      <p><strong>Proposed Delivery:</strong> {quote.deliveryDays} Days</p>
                      <p><strong>Supplier Remarks:</strong> {quote.remarks || "No remarks"}</p>
                      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.75rem" }}>
                        <span style={{ fontWeight: 600 }}>Total Price:</span>
                        <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--success)" }}>${quote.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "var(--danger)" }}>No quotation selected. Please contact procurement officer.</p>
                  )}

                  {selectedRFQ.status === "Under Review" && (
                    <div className="form-group" style={{ marginTop: "1rem" }}>
                      <label className="form-label">Review Assessment / Remarks</label>
                      <textarea
                        rows="3"
                        className="form-textarea"
                        value={managerRemarks}
                        onChange={(e) => setManagerRemarks(e.target.value)}
                        placeholder="Write approval guidelines or rejection reasons here..."
                      ></textarea>
                      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button onClick={() => handleApprovalDecision("Approved")} className="btn btn-success" style={{ flexGrow: 1 }}>
                          <Check size={16} /> Approve Contract
                        </button>
                        <button onClick={() => handleApprovalDecision("Rejected")} className="btn btn-danger" style={{ flexGrow: 1 }}>
                          <X size={16} /> Reject Bid
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRFQ.status !== "Under Review" && (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", padding: "1rem", borderRadius: "4px", marginTop: "1rem" }}>
                      <h5 style={{ color: "white", marginBottom: "0.5rem" }}>Historical Manager Action Remarks:</h5>
                      <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
                        "{selectedRFQ.managerRemarks || "No remarks added."}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel detail-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
              <Check size={32} style={{ color: "var(--success)", marginBottom: "0.75rem" }} />
              <p>All procurement tasks have been reviewed.</p>
            </div>
          )}
        </div>
      );
    }

    // Default tracking screen (Admin, Procurement)
    return (
      <div className="animate-fade-in glass-panel detail-card">
        <h3>Procurement Approvals Tracking</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Monitor compliance workflow statuses for contracted bids.</p>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>RFQ ID</th>
                <th>RFQ Title</th>
                <th>Selected Supplier</th>
                <th>Contract Amount</th>
                <th>Approver Decision</th>
                <th>Historical Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.filter(r => r.selectedQuotationId !== null).map((rfq) => {
                const quote = quotations.find(q => q.id === rfq.selectedQuotationId);
                return (
                  <tr key={rfq.id}>
                    <td>{rfq.id}</td>
                    <td style={{ fontWeight: 600 }}>{rfq.title}</td>
                    <td>{quote?.vendorName || "Unknown"}</td>
                    <td>${quote?.totalPrice.toLocaleString() || "0"}</td>
                    <td>
                      <span className={`badge badge-${rfq.status.toLowerCase().replace(" ", "")}`}>{rfq.status}</span>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      {rfq.managerRemarks || "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 7. PURCHASE ORDERS VIEW
  const renderPurchaseOrdersView = () => {
    // Check if we can generate a PO (RFQ is approved)
    const approvedRFQs = rfqs.filter(r => r.status === "Approved");

    return (
      <div className="animate-fade-in">
        {role === "Procurement Officer" && approvedRFQs.length > 0 && (
          <div className="glass-panel detail-card" style={{ marginBottom: "1.5rem" }}>
            <h4>Contracts Approved for PO Issuance</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1rem" }}>
              Manager approved contracts require formal Purchase Orders.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {approvedRFQs.map((rfq) => {
                const quote = quotations.find(q => q.id === rfq.selectedQuotationId);
                return (
                  <div key={rfq.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", padding: "0.75rem 1.25rem", borderRadius: "var(--radius-sm)" }}>
                    <div>
                      <span style={{ fontWeight: 600, color: "white" }}>{rfq.id} - {rfq.title}</span>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginLeft: "1.5rem" }}>
                        Selected Vendor: <strong>{quote?.vendorName}</strong> | Total Value: <strong>${quote?.totalPrice.toLocaleString()}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => generatePOAndInvoice(rfq.id, rfq.selectedQuotationId)}
                      className="btn btn-success btn-sm"
                    >
                      Generate PO & Invoice
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="glass-panel detail-card">
          <h3>Purchase Orders Directory</h3>
          <div className="table-container" style={{ marginTop: "1rem" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>RFQ ID</th>
                  <th>Supplier Name</th>
                  <th>Total Contract</th>
                  <th>Issue Date</th>
                  <th>Execution Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders
                  .filter(po => role === "Vendor" ? po.vendorId === currentUser.vendorId : true)
                  .map((po) => (
                    <tr key={po.id}>
                      <td style={{ fontWeight: 600 }}>{po.id}</td>
                      <td>{po.rfqId}</td>
                      <td>{po.vendorName}</td>
                      <td style={{ fontWeight: 600 }}>${po.total.toLocaleString()}</td>
                      <td>{po.createdDate}</td>
                      <td>
                        <span className="badge badge-active">{po.status}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedRfqId(po.rfqId);
                            setActiveView("invoices");
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <FileSpreadsheet size={14} /> View Sheets
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 8. INVOICES VIEW
  const renderInvoicesView = () => {
    // If a specific PO / RFQ is selected, render the high-fidelity invoice sheet layout
    const activeRfq = selectedRfqId ? rfqs.find(r => r.id === selectedRfqId) : null;
    const activePO = activeRfq ? purchaseOrders.find(p => p.rfqId === activeRfq.id) : null;
    const activeQuote = activeRfq ? quotations.find(q => q.id === activeRfq.selectedQuotationId) : null;
    const activeInvoice = activePO ? invoices.find(i => i.poId === activePO.id) : null;

    if (activeRfq && activePO && activeInvoice && activeQuote) {
      return (
        <div className="animate-fade-in">
          <button onClick={() => setSelectedRfqId(null)} className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }}>
            &larr; Back to Invoices List
          </button>

          {/* Wireframe Screen 9 Style Sheet */}
          <div className="glass-panel detail-card invoice-sheet" style={{ padding: "2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ color: "white" }}>Purchase Order & Invoice</h2>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>PO Reference: <strong>{activePO.id}</strong> | Invoice ID: <strong>{activeInvoice.id}</strong></span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`badge badge-${activeInvoice.status.toLowerCase().replace(" ", "")}`} style={{ fontSize: "0.9rem", padding: "0.4rem 1rem" }}>
                  Invoice {activeInvoice.status}
                </span>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>Generated: {activeInvoice.createdDate}</p>
              </div>
            </div>

            <div className="invoice-meta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Bill To:</p>
                <h4 style={{ color: "white", marginTop: "0.25rem" }}>VendorBridge Corp.</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                  Procurement Operations HQ<br />
                  100 Tech Blvd, Suite 200<br />
                  procurement@vendorbridge.com
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Supplier / Ship From:</p>
                <h4 style={{ color: "white", marginTop: "0.25rem" }}>{activeInvoice.vendorName}</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                  Registered Corporate Vendor<br />
                  Vetted Category: {activeRfq.category}<br />
                  Payment Terms: Net 30
                </p>
              </div>
            </div>

            <h4 style={{ color: "white", marginBottom: "0.75rem" }}>Procured Line Items</h4>
            <div className="table-container" style={{ marginBottom: "1.5rem" }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Ordered Qty</th>
                    <th>Unit</th>
                    <th>Unit Bid Rate</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRfq.items.map((item, index) => {
                    const quoteItem = activeQuote.items.find(qi => qi.name === item.name);
                    const bidPrice = quoteItem?.price || item.targetPrice;
                    return (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>{item.unit}</td>
                        <td>${bidPrice.toLocaleString()}</td>
                        <td style={{ fontWeight: 600 }}>${(item.qty * bidPrice).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    <td colSpan="3"></td>
                    <td style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.85rem" }}>Aggregate Contract:</td>
                    <td style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--success)" }}>${activeInvoice.total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "1.5rem" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "400px" }}>
                Notice: This purchase order and simulated billing statement are binding under the VendorBridge terms. Reconciliations are audited under logs.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={() => alert("Printing PO/Invoice layout...")} className="btn btn-secondary btn-sm">Download PDF Document</button>
                
                {role === "Vendor" && activeInvoice.status === "Sent" && (
                  <button onClick={() => updateInvoiceStatus(activeInvoice.id, "Paid")} className="btn btn-success btn-sm">
                    Acknowledge & Mark Paid
                  </button>
                )}

                {role === "Procurement Officer" && activeInvoice.status === "Sent" && (
                  <button onClick={() => alert(`Sending invoice email to ${activeInvoice.vendorName}...`)} className="btn btn-primary btn-sm">
                    Email Invoice to Vendor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default Invoices List
    return (
      <div className="animate-fade-in glass-panel detail-card">
        <h3>Invoices Database & Tracking</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          Cross-reference purchase order payouts, tax billing, and vendor payment statuses.
        </p>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>PO Number</th>
                <th>Supplier Company</th>
                <th>Billing total</th>
                <th>Billing Date</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices
                .filter(inv => role === "Vendor" ? inv.vendorId === currentUser.vendorId : true)
                .map((inv) => {
                  const rfq = rfqs.find(r => purchaseOrders.find(p => p.id === inv.poId)?.rfqId === r.id);
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.id}</td>
                      <td>{inv.poId}</td>
                      <td>{inv.vendorName}</td>
                      <td style={{ fontWeight: 600 }}>${inv.total.toLocaleString()}</td>
                      <td>{inv.createdDate}</td>
                      <td>
                        <span className={`badge badge-${inv.status.toLowerCase().replace(" ", "")}`}>{inv.status}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            if (rfq) {
                              setSelectedRfqId(rfq.id);
                            }
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          View Document
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 9. REPORTS & ANALYTICS VIEW
  const renderReportsView = () => {
    // Mock analytics metrics
    const totalSpent = invoices.reduce((acc, curr) => acc + curr.total, 0);
    const categorySpend = rfqs.reduce((acc, curr) => {
      const po = purchaseOrders.find(p => p.rfqId === curr.id);
      if (po) {
        acc[curr.category] = (acc[curr.category] || 0) + po.total;
      }
      return acc;
    }, {});

    return (
      <div className="animate-fade-in">
        <div className="card-grid">
          <div className="stat-card glass-panel">
            <div className="stat-info">
              <span className="stat-label">Cumulative Procurement Value</span>
              <span className="stat-value">${totalSpent.toLocaleString()}</span>
            </div>
            <div className="stat-icon" style={{ color: "var(--success)" }}><BarChart3 size={24} /></div>
          </div>
          <div className="stat-card glass-panel">
            <div className="stat-info">
              <span className="stat-label">Active Categories Vetted</span>
              <span className="stat-value">{categories.length}</span>
            </div>
            <div className="stat-icon"><Building2 size={24} /></div>
          </div>
          <div className="stat-card glass-panel">
            <div className="stat-info">
              <span className="stat-label">Total Successful RFQs</span>
              <span className="stat-value">{rfqs.filter(r => r.status === "Closed").length}</span>
            </div>
            <div className="stat-icon"><FileText size={24} /></div>
          </div>
        </div>

        {/* Custom SVG Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", margin: "1.5rem 0" }}>
          <div className="glass-panel detail-card">
            <h3>Spend Breakdown by Category</h3>
            <div style={{ height: "220px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "1rem" }}>
              {categories.map((cat) => {
                const value = categorySpend[cat] || 0;
                const pct = totalSpent > 0 ? (value / totalSpent) * 100 : 0;
                return (
                  <div key={cat} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "70px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>${value.toLocaleString()}</span>
                    <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "4px 4px 0 0", height: "120px", position: "relative" }}>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, var(--primary), var(--secondary))", height: `${pct}%`, borderRadius: "4px 4px 0 0", transition: "height 0.8s ease" }}></div>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", height: "30px", overflow: "hidden" }}>{cat}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel detail-card">
            <h3>Monthly Procurement Allocation (2026)</h3>
            <div style={{ height: "220px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "1rem" }}>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, idx) => {
                // Mock seasonal allocation values
                const monthlySpends = [12000, 15000, 8000, 22000, 19000, totalSpent];
                const value = monthlySpends[idx];
                const max = Math.max(...monthlySpends);
                const pct = max > 0 ? (value / max) * 100 : 0;
                return (
                  <div key={m} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "50px" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>${value > 1000 ? `${(value/1000).toFixed(0)}k` : value}</span>
                    <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "4px 4px 0 0", height: "120px", position: "relative" }}>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, var(--accent), var(--primary))", height: `${pct}%`, borderRadius: "4px 4px 0 0" }}></div>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-panel detail-card">
          <h3>Top-Performing Vetted Suppliers</h3>
          <div className="table-container" style={{ marginTop: "1rem" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Core Category</th>
                  <th>Audit Rating</th>
                  <th>PO Payout Contracts</th>
                  <th>Contract Fulfillment Rate</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => {
                  const contractsCount = purchaseOrders.filter(p => p.vendorId === v.id).length;
                  return (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.name}</td>
                      <td>{v.category}</td>
                      <td style={{ color: "var(--warning)" }}>★ {v.rating.toFixed(1)}</td>
                      <td>{contractsCount} Contracts</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ flexGrow: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden", minWidth: "100px" }}>
                            <div style={{ background: "var(--success)", height: "100%", width: v.status === "Active" ? "98%" : "0%" }}></div>
                          </div>
                          <span style={{ fontSize: "0.8rem" }}>{v.status === "Active" ? "98%" : "0%"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 10. AUDIT LOGS VIEW
  const renderAuditLogs = () => {
    return (
      <div className="animate-fade-in glass-panel detail-card">
        <h3>System Operations Audit Logs</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Immutable chronological trail of blockchain-like procurement actions.</p>

        <div className="logs-timeline" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {logs.map((log, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "1.5rem",
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.01)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-glass)",
                alignItems: "center"
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace", width: "160px", flexShrink: 0 }}>
                {log.timestamp}
              </span>
              <span className={`badge badge-${log.type}`} style={{ width: "160px", textAlign: "center", flexShrink: 0 }}>
                {log.role}
              </span>
              <p style={{ flexGrow: 1, fontSize: "0.9rem", color: "white" }}>
                {log.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 11. SETTINGS / PROFILE VIEW
  const renderSettingsView = () => {
    return (
      <div className="animate-fade-in glass-panel detail-card">
        <h3>Workspace Parameters & Integration Settings</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Configure procurement thresholds, webhook triggers, and compliance parameters.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "600px" }}>
          <div className="form-group">
            <label className="form-label">Procurement Manager Approval Threshold ($)</label>
            <input type="number" className="form-input" defaultValue="5000" />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Contracts exceeding this value mandate multi-signature approval.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Vetting Auto-Renewal Period</label>
            <select className="form-select" defaultValue="365">
              <option value="90">90 Days</option>
              <option value="180">180 Days</option>
              <option value="365">1 Year (Default)</option>
            </select>
          </div>

          <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "1rem" }}>
            <input type="checkbox" id="email-triggers" defaultChecked style={{ width: "20px", height: "20px" }} />
            <label htmlFor="email-triggers" className="form-label" style={{ marginBottom: 0, cursor: "pointer" }}>
              Enable automatic supplier email notifications on RFQ issuance
            </label>
          </div>

          <button onClick={() => alert("Settings saved successfully.")} className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: "1rem" }}>
            Save Configurations
          </button>

          <div style={{ borderTop: "1px dashed var(--border-glass)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
            <h4 style={{ color: "white", marginBottom: "0.5rem" }}>Database Maintenance</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1rem" }}>
              Clear out all sample transactions (RFQs, quotations, POs, invoices, logs) to test the application in a clean "Real Data" mode.
            </p>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete all transaction records? This will clear all RFQs, Bids, POs, Invoices, and Logs.")) {
                  clearTransactions();
                  alert("All transaction records have been cleared.");
                }
              }}
              className="btn btn-danger btn-sm"
            >
              Clear All Transactions
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVendorProfile = () => {
    const myVendor = vendors.find(v => v.id === currentUser.vendorId);
    return (
      <div className="animate-fade-in glass-panel detail-card">
        <h3>Supplier Profile</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Verify your company credentials and categories registered for bidding.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
          <div style={{ textAlign: "center", borderRight: "1px solid var(--border-glass)", paddingRight: "2rem" }}>
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyCenter: "center", margin: "0 auto 1rem auto", color: "white", fontSize: "2.5rem", fontWeight: 700, justifyContent: "center" }}>
              {myVendor?.name.charAt(0)}
            </div>
            <h4 style={{ color: "white" }}>{myVendor?.name}</h4>
            <span className={`badge badge-${myVendor?.status.toLowerCase()}`} style={{ marginTop: "0.5rem" }}>{myVendor?.status}</span>
            <p style={{ color: "var(--warning)", marginTop: "0.5rem" }}>★ {myVendor?.rating.toFixed(1)} / 5.0 rating</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Registered Corporate Name</label>
              <input type="text" className="form-input" value={myVendor?.name} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Notification Email Address</label>
              <input type="text" className="form-input" value={myVendor?.email} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Bidding Category Auth</label>
              <input type="text" className="form-input" value={myVendor?.category} readOnly />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- VIEW ROUTER ---
  const renderViewContent = () => {
    switch (activeView) {
      case "dashboard":
        return renderDashboardOverview();
      case "users":
        return renderUserManagement();
      case "vendors":
        return renderVendorManagement();
      case "rfqs":
        return renderRFQView();
      case "quotations":
        return renderQuotationsView();
      case "approvals":
        return renderApprovalsView();
      case "pos":
        return renderPurchaseOrdersView();
      case "invoices":
        return renderInvoicesView();
      case "reports":
        return renderReportsView();
      case "logs":
        return renderAuditLogs();
      case "settings":
        return renderSettingsView();
      case "profile":
        return renderVendorProfile();
      default:
        return renderDashboardOverview();
    }
  };

  // --- MODAL HANDLERS ---
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;
    createUser(newUserForm);
    setNewUserForm({ name: "", email: "", role: "Procurement Officer" });
    setShowCreateUserModal(false);
  };

  const handleAddVendor = (e) => {
    e.preventDefault();
    if (!newVendorForm.name || !newVendorForm.email) return;
    addVendor(newVendorForm);
    setNewVendorForm({ name: "", email: "", category: "IT & Hardware" });
    setShowAddVendorModal(false);
  };

  return (
    <div className="view-wrapper animate-fade-in">
      {renderViewContent()}

      {/* 1. Create User Modal */}
      {showCreateUserModal && (
        <div className="modal-overlay" onClick={() => setShowCreateUserModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateUserModal(false)}><X size={20} /></button>
            <h3>Create System User Account</h3>
            <form onSubmit={handleCreateUser} style={{ marginTop: "1.5rem" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. John Miller"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="john.miller@vendorbridge.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role Assignment</label>
                <select
                  className="form-select"
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                >
                  <option value="Admin">Admin</option>
                  <option value="Procurement Officer">Procurement Officer</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Create Account &rarr;
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="modal-overlay" onClick={() => setShowAddVendorModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddVendorModal(false)}><X size={20} /></button>
            <h3>Register Corporate Supplier</h3>
            <form onSubmit={handleAddVendor} style={{ marginTop: "1.5rem" }}>
              <div className="form-group">
                <label className="form-label">Company / Vendor Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={newVendorForm.name}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, name: e.target.value })}
                  placeholder="e.g. TechCorp Solutions Ltd"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Corporate Contact Email</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={newVendorForm.email}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, email: e.target.value })}
                  placeholder="sales@techcorp.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Auth Category Vetting</label>
                <select
                  className="form-select"
                  value={newVendorForm.category}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Register & Onboard Vendor &rarr;
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
