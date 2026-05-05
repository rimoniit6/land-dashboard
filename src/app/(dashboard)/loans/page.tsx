import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoanList } from "@/components/loans/LoanList";

export const dynamic = "force-dynamic";

export default async function LoansPage() {
  const [members, loans, session] = await Promise.all([
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, memberId: true },
      orderBy: { fullName: "asc" }
    }),
    prisma.loan.findMany({
      include: { 
        member: { select: { fullName: true, memberId: true } },
        repayments: true 
      },
      orderBy: { loanDate: "desc" }
    }),
    getServerSession(authOptions)
  ]);

  const isViewer = (session?.user as any)?.role === "VIEWER";

  return <LoanList initialLoans={loans} members={members} isViewer={isViewer} />;
}
