import "server-only";

import { UserStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

/** Заблокированный (SUSPENDED) аккаунт не пользуется разделами сайта до разблокировки. */
export async function redirectIfUserSuspended(userId: string) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });
  if (u?.status === UserStatus.SUSPENDED) {
    redirect("/login?suspended=1");
  }
}
