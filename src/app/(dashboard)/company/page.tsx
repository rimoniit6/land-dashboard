import { prisma } from "@/lib/prisma";
import CompanyAccountClient from "./CompanyAccountClient";

export const dynamic = "force-dynamic";

export default async function CompanyAccountPage() {
  const [
    contributions,
    fines,
    loans,
    investments,
    expenses,
    profits,
    pastDistributions,
    withdrawals,
    manualDeposits,
  ] = await Promise.all([
    prisma.contribution.aggregate({ _sum: { amount: true } }),
    prisma.fine.aggregate({ _sum: { fineAmount: true } }),
    prisma.loan.aggregate({ _sum: { remainingBalance: true } }),
    prisma.investment.aggregate({ _sum: { investmentAmount: true }, where: { status: { not: "RETURNED" } } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.investment.aggregate({ _sum: { companyProfit: true, memberProfit: true } }),
    prisma.distribution.aggregate({ _sum: { totalAmount: true } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "WITHDRAWAL" } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "DEPOSIT", memberId: null } }),
  ]);

  // USER EXACT FORMULA
  const companyBalance = 
    (contributions._sum.amount || 0) + 
    (profits._sum.companyProfit || 0) +
    (fines._sum.fineAmount || 0) + 
    (profits._sum.memberProfit || 0) -
    (expenses._sum.amount || 0) - 
    (investments._sum.investmentAmount || 0) - 
    (loans._sum.remainingBalance || 0) -
    (withdrawals._sum.amount || 0);

  const account = { id: 1, balance: companyBalance };

  const depositHistory = await prisma.transaction.findMany({
    where: { type: "DEPOSIT" },
    orderBy: { date: "desc" },
    take: 10,
  });

  return <CompanyAccountClient account={account as any} depositHistory={depositHistory} />;
}
