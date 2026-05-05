import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { joinDate: "desc" },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, fullName, phone, address, joinDate, nomineeName, nomineeRelation, nomineePhone } = body;

    if (!memberId || !fullName) {
      return NextResponse.json({ error: "Member ID and Full Name are required" }, { status: 400 });
    }

    if (typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json({ error: "Full Name must be at least 2 characters" }, { status: 400 });
    }

    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid Bangladeshi phone number format" }, { status: 400 });
    }

    const existing = await prisma.member.findUnique({ where: { memberId: String(memberId) } });
    if (existing) {
      return NextResponse.json({ error: "Member ID already exists" }, { status: 409 });
    }

    const newMember = await prisma.member.create({
      data: {
        memberId: String(memberId),
        fullName: String(fullName).trim(),
        phone: phone || null,
        address: address || null,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        nomineeName: nomineeName || null,
        nomineeRelation: nomineeRelation || null,
        nomineePhone: nomineePhone || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        actionType: "Member Added",
        description: `Added new member: ${fullName} (${memberId})`,
      },
    });

    return NextResponse.json(newMember);
  } catch (error: any) {
    console.error("Failed to create member:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Member ID already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
