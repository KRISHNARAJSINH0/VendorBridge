"use client";
import React from "react";
import { useAppState } from "../context/StateContext";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  FileText,
  MessageSquareQuote,
  CheckSquare,
  ShoppingCart,
  Receipt,
  BarChart3,
  ClipboardList,
  Settings,
  LogOut,
  User
} from "lucide-react";

export default function Sidebar({ activeView, setActiveView }) {
  const { currentUser, logoutUser } = useAppState();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Get menu items based on role
  const getMenuItems = () => {
    switch (role) {
      case "Admin":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "users", label: "User Management", icon: Users },
          { id: "vendors", label: "Vendor Management", icon: Building2 },
          { id: "rfqs", label: "RFQs", icon: FileText },
          { id: "quotations", label: "Quotations", icon: MessageSquareQuote },
          { id: "approvals", label: "Approvals", icon: CheckSquare },
          { id: "pos", label: "Purchase Orders", icon: ShoppingCart },
          { id: "invoices", label: "Invoices", icon: Receipt },
          { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
          { id: "logs", label: "Audit Logs", icon: ClipboardList },
          { id: "settings", label: "Settings", icon: Settings }
        ];
      case "Procurement Officer":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "vendors", label: "Vendors", icon: Building2 },
          { id: "rfqs", label: "RFQs", icon: FileText },
          { id: "quotations", label: "Quotations", icon: MessageSquareQuote },
          { id: "approvals", label: "Approvals", icon: CheckSquare },
          { id: "pos", label: "Purchase Orders", icon: ShoppingCart },
          { id: "invoices", label: "Invoices", icon: Receipt },
          { id: "reports", label: "Reports", icon: BarChart3 },
          { id: "logs", label: "Activity Logs", icon: ClipboardList }
        ];
      case "Vendor":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "rfqs", label: "RFQs", icon: FileText },
          { id: "quotations", label: "Quotations", icon: MessageSquareQuote },
          { id: "pos", label: "Purchase Orders", icon: ShoppingCart },
          { id: "invoices", label: "Invoices", icon: Receipt },
          { id: "profile", label: "My Profile", icon: User }
        ];
      case "Manager":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "approvals", label: "Approvals", icon: CheckSquare },
          { id: "rfqs", label: "RFQ Review", icon: FileText },
          { id: "quotations", label: "Quotation Review", icon: MessageSquareQuote },
          { id: "reports", label: "Reports", icon: BarChart3 },
          { id: "logs", label: "Activity Logs", icon: ClipboardList }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/";
  };

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-brand">
        <ShieldCheck size={28} className="brand-icon" />
        <span className="brand-name">VendorBridge</span>
      </div>

      <div className="sidebar-user-badge">
        <div className="user-avatar">
          {currentUser.name.charAt(0)}
        </div>
        <div className="user-info-text">
          <p className="user-name">{currentUser.name}</p>
          <p className="user-role">{role}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`nav-button ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn nav-button">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
