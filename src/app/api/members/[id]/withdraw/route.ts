import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({
        where: { id },
        include: {
          contributions: true,
          investments: true,
          distributions: { include: { distribution: true } },
          loans: true,
        }
      });

      if (!member) throw new Error("Member not found");
      if (member.status === "INACTIVE") throw new Error("Member is already inactive");

      const totalContributions = member.contributions.reduce((acc, curr) => acc + curr.amount, 0);
      const totalProfitGiven = member.investments.reduce((acc, curr) => acc + (curr.memberProfit || 0), 0);
      const totalDistributions = member.distributions.reduce((acc, curr) => acc + curr.amount, 0);
      const totalLoans = member.loans.reduce((acc, curr) => acc + curr.remainingBalance, 0);
      
      if (totalLoans > 0) {
        throw new Error(`Cannot withdraw: Member has unpaid loans (৳${totalLoans.toLocaleString()}). Please repay all loans first.`);
      }

      const withdrawableAmount = (totalContributions + totalProfitGiven + totalDistributions) - totalLoans;

      if (withdrawableAmount <= 0) {
        throw new Error(`Nothing to withdraw. Calculated amount is ৳${withdrawableAmount}`);
      }

      await tx.transaction.create({
        data: {
          type: "WITHDRAWAL",
          memberId: id,
          amount: withdrawableAmount,
          date: new Date(),
          description: `Full withdrawal of Net Amount to deactivate account.`,
        }
      });

      const updatedMember = await tx.member.update({
        where: { id },
        data: { status: "INACTIVE" }
      });

      await tx.activityLog.create({
        data: {
          actionType: "Member Withdrawal",
          description: `${updatedMember.fullName} withdrew ৳${withdrawableAmount.toLocaleString()} and deactivated their account.`,
        }
      });

      return { success: true, withdrawableAmount };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to process withdrawal:", error);
    return NextResponse.json({ error: error.message || "Failed to process withdrawal" }, { status: 500 });
  }
}
