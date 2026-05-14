import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const loanId = parseInt(paramId);
    const body = await req.json();
    const { amount, paymentDate, notes } = body;

    const result = await prisma.$transaction(async (tx) => {
      const parsedAmount = parseFloat(amount.toString());

      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { repayments: true, member: true }
      });

      if (!loan) throw new Error("Loan not found");

      // Create repayment record
      const repayment = await tx.loanRepayment.create({
        data: {
          loanId,
          memberId: loan.memberId,
          amount: parsedAmount,
          repaymentDate: new Date(paymentDate),
          notes,
        }
      });

      // Update remaining balance on loan
      await tx.loan.update({
        where: { id: loanId },
        data: { 
            totalRepaid: { increment: parsedAmount },
            remainingBalance: { decrement: parsedAmount },
        }
      });

      // Update company balance
      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { increment: parsedAmount } }
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          type: "LOAN_REPAYMENT",
          memberId: loan.memberId,
          amount: parsedAmount,
          date: new Date(paymentDate),
          description: `Loan repayment received`,
        }
      });

      // Check if loan is fully paid
      const totalPaidSoFar = loan.repayments.reduce((acc, curr) => acc + curr.amount, 0) + parsedAmount;
      if (totalPaidSoFar >= loan.loanAmount) {
        await tx.loan.update({
          where: { id: loanId },
          data: { status: "PAID" }
        });
      }

      // Activity log
      await tx.activityLog.create({
        data: {
          actionType: "Loan Repayment",
          description: `Recorded loan repayment of ৳${parsedAmount} from ${loan.member.fullName}`,
        }
      });

      return repayment;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to record repayment:", error);
    return NextResponse.json({ error: "Failed to record repayment" }, { status: 500 });
  }
}
