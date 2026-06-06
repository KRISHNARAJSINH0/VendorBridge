import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VendorBridge // Secure Access Portal",
  description: "Futuristic Vendor Procurement Management Platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${shareTechMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cyber-bg text-zinc-100 font-mono">
        {children}
      </body>
    </html>
  );
}

