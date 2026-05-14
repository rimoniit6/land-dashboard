import { prisma } from "@/lib/prisma";
import { FineList } from "@/components/fines/FineList";

export const dynamic = "force-dynamic";

export default async function FinesPage() {
  const members = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, fullName: true, memberId: true },
    orderBy: { fullName: "asc" }
  });

  const fines = await prisma.fine.findMany({
    include: { member: { select: { fullName: true, memberId: true } } },
    orderBy: { paymentDate: "desc" }
  });

  return <FineList initialFines={fines} members={members} />;
}
