import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FineList } from "@/components/fines/FineList";

export const dynamic = "force-dynamic";

export default async function FinesPage() {
  const [members, fines, session] = await Promise.all([
    prisma.member.findMany({
      select: { id: true, fullName: true, memberId: true },
      orderBy: { fullName: "asc" }
    }),
    prisma.fine.findMany({
      include: { member: { select: { fullName: true, memberId: true } } },
      orderBy: { paymentDate: "desc" }
    }),
    getServerSession(authOptions)
  ]);

  const isViewer = (session?.user as any)?.role === "VIEWER";

  return <FineList initialFines={fines} members={members} isViewer={isViewer} />;
}
