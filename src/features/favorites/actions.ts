"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Не авторизован");
  return session.user.id;
}

export async function toggleFavoriteCastingAction(castingId: string): Promise<{ favorited: boolean }> {
  const userId = await requireUserId();
  const existing = await prisma.favoriteCasting.findUnique({
    where: { userId_castingId: { userId, castingId } },
  });
  if (existing) {
    await prisma.favoriteCasting.delete({ where: { id: existing.id } });
    revalidatePath("/explore");
    revalidatePath(`/explore?tab=favorites`);
    revalidatePath(`/castings/${castingId}`);
    return { favorited: false };
  }
  await prisma.favoriteCasting.create({ data: { userId, castingId } });
  revalidatePath("/explore");
  revalidatePath(`/explore?tab=favorites`);
  revalidatePath(`/castings/${castingId}`);
  return { favorited: true };
}

export async function toggleFavoriteActorAction(actorProfileId: string): Promise<{ favorited: boolean }> {
  const userId = await requireUserId();
  const existing = await prisma.favoriteActor.findUnique({
    where: { userId_actorProfileId: { userId, actorProfileId } },
  });
  if (existing) {
    await prisma.favoriteActor.delete({ where: { id: existing.id } });
    revalidatePath("/explore");
    revalidatePath(`/explore?tab=favorites`);
    revalidatePath(`/actors/${actorProfileId}`);
    return { favorited: false };
  }
  await prisma.favoriteActor.create({ data: { userId, actorProfileId } });
  revalidatePath("/explore");
  revalidatePath(`/explore?tab=favorites`);
  revalidatePath(`/actors/${actorProfileId}`);
  return { favorited: true };
}
