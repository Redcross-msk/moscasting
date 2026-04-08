import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      /** ФИО из профиля актёра / продюсера для меню (без email). */
      displayName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    displayName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    email?: string | null;
    displayName?: string | null;
  }
}
