"use client";

import { useState } from "react";
import { Plus, PiggyBank, History } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompanyAccountClient({ account, depositHistory, isViewer = false }: any) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/company/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      setIsModalOpen(false);
      setFormData({ amount: "", date: new Date().toISOString().split("T")[0], description: "" });
    } catch (error) {
      console.error(error);
      alert("Error making deposit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Account</h1>
          <p className="text-slate-500 mt-1">Manage overall group balance and manual deposits.</p>
        </div>
        {!isViewer && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Manual Deposit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden h-fit">
          <div className="p-6 text-center bg-emerald-50 border-b border-emerald-100">
            <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <PiggyBank className="h-8 w-8" />
            </div>
            <h2 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Current Balance</h2>
            <p className="text-4xl font-bold text-slate-900 mt-2">৳{(account?.balance || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white text-sm text-slate-500">
            This balance is automatically updated when contributions, fines, profits, and manual deposits are recorded. It decreases when expenses or distributions are made.
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <History className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Recent Manual Deposits</h3>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depositHistory?.length > 0 ? (
                  depositHistory.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{tx.description}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">+৳{tx.amount.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No manual deposits found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Make Manual Deposit</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Amount (৳)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200"
                  placeholder="Source of money..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-emerald-600 text-white font-semibold py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Deposit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
