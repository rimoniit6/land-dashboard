import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, totalAmount, date, notes, memberIds } = body;

    if (!memberIds || memberIds.length === 0) {
      return NextResponse.json({ error: "No members selected" }, { status: 400 });
    }

    if (!totalAmount || !date) {
      return NextResponse.json({ error: "Missing required fields: totalAmount, date" }, { status: 400 });
    }

    const parsedAmount = parseFloat(totalAmount.toString());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {

      // Check balance first
      const account = await tx.companyAccount.findFirst();
      if (!account || account.balance < parsedAmount) {
        throw new Error("Insufficient company balance");
      }

      // Deduct from company balance
      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { decrement: parsedAmount } }
      });

      // Calculate per member
      const amountPerMember = parsedAmount / memberIds.length;

      // Create distribution record
      const distribution = await tx.distribution.create({
        data: {
          method: "SELECTED",
          totalAmount: parsedAmount,
          date: new Date(date),
          notes: title ? `${title} - ${notes || ''}` : notes,
          items: {
            create: memberIds.map((id: number) => ({
              memberId: id,
              amount: amountToDistributeRound(amountPerMember),
            }))
          }
        },
        include: { items: { include: { member: true } } }
      });

      // Avoid floating point precision issues in mapping exactly, 
      // but normally we just insert the calculated slice per member.

      // Record individual transactions for each member
      for (const id of memberIds) {
        await tx.transaction.create({
          data: {
            type: "DISTRIBUTION",
            memberId: id,
            amount: amountToDistributeRound(amountPerMember),
            date: new Date(date),
            description: `Profit Distribution: ${title}`,
            reference: `DISTRIBUTION_${distribution.id}`
          }
        });
      }

      await tx.activityLog.create({
        data: {
          actionType: "Fund Distributed",
          description: `Distributed ৳${parsedAmount} among ${memberIds.length} members for ${title}`,
        }
      });

      return distribution;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to distribute funds:", error);
    return NextResponse.json({ error: error.message || "Failed to distribute funds" }, { status: 500 });
  }
}

function amountToDistributeRound(num: number) {
  return Math.round(num * 100) / 100;
}
