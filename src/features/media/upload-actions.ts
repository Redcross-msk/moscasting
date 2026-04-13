"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { MediaKind, ModerationStatus } from "@prisma/client";
import { deletePublicUploadFile, savePublicUpload } from "@/server/uploads/save-public-upload";
import { runActorPortfolioPhotosUpload } from "@/server/media/actor-portfolio-photos-upload";
import { prepareUploadedProfileImage } from "@/server/media/prepare-uploaded-image";
import { runActorPortfolioVideoUpload } from "@/server/media/actor-portfolio-video-upload";

const MAX_AVATAR_BYTES = 30 * 1024 * 1024;
async function getActorProfileOrThrow() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") return null;
  const profile = await prisma.actorProfile.findUnique({ where: { userId: session.user.id } });
  return profile;
}

export type UploadResult = { error?: string; publicUrl?: string | null; storageKey?: string | null };

export type PortfolioPhotosUploadResult =
  | { error: string }
  | { added: Array<{ id: string; publicUrl: string | null; sortOrder: number; storageKey: string }> };

export async function uploadActorAvatarFormAction(formData: FormData): Promise<UploadResult> {
  const profile = await getActorProfileOrThrow();
  if (!profile) return { error: "Нет доступа" };

  const file = formData.get("avatar");
  if (!file || typeof file === "string" || file.size === 0) return { error: "Выберите файл" };
  if (file.size > MAX_AVATAR_BYTES) return { error: "Аватар до 30 МБ (после загрузки сожмём в JPEG)" };

  try {
    const prepared = await prepareUploadedProfileImage(file);
    if (!prepared) {
      return { error: "Не удалось обработать фото. Допустимы JPEG, PNG, WebP, HEIC/HEIF, AVIF" };
    }
    const { buffer, mime: outMime, ext } = prepared;
    const rel = `actor/${profile.id}/${randomUUID()}.${ext}`;
    const publicUrl = await savePublicUpload(rel, buffer);

    const previousAvatars = await prisma.mediaFile.findMany({
      where: {
        actorProfileId: profile.id,
        kind: MediaKind.PHOTO,
        isAvatar: true,
      },
      select: { id: true, storageKey: true },
    });
    for (const row of previousAvatars) {
      await deletePublicUploadFile(row.storageKey);
    }

    await prisma.$transaction([
      prisma.mediaFile.deleteMany({
        where: {
          actorProfileId: profile.id,
          kind: MediaKind.PHOTO,
          isAvatar: true,
        },
      }),
      prisma.mediaFile.create({
        data: {
          kind: MediaKind.PHOTO,
          storageKey: rel,
          publicUrl,
          mimeType: outMime,
          actorProfileId: profile.id,
          sortOrder: 0,
          isAvatar: true,
          moderationStatus: ModerationStatus.PENDING,
        },
      }),
    ]);

    revalidatePath("/actor/profile");
    revalidatePath("/actor/profile/edit");
    revalidatePath(`/actors/${profile.id}`);
    revalidatePath("/explore");
    return { publicUrl, storageKey: rel };
  } catch {
    return { error: "Не удалось сохранить аватар" };
  }
}

export async function uploadActorPortfolioPhotosFormAction(
  formData: FormData,
): Promise<PortfolioPhotosUploadResult> {
  const profile = await getActorProfileOrThrow();
  if (!profile) return { error: "Нет доступа" };

  const files = formData.getAll("photos") as File[];
  const valid = files.filter((f) => f && typeof f !== "string" && f.size > 0) as File[];
  return runActorPortfolioPhotosUpload(profile.id, valid);
}

export async function uploadActorPortfolioVideoFormAction(formData: FormData): Promise<UploadResult> {
  const profile = await getActorProfileOrThrow();
  if (!profile) return { error: "Нет доступа" };

  const file = formData.get("video");
  if (!file || typeof file === "string" || file.size === 0) return { error: "Выберите видео" };

  try {
    const out = await runActorPortfolioVideoUpload(profile.id, file);
    if ("error" in out) return { error: out.error };
    return { publicUrl: out.publicUrl, storageKey: out.storageKey };
  } catch {
    return { error: "Не удалось сохранить видео" };
  }
}

async function getProducerProfileOrThrow() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") return null;
  return prisma.producerProfile.findUnique({ where: { userId: session.user.id } });
}

export async function uploadProducerAvatarFormAction(formData: FormData): Promise<UploadResult> {
  const profile = await getProducerProfileOrThrow();
  if (!profile) return { error: "Нет доступа" };

  const file = formData.get("avatar");
  if (!file || typeof file === "string" || file.size === 0) return { error: "Выберите файл" };
  if (file.size > MAX_AVATAR_BYTES) return { error: "Аватар до 30 МБ (после загрузки сожмём в JPEG)" };

  try {
    const prepared = await prepareUploadedProfileImage(file);
    if (!prepared) {
      return { error: "Не удалось обработать фото. Допустимы JPEG, PNG, WebP, HEIC/HEIF, AVIF" };
    }
    const { buffer, mime: outMime, ext } = prepared;
    const rel = `producer/${profile.id}/${randomUUID()}.${ext}`;
    const publicUrl = await savePublicUpload(rel, buffer);

    const previousAvatars = await prisma.mediaFile.findMany({
      where: {
        producerProfileId: profile.id,
        kind: MediaKind.PHOTO,
        isAvatar: true,
      },
      select: { id: true, storageKey: true },
    });
    for (const row of previousAvatars) {
      await deletePublicUploadFile(row.storageKey);
    }

    await prisma.$transaction([
      prisma.mediaFile.deleteMany({
        where: {
          producerProfileId: profile.id,
          kind: MediaKind.PHOTO,
          isAvatar: true,
        },
      }),
      prisma.mediaFile.create({
        data: {
          kind: MediaKind.PHOTO,
          storageKey: rel,
          publicUrl,
          mimeType: outMime,
          producerProfileId: profile.id,
          sortOrder: 0,
          isAvatar: true,
          moderationStatus: ModerationStatus.PENDING,
        },
      }),
    ]);

    revalidatePath("/producer/profile");
    revalidatePath("/producer/profile/edit");
    revalidatePath(`/producers/${profile.id}`);
    revalidatePath("/explore");
    return { publicUrl, storageKey: rel };
  } catch {
    return { error: "Не удалось сохранить аватар" };
  }
}

export async function uploadProducerPortfolioPhotosFormAction(
  formData: FormData,
): Promise<PortfolioPhotosUploadResult> {
  const profile = await getProducerProfileOrThrow();
  if (!profile) return { error: "Нет доступа" };

  const files = formData.getAll("photos") as File[];
  const valid = files.filter((f) => f && typeof f !== "string" && f.size > 0) as File[];
  const { runProducerPortfolioPhotosUpload } = await import("@/server/media/producer-portfolio-photos-upload");
  return runProducerPortfolioPhotosUpload(profile.id, valid);
}
