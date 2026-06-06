import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Wrapper */}
      <div className="pl-64 min-h-screen flex flex-col">
        {/* Top Sticky Header */}
        <Navbar />

        {/* Page View Wrapper */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Global Toast Provider */}
      <Toaster theme="dark" closeButton richColors />
    </>
  );
}
