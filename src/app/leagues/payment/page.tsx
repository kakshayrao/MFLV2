"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const handlePaid = () => {
    router.push("/leagues/details");
  };
  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-rfl-navy">League Payment</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Pricing</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>League Creation Fee: <span className="font-bold">₹499</span></li>
            <li>Service Charge: <span className="font-bold">₹99</span></li>
            <li>GST (18%): <span className="font-bold">₹107.82</span></li>
          </ul>
          <div className="text-lg font-bold text-rfl-coral mb-4">Total: ₹705.82</div>
        </div>
        <Button type="button" className="w-full bg-green-600 text-white hover:bg-green-700" onClick={handlePaid}>Paid</Button>
      </div>
    </div>
  );
}
