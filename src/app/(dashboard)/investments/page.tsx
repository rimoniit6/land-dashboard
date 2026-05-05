import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InvestmentList } from "@/components/investments/InvestmentList";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage() {
  const [members, investments, session] = await Promise.all([
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, memberId: true },
      orderBy: { fullName: "asc" }
    }),
    prisma.investment.findMany({
      include: { member: { select: { fullName: true, memberId: true } } },
      orderBy: { investmentDate: "desc" }
    }),
    getServerSession(authOptions)
  ]);

  const isViewer = (session?.user as any)?.role === "VIEWER";

  return <InvestmentList initialInvestments={investments} members={members} isViewer={isViewer} />;
}
