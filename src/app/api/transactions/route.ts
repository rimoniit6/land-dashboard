import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // e.g. 'all', 'contributions', 'loans'
    
    let whereClause = {};
    if (type && type !== "all") {
        whereClause = { type: type.toUpperCase() };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: { member: { select: { fullName: true, memberId: true } } },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
