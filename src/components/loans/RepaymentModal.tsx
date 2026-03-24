"use client";

import { useState } from "react";
import { X, ArrowDownToLine } from "lucide-react";
import { useRouter } from "next/navigation";

export function RepaymentModal({ isOpen, onClose, loan }: { isOpen: boolean, onClose: () => void, loan: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  if (!isOpen || !loan) return null;

  const totalRepaid = loan.repayments.reduce((sum: number, r: any) => sum + r.amount, 0);
  const remaining = loan.loanAmount - totalRepaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/loans/${loan.id}/repayments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to record repayment");
      
      router.refresh();
      onClose();
      setFormData({ amount: "", paymentDate: new Date().toISOString().split("T")[0], notes: "" });
    } catch (error) {
      console.error(error);
      alert("Error recording repayment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900">Loan Repayment</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
               {loan.member?.fullName?.charAt(0)}
            </div>
            <div>
                <p className="font-semibold text-slate-900">{loan.member?.fullName}</p>
                <div className="text-xs text-slate-500 mt-1 flex gap-3">
                    <span>Total: ৳{loan.loanAmount.toLocaleString()}</span>
                    <span className="font-medium text-orange-600">Remaining: ৳{remaining.toLocaleString()}</span>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Amount (৳)</label>
              <input
                type="number"
                required
                min="1"
                max={Math.ceil(remaining)} // Allow small overpayment if floats get weird, but generally cap it
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Date</label>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Notes (Optional)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200"
              placeholder="e.g. First installment"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || remaining <= 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              {loading ? "Processing..." : "Record Repayment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
