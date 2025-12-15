"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle2 } from "lucide-react";

type UserInfo = { id: string; firstName: string; avatarUrl?: string };

export function TopNav({ user, onSignOut }: { user: UserInfo; onSignOut: () => void }) {
  const initial = (user?.firstName || "U").charAt(0).toUpperCase();
  return (
    <nav className="h-14 bg-white border-b" style={{ borderColor: "#E6E9EE" }}>
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/main-dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold"
              style={{ background: "#0B365F" }}>MFL</div>
          <span className="text-sm md:text-base font-semibold" style={{ color: "#0B365F" }}>My Fitness League</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="btn-outline font-semibold"
          >
            <Link href="/profile" aria-label="View profile">
              <span className="inline-flex items-center gap-2">
                <UserCircle2 className="w-4 h-4 text-amber-500" />
                <span>{user?.firstName || "Profile"}</span>
              </span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="btn-outline" aria-label="Sign out" onClick={onSignOut}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Sign Out</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
