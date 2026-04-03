import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MediaKind, ModerationStatus } from "@prisma/client";
import { savePublicUpload } from "@/server/uploads/save-public-upload";

const MAX_PRODUCER_FILES = 5;
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ProducerPortfolioPhotoAdded = {
  id: string;
  publicUrl: string | null;
  sortOrder: number;
  storageKey: string;
};

export type ProducerPortfolioPhotosUploadOutcome =
  | { error: string; added?: undefined }
  | { error?: undefined; added: ProducerPortfolioPhotoAdded[] };

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

function effectiveMime(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const n = file.name.toLowerCase();
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  return file.type || "";
}

export async function runProducerPortfolioPhotosUpload(
  producerProfileId: string,
  rawFiles: File[],
): Promise<ProducerPortfolioPhotosUploadOutcome> {
  const valid = rawFiles.filter((f) => f && typeof f !== "string" && f.size > 0) as File[];
  if (valid.length === 0) return { error: "Выберите хотя бы одно фото" };

  const count = await prisma.mediaFile.count({ where: { producerProfileId } });
  const maxAdd = Math.max(0, MAX_PRODUCER_FILES - count);
  if (maxAdd <= 0) return { error: `Уже максимум ${MAX_PRODUCER_FILES} файлов в профиле` };

  let sortBase =
    (
      await prisma.mediaFile.aggregate({
        where: { producerProfileId },
        _max: { sortOrder: true },
      })
    )._max.sortOrder ?? -1;

  let added = 0;
  const createdRows: ProducerPortfolioPhotoAdded[] = [];

  try {
    for (const file of valid) {
      if (added >= maxAdd) break;
      const mime = effectiveMime(file);
      if (!IMAGE_TYPES.has(mime)) continue;
      if (file.size > MAX_PHOTO_BYTES) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = extFromMime(mime);
      const rel = `producer/${producerProfileId}/${randomUUID()}.${ext}`;
      const publicUrl = await savePublicUpload(rel, buffer);
      sortBase += 1;
      const row = await prisma.mediaFile.create({
        data: {
          kind: MediaKind.PHOTO,
          storageKey: rel,
          publicUrl,
          mimeType: mime,
          producerProfileId,
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

    revalidatePath("/producer/profile");
    revalidatePath("/producer/profile/edit");
    revalidatePath("/producers");
    revalidatePath(`/producers/${producerProfileId}`);
    revalidatePath("/explore");

    return { added: createdRows };
  } catch {
    return { error: "Ошибка при загрузке фото" };
  }
}
