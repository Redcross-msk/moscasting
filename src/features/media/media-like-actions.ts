"use server";

import { MediaKind } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type MediaLikeResult =
  | { ok: true; liked: boolean; likeCount: number }
  | { ok: false; error: string };

/** Лайк только для фото портфолио / аватара актёра или продюсера (не медиа кастинга). */
export async function toggleMediaFileLikeAction(mediaId: string): Promise<MediaLikeResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Войдите, чтобы поставить лайк" };
  }

  const media = await prisma.mediaFile.findFirst({
    where: {
      id: mediaId,
      kind: MediaKind.PHOTO,
      castingId: null,
      OR: [{ actorProfileId: { not: null } }, { producerProfileId: { not: null } }],
    },
    select: {
      id: true,
      actorProfileId: true,
      producerProfileId: true,
    },
  });
  if (!media) {
    return { ok: false, error: "Фото не найдено" };
  }

  const existing = await prisma.mediaFileLike.findUnique({
    where: {
      mediaFileId_userId: { mediaFileId: mediaId, userId: session.user.id },
    },
  });

  try {
    if (existing) {
      await prisma.mediaFileLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.mediaFileLike.create({
        data: { mediaFileId: mediaId, userId: session.user.id },
      });
    }
  } catch {
    return { ok: false, error: "Не удалось сохранить лайк" };
  }

  const likeCount = await prisma.mediaFileLike.count({ where: { mediaFileId: mediaId } });
  const liked = !existing;

  if (media.actorProfileId) {
    revalidatePath("/actor/profile");
    revalidatePath("/actor/profile/edit");
    revalidatePath(`/actors/${media.actorProfileId}`);
    revalidatePath("/explore");
  }
  if (media.producerProfileId) {
    revalidatePath("/producer/profile");
    revalidatePath("/producer/profile/edit");
    revalidatePath(`/producers/${media.producerProfileId}`);
    revalidatePath("/explore");
  }

  return { ok: true, liked, likeCount };
}
