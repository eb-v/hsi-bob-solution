import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "SustainAd",
  description: "Sustainable Advertising Platform",
  manifest: "/manifest.json",
  themeColor: "#10b981", // Green theme color for SustainAd
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SustainAd",
  },
  icons: {
    icon: "/icon512_rounded.png",
    apple: "/icon512_rounded.png",
  },
};

// Separate viewport export
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}