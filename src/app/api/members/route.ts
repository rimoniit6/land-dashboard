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

    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid Bangladeshi phone number format" }, { status: 400 });
    }

    const newMember = await prisma.member.create({
      data: {
        memberId,
        fullName,
        phone,
        address,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        nomineeName,
        nomineeRelation,
        nomineePhone,
      },
    });

    await prisma.activityLog.create({
      data: {
        actionType: "Member Added",
        description: `Added new member: ${fullName} (${memberId})`,
      },
    });

    return NextResponse.json(newMember);
  } catch (error) {
    console.error("Failed to create member:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
