"use client";

import { X, Calendar } from "lucide-react";

export function LoanDetailsModal({ isOpen, onClose, loan }: { isOpen: boolean, onClose: () => void, loan: any }) {
  if (!isOpen || !loan) return null;

  const totalRepaid = loan.repayments.reduce((sum: number, r: any) => sum + r.amount, 0);
  const remaining = loan.loanAmount - totalRepaid;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
          <h2 className="text-xl font-semibold text-zinc-900">Loan Details</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Member Info</p>
              <p className="font-semibold text-slate-900 text-lg">{loan.member?.fullName}</p>
              <p className="text-sm text-slate-500">ID: {loan.member?.memberId}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium text-slate-500 mb-1">Loan Status</p>
              {loan.status === "ACTIVE" ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-orange-100 text-orange-800 text-sm font-semibold">
                  {remaining > 0 ? "ACTIVE" : "PENDING CLEARANCE"}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-sm font-semibold">
                  PAID
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-zinc-200">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Issue Date</p>
              <p className="font-semibold text-zinc-900">{new Date(loan.loanDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-zinc-200">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total Loan</p>
              <p className="font-semibold text-zinc-900">৳{loan.loanAmount.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Total Repaid</p>
              <p className="font-semibold text-emerald-700">৳{totalRepaid.toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <p className="text-xs font-medium text-orange-600 uppercase tracking-wider mb-1">Remaining</p>
              <p className="font-semibold text-orange-700">৳{remaining.toLocaleString()}</p>
            </div>
          </div>

          {loan.notes && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">Loan Reason/Notes</h3>
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 text-sm text-zinc-700">
                {loan.notes}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-500" />
              Repayment History
            </h3>
            
            {loan.repayments?.length > 0 ? (
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-600">
                  <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {/* Sort repayments by date descending so newest payments are first */}
                    {[...loan.repayments]
                      .sort((a, b) => new Date(b.repaymentDate).getTime() - new Date(a.repaymentDate).getTime())
                      .map((r: any, idx) => (
                      <tr key={r.id || idx} className="hover:bg-zinc-50/50 transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(r.repaymentDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">
                          +৳{r.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {r.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-50 rounded-lg border border-zinc-200 border-dashed text-zinc-500 text-sm">
                No repayments have been made yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
