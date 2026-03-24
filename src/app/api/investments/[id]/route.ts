import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    await prisma.$transaction(async (tx) => {
      const investment = await tx.investment.findUnique({
        where: { id },
        include: { member: true }
      });

      if (!investment) throw new Error("Not found");

      // We only restore the original investment amount if profit wasn't recorded
      // If profit was recorded, deleting it is complex (undo profit splits).
      // For simplicity, we just delete and restore the original investment amount to company 
      // if it was active.
      
      if (investment.status === "ACTIVE") {
        await tx.companyAccount.update({
          where: { id: 1 },
          data: { balance: { increment: investment.investmentAmount } }
        });
      }

      await tx.transaction.deleteMany({
        where: {
          OR: [
            { reference: `INVESTMENT_${id}` },
            { type: "INVESTMENT", memberId: investment.memberId, amount: investment.investmentAmount, date: investment.investmentDate }
          ]
        }
      });

      await tx.investmentReturn.deleteMany({ where: { investmentId: id } });
      await tx.investment.delete({ where: { id } });

      await tx.activityLog.create({
        data: {
          actionType: "Investment Deleted",
          description: `Deleted investment of ৳${investment.investmentAmount} for ${investment.member.fullName}`,
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete investment:", error);
    return NextResponse.json({ error: "Failed to delete investment" }, { status: 500 });
  }
}
