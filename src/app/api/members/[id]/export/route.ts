import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Since Next.js 15, route segment params are promises in server contexts where possible, though GET params can wait
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const memberId = parseInt(id);

    // Fetch the member with ALL transactions and summary data using aggregates
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        contributions: true,
        fines: true,
        loans: true,
        investments: {
          include: { returns: true },
        },
        distributions: { include: { distribution: true } },
        transactions: { orderBy: { date: "desc" } }, // get all transactions chronologically descending
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Failed to fetch export data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
