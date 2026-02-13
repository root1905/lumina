import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Uygulama hissi için zoom kapatıldı
};

export const metadata: Metadata = {
  title: "Lumina Pro | Screen & Audio Test Lab",
  description: "Professional screen testing, dead pixel repair, and audio frequency analysis tool.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Uygulama hissi için zoom kapalı
  },
  icons: {
    icon: "/icons/icon-192.png", // Tarayıcı sekmesi için
    shortcut: "/icons/icon-192.png",
    apple: "/icons/icon-512.png", // iPhone ana ekranı için
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lumina Pro",
  },
  openGraph: {
    title: "Lumina Pro Display Tool",
    description: "Professional grade screen testing tool.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-black text-white overflow-hidden">{children}</body>
    </html>
  );
}