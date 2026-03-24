"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseModal({ isOpen, onClose }: ExpenseModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Office",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      router.refresh();
      onClose();
      // Reset form
      setFormData({
        title: "",
        amount: "",
        category: "Office",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error saving expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900">Record Expense</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Expense Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Printer ink, Server cost"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Amount (৳)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Office">Office</option>
                <option value="Event">Event</option>
                <option value="Activity">Group Activity</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-blue-500"
              placeholder="Further details..."
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
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Processing..." : "Record Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
