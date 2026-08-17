import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "AURION Global Holdings PLC | Integrated Value Chains from Africa to the World", template: "%s | AURION Global Holdings PLC" },
  description: "AURION Global Holdings PLC builds integrated value chains across Mining, Agro-Industry, Jewelry Manufacturing, Green Energy, Aviation & Logistics, and Global E-Commerce — connecting African[...]",
  keywords: ["AURION", "Ethiopia", "Africa export", "agro industry", "jewelry manufacturing", "mining", "green energy", "e-commerce Africa", "global trade"],
  openGraph: { title: "AURION Global Holdings PLC", description: "Building integrated value chains from Africa to the world.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#070b14] text-[#f4f1ea] antialiased">
        <Header />
        <main className="flex-1 pt-16 md:pt-20">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
