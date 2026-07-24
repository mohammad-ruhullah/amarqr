import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ThemeProvider from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import FloatingQRModules from "@/components/FloatingQRModules";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amar QR — Free QR Code Generator Online",
  description:
    "Create free, customizable QR codes forever. No login, no paywall, no hidden charges. URL, Text, Email, WiFi, vCard and more.",
  keywords: [
    "QR code generator",
    "free QR code",
    "custom QR code",
    "Amar QR",
    "QR maker",
    "free QR maker",
  ],
  openGraph: {
    title: "Amar QR — Free QR Code Generator",
    description: "Create beautiful QR codes for free. Forever.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-body text-main`}>
        <ThemeProvider>
          <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent dark:from-primary/[0.08] dark:via-accent/[0.06] dark:to-transparent pointer-events-none" />
          <FloatingQRModules />
          <div className="relative z-10">
            <ToastProvider>
              {children}
            </ToastProvider>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
