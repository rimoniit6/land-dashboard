import { prisma } from "@/lib/prisma";
import { LoanList } from "@/components/loans/LoanList";

export const dynamic = "force-dynamic";

export default async function LoansPage() {
  const members = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, fullName: true, memberId: true },
    orderBy: { fullName: "asc" }
  });

  const loans = await prisma.loan.findMany({
    include: { 
      member: { select: { fullName: true, memberId: true } },
      repayments: true 
    },
    orderBy: { loanDate: "desc" }
  });

  return <LoanList initialLoans={loans} members={members} />;
}
