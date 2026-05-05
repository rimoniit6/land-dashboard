import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, month, year, fineAmount, paymentDate, reason } = body;

    if (!memberId || !month || !year || !fineAmount || !paymentDate) {
      return NextResponse.json({ error: "Missing required fields: memberId, month, year, fineAmount, paymentDate" }, { status: 400 });
    }

    const parsedAmount = parseFloat(fineAmount.toString());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Fine amount must be a positive number" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({ where: { id: parseInt(memberId) } });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {

      const fine = await tx.fine.create({
        data: {
          memberId: parseInt(memberId),
          month: parseInt(month),
          year: parseInt(year),
          fineAmount: parsedAmount,
          paymentDate: new Date(paymentDate),
          reason,
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
          type: "FINE",
          memberId: parseInt(memberId),
          amount: parsedAmount,
          date: new Date(paymentDate),
          description: `Fine collected for ${month}/${year}: ${reason}`,
          reference: `FINE_${fine.id}`
        }
      });

      // Activity log
      await tx.activityLog.create({
        data: {
          actionType: "Fine Collected",
          description: `Collected fine of ৳${parsedAmount} from ${fine.member.fullName}`,
        }
      });

      return fine;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to record fine:", error);
    return NextResponse.json({ error: "Failed to record fine" }, { status: 500 });
  }
}
