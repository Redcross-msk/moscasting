"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CastingStatus, ModerationStatus, ReportStatus } from "@prisma/client";
import {
  setUserSuspended,
  setActorBlocked,
  setProducerBlocked,
  setCastingBlocked,
  logAdminAction,
  deleteUserCascade,
  adminSoftDeleteCasting,
  adminUpdateCastingBasics,
} from "@/server/services/admin.service";
import {
  replaceHomepageFeaturedActors,
  replaceHomepageFeaturedCastings,
} from "@/server/services/homepage.service";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { updateReportStatus } from "@/server/services/report.service";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session.user;
}

export async function suspendUserAction(userId: string, suspended: boolean) {
  const admin = await requireAdmin();
  await setUserSuspended(userId, suspended);
  await logAdminAction(admin.id, suspended ? "user.suspend" : "user.unsuspend", "User", userId);
  revalidatePath("/admin/users");
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  await deleteUserCascade(userId);
  await logAdminAction(admin.id, "user.delete", "User", userId);
  revalidatePath("/admin/users");
}

export async function blockActorProfileAction(profileId: string, blocked: boolean) {
  const admin = await requireAdmin();
  await setActorBlocked(profileId, blocked);
  await logAdminAction(admin.id, blocked ? "actor.block" : "actor.unblock", "ActorProfile", profileId);
  revalidatePath("/admin/users");
}

export async function blockProducerProfileAction(profileId: string, blocked: boolean) {
  const admin = await requireAdmin();
  await setProducerBlocked(profileId, blocked);
  await logAdminAction(admin.id, blocked ? "producer.block" : "producer.unblock", "ProducerProfile", profileId);
  revalidatePath("/admin/users");
}

export async function blockCastingAction(castingId: string, blocked: boolean) {
  const admin = await requireAdmin();
  await setCastingBlocked(castingId, blocked);
  await logAdminAction(admin.id, blocked ? "casting.block" : "casting.unblock", "Casting", castingId);
  revalidatePath("/admin/castings");
  revalidatePath("/castings");
  revalidatePath("/explore");
  revalidatePath("/");
}

export async function updateReportAction(reportId: string, status: ReportStatus, adminNotes?: string) {
  const admin = await requireAdmin();
  await updateReportStatus(reportId, status, adminNotes);
  await logAdminAction(admin.id, "report.update", "Report", reportId, { status });
  revalidatePath("/admin/reports");
}

export async function adminDeleteCastingAction(castingId: string) {
  const admin = await requireAdmin();
  await adminSoftDeleteCasting(castingId);
  await logAdminAction(admin.id, "casting.delete", "Casting", castingId);
  revalidatePath("/admin/castings");
  revalidatePath("/explore");
  revalidatePath("/");
}

export async function adminUpdateCastingBasicsAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("castingId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!id || title.length < 2 || description.length < 5) throw new Error("Некорректные данные");
  await adminUpdateCastingBasics(id, { title, description });
  await logAdminAction(admin.id, "casting.edit", "Casting", id);
  revalidatePath("/admin/castings");
  revalidatePath(`/castings/${id}`);
  revalidatePath("/explore");
  revalidatePath("/");
}

export async function saveHomepageFeaturedCastingsAction(formData: FormData) {
  const admin = await requireAdmin();
  const citySlug = env.NEXT_PUBLIC_DEFAULT_CITY_SLUG;
  const positions: { position: number; castingId: string | null }[] = [];
  for (let p = 1; p <= 6; p++) {
    const raw = formData.get(`casting_slot_${p}`)?.toString().trim() ?? "";
    positions.push({ position: p, castingId: raw === "" ? null : raw });
  }

  const ids = positions.map((x) => x.castingId).filter(Boolean) as string[];
  if (new Set(ids).size !== ids.length) {
    throw new Error("Один кастинг нельзя выбрать в двух слотах");
  }

  for (const id of ids) {
    const c = await prisma.casting.findFirst({
      where: {
        id,
        deletedAt: null,
        status: CastingStatus.ACTIVE,
        moderationStatus: ModerationStatus.APPROVED,
        city: { slug: citySlug },
        producerProfile: {
          isBlockedByAdmin: false,
          moderationStatus: { not: ModerationStatus.BLOCKED },
        },
      },
    });
    if (!c) throw new Error("Недопустимый кастинг для слота");
  }

  await replaceHomepageFeaturedCastings(positions);
  await logAdminAction(admin.id, "homepage.featured.castings", "Homepage", "castings", {
    slots: positions,
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function saveHomepageFeaturedActorsAction(formData: FormData) {
  const admin = await requireAdmin();
  const citySlug = env.NEXT_PUBLIC_DEFAULT_CITY_SLUG;
  const positions: { position: number; actorProfileId: string | null }[] = [];
  for (let p = 1; p <= 6; p++) {
    const raw = formData.get(`actor_slot_${p}`)?.toString().trim() ?? "";
    positions.push({ position: p, actorProfileId: raw === "" ? null : raw });
  }

  const ids = positions.map((x) => x.actorProfileId).filter(Boolean) as string[];
  if (new Set(ids).size !== ids.length) {
    throw new Error("Один профиль нельзя выбрать в двух слотах");
  }

  for (const id of ids) {
    const a = await prisma.actorProfile.findFirst({
      where: {
        id,
        deletedAt: null,
        isBlockedByAdmin: false,
        isHiddenByUser: false,
        moderationStatus: ModerationStatus.APPROVED,
        city: { slug: citySlug },
      },
    });
    if (!a) throw new Error("Недопустимый профиль для слота");
  }

  await replaceHomepageFeaturedActors(positions);
  await logAdminAction(admin.id, "homepage.featured.actors", "Homepage", "actors", {
    slots: positions,
  });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}
