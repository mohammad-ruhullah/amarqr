import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ThemeProvider from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import FloatingQRModules from "@/components/FloatingQRModules";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://amarqr.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Amar QR — Free QR Code Generator Online | amarqr.online",
  description:
    "Create free, customizable QR codes forever. No login, no paywall, no hidden charges. URL, Text, Email, WiFi, vCard and more.",
  keywords: [
    "QR code generator",
    "free QR code",
    "custom QR code",
    "Amar QR",
    "amarqr.online",
    "amarqr online",
    "QR maker",
    "free QR maker",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Amar QR — Free QR Code Generator Online",
    description:
      "Create free, customizable QR codes forever. No login, no paywall, no hidden charges. URL, Text, Email, WiFi, vCard and more.",
    url: siteUrl,
    siteName: "Amar QR",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og_image_final.png",
        width: 1080,
        height: 1080,
        alt: "Amar QR — Free QR Code Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amar QR — Free QR Code Generator Online",
    description:
      "Create free, customizable QR codes forever. No login, no paywall, no hidden charges.",
    images: ["/og_image_final.png"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Amar QR",
      url: siteUrl,
      logo: `${siteUrl}/favicon.svg`,
      description:
        "Create free, customizable QR codes forever. No login, no paywall, no hidden charges.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Amar QR — Free QR Code Generator Online",
      description:
        "Create free, customizable QR codes forever. URL, Text, Email, WiFi, vCard and more.",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#softwareapplication`,
      name: "Amar QR",
      applicationCategory: "Multimedia",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      url: siteUrl,
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
