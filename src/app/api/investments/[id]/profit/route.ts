import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await req.json();
    const { profitAmount, profitDate, returnPrincipal } = body;

    if (!profitAmount || !profitDate) {
      return NextResponse.json({ error: "Missing required fields: profitAmount, profitDate" }, { status: 400 });
    }

    const parsedProfit = parseFloat(profitAmount.toString());
    if (isNaN(parsedProfit) || parsedProfit <= 0) {
      return NextResponse.json({ error: "Profit amount must be a positive number" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      
      const memberProfit = parsedProfit * 0.10;
      const companyProfit = parsedProfit * 0.90;

      const current = await tx.investment.findUnique({ where: { id } });
      if (!current) throw new Error("Investment not found");

      const newProfitAmount = (current.profitAmount || 0) + parsedProfit;
      const newMemberProfit = (current.memberProfit || 0) + memberProfit;
      const newCompanyProfit = (current.companyProfit || 0) + companyProfit;

      const investment = await tx.investment.update({
        where: { id },
        data: {
          profitAmount: newProfitAmount,
          profitDate: new Date(profitDate),
          memberProfit: newMemberProfit,
          companyProfit: newCompanyProfit,
          status: returnPrincipal ? "RETURNED" : "ACTIVE"
        },
        include: { member: true }
      });

      const principalToReturn = returnPrincipal ? investment.investmentAmount : 0;
      const totalToCompany = principalToReturn + companyProfit;

      await tx.companyAccount.update({
        where: { id: 1 },
        data: { balance: { increment: totalToCompany } }
      });

      // Record in history table
      await tx.investmentReturn.create({
        data: {
          investmentId: id,
          returnType: returnPrincipal ? "PROFIT_AND_PRINCIPAL" : "PROFIT",
          amount: parsedProfit + principalToReturn,
          returnDate: new Date(profitDate),
          memberProfit,
          companyProfit
        }
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          type: "PROFIT",
          memberId: investment.memberId,
          amount: companyProfit,
          date: new Date(profitDate),
          description: `Company profit (90%) from ${investment.businessType}`,
        }
      });

      // Also conditionally record the return of the principal amount
      if (returnPrincipal) {
        await tx.transaction.create({
          data: {
            type: "DEPOSIT",
            memberId: investment.memberId,
            amount: investment.investmentAmount,
            date: new Date(profitDate),
            description: `Return of principal investment for ${investment.businessType}`,
            reference: `INVESTMENT_PRINCIPAL_${investment.id}`
          }
        });
      }

      await tx.activityLog.create({
        data: {
          actionType: "Profit Recorded",
          description: `Recorded profit of ৳${parsedProfit} from ${investment.member.fullName}. Company: ৳${companyProfit}, Member: ৳${memberProfit}`,
        }
      });

      return investment;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to record profit:", error);
    return NextResponse.json({ error: "Failed to record profit" }, { status: 500 });
  }
}
