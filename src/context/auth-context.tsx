"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppUser, UserRole } from "@/lib/db";

interface AuthContextType {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("vb_user");
    if (stored) { try { setUserState(JSON.parse(stored)); } catch { /* noop */ } }
    setLoaded(true);
  }, []);

  const setUser = (u: AppUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem("vb_user", JSON.stringify(u));
    else localStorage.removeItem("vb_user");
  };

  const logout = () => { setUser(null); };

  if (!loaded) return null; // prevent flash

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
