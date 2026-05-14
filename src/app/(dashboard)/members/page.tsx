import { prisma } from "@/lib/prisma";
import { MemberList } from "@/components/members/MemberList";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { joinDate: "desc" },
  });

  return <MemberList initialMembers={members} />;
}
