"use client";

import { useState } from "react";
import { LoanModal } from "./LoanModal";
import { RepaymentModal } from "./RepaymentModal";
import { LoanDetailsModal } from "./LoanDetailsModal";
import { Plus, Search, Trash2, ArrowDownToLine, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function LoanList({ initialLoans, members }: { initialLoans: any[], members: any[] }) {
  const [loans, setLoans] = useState(initialLoans);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [selectedLoanForDetails, setSelectedLoanForDetails] = useState<any>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === "VIEWER";

  const filtered = loans.filter(
    (l) =>
      l.member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.notes && l.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this loan entirely? This will also delete all repayment history for this loan and restore the company balance.")) return;

    try {
      const res = await fetch(`/api/loans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setLoans(loans.filter((l) => l.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting loan");
    }
  };

  const handleRepayClick = (e: React.MouseEvent, loan: any) => {
    e.stopPropagation();
    setSelectedLoan(loan);
    setIsRepayModalOpen(true);
  };

  const handleRowClick = (loan: any) => {
    setSelectedLoanForDetails(loan);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Loan Management</h1>
          <p className="text-slate-500 mt-1">Issue group loans and track member repayments.</p>
        </div>
        {!isViewer && (
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Issue Loan
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by member or reason..."
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
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Repaid</th>
                <th className="px-6 py-4">Remaining</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length > 0 ? (
                filtered.map((l) => {
                  const totalRepaid = l.repayments.reduce((sum: number, r: any) => sum + r.amount, 0);
                  const remaining = l.loanAmount - totalRepaid;
                  
                  return (
                    <tr 
                      key={l.id} 
                      className="hover:bg-slate-50/50 transition cursor-pointer"
                      onClick={() => handleRowClick(l)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(l.loanDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {l.member.fullName} <span className="text-slate-400 font-normal ml-1">({l.member.memberId})</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ৳{l.loanAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-medium">
                        ৳{totalRepaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-orange-600 font-medium">
                        ৳{remaining.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {l.status === "ACTIVE" ? (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-orange-100 text-orange-800 text-xs font-semibold">
                                {remaining > 0 ? "ACTIVE" : "PENDING CLEARANCE"}
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">
                                PAID
                            </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {l.status === "ACTIVE" && remaining > 0 && !isViewer && (
                            <button
                              onClick={(e) => handleRepayClick(e, l)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition text-xs font-medium"
                              title="Record Repayment"
                            >
                              <ArrowDownToLine className="h-3.5 w-3.5" />
                              Repay
                            </button>
                        )}
                        {l.status === "PAID" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-emerald-600 bg-emerald-50 rounded-lg text-xs font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Fully Paid
                            </span>
                        )}
                        {!isViewer && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(l.id); }}
                            className="inline-flex p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
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
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No loans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LoanModal 
        isOpen={isLoanModalOpen} 
        onClose={() => {
          setIsLoanModalOpen(false);
          window.location.reload(); 
        }} 
        members={members}
      />

      <RepaymentModal 
        isOpen={isRepayModalOpen}
        onClose={() => {
            setIsRepayModalOpen(false);
            window.location.reload();
        }}
        loan={selectedLoan}
      />

      <LoanDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        loan={selectedLoanForDetails}
      />
    </div>
  );
}
