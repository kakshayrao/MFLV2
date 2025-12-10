'use client'

import { Navbar } from "@/components/layout/navbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMainDashboard = pathname === '/main-dashboard';
  
  return (
    <>
      {!isMainDashboard && <Navbar />}
      <main className="min-h-screen bg-rfl-black">
        {children}
      </main>
    </>
  );
}

