import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar"; // Importam Sidebar-ul

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRM Educational",
  description: "Platforma de management scolar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 `}>
        <div className="flex min-h-screen">
          {/* Meniul Lateral (Fix) */}
          <Sidebar />
          
          {/* Zona de continut (Dinamica) */}
          {/* margin-left-64 (ml-64) face loc pentru sidebar */}
          <main className="flex-1 ml-64 p-8 bg-slate-50 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

