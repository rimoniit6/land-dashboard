import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbPath = path.join(process.cwd(), "prisma", "dev.db");

    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Database file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="land-dashboard-backup-${new Date().toISOString().split('T')[0]}.db"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Download Error:", error);
    return NextResponse.json({ error: "Failed to download database" }, { status: 500 });
  }
}
