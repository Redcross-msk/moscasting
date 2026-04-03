"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { MediaKind, ModerationStatus } from "@prisma/client";
import { createStorageFromEnv } from "@/server/storage/local-placeholder-storage";

const MAX_ACTOR_MEDIA = 10;
const MAX_PRODUCER_MEDIA = 5;

export async function addActorPortfolioMediaAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") throw new Error("Forbidden");

  const profile = await prisma.actorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Нет профиля");

  const count = await prisma.mediaFile.count({ where: { actorProfileId: profile.id } });
  if (count >= MAX_ACTOR_MEDIA) throw new Error(`Не более ${MAX_ACTOR_MEDIA} фото и видео`);

  const kindRaw = String(formData.get("kind") ?? "PHOTO");
  const kind = kindRaw === "VIDEO" ? MediaKind.VIDEO : MediaKind.PHOTO;

  const storage = createStorageFromEnv();
  const key = `actor/${profile.id}/${randomUUID()}`;
  const { publicUrl } = await storage.putObject({
    key,
    body: Buffer.from([]),
    contentType: kind === MediaKind.VIDEO ? "video/mp4" : "image/jpeg",
  });

  await prisma.mediaFile.create({
    data: {
      kind,
      storageKey: key,
      publicUrl: publicUrl ?? storage.getPublicUrl(key),
      actorProfileId: profile.id,
      sortOrder: count,
      moderationStatus: ModerationStatus.PENDING,
    },
  });

  revalidatePath("/actor/profile");
  revalidatePath("/actor/profile/edit");
  revalidatePath(`/actors/${profile.id}`);
  revalidatePath("/explore");
}

export async function addProducerProfileMediaAction(_formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Нет профиля");

  const count = await prisma.mediaFile.count({ where: { producerProfileId: profile.id } });
  if (count >= MAX_PRODUCER_MEDIA) throw new Error(`Не более ${MAX_PRODUCER_MEDIA} фото`);

  const storage = createStorageFromEnv();
  const key = `producer/${profile.id}/${randomUUID()}`;
  const { publicUrl } = await storage.putObject({
    key,
    body: Buffer.from([]),
    contentType: "image/jpeg",
  });

  await prisma.mediaFile.create({
    data: {
      kind: MediaKind.PHOTO,
      storageKey: key,
      publicUrl: publicUrl ?? storage.getPublicUrl(key),
      producerProfileId: profile.id,
      sortOrder: count,
      moderationStatus: ModerationStatus.PENDING,
    },
  });

  revalidatePath("/producer/profile");
  revalidatePath("/producer/profile/edit");
  revalidatePath("/explore");
}

export async function setActorAvatarMediaFormAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") throw new Error("Forbidden");

  const mediaId = String(formData.get("mediaId") ?? "");
  if (!mediaId) throw new Error("Нет файла");

  const profile = await prisma.actorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Нет профиля");

  const media = await prisma.mediaFile.findFirst({
    where: { id: mediaId, actorProfileId: profile.id },
  });
  if (!media || media.kind !== MediaKind.PHOTO) throw new Error("Аватаром может быть только фото");

  await prisma.$transaction([
    prisma.mediaFile.updateMany({
      where: { actorProfileId: profile.id },
      data: { isAvatar: false },
    }),
    prisma.mediaFile.update({
      where: { id: mediaId },
      data: { isAvatar: true },
    }),
  ]);

  revalidatePath("/actor/profile");
  revalidatePath("/actor/profile/edit");
  revalidatePath(`/actors/${profile.id}`);
  revalidatePath("/explore");
}

export async function setProducerAvatarMediaFormAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  const mediaId = String(formData.get("mediaId") ?? "");
  if (!mediaId) throw new Error("Нет файла");

  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Нет профиля");

  const media = await prisma.mediaFile.findFirst({
    where: { id: mediaId, producerProfileId: profile.id },
  });
  if (!media) throw new Error("Файл не найден");

  await prisma.$transaction([
    prisma.mediaFile.updateMany({
      where: { producerProfileId: profile.id },
      data: { isAvatar: false },
    }),
    prisma.mediaFile.update({
      where: { id: mediaId },
      data: { isAvatar: true },
    }),
  ]);

  revalidatePath("/producer/profile");
  revalidatePath("/producer/profile/edit");
  revalidatePath(`/producers/${profile.id}`);
  revalidatePath("/explore");
}

/** Меняет порядок только у фото портфолио (не аватар, не видео). */
export async function moveActorMediaAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") throw new Error("Forbidden");

  const mediaId = String(formData.get("mediaId") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!mediaId || (direction !== "up" && direction !== "down")) throw new Error("Некорректные данные");

  const profile = await prisma.actorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) throw new Error("Нет профиля");

  const photoList = await prisma.mediaFile.findMany({
    where: {
      actorProfileId: profile.id,
      kind: MediaKind.PHOTO,
      isAvatar: false,
    },
    orderBy: { sortOrder: "asc" },
  });
  const idx = photoList.findIndex((m) => m.id === mediaId);
  if (idx < 0) throw new Error("Файл не найден или для него недоступна смена порядка");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= photoList.length) return;

  const a = photoList[idx];
  const b = photoList[swapIdx];
  await prisma.$transaction([
    prisma.mediaFile.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.mediaFile.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  revalidatePath("/actor/profile");
  revalidatePath("/actor/profile/edit");
  revalidatePath(`/actors/${profile.id}`);
  revalidatePath("/explore");
}

/** Удаление фото из портфолио (не аватар). */
export async function deleteActorPortfolioPhotoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") throw new Error("Forbidden");

  const mediaId = String(formData.get("mediaId") ?? "");
  if (!mediaId) throw new Error("Нет файла");

  const profile = await prisma.actorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) throw new Error("Нет профиля");

  const media = await prisma.mediaFile.findFirst({
    where: {
      id: mediaId,
      actorProfileId: profile.id,
      kind: MediaKind.PHOTO,
      isAvatar: false,
    },
  });
  if (!media) throw new Error("Файл не найден");

  await prisma.mediaFile.delete({ where: { id: mediaId } });

  revalidatePath("/actor/profile");
  revalidatePath("/actor/profile/edit");
  revalidatePath(`/actors/${profile.id}`);
  revalidatePath("/explore");
}

/** Удаление фото портфолио продюсера (не аватар). */
export async function deleteProducerPortfolioPhotoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  const mediaId = String(formData.get("mediaId") ?? "");
  if (!mediaId) throw new Error("Нет файла");

  const profile = await prisma.producerProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) throw new Error("Нет профиля");

  const media = await prisma.mediaFile.findFirst({
    where: {
      id: mediaId,
      producerProfileId: profile.id,
      kind: MediaKind.PHOTO,
      isAvatar: false,
    },
  });
  if (!media) throw new Error("Файл не найден");

  await prisma.mediaFile.delete({ where: { id: mediaId } });

  revalidatePath("/producer/profile");
  revalidatePath("/producer/profile/edit");
  revalidatePath(`/producers/${profile.id}`);
  revalidatePath("/explore");
}

/** Порядок только у фото портфолио продюсера (без аватара). */
export async function moveProducerPortfolioPhotoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  const mediaId = String(formData.get("mediaId") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!mediaId || (direction !== "up" && direction !== "down")) throw new Error("Некорректные данные");

  const profile = await prisma.producerProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) throw new Error("Нет профиля");

  const photoList = await prisma.mediaFile.findMany({
    where: {
      producerProfileId: profile.id,
      kind: MediaKind.PHOTO,
      isAvatar: false,
    },
    orderBy: { sortOrder: "asc" },
  });
  const idx = photoList.findIndex((m) => m.id === mediaId);
  if (idx < 0) throw new Error("Файл не найден");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= photoList.length) return;

  const a = photoList[idx];
  const b = photoList[swapIdx];
  await prisma.$transaction([
    prisma.mediaFile.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.mediaFile.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  revalidatePath("/producer/profile");
  revalidatePath("/producer/profile/edit");
  revalidatePath(`/producers/${profile.id}`);
  revalidatePath("/explore");
}

export async function moveProducerMediaAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  const mediaId = String(formData.get("mediaId") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!mediaId || (direction !== "up" && direction !== "down")) throw new Error("Некорректные данные");

  const profile = await prisma.producerProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) throw new Error("Нет профиля");

  const list = await prisma.mediaFile.findMany({
    where: { producerProfileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });
  const idx = list.findIndex((m) => m.id === mediaId);
  if (idx < 0) throw new Error("Файл не найден");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= list.length) return;

  const next = [...list];
  const [item] = next.splice(idx, 1);
  next.splice(swapIdx, 0, item);
  await prisma.$transaction(
    next.map((m, i) => prisma.mediaFile.update({ where: { id: m.id }, data: { sortOrder: i } })),
  );

  revalidatePath("/producer/profile");
  revalidatePath("/producer/profile/edit");
  revalidatePath("/explore");
}
