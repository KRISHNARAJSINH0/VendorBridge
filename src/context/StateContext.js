"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext();

export function StateProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState(["IT & Hardware", "Office Supplies", "Facility Management", "Marketing Services"]);
  const [rfqs, setRfqs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [logs, setLogs] = useState([]);

  // Fetch all master and transactional data from the database
  const fetchAllData = async () => {
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setUsers(data.users || []);
      setVendors(data.vendors || []);
      setRfqs(data.rfqs || []);
      setQuotations(data.quotations || []);
      setPurchaseOrders(data.purchaseOrders || []);
      setInvoices(data.invoices || []);
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to sync database state:", err);
    }
  };

  // On mount: load persistent sessions and sync with database
  useEffect(() => {
    fetchAllData();

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("vb_currentUser");
      const storedActiveView = localStorage.getItem("vb_activeView");

      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem("vb_currentUser");
        }
      }
      if (storedActiveView) {
        try {
          setActiveView(JSON.parse(storedActiveView));
        } catch (e) {
          localStorage.removeItem("vb_activeView");
        }
      }
    }
  }, []);

  // Save persistent parameters
  const saveState = (key, val) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  const loginUser = (email) => {
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
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

  const registerUser = async (userData) => {
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "registerUser", data: userData })
    });
    const resData = await res.json();
    if (resData.error) throw new Error(resData.error);

    // Re-fetch all data to load the newly registered user and vendor
    const resAll = await fetch("/api/sync");
    const allData = await resAll.json();
    setUsers(allData.users || []);
    setVendors(allData.vendors || []);

    const newUser = (allData.users || []).find((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (newUser) {
      setCurrentUser(newUser);
      saveState("vb_currentUser", newUser);
    }
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

  const addLog = async (role, message, type = "info") => {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addLog", data: { role, message, type } })
      });
      // Re-fetch to update logs panel
      await fetchAllData();
    } catch (err) {
      console.error("Failed to write log:", err);
    }
  };

  // 1. Admin Actions
  const createUser = async (userData) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createUser", data: userData })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteUser", data: { id: userId } })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVendorStatus = async (vendorId) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleVendorStatus", data: { id: vendorId } })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const addVendor = async (vendorData) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addVendor", data: vendorData })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Procurement Officer Actions
  const createRFQ = async (rfqData) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createRFQ", data: rfqData })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const selectBestQuotation = async (rfqId, quoteId) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "selectBestQuotation", data: { rfqId, quotationId: quoteId } })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const generatePOAndInvoice = async (rfqId, quoteId) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generatePOAndInvoice", data: { rfqId, quotationId: quoteId } })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Vendor Actions
  const submitQuotation = async (quoteData) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submitQuotation", data: quoteData })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateInvoiceStatus = async (invoiceId, status) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateInvoiceStatus", data: { invoiceId, status } })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Manager Actions
  const approveOrRejectRFQ = async (rfqId, approvalStatus, remarks) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approveOrRejectRFQ", data: { rfqId, status: approvalStatus, remarks } })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetDemoData = async () => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetDemoData" })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const clearTransactions = async () => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clearTransactions" })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetActiveView = (view) => {
    setActiveView(view);
    saveState("vb_activeView", view);
  };

  return (
    <StateContext.Provider
      value={{
        currentUser,
        activeView,
        setActiveView: handleSetActiveView,
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
