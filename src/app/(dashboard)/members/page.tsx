import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MemberList } from "@/components/members/MemberList";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const [members, session] = await Promise.all([
    prisma.member.findMany({ orderBy: { joinDate: "desc" } }),
    getServerSession(authOptions),
  ]);

  const isViewer = (session?.user as any)?.role === "VIEWER";

  return <MemberList initialMembers={members} isViewer={isViewer} />;
}
