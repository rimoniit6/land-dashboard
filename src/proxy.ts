import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const role = token?.role as string | undefined;
    const isMutation = req.method !== "GET" && req.method !== "HEAD";

    if (isMutation && role === "VIEWER") {
      return NextResponse.json(
        { error: "Read-only mode. Changes are not allowed." },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  if (pathname === "/login" || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/((?!auth).*)",
    "/((?!api|login|_next/static|_next/image|favicon.ico).*)",
  ],
};
