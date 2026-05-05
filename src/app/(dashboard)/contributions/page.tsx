import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ContributionList } from "@/components/contributions/ContributionList";

export const dynamic = "force-dynamic";

export default async function ContributionsPage() {
  const [members, contributions, session] = await Promise.all([
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, memberId: true },
      orderBy: { fullName: "asc" }
    }),
    prisma.contribution.findMany({
      include: { member: { select: { fullName: true, memberId: true } } },
      orderBy: { paymentDate: "desc" }
    }),
    getServerSession(authOptions)
  ]);

  const isViewer = (session?.user as any)?.role === "VIEWER";

  return <ContributionList initialContributions={contributions} members={members} isViewer={isViewer} />;
}
