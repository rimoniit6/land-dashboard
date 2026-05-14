import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, loanAmount, loanDate, reason, durationDays } = body;

    const result = await prisma.$transaction(async (tx) => {
      const parsedAmount = parseFloat(loanAmount.toString());

      // Reduce company balance since money is given out as loan
      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { decrement: parsedAmount } }
      });

      const loan = await tx.loan.create({
        data: {
          memberId: parseInt(memberId),
          loanAmount: parsedAmount,
          remainingBalance: parsedAmount,
          loanDate: new Date(loanDate),
          durationDays: durationDays ? parseInt(durationDays) : null,
          notes: reason,
          status: "ACTIVE",
        },
        include: { member: true }
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          type: "LOAN",
          memberId: parseInt(memberId),
          amount: parsedAmount,
          date: new Date(loanDate),
          description: `Loan issued: ${reason}`,
          reference: `LOAN_${loan.id}`
        }
      });

      // Activity log
      await tx.activityLog.create({
        data: {
          actionType: "Loan Issued",
          description: `Issued loan of ৳${parsedAmount} to member ID ${loan.memberId}`,
        }
      });

      return loan;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to issue loan:", error);
    return NextResponse.json({ error: "Failed to issue loan" }, { status: 500 });
  }
}
