"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorDashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-6 w-6 rounded-full border-2 border-brand-green border-t-transparent animate-spin" />
    </div>
  );
}
