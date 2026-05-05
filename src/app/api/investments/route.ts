import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, investmentAmount, investmentDate, businessType, durationDays, notes } = body;

    if (!memberId || !investmentAmount || !investmentDate || !businessType) {
      return NextResponse.json({ error: "Missing required fields: memberId, investmentAmount, investmentDate, businessType" }, { status: 400 });
    }

    const parsedAmount = parseFloat(investmentAmount.toString());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Investment amount must be a positive number" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({ where: { id: parseInt(memberId) } });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {

      // Reduce company balance since money is taken from group
      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { decrement: parsedAmount } }
      });

      const investment = await tx.investment.create({
        data: {
          memberId: parseInt(memberId),
          investmentAmount: parsedAmount,
          investmentDate: new Date(investmentDate),
          durationDays: durationDays ? parseInt(durationDays) : null,
          businessType,
          notes,
          status: "ACTIVE",
        },
        include: { member: true }
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          type: "INVESTMENT",
          memberId: parseInt(memberId),
          amount: parsedAmount,
          date: new Date(investmentDate),
          description: `Given investment for ${businessType}`,
          reference: `INVESTMENT_${investment.id}`
        }
      });

      await tx.activityLog.create({
        data: {
          actionType: "Investment Given",
          description: `Gave investment of ৳${parsedAmount} to ${investment.member.fullName} for ${businessType}`,
        }
      });

      return investment;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to record investment:", error);
    return NextResponse.json({ error: "Failed to record investment" }, { status: 500 });
  }
}
