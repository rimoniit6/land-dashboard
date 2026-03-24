import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, description, date } = body;

    const result = await prisma.$transaction(async (tx) => {
      const parsedAmount = parseFloat(amount.toString());

      // Update company balance
      const account = await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { increment: parsedAmount } }
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          type: "DEPOSIT",
          amount: parsedAmount,
          date: new Date(date),
          description: description || "Manual deposit to company account",
        }
      });

      // Activity log
      await tx.activityLog.create({
        data: {
          actionType: "Manual Deposit",
          description: `Deposited ৳${parsedAmount} to company account.`,
        }
      });

      return account;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to make deposit:", error);
    return NextResponse.json({ error: "Failed to make deposit" }, { status: 500 });
  }
}
