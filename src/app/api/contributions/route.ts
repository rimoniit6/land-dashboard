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

    if (!memberId || !month || !year || !amount || !paymentDate) {
      return NextResponse.json({ error: "Missing required fields: memberId, month, year, amount, paymentDate" }, { status: 400 });
    }

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    const parsedAmount = parseFloat(amount.toString());

    if (parsedMonth < 1 || parsedMonth > 12) {
      return NextResponse.json({ error: "Month must be between 1 and 12" }, { status: 400 });
    }
    if (parsedYear < 2000 || parsedYear > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({ where: { id: parseInt(memberId) } });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.contribution.findFirst({
        where: { memberId: parseInt(memberId), month: parsedMonth, year: parsedYear }
      });
      if (existing) {
        throw new Error(`Contribution for month ${parsedMonth}/${parsedYear} already exists`);
      }

      const contribution = await tx.contribution.create({
        data: {
          memberId: parseInt(memberId),
          month: parsedMonth,
          year: parsedYear,
          amount: parsedAmount,
          paymentDate: new Date(paymentDate),
          notes: notes || null,
          isLate: isLate || false,
        },
        include: { member: true }
      });

      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { increment: parsedAmount } }
      });

      await tx.transaction.create({
        data: {
          type: "CONTRIBUTION",
          memberId: parseInt(memberId),
          amount: parsedAmount,
          date: new Date(paymentDate),
          description: `Monthly contribution for ${parsedMonth}/${parsedYear}`,
          reference: `CONTRIBUTION_${contribution.id}`
        }
      });

      await tx.activityLog.create({
        data: {
          actionType: "Contribution Added",
          description: `Recorded ৳${parsedAmount} from ${contribution.member.fullName} for ${parsedMonth}/${parsedYear}`,
        }
      });

      return contribution;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to record contribution:", error);
    if (error.message && error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to record contribution" }, { status: 500 });
  }
}
