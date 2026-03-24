"use client";

import { useState } from "react";
import { FineModal } from "./FineModal";
import { Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function FineList({ initialFines, members }: { initialFines: any[], members: any[] }) {
  const [fines, setFines] = useState(initialFines);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === "VIEWER";

  const filtered = fines.filter(
    (f) =>
      f.member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.reason && f.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this fine? The amount will automatically be deducted from the company balance.")) return;

    try {
      const res = await fetch(`/api/fines/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setFines(fines.filter((f) => f.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting fine");
    }
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fine Management</h1>
          <p className="text-slate-500 mt-1">Record and track fines collected from members.</p>
        </div>
        {!isViewer && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Record Fine
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by member, ID, or reason..."
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
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length > 0 ? (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(f.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {f.member.fullName} <span className="text-slate-400 font-normal ml-1">({f.member.memberId})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {months[f.month - 1]} {f.year}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {f.reason}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ৳{f.fineAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isViewer && (
                        <button
                          onClick={() => handleDelete(f.id)}
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
                    No fines found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FineModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          window.location.reload(); 
        }} 
        members={members} 
      />
    </div>
  );
}
