import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DistributionList } from "@/components/distributions/DistributionList";

export const dynamic = "force-dynamic";

export default async function DistributionsPage() {
  const [members, distributions, profits, fines, expenses, pastDistributions, session] = await Promise.all([
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, memberId: true },
      orderBy: { fullName: "asc" }
    }),
    prisma.distribution.findMany({
      include: { items: { include: { member: { select: { fullName: true, memberId: true } } } } },
      orderBy: { date: "desc" }
    }),
    prisma.investment.aggregate({ _sum: { companyProfit: true } }),
    prisma.fine.aggregate({ _sum: { fineAmount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.distribution.aggregate({ _sum: { totalAmount: true } }),
    getServerSession(authOptions)
  ]);

  const availableProfit =
    (profits._sum.companyProfit || 0) +
    (fines._sum.fineAmount || 0) -
    (expenses._sum.amount || 0) -
    (pastDistributions._sum.totalAmount || 0);

  const isViewer = (session?.user as any)?.role === "VIEWER";

  return <DistributionList initialDistributions={distributions} members={members} isViewer={isViewer} availableProfit={availableProfit} />;
}
