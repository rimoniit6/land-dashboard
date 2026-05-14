"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export function InvestmentModal({ isOpen, onClose, members }: { isOpen: boolean, onClose: () => void, members: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    memberId: "",
    investmentAmount: "",
    investmentDate: new Date().toISOString().split("T")[0],
    durationDays: "",
    businessType: "",
    notes: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) return alert("Select a member first");
    
    setLoading(true);

    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      router.refresh();
      onClose();
      // Reset form
      setFormData({
        ...formData,
        memberId: "",
        investmentAmount: "",
        durationDays: "",
        businessType: "",
        notes: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error saving investment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900">Record New Investment</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Member</label>
            <select
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Member</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.fullName} ({m.memberId})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Business Type / Idea</label>
            <input
              type="text"
              required
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Grocery Shop, Trading"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Investment Amount (৳)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Date</label>
              <input
                type="date"
                required
                value={formData.investmentDate}
                onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Duration (Days)</label>
            <input
              type="number"
              min="1"
              value={formData.durationDays}
              onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Notes (Optional)</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200"
            />
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
            Note: This amount will be deducted from the main company balance.
          </p>

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
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Processing..." : "Record Investment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
