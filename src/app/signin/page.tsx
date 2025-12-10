"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Redirecting...</div>
    </div>
  );
}
