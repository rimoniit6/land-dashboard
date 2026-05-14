"use client";

import { useState } from "react";
import { ExpenseModal } from "./ExpenseModal";
import { Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function ExpenseList({ initialExpenses }: { initialExpenses: any[] }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const isViewer = (session?.user as any)?.role === "VIEWER";
  const canEdit = isAuthenticated && !isViewer;

  const filtered = expenses.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this expense? The amount will automatically be restored to the company balance.")) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setExpenses(expenses.filter((e) => e.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting expense");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Group Expenses</h1>
          <p className="text-slate-500 mt-1">Record and track company expenses.</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Record Expense
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length > 0 ? (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{e.title}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs font-semibold">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">
                      {e.description || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600">
                      -৳{e.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          window.location.reload(); 
        }} 
      />
    </div>
  );
}
