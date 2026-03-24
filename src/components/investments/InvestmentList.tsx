"use client";

import { useState } from "react";
import { InvestmentModal } from "./InvestmentModal";
import { ProfitModal } from "./ProfitModal";
import { Plus, Search, Trash2, HandCoins } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function InvestmentList({ initialInvestments, members }: { initialInvestments: any[], members: any[] }) {
  const [investments, setInvestments] = useState(initialInvestments);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === "VIEWER";

  const filtered = investments.filter(
    (i) =>
      i.member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.businessType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this investment? If active, the principal will be returned to the company balance.")) return;

    try {
      const res = await fetch(`/api/investments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setInvestments(investments.filter((i) => i.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting investment");
    }
  };

  const handleProfitClick = (investment: any) => {
      setSelectedInvestment(investment);
      setIsProfitModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Investments</h1>
          <p className="text-slate-500 mt-1">Manage member business investments and profit distribution (10/90 split).</p>
        </div>
        {!isViewer && (
          <button
            onClick={() => setIsInvestModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Give Investment
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by member or business type..."
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
                <th className="px-6 py-4">Date Given</th>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Amount Given</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total Profit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length > 0 ? (
                filtered.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(i.investmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {i.member.fullName} <span className="text-slate-400 font-normal ml-1">({i.member.memberId})</span>
                    </td>
                    <td className="px-6 py-4">
                      {i.businessType}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ৳{i.investmentAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {i.status === "ACTIVE" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                              ACTIVE
                          </span>
                      ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-teal-100 text-teal-800 text-xs font-semibold">
                              COMPLETED
                          </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-teal-600">
                      {i.profitAmount ? `৳${i.profitAmount.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {i.status === "ACTIVE" && !isViewer && (
                          <button
                            onClick={() => handleProfitClick(i)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-lg transition text-xs font-medium"
                            title="Record Profit & Complete"
                          >
                            <HandCoins className="h-3.5 w-3.5" />
                            Return + Profit
                          </button>
                      )}
                      {!isViewer && (
                        <button
                          onClick={() => handleDelete(i.id)}
                          className="inline-flex p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No investments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvestmentModal 
        isOpen={isInvestModalOpen} 
        onClose={() => {
          setIsInvestModalOpen(false);
          window.location.reload(); 
        }} 
        members={members}
      />

      <ProfitModal 
        isOpen={isProfitModalOpen}
        onClose={() => {
            setIsProfitModalOpen(false);
            window.location.reload();
        }}
        investment={selectedInvestment}
      />
    </div>
  );
}
