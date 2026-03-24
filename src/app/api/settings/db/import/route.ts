import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".db")) {
      return NextResponse.json({ error: "Invalid file type. Only .db files are allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dbPath = path.join(process.cwd(), "prisma", "dev.db");

    // Prevent accidental zero-byte overriding
    if (buffer.length === 0) {
        return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }

    fs.writeFileSync(dbPath, buffer);

    return NextResponse.json({ success: true, message: "Database imported successfully." });
  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: "Failed to import database." }, { status: 500 });
  }
}
