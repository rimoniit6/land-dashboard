import { prisma } from "@/lib/prisma";
import { 
  OverviewChart } from "@/components/dashboard/OverviewChart";
import { DashboardStatsClient } from "@/components/dashboard/DashboardStatsClient";

async function getDashboardData() {
  const [
    memberCount,
    contributions,
    fines,
    loans,
    investments,
    expenses,
    companyAccount,
    profits,
    pastDistributions,
    withdrawals,
    manualDeposits,
  ] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.contribution.aggregate({ _sum: { amount: true } }),
    prisma.fine.aggregate({ _sum: { fineAmount: true } }),
    prisma.loan.aggregate({ _sum: { remainingBalance: true } }), // All active remaining balances
    prisma.investment.aggregate({ _sum: { investmentAmount: true }, where: { status: { not: "RETURNED" } } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.companyAccount.findFirst(),
    prisma.investment.aggregate({ _sum: { companyProfit: true, memberProfit: true } }),
    prisma.distribution.aggregate({ _sum: { totalAmount: true } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "WITHDRAWAL" } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "DEPOSIT", memberId: null } }),
  ]);

  const members = memberCount;
  const totalContributions = contributions._sum.amount || 0;
  const totalFines = fines._sum.fineAmount || 0;
  const activeLoans = loans._sum.remainingBalance || 0;
  const activeInvestments = investments._sum.investmentAmount || 0;
  const totalExpenses = expenses._sum.amount || 0;
  const totalCompanyProfit = profits._sum.companyProfit || 0;
  const totalProfitGiven = profits._sum.memberProfit || 0;
  const totalDistributed = pastDistributions._sum.totalAmount || 0;
  const totalWithdrawals = withdrawals._sum.amount || 0;
  const totalManualDeposits = manualDeposits._sum.amount || 0;

  // USER EXACT FORMULA: (Total Contributions + Total Company Profit + Total Fines Collected + Total Profit Given ) - (Total Expenses+Active Investments+Active Loans Given + Withdrawals)
  const companyBalance = (totalContributions + totalCompanyProfit + totalFines + totalProfitGiven) - (totalExpenses + activeInvestments + activeLoans + totalWithdrawals);

  return {
    members,
    totalContributions,
    totalFines,
    activeLoans,
    activeInvestments,
    totalExpenses,
    companyBalance,
    totalCompanyProfit,
    totalDistributed,
    totalProfitGiven,
    totalWithdrawals,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Fetch recent activities
  const recentActivities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Get recent 6 months of transactions for chart
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const recentTransactions = await prisma.transaction.findMany({
    where: { date: { gte: sixMonthsAgo } },
    select: { date: true, amount: true, type: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Summary of group financial status</p>
      </div>

      <DashboardStatsClient data={data} recentActivities={recentActivities} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[350px]">
          <h3 className="font-semibold text-slate-900 mb-4">Financial Overview (Last 6 Months)</h3>
          <OverviewChart transactions={recentTransactions} />
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Activities</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{log.actionType}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                        {log.createdAt.toLocaleDateString()} {log.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
