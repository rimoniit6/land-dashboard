import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const isApi = req.nextUrl.pathname.startsWith("/api/");
    const isMutation = req.method !== "GET";

    // Allow all GET requests (public view mode)
    if (!isMutation) {
      return NextResponse.next();
    }

    // Block mutations for unauthenticated users
    if (isMutation && !role) {
      return NextResponse.json(
        { error: "Please login to perform this action." },
        { status: 401 }
      );
    }

    // Block mutations for VIEWER role
    if (isApi && isMutation && role === "VIEWER") {
      return NextResponse.json(
        { error: "Read-only mode. Changes are not allowed." },
        { status: 403 }
      );
    }
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    // Protect all routes except auto-excluded static files and explicit public routes
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
};
