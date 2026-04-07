import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Одна запись = одно засчитанное посещение (клиент дедуплицирует по сессии). */
export async function POST() {
  try {
    const session = await auth();
    await prisma.portalVisit.create({
      data: { userId: session?.user?.id ?? null },
    });
  } catch {
    /* не ломаем страницу при сбое аналитики */
  }
  return NextResponse.json({ ok: true });
}
