import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    // We need to deduct from company balance and remove ledger transaction
    // But since transactions are read-only ledger, we will just subtract the balance
    // An even better approach for real accounting is to add a reverse transaction, 
    // but for simplicity we will just delete and adjust balance.
    
    await prisma.$transaction(async (tx) => {
      const contribution = await tx.contribution.findUnique({
        where: { id },
        include: { member: true }
      });

      if (!contribution) throw new Error("Not found");

      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { decrement: contribution.amount } }
      });

      await tx.transaction.deleteMany({
        where: {
          OR: [
            { reference: `CONTRIBUTION_${id}` },
            { type: "CONTRIBUTION", memberId: contribution.memberId, amount: contribution.amount, date: contribution.paymentDate }
          ]
        }
      });

      await tx.contribution.delete({ where: { id } });

      await tx.activityLog.create({
        data: {
          actionType: "Contribution Deleted",
          description: `Deleted contribution of ৳${contribution.amount} from ${contribution.member.fullName}`,
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete contribution:", error);
    return NextResponse.json({ error: "Failed to delete contribution" }, { status: 500 });
  }
}
