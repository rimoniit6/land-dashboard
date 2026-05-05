import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, MapPin, Calendar, Activity, Wallet, AlertTriangle, TrendingUp, Banknote } from "lucide-react";
import { WithdrawButton } from "@/components/members/WithdrawButton";
import { ExportPdfButton } from "@/components/members/ExportPdfButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const isViewer = (session?.user as any)?.role === "VIEWER";
  const resolvedParams = await params;
  const memberId = parseInt(resolvedParams.id);
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      contributions: { orderBy: { createdAt: "desc" }, take: 5 },
      fines: { orderBy: { createdAt: "desc" }, take: 5 },
      loans: { orderBy: { createdAt: "desc" }, take: 5 },
      investments: { 
        orderBy: { createdAt: "desc" }, 
        take: 5,
        include: { returns: { orderBy: { returnDate: "desc" } } }
      },
      distributions: { include: { distribution: true } },
      transactions: { orderBy: { date: "desc" }, take: 10 },
    },
  });

  if (!member) return notFound();

  // Calculate totals
  const totalContributions = member.contributions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFines = member.fines.reduce((acc, curr) => acc + curr.fineAmount, 0);
  const totalLoans = member.loans.reduce((acc, curr) => acc + curr.remainingBalance, 0);
  const totalInvestments = member.investments.reduce((acc, curr) => acc + curr.investmentAmount, 0);
  const totalProfitGiven = member.investments.reduce((acc, curr) => acc + (curr.memberProfit || 0), 0);
  const totalDistributions = member.distributions.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalWithdrawals = member.transactions
    .filter(tx => tx.type === "WITHDRAWAL")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalAmount = (totalContributions + totalProfitGiven + totalDistributions) - totalLoans - totalWithdrawals;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/members" className="p-2 hover:bg-slate-200 rounded-lg transition">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Member Profile</h1>
          <p className="text-slate-500 mt-1">Detailed overview of member activity</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportPdfButton memberId={member.id} />
          {!isViewer && (
             <WithdrawButton memberId={member.id} totalAmount={totalAmount} active={member.status === "ACTIVE"} totalLoans={totalLoans} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
              <User className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{member.fullName}</h2>
            <p className="text-slate-500 font-medium">ID: {member.memberId}</p>
            <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              member.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {member.status}
            </span>
          </div>
          
          <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="h-5 w-5 text-slate-400" />
              <span className="text-sm">{member.phone || "No phone number"}</span>
            </div>
            <div className="flex items-start gap-3 text-slate-600">
              <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-sm">{member.address || "No address provided"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Calendar className="h-5 w-5 text-slate-400" />
              <span className="text-sm">Joined {new Date(member.joinDate).toDateString()}</span>
            </div>
          </div>

          {member.nomineeName && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Nominee Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">{member.nomineeName}</span>
                </div>
                {member.nomineeRelation && (
                  <div className="flex items-start gap-3 text-slate-600">
                    <span className="text-xs text-slate-500 font-medium ml-7 uppercase tracking-wider">Relation: {member.nomineeRelation}</span>
                  </div>
                )}
                {member.nomineePhone && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">{member.nomineePhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                <Wallet className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-medium text-slate-600">Total Contribution</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">৳{totalContributions.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="text-sm font-medium text-slate-600">Total Fines</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">৳{totalFines.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                <Banknote className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-medium text-slate-600">Loans Taken</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">৳{totalLoans.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-medium text-slate-600">Business Investments</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">৳{totalInvestments.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                <Activity className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-medium text-slate-600">Profit Given</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">৳{totalProfitGiven.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                <Wallet className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-medium text-slate-600">Total Distributions Received</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">৳{totalDistributions.toLocaleString()}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm bg-indigo-50/50">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                <Activity className="h-5 w-5 text-indigo-700" />
                <h3 className="text-sm font-medium text-indigo-900">Total Net Amount</h3>
              </div>
              <p className="text-2xl font-bold text-indigo-900">৳{totalAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
              <Link href={`/transactions?memberId=${member.id}`} className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {member.transactions.length > 0 ? (
                member.transactions.map(tx => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{tx.type.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{tx.description || "No description"}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        ['CONTRIBUTION', 'FINE', 'LOAN_REPAYMENT', 'PROFIT'].includes(tx.type) ? 'text-green-600' : 'text-slate-900'
                      }`}>
                        {['CONTRIBUTION', 'FINE', 'LOAN_REPAYMENT', 'PROFIT'].includes(tx.type) ? '+' : ''}৳{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">No recent transactions found</div>
              )}
            </div>
          </div>

          {/* Investment History Segment */}
          {member.investments.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Investment Return History</h3>
              </div>
              <div className="p-5 space-y-4">
                {member.investments.map(inv => (
                  <div key={inv.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                      <p className="font-medium text-slate-800">{inv.businessType}</p>
                      <p className="text-sm text-slate-600">Inv: ৳{inv.investmentAmount.toLocaleString()} {inv.durationDays ? `(${inv.durationDays} Days)` : ''}</p>
                    </div>
                    {inv.returns && inv.returns.length > 0 ? (
                      <div className="space-y-2">
                         {inv.returns.map((ret: { id: number, returnDate: Date | string, returnType: string, amount: number }) => (
                          <div key={ret.id} className="flex justify-between text-sm">
                            <span className="text-slate-500">{new Date(ret.returnDate).toLocaleDateString()}</span>
                            <span className="text-slate-700">Type: {ret.returnType === "PROFIT_AND_PRINCIPAL" ? "Profit + Principal" : "Profit"}</span>
                            <span className="font-semibold text-teal-600">৳{ret.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No returns recorded yet.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
