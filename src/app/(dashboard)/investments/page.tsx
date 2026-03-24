import { prisma } from "@/lib/prisma";
import { InvestmentList } from "@/components/investments/InvestmentList";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage() {
  const members = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, fullName: true, memberId: true },
    orderBy: { fullName: "asc" }
  });

  const investments = await prisma.investment.findMany({
    include: { member: { select: { fullName: true, memberId: true } } },
    orderBy: { investmentDate: "desc" }
  });

  return <InvestmentList initialInvestments={investments} members={members} />;
}
