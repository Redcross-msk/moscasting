"use server";

import { revalidatePath } from "next/cache";
import { UserStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { upsertProfileStarRating } from "@/server/services/profile-star-rating.service";

export type SetProfileStarRatingResult =
  | { ok: true }
  | { ok: false; error: string };

export async function setProfileStarRatingAction(
  subjectUserId: string,
  stars: number,
): Promise<SetProfileStarRatingResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Войдите, чтобы поставить оценку" };
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true },
  });
  if (me?.status === UserStatus.SUSPENDED) {
    return { ok: false, error: "Аккаунт заблокирован" };
  }

  try {
    await upsertProfileStarRating(session.user.id, subjectUserId, stars);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Не удалось сохранить оценку";
    return { ok: false, error: msg };
  }

  const [actor, producer] = await Promise.all([
    prisma.actorProfile.findUnique({
      where: { userId: subjectUserId },
      select: { id: true },
    }),
    prisma.producerProfile.findUnique({
      where: { userId: subjectUserId },
      select: { id: true },
    }),
  ]);
  if (actor) revalidatePath(`/actors/${actor.id}`);
  if (producer) revalidatePath(`/producers/${producer.id}`);

  return { ok: true };
}
