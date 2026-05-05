"use client";

import { useState } from "react";
import { X, HandCoins } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfitModal({ isOpen, onClose, investment }: { isOpen: boolean, onClose: () => void, investment: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    profitAmount: "",
    profitDate: new Date().toISOString().split("T")[0],
    returnPrincipal: false,
  });

  if (!isOpen || !investment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/investments/${investment.id}/profit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      onClose();
      setFormData({ profitAmount: "", profitDate: new Date().toISOString().split("T")[0], returnPrincipal: false });
    } catch (error) {
      console.error(error);
      alert("Error recording profit.");
    } finally {
      setLoading(false);
    }
  };

  const currentProfit = parseFloat(formData.profitAmount || "0");
  const memberShare = currentProfit * 0.10;
  const companyShare = currentProfit * 0.90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900">Record Profit & Return</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
               {investment.member?.fullName?.charAt(0)}
            </div>
            <div>
                <p className="font-semibold text-slate-900">{investment.member?.fullName}</p>
                <p className="text-xs text-slate-500">{investment.businessType} (Inv: ৳{investment.investmentAmount.toLocaleString()})</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Total Profit Earned (৳)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.profitAmount}
                onChange={(e) => setFormData({ ...formData, profitAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Profit Date</label>
              <input
                type="date"
                required
                value={formData.profitDate}
                onChange={(e) => setFormData({ ...formData, profitDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200"
              />
            </div>
            <div className="space-y-2 col-span-2 mt-2">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input 
                  type="checkbox" 
                  checked={formData.returnPrincipal}
                  onChange={(e) => setFormData({ ...formData, returnPrincipal: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-slate-700">Return Principal (৳{investment.investmentAmount.toLocaleString()}) and close investment</span>
              </label>
            </div>
          </div>

          {currentProfit > 0 && (
            <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Automatic Split Calculation:</span>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Member Share (10%)</span>
                    <span className="font-semibold text-slate-900">৳{memberShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Company Share (90%)</span>
                    <span className="font-semibold text-teal-700">৳{companyShare.toLocaleString()}</span>
                </div>
                <p className="text-xs text-teal-600 mt-2 border-t border-teal-200 pt-2">
                   Company Profit (৳{companyShare.toLocaleString()}) will be added to the company balance.{' '}
                   {formData.returnPrincipal && `The initial investment (৳${investment.investmentAmount.toLocaleString()}) will also be returned.`}
                </p>
            </div>
          )}

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
              disabled={loading || currentProfit <= 0}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <HandCoins className="h-4 w-4" />
              {loading ? "Processing..." : "Record & Complete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
