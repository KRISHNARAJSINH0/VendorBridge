"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/context/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/");
  }, [user, router]);

  if (!user) return null;

  return (
    <>
      <Sidebar />
      <div className="pl-64 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}
