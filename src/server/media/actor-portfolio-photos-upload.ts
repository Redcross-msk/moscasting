import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MediaKind, ModerationStatus } from "@prisma/client";
import { effectiveImageMime, sniffImageMimeFromBuffer } from "@/server/media/effective-upload-mime";
import { normalizePortfolioImageBuffer } from "@/server/media/portfolio-image-normalize";
import { savePublicUpload } from "@/server/uploads/save-public-upload";
import { MAX_ACTOR_PORTFOLIO_PHOTOS } from "@/lib/actor-portfolio-limits";

const MAX_PHOTO_BYTES = 35 * 1024 * 1024;
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
]);

export type PortfolioPhotoAdded = {
  id: string;
  publicUrl: string | null;
  sortOrder: number;
  storageKey: string;
};

export type PortfolioPhotosUploadOutcome =
  | { error: string; added?: undefined }
  | { error?: undefined; added: PortfolioPhotoAdded[] };

export async function runActorPortfolioPhotosUpload(
  actorProfileId: string,
  rawFiles: File[],
): Promise<PortfolioPhotosUploadOutcome> {
  const valid = rawFiles.filter((f) => f && typeof f !== "string" && f.size > 0) as File[];
  if (valid.length === 0) return { error: "Выберите хотя бы одно фото" };

  const overLimit = valid.filter((f) => f.size > MAX_PHOTO_BYTES);
  if (overLimit.length > 0) {
    return {
      error: `Файл слишком большой (до 35 МБ на фото): ${overLimit[0].name}`,
    };
  }

  const count = await prisma.mediaFile.count({
    where: { actorProfileId, kind: MediaKind.PHOTO, isAvatar: false },
  });
  const maxAdd = Math.max(0, MAX_ACTOR_PORTFOLIO_PHOTOS - count);
  if (maxAdd <= 0) {
    return { error: `Уже максимум ${MAX_ACTOR_PORTFOLIO_PHOTOS} фото в портфолио` };
  }

  let sortBase =
    (
      await prisma.mediaFile.aggregate({
        where: { actorProfileId },
        _max: { sortOrder: true },
      })
    )._max.sortOrder ?? -1;

  let added = 0;
  const createdRows: PortfolioPhotoAdded[] = [];

  try {
    for (const file of valid) {
      if (added >= maxAdd) break;
      const raw = Buffer.from(await file.arrayBuffer());
      let mimeIn = effectiveImageMime(file).toLowerCase();
      if (mimeIn === "image/jpg") mimeIn = "image/jpeg";
      if (!IMAGE_TYPES.has(mimeIn)) {
        const sniffed = sniffImageMimeFromBuffer(raw);
        if (sniffed && IMAGE_TYPES.has(sniffed)) mimeIn = sniffed;
      }
      const mayDecode =
        IMAGE_TYPES.has(mimeIn) || mimeIn === "application/octet-stream" || !mimeIn.trim();
      if (!mayDecode) continue;
      const normalized = await normalizePortfolioImageBuffer(raw, mimeIn || "application/octet-stream");
      if (!normalized) continue;
      const { buffer, mime: outMime, ext } = normalized;
      const rel = `actor/${actorProfileId}/${randomUUID()}.${ext}`;
      const publicUrl = await savePublicUpload(rel, buffer);
      sortBase += 1;
      const row = await prisma.mediaFile.create({
        data: {
          kind: MediaKind.PHOTO,
          storageKey: rel,
          publicUrl,
          mimeType: outMime,
          actorProfileId,
          sortOrder: sortBase,
          isAvatar: false,
          moderationStatus: ModerationStatus.PENDING,
        },
      });
      createdRows.push({
        id: row.id,
        publicUrl: row.publicUrl,
        sortOrder: row.sortOrder,
        storageKey: row.storageKey,
      });
      added += 1;
    }

    if (added === 0) return { error: "Не удалось загрузить фото (формат или размер)" };

    revalidatePath("/actor/profile");
    revalidatePath("/actor/profile/edit");
    revalidatePath(`/actors/${actorProfileId}`);
    revalidatePath("/explore");

    return { added: createdRows };
  } catch {
    return { error: "Ошибка при загрузке фото" };
  }
}
