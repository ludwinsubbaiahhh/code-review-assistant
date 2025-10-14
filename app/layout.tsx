// File: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Code Review Assistant",
  description: "AI-Powered Code Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F0F0FF]`}>
        {/* This div creates the purple gradient effect at the top */}
        <div className="absolute top-0 left-0 -z-10 h-[400px] w-full bg-gradient-to-br from-purple-200 to-blue-200" />
        <Header />
        <main className="container mx-auto max-w-5xl py-8">
          {children}
        </main>
      </body>
    </html>
  );
}