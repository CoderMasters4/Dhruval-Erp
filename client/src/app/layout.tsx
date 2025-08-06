import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ERP System - Textile Business Management",
  description: "Complete ERP solution for textile and fabric printing business with multi-company support",
  keywords: "ERP, textile, fabric, printing, inventory, warehouse, invoicing",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ERP System",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "ERP Management System",
    title: "ERP System - Textile Business Management",
    description: "Complete ERP solution for textile and fabric printing business",
  },
  twitter: {
    card: "summary",
    title: "ERP System - Textile Business Management",
    description: "Complete ERP solution for textile and fabric printing business",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="ERP System" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ERP System" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#0ea5e9" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://yourapp.com" />
        <meta name="twitter:title" content="ERP System" />
        <meta name="twitter:description" content="Complete ERP solution for textile business" />
        <meta name="twitter:image" content="https://yourapp.com/icons/icon-192x192.png" />
        <meta name="twitter:creator" content="@yourhandle" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ERP System" />
        <meta property="og:description" content="Complete ERP solution for textile business" />
        <meta property="og:site_name" content="ERP System" />
        <meta property="og:url" content="https://yourapp.com" />
        <meta property="og:image" content="https://yourapp.com/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
