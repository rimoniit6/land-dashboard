import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const memberId = searchParams.get("memberId");

    const where: any = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (memberId) where.memberId = parseInt(memberId);

    const contributions = await prisma.contribution.findMany({
      where,
      include: { member: { select: { fullName: true, memberId: true } } },
      orderBy: { paymentDate: "desc" },
    });
    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Failed to fetch contributions:", error);
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, month, year, amount, paymentDate, notes, isLate } = body;

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      const parsedAmount = parseFloat(amount.toString());
      
      const contribution = await tx.contribution.create({
        data: {
          memberId: parseInt(memberId),
          month: parseInt(month),
          year: parseInt(year),
          amount: parsedAmount,
          paymentDate: new Date(paymentDate),
          notes,
          isLate: isLate || false,
        },
        include: { member: true }
      });

      // Update company balance
      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { increment: parsedAmount } }
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          type: "CONTRIBUTION",
          memberId: parseInt(memberId),
          amount: parsedAmount,
          date: new Date(paymentDate),
          description: `Monthly contribution for ${month}/${year}`,
          reference: `CONTRIBUTION_${contribution.id}`
        }
      });

      // Activity log
      await tx.activityLog.create({
        data: {
          actionType: "Contribution Added",
          description: `Recorded ৳${parsedAmount} from ${contribution.member.fullName} for ${month}/${year}`,
        }
      });

      return contribution;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to record contribution:", error);
    return NextResponse.json({ error: "Failed to record contribution" }, { status: 500 });
  }
}
