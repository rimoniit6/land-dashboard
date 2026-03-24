import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        contributions: true,
        fines: true,
        loans: true,
        investments: { include: { returns: { orderBy: { returnDate: "desc" } } } },
        distributions: { include: { distribution: true } },
        transactions: { orderBy: { date: "desc" } }
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Failed to fetch member:", error);
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await req.json();
    const { fullName, phone, address, status, nomineeName, nomineeRelation, nomineePhone } = body;

    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid Bangladeshi phone number format" }, { status: 400 });
    }

    if (status === "INACTIVE") {
      const activeLoans = await prisma.loan.count({
        where: { memberId: id, status: "ACTIVE", remainingBalance: { gt: 0 } }
      });
      
      if (activeLoans > 0) {
        return NextResponse.json({ error: "Cannot deactivate member: Member has unpaid loans. Please repay all loans first." }, { status: 400 });
      }
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        fullName,
        phone,
        address,
        status,
        nomineeName,
        nomineeRelation,
        nomineePhone,
      },
    });

    await prisma.activityLog.create({
      data: {
        actionType: "Member Updated",
        description: `Updated profile for member: ${updatedMember.fullName}`,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Failed to update member:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    const member = await prisma.member.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        actionType: "Member Deleted",
        description: `Deleted member: ${member.fullName} (${member.memberId})`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete member:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
