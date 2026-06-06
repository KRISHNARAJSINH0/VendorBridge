import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StateProvider } from "../context/StateContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VendorBridge - Procurement Portal",
  description: "Next-generation procurement, RFQ, and quotation management",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StateProvider>
          {children}
        </StateProvider>
      </body>
    </html>
  );
}
