import { prisma } from "@/lib/prisma";
import { ArrowDownLeft, ArrowUpRight, Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    include: { member: { select: { fullName: true, memberId: true } } },
    orderBy: { date: "desc" },
    take: 500, // Limit for performance
  });

  // Calculate flow
  const totalIn = transactions
    .filter(t => ["CONTRIBUTION", "FINE", "LOAN_REPAYMENT", "PROFIT", "DEPOSIT"].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalOut = transactions
    .filter(t => ["LOAN", "INVESTMENT", "EXPENSE", "DISTRIBUTION"].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Full Transaction Ledger</h1>
        <p className="text-slate-500 mt-1">A complete read-only history of all financial movements in the company.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ArrowDownLeft className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Inflow (Visible)</p>
            <p className="text-2xl font-bold text-slate-900">৳{totalIn.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Outflow (Visible)</p>
            <p className="text-2xl font-bold text-slate-900">৳{totalOut.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Simple static table, could be made client component with filtering if needed, keeping simple for now */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Associated Member</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length > 0 ? (
                transactions.map((t) => {
                  const isInflow = ["CONTRIBUTION", "FINE", "LOAN_REPAYMENT", "PROFIT", "DEPOSIT"].includes(t.type);
                  
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                          isInflow ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {t.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {t.member ? `${t.member.fullName} (${t.member.memberId})` : <span className="text-slate-400">Company</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-sm truncate">
                        {t.description}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                        isInflow ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {isInflow ? "+" : "-"}৳{t.amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
