import { Navbar } from "@/components/layout/navbar";
import AuthProvider from "@/components/auth/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-screen bg-rfl-black">
        {children}
      </main>
    </AuthProvider>
  );
}

