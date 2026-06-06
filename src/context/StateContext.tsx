"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

import {
  User,
  Vendor,
  RFQ,
  Quotation,
  PurchaseOrder,
  Invoice,
  ActivityLog,
} from "@/lib/types";


interface StateContextType {
  currentUser: User | null;
  activeView: string;
  setActiveView: (view: string) => void;
  users: User[];
  vendors: Vendor[];
  categories: string[];
  rfqs: RFQ[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  logs: ActivityLog[];
  loginUser: (email: string) => User;
  registerUser: (userData: any) => Promise<User | undefined>;
  logoutUser: () => void;
  createUser: (userData: any) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  toggleVendorStatus: (vendorId: string) => Promise<void>;
  addVendor: (vendorData: any) => Promise<void>;
  deleteVendor: (vendorId: string) => Promise<void>;
  updateVendor: (vendorId: string, vendorData: any) => Promise<void>;
  createRFQ: (rfqData: any) => Promise<void>;
  selectBestQuotation: (rfqId: string, quoteId: string) => Promise<void>;
  approveOrRejectRFQ: (rfqId: string, approvalStatus: string, remarks: string) => Promise<void>;
  generatePOAndInvoice: (rfqId: string, quoteId: string) => Promise<void>;
  submitQuotation: (quoteData: any) => Promise<void>;
  updateInvoiceStatus: (invoiceId: string, status: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  clearTransactions: () => Promise<void>;
  addLog: (role: string, message: string, type?: string) => Promise<void>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories] = useState<string[]>(["IT Hardware", "Office Supplies", "Furniture", "Logistics"]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

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
  const saveState = (key: string, val: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  const loginUser = (email: string): User => {
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

  const registerUser = async (userData: any): Promise<User | undefined> => {
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

    const newUser = (allData.users || []).find((u: User) => u.email.toLowerCase() === userData.email.trim().toLowerCase());
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

  const addLog = async (role: string, message: string, type: string = "info") => {
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
  const createUser = async (userData: any) => {
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

  const deleteUser = async (userId: string) => {
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

  const toggleVendorStatus = async (vendorId: string) => {
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

  const addVendor = async (vendorData: any) => {
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

  const deleteVendor = async (vendorId: string) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteVendor", data: { id: vendorId } })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateVendor = async (vendorId: string, vendorData: any) => {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateVendor", data: { id: vendorId, ...vendorData } })
      });
      const resData = await res.json();
      if (resData.error) throw new Error(resData.error);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };


  // 2. Procurement Officer Actions
  const createRFQ = async (rfqData: any) => {
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

  const selectBestQuotation = async (rfqId: string, quoteId: string) => {
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

  const generatePOAndInvoice = async (rfqId: string, quoteId: string) => {
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
  const submitQuotation = async (quoteData: any) => {
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

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
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
  const approveOrRejectRFQ = async (rfqId: string, approvalStatus: string, remarks: string) => {
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

  const handleSetActiveView = (view: string) => {
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
        deleteVendor,
        updateVendor,
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
