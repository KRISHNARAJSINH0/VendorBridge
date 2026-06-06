import type { Metadata } from "next";
import { Geist, Geist_Mono, Share_Tech_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth-context";
import { StateProvider } from "@/context/StateContext";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VendorBridge — Enterprise Procurement ERP",
  description: "Manage vendors, RFQs, quotations, approvals, purchase orders, and invoices.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${shareTechMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-background text-foreground overflow-x-hidden font-sans">
        <AuthProvider>
          <StateProvider>
            {children}
          </StateProvider>
        </AuthProvider>
        <Toaster theme="dark" closeButton richColors />
      </body>
    </html>
  );
}
