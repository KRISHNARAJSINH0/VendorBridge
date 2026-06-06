"use client";

import React, { useState, useEffect } from "react";

export default function Register() {
  const [step, setStep] = useState(1); // 1, 2, 3
  const [systemTime, setSystemTime] = useState("");
  
  // Step 1 Form Data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("USA");
  const [category, setCategory] = useState("manufacturing");
  const [taxId, setTaxId] = useState("");
  const [description, setDescription] = useState("");

  // Step 2 Form Data
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  // Status and Logs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedVendorCode, setGeneratedVendorCode] = useState("");
  const [terminalLogs, setTerminalLogs] = useState([
    "SYS.ONBOARD // REGISTER WIZARD BOOTED...",
    "SECURE ROUTE: NODE-829A // REGISTER-NODE",
    "STATUS: AWAITING STEP_1 PROTOCOL DATA..."
  ]);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toISOString().replace("T", " // ").slice(0, -5));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNextStep = (e) => {
    e.preventDefault();
    
    // Quick validation for Step 1
    if (!firstName || !lastName || !email || !phone || !companyName || !taxId) {
      setErrorMessage("REQUIRED CONFIGURATION ATTRIBUTES ARE MISSING.");
      setTerminalLogs(prev => [
        ...prev.slice(-2),
        "ERR: VAL_CHECK FAILED. NULL_FIELDS_DETECTED.",
        "SYS.WARN: COMPLY WITH COMPULSORY REGISTER METRICS."
      ]);
      return;
    }

    setErrorMessage("");
    setTerminalLogs(prev => [
      ...prev.slice(-2),
      "SYS.VAL: STEP_1 COMPLETED. METRICS VERIFIED.",
      "SYS.LOG: COMMENCING STEP_2 SECURITY KEY CREATION & FILE HANDSHAKE..."
    ]);
    setStep(2);
  };

  const handlePrevStep = () => {
    setErrorMessage("");
    setTerminalLogs(prev => [
      ...prev.slice(-2),
      "SYS.NAV: DE-ESCALATING TO STEP_1 COMPANY METRICS SHEET."
    ]);
    setStep(1);
  };

  // Upload Simulators
  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setTerminalLogs(prev => [
        ...prev.slice(-2),
        `SYS.FILE: LOGO UPLOAD IDENTIFIED: "${file.name}"`,
        `SYS.CRYPTO: GENERATED HASH [SHA-256]: ${Math.random().toString(36).substring(2, 10).toUpperCase()}...`
      ]);
    }
  };

  const handleLicenseChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLicenseFile(file);
      setTerminalLogs(prev => [
        ...prev.slice(-2),
        `SYS.FILE: LICENSE FILE UPLOAD IDENTIFIED: "${file.name}"`,
        `SYS.CRYPTO: SHA-256 HASH VERIFICATION METRIC INITIALIZED.`
      ]);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("CRYPTOGRAPHIC KEYS MATCH MISALIGNMENT.");
      setTerminalLogs(prev => [
        ...prev.slice(-2),
        "ERR: PASSWORDS DO NOT MATCH MATCHING REGISTER METRIC."
      ]);
      return;
    }

    if (!acceptTerms || !agreePolicy) {
      setErrorMessage("COMPLIANCE PROTOCOLS ACCEPTANCE IS MANDATORY.");
      setTerminalLogs(prev => [
        ...prev.slice(-2),
        "ERR: PROCUREMENT POLICY SIGNATURE MISSING."
      ]);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    setTerminalLogs(prev => [
      ...prev.slice(-2),
      "SYS.ONBOARD: PACKAGING SUPPLIER DATA FOR DB DISPATCH...",
      "SYS.ONBOARD: GENERATING CRYPTOGRAPHIC SUPPLIER ACCOUNT..."
    ]);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev.slice(-2),
        "SYS.ONBOARD: COMMITTING TRANSACTIONS TO CENTRAL LEDGER...",
        "SYS.ONBOARD: SEEDING INITIAL ROLES AND PERMISSIONS..."
      ]);

      setTimeout(() => {
        const vendorNum = Math.floor(1000 + Math.random() * 9000);
        const generatedCode = `VB-VND-${vendorNum}-${country.slice(0, 3).toUpperCase()}`;
        setGeneratedVendorCode(generatedCode);
        setIsSubmitting(false);
        setStep(3);
        setTerminalLogs(prev => [
          ...prev.slice(-2),
          `SYS.SUCCESS: SUPPLIER ASSIGNED CODE: "${generatedCode}"`,
          "SYS.STATUS: ONBOARDING COMPLETE // RETIREE LOGGED AT GATEWAY"
        ]);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-screen bg-[#0A0A0A] overflow-hidden select-none font-mono">
      {/* Background patterns */}
      <div className="absolute inset-0 animate-grid opacity-35 z-0 pointer-events-none"></div>
      <div className="absolute inset-0 animate-scanline z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyber-green/5 blur-[120px] pointer-events-none z-0"></div>

      {/* Chrome Top Bar */}
      <header className="relative w-full h-11 flex items-center justify-between px-4 border-b border-cyber-green/20 bg-black/80 backdrop-blur-sm z-20 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600/60 border border-red-600/30"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 border border-yellow-500/30"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-green/60 border border-cyber-green/30 animate-pulse"></span>
          </div>
          <span className="text-[#888] font-semibold tracking-wider uppercase font-mono">
            SYS.LOC: <span className="text-cyber-green text-shadow-[0_0_8px_rgba(34,197,94,0.4)]">SECURE_NODE://VBRIDGE-ONBOARDING-5</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[#666]">
          <div>PROTOCOL: <span className="text-cyber-green/75">TLS_1.3</span></div>
          <div>STAMP: <span className="text-cyber-green/70">{systemTime}</span></div>
        </div>
      </header>

      {/* Main Form Center Layout */}
      <main className="flex-1 flex items-center justify-center p-4 py-12 relative z-20 animate-fade-in">
        
        {/* Large registration card container */}
        <div className="w-full max-w-[700px] glass-cyber animate-border-pulse rounded-lg overflow-hidden shadow-2xl relative">
          
          {/* Edge glowing neon border */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyber-green to-transparent opacity-85 shadow-[0_0_10px_#22C55E]"></div>
          
          <span className="absolute top-2 left-2 text-[8px] text-cyber-green/40 font-mono">SUPPLIER_REG_WIZARD</span>
          <span className="absolute top-2 right-2 text-[8px] text-cyber-green/40 font-mono">[STEP_0{step}]</span>

          <div className="p-8 pt-10">
            
            {/* Logo/Badge Upload Placeholders */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-black/60 border border-cyber-green/30 shadow-[inset_0_0_10px_rgba(34,197,94,0.25)]">
                <svg className="w-7 h-7 text-cyber-green/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyber-green/20 border border-cyber-green flex items-center justify-center">
                  <span className="w-1 h-1 bg-cyber-green rounded-full"></span>
                </div>
              </div>
              
              <h1 className="text-2xl font-extrabold tracking-[0.15em] text-cyber-green uppercase glow-green mb-0.5 text-center">
                Vendor Registration
              </h1>
              <p className="text-[10px] tracking-wider text-[#777] uppercase text-center font-bold">
                Create your supplier organization account
              </p>
            </div>

            {/* Step Progress Line HUD */}
            <div className="w-full mb-8 px-4">
              <div className="relative flex items-center justify-between">
                
                {/* Horizontal line background */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-zinc-800 z-0"></div>
                
                {/* Dynamic colored progress indicator bar */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-cyber-green shadow-[0_0_8px_#22C55E] z-0 transition-all duration-500"
                  style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
                ></div>

                {/* Step indicators */}
                {[
                  { num: 1, label: "Company Information" },
                  { num: 2, label: "Verification" },
                  { num: 3, label: "Success" }
                ].map((s) => (
                  <div key={s.num} className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono transition-all duration-300 ${
                      step >= s.num 
                        ? "bg-[#0A0A0A] border-cyber-green text-cyber-green shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                        : "bg-zinc-950 border-zinc-800 text-zinc-600"
                    }`}>
                      {s.num === 3 && step === 3 ? "✓" : `0${s.num}`}
                    </div>
                    <span className={`text-[8px] uppercase tracking-widest mt-2 hidden sm:block ${
                      step >= s.num ? "text-cyber-green font-bold" : "text-zinc-600"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="w-full py-2.5 px-4 mb-6 bg-red-950/40 border border-red-500/40 text-red-400 text-xs flex items-center gap-2 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                <span>ERROR: {errorMessage}</span>
              </div>
            )}

            {/* Step 1 Content: Organization Data Details */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                
                {/* Row 1: First and Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[01]</span> CONTACT FIRST NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full bg-black/45 border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono placeholder:text-zinc-850 outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[02]</span> CONTACT LAST NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Smith"
                      className="w-full bg-black/45 border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono placeholder:text-zinc-850 outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Row 2: Email & Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[03]</span> SECURE EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="supplier@company.com"
                      className="w-full bg-black/45 border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono placeholder:text-zinc-850 outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[04]</span> SECURE TELEPHONE
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-black/45 border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono placeholder:text-zinc-850 outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Row 3: Company Name & Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[05]</span> SUPPLIER COMPANY NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Industrial Corp"
                      className="w-full bg-black/45 border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono placeholder:text-zinc-850 outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[06]</span> OPERATIONAL COUNTRY
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-[#0E0E0E] border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300"
                    >
                      <option value="USA">USA // NORTH AMERICA</option>
                      <option value="IND">INDIA // ASIA-PACIFIC</option>
                      <option value="DEU">GERMANY // EUROPE</option>
                      <option value="GBR">UNITED KINGDOM // EUROPE</option>
                      <option value="CAN">CANADA // NORTH AMERICA</option>
                      <option value="AUS">AUSTRALIA // OCEANIA</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Business Category & Tax ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[07]</span> BUSINESS CATEGORY
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#0E0E0E] border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300"
                    >
                      <option value="manufacturing">MANUFACTURING & INDUSTRIAL</option>
                      <option value="logistics">LOGISTICS & FREIGHT</option>
                      <option value="electronics">ELECTRONICS & COMPONENTS</option>
                      <option value="software">IT SERVICES & SOFTWARE</option>
                      <option value="raw_materials">RAW MATERIALS SUPPLY</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[08]</span> REGISTRATION / TAX ID
                    </label>
                    <input
                      type="text"
                      required
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="e.g. EIN-12-3456789"
                      className="w-full bg-black/45 border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono placeholder:text-zinc-850 outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Large Text Area: Company Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                    <span className="text-cyber-green">[09]</span> ORGANIZATION PROFILE DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a summary of products, services, capabilities and capacity details..."
                    className="w-full bg-black/45 border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono placeholder:text-zinc-800 outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300 resize-none"
                  />
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                  <a
                    href="/"
                    className="text-xs text-[#777] hover:text-cyber-green transition-colors flex items-center gap-1.5 uppercase font-semibold"
                  >
                    &lt; RETURN GATEWAY
                  </a>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cyber-green text-black font-extrabold tracking-wider rounded text-xs uppercase cursor-pointer hover:bg-transparent hover:text-cyber-green border border-transparent hover:border-cyber-green hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-300"
                  >
                    CONTINUE SECURITY CHECK &gt;
                  </button>
                </div>
              </form>
            )}

            {/* Step 2 Content: Auth Keys & Upload Attachments */}
            {step === 2 && (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                
                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[10]</span> ACCOUNT SYSTEM ACCESS KEY
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      disabled={isSubmitting}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full bg-black/45 border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono placeholder:text-zinc-850 outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[11]</span> CONFIRM ACCESS KEY
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      disabled={isSubmitting}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full bg-black/45 border border-cyber-green/20 rounded px-4 py-2.5 text-sm text-[#eee] font-mono placeholder:text-zinc-850 outline-none focus:border-cyber-green focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all duration-300 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Upload Section: Logo & License */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* File Upload 1: Company Logo */}
                  <div className="space-y-2">
                    <span className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green">[12]</span> CORPORATE LOGO EMBLEM
                    </span>
                    <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-cyber-green/25 hover:border-cyber-green rounded-lg bg-black/30 cursor-pointer transition-colors duration-300 p-2">
                      <div className="flex flex-col items-center justify-center text-center">
                        <svg className="w-6 h-6 text-cyber-green/60 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-[9px] text-cyber-green/75 uppercase font-bold">
                          {logoFile ? `[LOGO LOADED]` : `SELECT LOGO IMAGE`}
                        </p>
                        <p className="text-[8px] text-zinc-500 uppercase mt-0.5 truncate max-w-[160px]">
                          {logoFile ? logoFile.name : `PNG, JPG // MAX 2MB`}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={isSubmitting}
                        onChange={handleLogoChange} 
                      />
                    </label>
                  </div>

                  {/* File Upload 2: Business License */}
                  <div className="space-y-2">
                    <span className="text-[10px] tracking-wider text-[#999] uppercase font-bold flex items-center gap-1">
                      <span className="text-cyber-green/[0.7]">[13]</span> BUSINESS REGISTRATION LICENSE
                    </span>
                    <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-cyber-green/25 hover:border-cyber-green rounded-lg bg-black/30 cursor-pointer transition-colors duration-300 p-2">
                      <div className="flex flex-col items-center justify-center text-center">
                        <svg className="w-6 h-6 text-cyber-green/60 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-[9px] text-cyber-green/75 uppercase font-bold">
                          {licenseFile ? `[LICENSE LOADED]` : `SELECT CERTIFICATE PDF`}
                        </p>
                        <p className="text-[8px] text-zinc-500 uppercase mt-0.5 truncate max-w-[160px]">
                          {licenseFile ? licenseFile.name : `PDF, IMAGE // MAX 5MB`}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        accept="application/pdf,image/*" 
                        className="hidden" 
                        disabled={isSubmitting}
                        onChange={handleLicenseChange} 
                      />
                    </label>
                  </div>
                </div>

                {/* Compliance Checkboxes */}
                <div className="space-y-3 pt-2">
                  
                  {/* T&C Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-[#aaa] hover:text-[#eee] transition-colors select-none text-[11px]">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        disabled={isSubmitting}
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-3.5 h-3.5 border border-cyber-green/40 bg-black peer-checked:bg-cyber-green/20 peer-checked:border-cyber-green rounded-sm flex items-center justify-center">
                        {acceptTerms && (
                          <span className="w-1.5 h-1.5 bg-cyber-green rounded-sm shadow-[0_0_4px_#22C55E]"></span>
                        )}
                      </div>
                    </div>
                    <span>
                      I SIGN AND ACCEPT THE <a href="#terms" onClick={(e) => e.preventDefault()} className="text-cyber-green hover:underline">TERMS OF DIGITAL INTERACTION</a> AND COMPLIANCE RULES.
                    </span>
                  </label>

                  {/* Policy Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-[#aaa] hover:text-[#eee] transition-colors select-none text-[11px]">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        disabled={isSubmitting}
                        checked={agreePolicy}
                        onChange={(e) => setAgreePolicy(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-3.5 h-3.5 border border-cyber-green/40 bg-black peer-checked:bg-cyber-green/20 peer-checked:border-cyber-green rounded-sm flex items-center justify-center">
                        {agreePolicy && (
                          <span className="w-1.5 h-1.5 bg-cyber-green rounded-sm shadow-[0_0_4px_#22C55E]"></span>
                        )}
                      </div>
                    </div>
                    <span>
                      I AGREE TO ADHERE TO THE GLOBAL B2B <a href="#policy" onClick={(e) => e.preventDefault()} className="text-cyber-green hover:underline">PROCUREMENT ETHICS POLICY</a>.
                    </span>
                  </label>
                </div>

                {/* Bottom navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 bg-transparent border border-cyber-green/20 text-[#888] hover:text-cyber-green hover:border-cyber-green rounded text-xs uppercase cursor-pointer transition-colors duration-300 disabled:opacity-50"
                  >
                    &lt; BACK TO DATA
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative px-6 py-2.5 bg-cyber-green text-black font-extrabold tracking-wider rounded text-xs uppercase cursor-pointer hover:bg-transparent hover:text-cyber-green border border-transparent hover:border-cyber-green hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        COMMITTING CRYPTO KEY...
                      </>
                    ) : (
                      "SUBMIT LEDGER REGISTRATION"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 Content: Successful Registration */}
            {step === 3 && (
              <div className="py-8 text-center space-y-6 animate-fade-in flex flex-col items-center">
                
                {/* Glowing Success Ring Badge */}
                <div className="relative w-20 h-20 mb-2 flex items-center justify-center rounded-full bg-cyber-green/10 border border-cyber-green shadow-[0_0_25px_rgba(34,197,94,0.4)]">
                  <svg className="w-10 h-10 text-cyber-green drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="absolute inset-0 border border-dashed border-cyber-green/30 rounded-full animate-[spin_12s_linear_infinite]"></div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold tracking-wider text-cyber-green uppercase glow-green">
                    Onboarding Complete
                  </h2>
                  <p className="text-xs text-[#aaa] max-w-sm mx-auto uppercase">
                    Your supplier account registration has been successfully committed to the database network ledger.
                  </p>
                </div>

                {/* Cyber Dashboard Registration Specifications Box */}
                <div className="w-full max-w-sm bg-black/85 border border-cyber-green/20 rounded p-5 space-y-3 text-left">
                  <div className="text-[10px] text-cyber-green/40 border-b border-cyber-green/10 pb-1.5 uppercase font-bold tracking-wider">
                    SPECIFICATIONS PROTOCOL RECEIPT
                  </div>
                  
                  <div className="grid grid-cols-2 text-xs">
                    <span className="text-[#666] uppercase">VENDOR CODE:</span>
                    <span className="text-cyber-green text-right font-bold tracking-widest">{generatedVendorCode}</span>
                  </div>

                  <div className="grid grid-cols-2 text-xs">
                    <span className="text-[#666] uppercase">COMPANY NAME:</span>
                    <span className="text-zinc-300 text-right truncate">{companyName}</span>
                  </div>

                  <div className="grid grid-cols-2 text-xs">
                    <span className="text-[#666] uppercase">TAX IDENTIFIER:</span>
                    <span className="text-zinc-300 text-right">{taxId}</span>
                  </div>

                  <div className="grid grid-cols-2 text-xs">
                    <span className="text-[#666] uppercase">LEDGER STATUS:</span>
                    <span className="text-cyber-green text-right animate-pulse">● ACTIVE_COMPLIANT</span>
                  </div>
                </div>

                <p className="text-[9px] text-[#555] uppercase max-w-xs mx-auto">
                  *A verification notification link will be dispatched to "{email}" upon initial audit confirmation.
                </p>

                <div className="pt-6 border-t border-zinc-900 w-full">
                  <a
                    href="/"
                    className="inline-block px-8 py-3 bg-[#22C55E] text-black font-extrabold tracking-[0.2em] rounded text-xs uppercase cursor-pointer hover:bg-transparent hover:text-cyber-green border border-transparent hover:border-cyber-green hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300"
                  >
                    RETURN TO SECURITY GATEWAY
                  </a>
                </div>
              </div>
            )}

            {/* Realtime logs ticker */}
            <div className="w-full mt-6 p-3 bg-black/85 border border-cyber-green/15 rounded text-[9px] font-mono text-cyber-green/75 space-y-1 max-h-[85px] overflow-hidden">
              <div className="text-cyber-green/40 flex justify-between border-b border-cyber-green/10 pb-1 mb-1.5 uppercase font-bold text-[8px] tracking-wider">
                <span>ONBOARD CONSOLE LOGGER</span>
                <span className="animate-pulse">● LIVE_FEED</span>
              </div>
              {terminalLogs.map((log, index) => (
                <div key={index} className="truncate select-text selection:bg-cyber-green/30">
                  <span className="text-cyber-green/30">&gt; </span>
                  {log}
                </div>
              ))}
            </div>

          </div>
        </div>

      </main>

      {/* Footer Bar */}
      <footer className="relative w-full h-10 flex items-center justify-between px-4 border-t border-cyber-green/20 bg-black/80 backdrop-blur-sm z-20 text-[10px] text-[#777] font-mono uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green animate-blink"></span>
          </span>
          <span>SYSTEM_STATUS: <span className="text-cyber-green font-bold glow-green">ONLINE</span></span>
        </div>

        <div className="hidden sm:block">
          ENCRYPTION: <span className="text-cyber-green/80">SECURE SOCKET [AES-256-GCM]</span>
        </div>

        <div>
          VERSION_NODE: <span className="text-cyber-green/85">v1.0.0</span>
        </div>
      </footer>

    </div>
  );
}
