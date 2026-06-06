import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VendorBridge - Enterprise Procurement SaaS",
  description: "Manage suppliers, RFQs, and quotations on a premium platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-background text-foreground overflow-x-hidden font-sans">
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
      </body>
    </html>
  );
}
