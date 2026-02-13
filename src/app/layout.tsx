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
  title: "Lumina | Professional Screen & Dead Pixel Test",
  description: "The ultimate tool for screen testing, dead pixel detection, and ambient lighting. Features RGB color cycling, pure black mode, and wake lock support.",
  keywords: ["screen test", "dead pixel fix", "white screen", "black screen", "monitor calibration", "lcd test"],
  authors: [{ name: "Lumina Pro OS" }], // Senin imzan
  icons: {
    icon: "/favicon.ico", // public klasörüne bir favicon koymayı unutma
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