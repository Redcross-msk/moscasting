import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
        expectedRole: { label: "Тип входа", type: "text" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse({
          email: raw?.email,
          password: raw?.password,
        });
        if (!parsed.success) return null;

        const expectedRole = String(raw?.expectedRole ?? "").toUpperCase();
        if (expectedRole !== "ACTOR" && expectedRole !== "PRODUCER") return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user || user.status !== "ACTIVE") return null;

        const ok = await compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        if (user.role !== "ADMIN") {
          if (expectedRole === "ACTOR" && user.role !== "ACTOR") return null;
          if (expectedRole === "PRODUCER" && user.role !== "PRODUCER") return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.email,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: UserRole }).role;
        token.email = user.email ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.email = (token.email as string) ?? session.user.email;
      }
      return session;
    },
  },
});
