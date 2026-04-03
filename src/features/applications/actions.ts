"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { calculateAge } from "@/lib/utils";
import {
  acceptToProjectApplication,
  applyToCasting,
  ensureProducerInvitationApplication,
  markCastPassed,
  rejectApplication,
  withdrawApplication,
} from "@/server/services/application.service";

export type ActorApplyPreview =
  | { error: string }
  | {
      error?: undefined;
      actorProfileId: string;
      fullName: string;
      cityName: string;
      age: number;
      heightCm: number | null;
      weightKg: number | null;
    };

export async function getActorProfilePreviewForApply(): Promise<ActorApplyPreview> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") {
    return { error: "Только для актёров" };
  }
  const profile = await prisma.actorProfile.findUnique({
    where: { userId: session.user.id },
    include: { city: true },
  });
  if (!profile) {
    return { error: "Сначала заполните профиль актёра" };
  }
  return {
    actorProfileId: profile.id,
    fullName: profile.fullName,
    cityName: profile.city.name,
    age: calculateAge(new Date(profile.birthDate)),
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
  };
}

export async function applyToCastingAction(
  castingId: string,
  coverNote?: string,
): Promise<{ chatId: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") throw new Error("Только для актёров");

  const profile = await prisma.actorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Сначала заполните профиль");

  const { chatId } = await applyToCasting({ castingId, actorProfileId: profile.id, coverNote });
  revalidatePath(`/castings/${castingId}`);
  revalidatePath("/explore");
  revalidatePath("/actor/applications");
  revalidatePath("/actor/chats");
  return { chatId };
}

export async function withdrawApplicationAction(applicationId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") throw new Error("Forbidden");

  await withdrawApplication(applicationId, session.user.id);
  revalidatePath("/actor/applications");
}

export async function markCastPassedAction(applicationId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  await markCastPassed(applicationId, session.user.id);
  revalidatePath("/producer/castings");
  revalidatePath("/actor/applications");
  revalidatePath("/notifications");
}

export async function rejectApplicationAction(applicationId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  await rejectApplication(applicationId, session.user.id);
  revalidatePath("/producer/castings");
  revalidatePath("/actor/applications");
  revalidatePath("/notifications");
  revalidatePath("/producer/chats");
  revalidatePath("/actor/chats");
}

export async function acceptToProjectAction(applicationId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  await acceptToProjectApplication(applicationId, session.user.id);
  revalidatePath("/producer/castings");
  revalidatePath("/actor/applications");
  revalidatePath("/notifications");
  revalidatePath("/producer/chats");
  revalidatePath("/actor/chats");
}

export type ProducerInviteResult = { error: string } | { chatId: string };

export async function producerInviteActorAction(
  castingId: string,
  actorProfileId: string,
): Promise<ProducerInviteResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") {
    return { error: "Только для кастинг-директора" };
  }
  if (!castingId?.trim() || !actorProfileId?.trim()) {
    return { error: "Выберите кастинг" };
  }

  try {
    const { chatId } = await ensureProducerInvitationApplication({
      castingId: castingId.trim(),
      actorProfileId: actorProfileId.trim(),
      producerUserId: session.user.id,
    });
    revalidatePath("/producer/chats");
    revalidatePath("/actor/applications");
    revalidatePath(`/actors/${actorProfileId}`);
    return { chatId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Не удалось создать чат";
    return { error: msg };
  }
}
