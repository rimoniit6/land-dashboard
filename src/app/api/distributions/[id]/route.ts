import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    await prisma.$transaction(async (tx) => {
      const distribution = await tx.distribution.findUnique({ where: { id } });

      if (!distribution) throw new Error("Not found");

      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { increment: distribution.totalAmount } }
      });

      await tx.transaction.deleteMany({
        where: { type: "DISTRIBUTION", reference: `DISTRIBUTION_${id}` }
      });

      await tx.distributionItem.deleteMany({ where: { distributionId: id } });
      
      await tx.distribution.delete({ where: { id } });

      await tx.activityLog.create({
        data: {
          actionType: "Distribution Deleted",
          description: `Deleted distribution of ৳${distribution.totalAmount} (ID: ${distribution.id}) and refunded to balance.`,
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete distribution:", error);
    return NextResponse.json({ error: "Failed to delete distribution" }, { status: 500 });
  }
}
