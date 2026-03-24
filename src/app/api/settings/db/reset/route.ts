import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use a transaction to safely delete all records
    await prisma.$transaction([
      prisma.loanRepayment.deleteMany({}),
      prisma.loan.deleteMany({}),
      prisma.investmentReturn.deleteMany({}),
      prisma.investment.deleteMany({}),
      prisma.fine.deleteMany({}),
      prisma.contribution.deleteMany({}),
      prisma.distributionItem.deleteMany({}),
      prisma.distribution.deleteMany({}),
      prisma.transaction.deleteMany({}),
      prisma.activityLog.deleteMany({}),
      prisma.expense.deleteMany({}),
      prisma.member.deleteMany({}),
      // Set company account balance back to 0
      prisma.companyAccount.update({
        where: { id: 1 },
        data: { balance: 0 },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Database reset successfully" });
  } catch (error) {
    console.error("Reset Error:", error);
    return NextResponse.json({ error: "Failed to reset database" }, { status: 500 });
  }
}
