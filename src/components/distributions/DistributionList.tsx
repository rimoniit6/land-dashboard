"use client";

import { useState } from "react";
import { DistributionModal } from "./DistributionModal";
import { Plus, Search, Trash2, Tag, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function DistributionList({ initialDistributions, members, companyBalance }: { initialDistributions: any[], members: any[], companyBalance: number }) {
  const [distributions, setDistributions] = useState(initialDistributions);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const isViewer = (session?.user as any)?.role === "VIEWER";
  const canEdit = isAuthenticated && !isViewer;

  const filtered = distributions.filter(
    (d) =>
      (d.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this distribution? The total amount will be returned to the company balance.")) return;

    try {
      const res = await fetch(`/api/distributions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setDistributions(distributions.filter((d) => d.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting distribution");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fund Distributions</h1>
          <p className="text-slate-500 mt-1">Split company profits and distribute them among members.</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Distribution
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title..."
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
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Recipients</th>
                <th className="px-6 py-4">Amt. per Member</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length > 0 ? (
                filtered.map((d) => {
                    const recipientCount = d.items.length;
                    const perMember = recipientCount > 0 ? d.totalAmount / recipientCount : 0;

                    return (
                        <tr key={d.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(d.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                            Distribution #{d.id}
                            {d.notes && <p className="text-xs text-slate-400 mt-1 font-normal truncate max-w-[200px]">{d.notes}</p>}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                            ৳{d.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                {recipientCount} Members
                            </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-emerald-600">
                            ৳{perMember.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                            {canEdit && (
                              <button
                                  onClick={() => handleDelete(d.id)}
                                  className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete & Refund"
                              >
                                  <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                        </td>
                        </tr>
                    )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No fund distributions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DistributionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          window.location.reload(); 
        }} 
        members={members}
        balance={companyBalance}
      />
    </div>
  );
}
