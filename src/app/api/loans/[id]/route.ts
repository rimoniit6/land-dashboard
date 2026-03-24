import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id },
        include: { repayments: true, member: true }
      });

      if (!loan) throw new Error("Not found");

      // Calculate how much was actually given vs repaid
      const totalRepaid = loan.repayments.reduce((acc, curr) => acc + curr.amount, 0);
      
      // The original loan minus what was repaid needs to be added back to company
      const amountToRestore = loan.loanAmount - totalRepaid;

      if (amountToRestore > 0) {
        await tx.companyAccount.update({
          where: { id: 1 },
          data: { balance: { increment: amountToRestore } }
        });
      } else if (amountToRestore < 0) {
        // Technically overpaid? Adjust balance accordingly
        await tx.companyAccount.update({
            where: { id: 1 },
            data: { balance: { decrement: Math.abs(amountToRestore) } }
        });
      }

      // Delete loan transaction from ledger
      await tx.transaction.deleteMany({
        where: {
          OR: [
            { reference: `LOAN_${id}` },
            { type: "LOAN", memberId: loan.memberId, amount: loan.loanAmount, date: loan.loanDate }
          ]
        }
      });

      // Delete repayments first
      await tx.loanRepayment.deleteMany({ where: { loanId: id } });
      // Delete loan
      await tx.loan.delete({ where: { id } });

      await tx.activityLog.create({
        data: {
          actionType: "Loan Deleted",
          description: `Deleted loan of ৳${loan.loanAmount} from ${loan.member.fullName}`,
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete loan:", error);
    return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 });
  }
}
