"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "../context/StateContext";
import { ShieldCheck, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { currentUser, loginUser, registerUser, users } = useAppState();
  const router = useRouter();

  // Tab State: 'signin' or 'signup'
  const [activeTab, setActiveTab] = useState("signin");

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInError, setSignInError] = useState("");

  // Sign Up Form State
  const [signUpForm, setSignUpForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Procurement Officer",
    companyName: "",
    category: "IT & Hardware"
  });
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState("");

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // Sign In Submit
  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setSignInError("");
    try {
      if (!signInEmail) {
        setSignInError("Please enter your email address.");
        return;
      }
      loginUser(signInEmail);
      router.push("/dashboard");
    } catch (err) {
      setSignInError(err.message || "Invalid login email.");
    }
  };

  // Sign Up Submit
  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setSignUpError("");
    setSignUpSuccess("");
    try {
      if (!signUpForm.firstName || !signUpForm.lastName || !signUpForm.email) {
        setSignUpError("Please fill out all required fields.");
        return;
      }
      // Register
      const newUser = registerUser(signUpForm);
      setSignUpSuccess(`Account created successfully! Logging you in...`);
      // Auto Login
      setTimeout(() => {
        loginUser(newUser.email);
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setSignUpError(err.message || "Registration failed.");
    }
  };

  // Quick Switch Shortcut Pills
  const handleShortcutClick = (email) => {
    setSignInEmail(email);
    setSignInError("");
    try {
      loginUser(email);
      router.push("/dashboard");
    } catch (err) {
      setSignInError(err.message);
    }
  };

  return (
    <main className="login-page-container">
      <div className="login-bg-overlay"></div>

      <div className="login-content-box">
        {/* Brand Header */}
        <header className="login-header">
          <div className="login-logo-circle">
            <ShieldCheck size={40} className="login-logo-icon" />
          </div>
          <h1>VendorBridge</h1>
          <p className="subtitle">Enterprise Procurement Operations & Vetted Supplier Network</p>
        </header>

        {/* Auth Panel Box */}
        <div className="glass-panel auth-panel-wrapper">
          <div className="auth-tabs-header">
            <button
              onClick={() => { setActiveTab("signin"); setSignInError(""); }}
              className={`auth-tab-btn ${activeTab === "signin" ? "active" : ""}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab("signup"); setSignUpError(""); }}
              className={`auth-tab-btn ${activeTab === "signup" ? "active" : ""}`}
            >
              Create Account
            </button>
          </div>

          {/* Tab 1: SIGN IN */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignInSubmit} className="animate-fade-in">
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Log into your VendorBridge portal account using your registered corporate email.
              </p>

              {signInError && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "var(--danger-bg)", color: "var(--danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <AlertCircle size={18} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{signInError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="e.g. procurement@vendorbridge.com"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                <LogIn size={18} /> Sign In &rarr;
              </button>
            </form>
          )}

          {/* Tab 2: SIGN UP */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignUpSubmit} className="animate-fade-in">
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Register a new profile to participate in bidding, RFQ management, and approvals.
              </p>

              {signUpError && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "var(--danger-bg)", color: "var(--danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <AlertCircle size={18} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{signUpError}</span>
                </div>
              )}

              {signUpSuccess && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "var(--success-bg)", color: "var(--success)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <ShieldCheck size={18} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{signUpSuccess}</span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={signUpForm.firstName}
                    onChange={(e) => setSignUpForm({ ...signUpForm, firstName: e.target.value })}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={signUpForm.lastName}
                    onChange={(e) => setSignUpForm({ ...signUpForm, lastName: e.target.value })}
                    placeholder="Miller"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                  placeholder="john.miller@vendorbridge.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">System Role Access</label>
                <select
                  className="form-select"
                  value={signUpForm.role}
                  onChange={(e) => setSignUpForm({ ...signUpForm, role: e.target.value })}
                >
                  <option value="Admin">Administrator</option>
                  <option value="Procurement Officer">Procurement Officer</option>
                  <option value="Manager">Manager / Approver</option>
                  <option value="Vendor">Corporate Vendor (Supplier)</option>
                </select>
              </div>

              {/* Dynamic Vendor Form Fields */}
              {signUpForm.role === "Vendor" && (
                <div className="animate-fade-in" style={{ background: "rgba(255,255,255,0.02)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)", marginBottom: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signUpForm.companyName}
                      onChange={(e) => setSignUpForm({ ...signUpForm, companyName: e.target.value })}
                      placeholder="e.g. Miller Supplies Ltd"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Vetted Category</label>
                    <select
                      className="form-select"
                      value={signUpForm.category}
                      onChange={(e) => setSignUpForm({ ...signUpForm, category: e.target.value })}
                    >
                      <option value="IT & Hardware">IT & Hardware</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Facility Management">Facility Management</option>
                      <option value="Marketing Services">Marketing Services</option>
                    </select>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                <UserPlus size={18} /> Register Profile &rarr;
              </button>
            </form>
          )}

          {/* Sandbox Quick Shortcuts */}
          <div className="sandbox-shortcuts-panel">
            <h4 style={{ color: "white", fontSize: "0.9rem", marginBottom: "0.25rem", fontWeight: 600 }}>
              Quick Bypasses (Sandbox Seed Accounts)
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
              Click any profile to log in instantly and test the procurement workflows.
            </p>
            <div className="shortcuts-grid">
              <button onClick={() => handleShortcutClick("admin@vendorbridge.com")} className="shortcut-pill">
                Admin
              </button>
              <button onClick={() => handleShortcutClick("procurement@vendorbridge.com")} className="shortcut-pill">
                Procurement
              </button>
              <button onClick={() => handleShortcutClick("manager@vendorbridge.com")} className="shortcut-pill">
                Manager
              </button>
              <button onClick={() => handleShortcutClick("techsupply@vendorbridge.com")} className="shortcut-pill">
                TechSupply (Vendor)
              </button>
              <button onClick={() => handleShortcutClick("acme@vendorbridge.com")} className="shortcut-pill">
                Acme Corp (Vendor)
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
