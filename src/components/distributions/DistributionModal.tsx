"use client";

import { useState } from "react";
import { X, Share2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export function DistributionModal({ isOpen, onClose, members, balance }: { isOpen: boolean, onClose: () => void, members: any[], balance: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // By default select all active members
  const [formData, setFormData] = useState({
    title: "",
    totalAmount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    memberIds: members.map(m => m.id),
  });

  if (!isOpen) return null;

  const toggleMember = (id: number) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(id) 
        ? prev.memberIds.filter(mId => mId !== id)
        : [...prev.memberIds, id]
    }));
  };

  const handleSelectAll = (select: boolean) => {
      setFormData(prev => ({
          ...prev,
          memberIds: select ? members.map(m => m.id) : []
      }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.memberIds.length === 0) return alert("Select at least one member to distribute to.");
    
    const amount = parseFloat(formData.totalAmount);
    if (amount > balance) {
        return alert(`Insufficient available profit! You only have ৳${balance.toLocaleString()}`);
    }

    setLoading(true);

    try {
      const res = await fetch("/api/distributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save");
      }
      
      router.refresh();
      onClose();
      // Reset form
      setFormData({
        title: "",
        totalAmount: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        memberIds: members.map(m => m.id),
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error saving distribution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Distribute Company Funds</h2>
            <p className="text-sm text-slate-500 mt-1">Available Profit to Distribute: <span className="font-bold text-slate-800">৳{balance.toLocaleString()}</span></p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Distribution Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Yearly Profit 2024"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Total Amount to Distribute (৳)</label>
              <input
                type="number"
                required
                min="1"
                max={balance}
                step="any"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-sm font-medium text-zinc-700">Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200"
              />
            </div>
          </div>

          <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                 <label className="text-sm font-medium text-slate-800 flex items-center gap-2">
                     <Users className="h-4 w-4" />
                     Select Recipients ({formData.memberIds.length}/{members.length})
                 </label>
                 <div className="space-x-2 text-xs">
                     <button type="button" onClick={() => handleSelectAll(true)} className="text-blue-600 hover:underline">Select All</button>
                     <span className="text-slate-300">|</span>
                     <button type="button" onClick={() => handleSelectAll(false)} className="text-slate-600 hover:underline">Clear</button>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
                  {members.map(m => (
                      <label key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          formData.memberIds.includes(m.id) ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                      }`}>
                          <input 
                            type="checkbox" 
                            checked={formData.memberIds.includes(m.id)}
                            onChange={() => toggleMember(m.id)}
                            className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="text-sm">
                              <p className="font-medium text-slate-800 leading-none">{m.fullName}</p>
                              <p className="text-xs text-slate-500 mt-1">ID: {m.memberId}</p>
                          </div>
                      </label>
                  ))}
              </div>
          </div>

          {formData.totalAmount && formData.memberIds.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-slate-600">Each selected member will receive:</span>
                  <span className="font-bold text-lg text-slate-900">
                      ৳{(parseFloat(formData.totalAmount) / formData.memberIds.length).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
              </div>
          )}

          <div className="pt-4 flex justify-end gap-3 shrink-0 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.memberIds.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Share2 className="h-4 w-4" />
              {loading ? "Processing..." : "Distribute Funds"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
