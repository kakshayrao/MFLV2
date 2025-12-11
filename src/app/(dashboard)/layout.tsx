'use client'

import { Navbar } from "@/components/layout/navbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Pages that should NOT show the full navbar (they have their own simple header or no navbar)
  const hideNavbar = 
    pathname === '/main-dashboard' ||
    pathname.startsWith('/leagues/create') ||
    pathname.startsWith('/leagues/payment') ||
    pathname.includes('/edit') ||
    pathname === '/leagues';
  
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="min-h-screen bg-rfl-black">
        {children}
      </main>
    </>
  );
}

