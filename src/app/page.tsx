"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemTime, setSystemTime] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Realtime system terminal logger
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SYS.LOG // VBRIDGE BOOT INITIALIZED...",
    "SECURE CONTEXT ROOTED ON NODE-829A",
    "DB CLIENT LOADED: PRISMA-SQLITE-V7",
    "STATUS: AWAITING CREDENTIAL SCAN..."
  ]);
  const [loginStatus, setLoginStatus] = useState("READY"); // READY, CONNECTING, AUTHORIZING, GRANTED, ERROR

  // Update clock at top right
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toISOString().replace("T", " // ").slice(0, -5));
    };
    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulating ongoing cyber logs
  useEffect(() => {
    if (isSubmitting || loginStatus === "GRANTED" || loginStatus === "ERROR") return;
    
    const logsPool = [
      "DB QUERY: RETRIEVED COMPLIANCE RECORDS [OK]",
      "IDS STATUS: 0 ANOMALIES ON PORT 443 // SHIELD UP",
      "SYS TEMP: 41°C // CPU LOAD: 4.8%",
      "LEDGER STATUS: AUTOMATED SYNC RUNNING",
      "NETWORK STATUS: 12 ACTIVE ROUTED SESSIONS",
      "PO SYSTEM: COMPILED PENDING BID REQUESTS",
      "RFQ WATCHDOG: ACTIVE PORT SCAN COMPLETE",
      "INTEGRATION NODE: DISPATCH COMPLETED [200 OK]"
    ];

    const logInterval = window.setInterval(() => {
      const randomMsg = logsPool[Math.floor(Math.random() * logsPool.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      setTerminalLogs(prev => [...prev.slice(-3), `[${timeStr}] ${randomMsg}`]);
    }, 4500);

    return () => clearInterval(logInterval);
  }, [isSubmitting, loginStatus]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginStatus("ERROR");
      setTerminalLogs(prev => [
        ...prev.slice(-2),
        "ERR: ACCESS REJECTED. FIELDS MATRIX IS INCOMPLETE.",
        "SYS.STATUS: INSUFFICIENT AUTHENTICATORS // SHIELD ENGAGED"
      ]);
      setTimeout(() => {
        setLoginStatus("READY");
      }, 3000);
      return;
    }

    setIsSubmitting(true);
    setLoginStatus("CONNECTING");
    setTerminalLogs(prev => [
      ...prev.slice(-2),
      "SYS.HANDSHAKE: INITIATING SECURE SOCKET WRAPPER...",
      "SYS.QUERY: COMPILING ENCRYPTED SIGNATURE KEY..."
    ]);

    setTimeout(() => {
      setLoginStatus("AUTHORIZING");
      setTerminalLogs(prev => [
        ...prev.slice(-2),
        `SYS.AUTH: VERIFYING MATCH MATRIX FOR UID: "${username}"`,
        "SYS.CRYPTO: GENERATING SESSION DECRYPT KEY..."
      ]);

      setTimeout(() => {
        setLoginStatus("GRANTED");
        setIsSubmitting(false);
        setTerminalLogs(prev => [
          ...prev.slice(-2),
          "SYS.STATUS: SYNC-ACCESS PROTOCOL CONFIRMED // GRANTED",
          `WELCOME OPERATOR // CONSOLE SESSION REDIRECTED TO SYSTEM ROOT`
        ]);
        // Redirect to dashboard vendors page on login grant
        setTimeout(() => {
          window.location.href = "/vendors";
        }, 800);
      }, 1500);
    }, 1500);
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setLoginStatus("READY");
    setTerminalLogs([
      "SYS.LOG // MATRIX RESET COMPLETED...",
      "SECURE CONTEXT ROOTED ON NODE-829A",
      "STATUS: AWAITING CREDENTIAL SCAN..."
    ]);
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-screen bg-[#0A0A0A] overflow-hidden select-none font-mono">
      
      {/* 1. Terminal Floating Grid & Scanline Background */}
      <div className="absolute inset-0 animate-grid opacity-35 z-0 pointer-events-none"></div>
      <div className="absolute inset-0 animate-scanline z-10 pointer-events-none"></div>
      
      {/* Neon glowing radial gradient to create cyber depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyber-green/5 blur-[120px] pointer-events-none z-0"></div>

      {/* 2. Top Chrome Application Bar */}
      <header className="relative w-full h-11 flex items-center justify-between px-4 border-b border-cyber-green/20 bg-black/80 backdrop-blur-sm z-20 text-xs">
        <div className="flex items-center gap-3">
          {/* Cyber Terminal Dots */}
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600/60 border border-red-600/30"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 border border-yellow-500/30"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-green/60 border border-cyber-green/30 animate-pulse"></span>
          </div>
          <span className="text-[#888] font-semibold tracking-wider uppercase font-mono">
            SYS.LOC: <span className="text-cyber-green text-shadow-[0_0_8px_rgba(34,197,94,0.4)]">SECURE_NODE://VBRIDGE-GATEWAY-1</span>
          </span>
        </div>
        
        {/* Dynamic server clock / node stats */}
        <div className="hidden md:flex items-center gap-6 text-[#666]">
          <div>PROTOCOL: <span className="text-cyber-green/75">TLS_1.3</span></div>
          <div>MEM.ALLOC: <span className="text-cyber-green/75">244MB/1024MB</span></div>
          <div className="text-cyber-green/70">{systemTime}</div>
        </div>
      </header>

      {/* 3. Main Center Workspace Area */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-20 animate-fade-in">
        
        {/* Main Authenticator Interface Container */}
        <div className="w-full max-w-[480px] glass-cyber animate-border-pulse rounded-lg overflow-hidden shadow-2xl relative">
          
          {/* Top edge futuristic laser glow bar */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyber-green to-transparent opacity-85 shadow-[0_0_10px_#22C55E]"></div>
          
          {/* Card Frame Inner Borders/Indicators */}
          <span className="absolute top-2 left-2 text-[8px] text-cyber-green/40 font-mono">VB_SECURE_AUTH</span>
          <span className="absolute top-2 right-2 text-[8px] text-cyber-green/40 font-mono">[0x000F8]</span>
          
          <div className="p-8 pt-10 flex flex-col items-center">
            
            {/* Cyberpunk SVG Logo / Avatar Area */}
            <div className="relative w-20 h-20 mb-5 flex items-center justify-center rounded-xl bg-black/60 border border-cyber-green/30 shadow-[inset_0_0_12px_rgba(34,197,94,0.25)] group hover:border-cyber-green transition-colors duration-300">
              {/* Corner brackets for technological camera aperture look */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-cyber-green"></div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r border-cyber-green"></div>
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b border-l border-cyber-green"></div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r border-cyber-green"></div>
              
              {/* Spinning circular HUD element */}
              <div className="absolute w-[80%] h-[80%] border border-dashed border-cyber-green/20 rounded-full animate-[spin_40s_linear_infinite]"></div>
              
              {/* Custom SVG Logo */}
              <svg 
                className="w-10 h-10 text-cyber-green drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] group-hover:scale-110 transition-transform duration-300"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>

            {/* Core Titles */}
            <h1 className="text-3xl font-extrabold tracking-[0.2em] text-cyber-green uppercase glow-green mb-1 text-center font-mono">
              VendorBridge
            </h1>
            <p className="text-[10px] tracking-[0.15em] text-[#888] uppercase mb-8 text-center font-semibold">
              Vendor Procurement Management Platform
            </p>

            {/* Login Status Notification Message */}
            {loginStatus !== "READY" && (
              <div className={`w-full py-2.5 px-4 mb-6 border text-xs flex items-center justify-between rounded ${
                loginStatus === "ERROR" 
                  ? "bg-red-950/40 border-red-500/40 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
                  : loginStatus === "GRANTED"
                  ? "bg-emerald-950/40 border-cyber-green/40 text-cyber-green shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                  : "bg-zinc-900/55 border-cyber-green/20 text-[#aaa]"
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    loginStatus === "ERROR" ? "bg-red-500 animate-ping" : "bg-cyber-green animate-ping"
                  }`}></span>
                  <span className="font-mono">
                    STATUS: {loginStatus === "CONNECTING" && "INITIALIZING SECURE LINK..."}
                    {loginStatus === "AUTHORIZING" && "VERIFYING PASSKEY MATRIX..."}
                    {loginStatus === "GRANTED" && "IDENTITY VALIDATED. ROUTING..."}
                    {loginStatus === "ERROR" && "COMPLIANCE BREACH: DENIED"}
                  </span>
                </div>
                {loginStatus === "ERROR" && (
                  <button onClick={resetForm} className="text-[9px] underline hover:text-red-300">
                    [RETRY]
                  </button>
                )}
              </div>
            )}

            {/* Credentials Submission Form */}
            <form onSubmit={handleLoginSubmit} className="w-full space-y-5">
              
              {/* Field 1: Username Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold tracking-wider text-[#999]">
                  <label htmlFor="username" className="font-mono flex items-center gap-1.5">
                    <span className="text-cyber-green">[01]</span> USER IDENTIFIER
                  </label>
                  <span className="text-[#555]">[REQUIRED]</span>
                </div>
                
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-cyber-green/60 select-none">
                    [USR] &gt;
                  </span>
                  <input
                    id="username"
                    type="text"
                    required
                    disabled={isSubmitting || loginStatus === "GRANTED"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter terminal name..."
                    className="w-full pl-[70px] pr-4 py-3 bg-black/45 border border-cyber-green/30 rounded text-sm text-[#eee] font-mono placeholder:text-zinc-700 outline-none focus:border-cyber-green focus:shadow-[0_0_12px_rgba(34,197,94,0.25)] transition-all duration-300 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Field 2: Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold tracking-wider text-[#999]">
                  <label htmlFor="password" className="font-mono flex items-center gap-1.5">
                    <span className="text-cyber-green">[02]</span> SYSTEM SECURITY KEY
                  </label>
                  <span className="text-[#555]">[ENCRYPTED]</span>
                </div>
                
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-cyber-green/60 select-none">
                    [PWD] &gt;
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    disabled={isSubmitting || loginStatus === "GRANTED"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full pl-[70px] pr-4 py-3 bg-black/45 border border-cyber-green/30 rounded text-sm text-[#eee] font-mono placeholder:text-zinc-700 outline-none focus:border-cyber-green focus:shadow-[0_0_12px_rgba(34,197,94,0.25)] transition-all duration-300 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Form Options Wrapper: Remember & Forgot Pass */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                {/* Remember Me Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-[#aaa] hover:text-[#eee] transition-colors select-none text-xs">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      disabled={isSubmitting || loginStatus === "GRANTED"}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    {/* Visual custom checkbox box */}
                    <div className="w-3.5 h-3.5 border border-cyber-green/40 bg-black peer-checked:bg-cyber-green/20 peer-checked:border-cyber-green rounded-sm transition-colors flex items-center justify-center">
                      {rememberMe && (
                        <span className="w-1.5 h-1.5 bg-cyber-green rounded-sm shadow-[0_0_4px_#22C55E]"></span>
                      )}
                    </div>
                  </div>
                  <span>REMEMBER_OPERATOR</span>
                </label>

                {/* Forgot Password Link */}
                <a 
                  href="#forgot" 
                  onClick={(e) => {
                    e.preventDefault();
                    setTerminalLogs(prev => [...prev.slice(-2), "SYS.LOG: FORGOT PASSWORD REQUEST DISPATCHED.", "INSTRUCTION: PLEASE CONTACT LOCAL IT COMPLIANCE OFFICE."]);
                  }}
                  className="text-cyber-green/70 hover:text-cyber-green hover:underline transition-colors"
                >
                  FORGOT_KEY?
                </a>
              </div>

              {/* Action Button: Primary Login */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || loginStatus === "GRANTED"}
                  className="relative w-full py-3.5 bg-[#22C55E] text-black font-extrabold tracking-[0.2em] rounded text-xs uppercase cursor-pointer hover:bg-transparent hover:text-cyber-green border border-transparent hover:border-cyber-green hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300 select-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                >
                  {/* Decorative slide-across cyber hover line */}
                  <span className="absolute left-0 bottom-0 top-0 w-[4px] bg-white opacity-0 group-hover:opacity-40 transition-opacity"></span>
                  
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3 w-3 text-black group-hover:text-cyber-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      ENGAGING CRYPTO...
                    </span>
                  ) : (
                    "INITIALIZE ACCESS ROUTE"
                  )}
                </button>
              </div>
            </form>

            {/* Separator Divider Lines */}
            <div className="w-full flex items-center justify-center my-6 gap-2 opacity-30">
              <span className="h-[1px] w-full bg-cyber-green/50"></span>
              <span className="text-[8px] text-cyber-green tracking-widest whitespace-nowrap">NODE LINK</span>
              <span className="h-[1px] w-full bg-cyber-green/50"></span>
            </div>

            {/* Action 2: Register Account Option */}
            <div className="text-center">
              <a
                href="/register"
                onClick={(e) => {
                  e.preventDefault();
                  setTerminalLogs(prev => [
                    ...prev.slice(-2),
                    "SYS.LOG: CONNECTING TO REGISTRATION WIZARD...",
                    "SYS.LOG: HANDSHAKING WITH ONBOARDING NODE..."
                  ]);
                  setTimeout(() => {
                    window.location.href = "/register";
                  }, 800);
                }}
                className="text-xs text-[#666] hover:text-cyber-green transition-colors uppercase font-mono tracking-widest hover:glow-green"
              >
                // REGISTER NEW SECURE CREDENTIALS
              </a>
            </div>

            {/* Simulated Live Console Log Window Inside Auth Card */}
            <div className="w-full mt-6 p-3 bg-black/85 border border-cyber-green/15 rounded text-[9px] font-mono text-cyber-green/75 space-y-1 max-h-[85px] overflow-hidden">
              <div className="text-cyber-green/40 flex justify-between border-b border-cyber-green/10 pb-1 mb-1.5 uppercase font-bold text-[8px] tracking-wider">
                <span>SYSTEM CONSOLE LOGS</span>
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

      {/* 4. Bottom status bar */}
      <footer className="relative w-full h-10 flex items-center justify-between px-4 border-t border-cyber-green/20 bg-black/80 backdrop-blur-sm z-20 text-[10px] text-[#777] font-mono uppercase tracking-wider">
        {/* Status System State */}
        <div className="flex items-center gap-2">
          {/* LED blink indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green animate-blink"></span>
          </span>
          <span>SYSTEM_STATUS: <span className="text-cyber-green font-bold glow-green">ONLINE</span></span>
        </div>

        {/* Secure connection details */}
        <div className="hidden sm:block">
          ENCRYPTION: <span className="text-cyber-green/80">SECURE SOCKET [AES-256-GCM]</span>
        </div>

        {/* Build version */}
        <div>
          VERSION_NODE: <span className="text-cyber-green/85">v1.0.0</span>
        </div>
      </footer>

    </div>
  );
}
