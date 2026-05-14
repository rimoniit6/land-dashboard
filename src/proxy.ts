import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role;
    const { pathname } = req.nextUrl;
    
    // 1. Handle API Route Protection (Mutations)
    const isApiRoute = pathname.startsWith("/api/");
    const isMutation = req.method !== "GET";

    if (isApiRoute && isMutation && role === "VIEWER") {
      return NextResponse.json(
        { error: "Read-only mode. Changes are not allowed." },
        { status: 403 }
      );
    }

    // 2. Handle Admin Route UI Protection
    const isAdminRoute = pathname.startsWith("/settings") || 
                         pathname.startsWith("/activity") ||
                         pathname.startsWith("/api/settings");

    if (isAdminRoute && role !== "ADMIN") {
      // For API routes, return JSON, for UI routes redirect
      if (isApiRoute) {
        return NextResponse.json(
          { error: "Admin access required." },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  // Protect all routes under (dashboard), except for the login page and api routes
  // But usually, we protect everything except public paths.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - login (Login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
