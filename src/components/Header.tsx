"use client";
import React, { useState } from "react";
import { useAppState } from "../context/StateContext";
import { Bell, RefreshCw, UserCheck } from "lucide-react";

interface HeaderProps {
  activeView: string;
}

export default function Header({ activeView }: HeaderProps) {
  const { currentUser, users, loginUser, resetDemoData } = useAppState();

  if (!currentUser) return null;

  // Find user options for the role switcher
  const adminUser = users.find((u) => u.role === "Admin");
  const procurementUser = users.find((u) => u.role === "Procurement Officer");
  const managerUser = users.find((u) => u.role === "Manager");
  const vendorUser = users.find((u) => u.role === "Vendor" && u.vendorId === "vvnd_techcore"); // TechCore by default
  const vendorUserAcme = users.find((u) => u.role === "Vendor" && u.vendorId === "vvnd_infrasupp"); // InfraSupp

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    let targetUser;
    if (role === "Admin") targetUser = adminUser;
    else if (role === "Procurement Officer") targetUser = procurementUser;
    else if (role === "Manager") targetUser = managerUser;
    else if (role === "Vendor") targetUser = vendorUser;
    else if (role === "VendorAcme") targetUser = vendorUserAcme;

    if (targetUser) {
      loginUser(targetUser.email);
    }
  };

  const getTitle = () => {
    switch (activeView) {
      case "dashboard":
        return `${currentUser.role} Control Panel`;
      case "users":
        return "User Management & System Access";
      case "vendors":
        return "Supplier Network & Directories";
      case "rfqs":
        return "Request for Quotations (RFQs)";
      case "quotations":
        return "Received Quotations & Bidding";
      case "approvals":
        return "Procurement Review & Approvals";
      case "pos":
        return "Purchase Orders (POs)";
      case "invoices":
        return "Invoice Tracking & Reconciliation";
      case "reports":
        return "Reports & Procurement Insights";
      case "logs":
        return "System Audit Trail";
      case "settings":
        return "System Settings";
      case "profile":
        return "My Company Profile";
      default:
        return "VendorBridge Portal";
    }
  };

  return (
    <header className="header-container glass-panel">
      <div className="header-title-section">
        <h1>{getTitle()}</h1>
        <p className="header-subtitle">Simulate real-time procurement operations</p>
      </div>

      <div className="header-actions">
        {/* Sandbox Role Switcher */}
        <div className="sandbox-widget">
          <UserCheck size={16} className="sandbox-icon" />
          <span className="sandbox-label">Sandbox:</span>
          <select
            value={currentUser.role === "Vendor" ? (currentUser.vendorId === "vvnd_infrasupp" ? "VendorAcme" : "Vendor") : currentUser.role}
            onChange={handleRoleChange}
            className="sandbox-select"
          >
            <option value="Admin">Admin</option>
            <option value="Procurement Officer">Procurement Officer</option>
            <option value="Manager">Manager / Approver</option>
            <option value="Vendor">Vendor (TechCore)</option>
            <option value="VendorAcme">Vendor (Infra Supplies)</option>
          </select>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={resetDemoData}
          className="reset-btn"
          title="Reset simulated database to defaults"
        >
          <RefreshCw size={16} />
          <span>Reset Demo</span>
        </button>

        {/* Notifications Icon */}
        <div className="notifications-badge">
          <Bell size={18} />
          <span className="badge-count">3</span>
        </div>
      </div>
    </header>
  );
}
