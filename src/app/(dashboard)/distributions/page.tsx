import { prisma } from "@/lib/prisma";
import { DistributionList } from "@/components/distributions/DistributionList";

export const dynamic = "force-dynamic";

export default async function DistributionsPage() {
  const members = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, fullName: true, memberId: true },
    orderBy: { fullName: "asc" }
  });

  const distributions = await prisma.distribution.findMany({
    include: { items: true },
    orderBy: { date: "desc" }
  });

  const fines = await prisma.fine.aggregate({ _sum: { fineAmount: true } });
  const profits = await prisma.investment.aggregate({ _sum: { companyProfit: true } });
  const pastDistributions = await prisma.distribution.aggregate({ _sum: { totalAmount: true } });
  const expenses = await prisma.expense.aggregate({ _sum: { amount: true } });

  const availableProfit = 
    (fines._sum.fineAmount || 0) + 
    (profits._sum.companyProfit || 0) - 
    (expenses._sum.amount || 0) - 
    (pastDistributions._sum.totalAmount || 0);

  return <DistributionList 
    initialDistributions={distributions} 
    members={members} 
    companyBalance={availableProfit} 
  />;
}
