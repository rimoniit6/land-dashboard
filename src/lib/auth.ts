import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.password) return null;

        // Hardcoded credentials
        if (credentials.id === "land" && credentials.password === "land") {
          return { id: "1", name: "Admin", email: "admin@landgroup.com", role: "ADMIN" };
        }
        if (credentials.id === "view" && credentials.password === "land") {
          return { id: "2", name: "Viewer", email: "viewer@landgroup.com", role: "VIEWER" };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
