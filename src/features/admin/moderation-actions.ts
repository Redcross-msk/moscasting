"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CastingStatus, ModerationStatus } from "@prisma/client";
import { logAdminAction } from "@/server/services/admin.service";
import { createInAppNotification } from "@/server/services/notification.service";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session.user;
}

export async function approveCastingModerationAction(castingId: string) {
  const admin = await requireAdmin();
  const c = await prisma.casting.update({
    where: { id: castingId },
    data: {
      moderationStatus: ModerationStatus.APPROVED,
      moderationComment: null,
      status: CastingStatus.ACTIVE,
    },
    include: { producerProfile: { include: { user: true } } },
  });

  await createInAppNotification({
    userId: c.producerProfile.userId,
    title: "Кастинг опубликован",
    body: `«${c.title}» прошёл модерацию и отображается актёрам.`,
    payload: { type: "casting_moderation_approved", castingId },
  });

  await logAdminAction(admin.id, "moderation.casting.approve", "Casting", castingId);
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/castings");
  revalidatePath("/");
  revalidatePath("/castings");
  revalidatePath("/producer/castings");
  revalidatePath("/notifications");
}

export async function rejectCastingModerationAction(formData: FormData) {
  const admin = await requireAdmin();
  const castingId = String(formData.get("castingId") ?? "");
  const text = String(formData.get("comment") ?? "").trim();
  if (!castingId) throw new Error("Нет id");
  if (text.length < 5) throw new Error("Опишите причину отклонения (от 5 символов)");

  const c = await prisma.casting.update({
    where: { id: castingId },
    data: {
      moderationStatus: ModerationStatus.REJECTED,
      moderationComment: text,
      status: CastingStatus.DRAFT,
    },
    include: { producerProfile: { include: { user: true } } },
  });

  await createInAppNotification({
    userId: c.producerProfile.userId,
    title: "Кастинг не прошёл модерацию",
    body: text.slice(0, 200),
    payload: { type: "casting_moderation_rejected", castingId },
  });

  await logAdminAction(admin.id, "moderation.casting.reject", "Casting", castingId, { comment: text });
  revalidatePath("/admin/moderation");
  revalidatePath("/producer/castings");
  revalidatePath("/");
  revalidatePath("/notifications");
}

export async function approveActorProfileModerationAction(profileId: string) {
  const admin = await requireAdmin();
  const p = await prisma.actorProfile.update({
    where: { id: profileId },
    data: { moderationStatus: ModerationStatus.APPROVED, moderationComment: null },
    include: { user: true },
  });

  await createInAppNotification({
    userId: p.userId,
    title: "Профиль актёра одобрен",
    body: "Ваш профиль прошёл проверку и может отображаться в каталоге.",
    payload: { type: "actor_profile_approved", profileId },
  });

  await logAdminAction(admin.id, "moderation.actor.approve", "ActorProfile", profileId);
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/actors");
  revalidatePath("/actors");
  revalidatePath("/notifications");
}

export async function rejectActorProfileModerationAction(formData: FormData) {
  const admin = await requireAdmin();
  const profileId = String(formData.get("profileId") ?? "");
  const text = String(formData.get("comment") ?? "").trim();
  if (!profileId) throw new Error("Нет id");
  if (text.length < 5) throw new Error("Опишите причину отклонения (от 5 символов)");

  const p = await prisma.actorProfile.update({
    where: { id: profileId },
    data: { moderationStatus: ModerationStatus.REJECTED, moderationComment: text },
    include: { user: true },
  });

  await createInAppNotification({
    userId: p.userId,
    title: "Профиль актёра не принят",
    body: text.slice(0, 200),
    payload: { type: "actor_profile_rejected", profileId },
  });

  await logAdminAction(admin.id, "moderation.actor.reject", "ActorProfile", profileId, { comment: text });
  revalidatePath("/admin/moderation");
  revalidatePath("/notifications");
}

export async function approveProducerProfileModerationAction(profileId: string) {
  const admin = await requireAdmin();
  const p = await prisma.producerProfile.update({
    where: { id: profileId },
    data: { moderationStatus: ModerationStatus.APPROVED, moderationComment: null },
    include: { user: true },
  });

  await createInAppNotification({
    userId: p.userId,
    title: "Профиль кастинг-директора одобрен",
    body: "Ваш профиль прошёл проверку.",
    payload: { type: "producer_profile_approved", profileId },
  });

  await logAdminAction(admin.id, "moderation.producer.approve", "ProducerProfile", profileId);
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/producers");
  revalidatePath("/notifications");
}

export async function rejectProducerProfileModerationAction(formData: FormData) {
  const admin = await requireAdmin();
  const profileId = String(formData.get("profileId") ?? "");
  const text = String(formData.get("comment") ?? "").trim();
  if (!profileId) throw new Error("Нет id");
  if (text.length < 5) throw new Error("Опишите причину отклонения (от 5 символов)");

  const p = await prisma.producerProfile.update({
    where: { id: profileId },
    data: { moderationStatus: ModerationStatus.REJECTED, moderationComment: text },
    include: { user: true },
  });

  await createInAppNotification({
    userId: p.userId,
    title: "Профиль не принят",
    body: text.slice(0, 200),
    payload: { type: "producer_profile_rejected", profileId },
  });

  await logAdminAction(admin.id, "moderation.producer.reject", "ProducerProfile", profileId, { comment: text });
  revalidatePath("/admin/moderation");
  revalidatePath("/notifications");
}

export async function approveCastingModerationFormAction(formData: FormData) {
  const id = String(formData.get("castingId") ?? "");
  if (!id) throw new Error("Нет id");
  return approveCastingModerationAction(id);
}

export async function approveActorProfileModerationFormAction(formData: FormData) {
  const id = String(formData.get("profileId") ?? "");
  if (!id) throw new Error("Нет id");
  return approveActorProfileModerationAction(id);
}

export async function approveProducerProfileModerationFormAction(formData: FormData) {
  const id = String(formData.get("profileId") ?? "");
  if (!id) throw new Error("Нет id");
  return approveProducerProfileModerationAction(id);
}
