import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, amount, category, date, description } = body;

    if (!title || !amount || !date) {
      return NextResponse.json({ error: "Missing required fields: title, amount, date" }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount.toString());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {

      // 1. Create expense
      const expense = await tx.expense.create({
        data: {
          title,
          amount: parsedAmount,
          category,
          date: new Date(date),
          description,
        }
      });

      // 2. Reduce company balance
      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { decrement: parsedAmount } }
      });

      // 3. Record transaction
      await tx.transaction.create({
        data: {
          type: "EXPENSE",
          amount: parsedAmount,
          date: new Date(date),
          description: `Expense: ${title} (${category})`,
        }
      });

      // 4. Activity log
      await tx.activityLog.create({
        data: {
          actionType: "Expense Recorded",
          description: `Recorded expense of ৳${parsedAmount} for ${title}`,
        }
      });

      return expense;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to record expense:", error);
    return NextResponse.json({ error: "Failed to record expense" }, { status: 500 });
  }
}
