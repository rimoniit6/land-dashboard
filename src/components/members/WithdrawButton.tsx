"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function WithdrawButton({ memberId, totalAmount, active, totalLoans = 0 }: { memberId: number, totalAmount: number, active: boolean, totalLoans?: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!active || totalAmount <= 0) return null;

  const handleWithdraw = async () => {
    if (!confirm(`Are you sure you want to withdraw ৳${totalAmount.toLocaleString()} and DEACTIVATE this account?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/members/${memberId}/withdraw`, { method: "POST" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to withdraw");
      }
      alert("Withdrawal successful! Account is now inactive.");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWithdraw}
      disabled={loading || totalLoans > 0}
      title={totalLoans > 0 ? "Cannot withdraw until all active loans are fully repaid." : ""}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition shadow-sm ${
        totalLoans > 0 
          ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
          : "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
      }`}
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Processing..." : `Withdraw ৳${totalAmount.toLocaleString()} & Deactivate`}
    </button>
  );
}
