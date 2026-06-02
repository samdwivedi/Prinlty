import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { SecurityWrapper } from "@/components/security-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Printly — Secure Print Management",
    template: "%s | Printly",
  },
  description:
    "Printly is a secure print management platform for colleges, libraries, and print centers. Upload PDFs, generate QR tokens, and manage print queues seamlessly.",
  keywords: ["print management", "PDF printing", "secure printing", "campus printing", "print queue"],
  authors: [{ name: "Printly" }],
  openGraph: {
    title: "Printly — Secure Print Management",
    description: "Modern print management for colleges and print centers",
    type: "website",
    siteName: "Printly",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        <Providers>
          <SecurityWrapper />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#1e293b",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: {
                iconTheme: { primary: "#2563EB", secondary: "#fff" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
