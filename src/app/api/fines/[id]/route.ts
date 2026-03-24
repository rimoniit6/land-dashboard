import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    await prisma.$transaction(async (tx) => {
      const fine = await tx.fine.findUnique({
        where: { id },
        include: { member: true }
      });

      if (!fine) throw new Error("Not found");

      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { decrement: fine.fineAmount } }
      });

      await tx.transaction.deleteMany({
        where: {
          OR: [
            { reference: `FINE_${id}` },
            { type: "FINE", memberId: fine.memberId, amount: fine.fineAmount, date: fine.paymentDate }
          ]
        }
      });

      await tx.fine.delete({ where: { id } });

      await tx.activityLog.create({
        data: {
          actionType: "Fine Deleted",
          description: `Deleted fine of ৳${fine.fineAmount} from ${fine.member.fullName}`,
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete fine:", error);
    return NextResponse.json({ error: "Failed to delete fine" }, { status: 500 });
  }
}
