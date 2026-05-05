import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id } });

      if (!expense) throw new Error("Not found");

      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { increment: expense.amount } }
      });

      await tx.transaction.deleteMany({
        where: { type: "EXPENSE", amount: expense.amount, date: expense.date }
      });

      await tx.expense.delete({ where: { id } });

      await tx.activityLog.create({
        data: {
          actionType: "Expense Deleted",
          description: `Deleted expense of ৳${expense.amount} (${expense.title})`,
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
