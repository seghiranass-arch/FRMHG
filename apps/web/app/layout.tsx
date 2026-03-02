import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { RegisterServiceWorker } from "../components/pwa/register-sw";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap"
});

export const metadata: Metadata = {
  title: "FRMHG — Plateforme de gestion",
  description: "Plateforme de gestion — Fédération Royale Marocaine de Hockey sur Glace",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FRMHG"
  },
  icons: {
    icon: "/logo_frmhg.png",
    apple: "/logo_frmhg.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}








