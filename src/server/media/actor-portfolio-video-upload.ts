import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MediaKind, ModerationStatus } from "@prisma/client";
import { deletePublicUploadFile, savePublicUpload } from "@/server/uploads/save-public-upload";
import { effectiveVideoMime } from "@/server/media/effective-upload-mime";

const MAX_VIDEO_BYTES = 120 * 1024 * 1024;
const MIN_VIDEO_BYTES = 512;

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/m4v",
]);

function extFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m === "video/mp4" || m === "video/x-m4v" || m === "video/m4v") return "mp4";
  if (m === "video/webm") return "webm";
  if (m === "video/quicktime") return "mov";
  return "mp4";
}

function normalizedVideoMimeForStorage(file: File): string | null {
  const fromDeclared = effectiveVideoMime(file);
  if (VIDEO_TYPES.has(fromDeclared)) return fromDeclared;
  const n = file.name.toLowerCase();
  if (n.endsWith(".webm")) return "video/webm";
  if (n.endsWith(".mov") || n.endsWith(".qt")) return "video/quicktime";
  if (n.endsWith(".mp4") || n.endsWith(".m4v")) return "video/mp4";
  return null;
}

export type ActorPortfolioVideoUploadResult =
  | { error: string }
  | { publicUrl: string | null; storageKey: string };

/** Сохранение одной видеовизитки (замена предыдущей). Общая логика для Server Action и POST /api. */
export async function runActorPortfolioVideoUpload(
  actorProfileId: string,
  file: File,
): Promise<ActorPortfolioVideoUploadResult> {
  if (!file || typeof file === "string" || file.size === 0) return { error: "Выберите видео" };
  const videoMime = normalizedVideoMimeForStorage(file);
  if (!videoMime) {
    return {
      error:
        "Допустимы MP4, WebM, MOV (с телефона тип иногда пустой — расширение .mp4/.mov/.webm)",
    };
  }
  if (file.size > MAX_VIDEO_BYTES) return { error: "Видео до 120 МБ" };

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length < MIN_VIDEO_BYTES) {
    return { error: "Видеофайл пустой или повреждён — попробуйте записать или выбрать снова" };
  }
  const ext = extFromMime(videoMime);
  const rel = `actor/${actorProfileId}/${randomUUID()}.${ext}`;
  const publicUrl = await savePublicUpload(rel, buffer);

  const previousVideos = await prisma.mediaFile.findMany({
    where: { actorProfileId, kind: MediaKind.VIDEO },
    select: { storageKey: true },
  });

  const sortBase =
    (await prisma.mediaFile.aggregate({
      where: { actorProfileId },
      _max: { sortOrder: true },
    }))._max.sortOrder ?? -1;

  await prisma.$transaction([
    prisma.mediaFile.deleteMany({
      where: { actorProfileId, kind: MediaKind.VIDEO },
    }),
    prisma.mediaFile.create({
      data: {
        kind: MediaKind.VIDEO,
        storageKey: rel,
        publicUrl,
        mimeType: videoMime,
        actorProfileId,
        sortOrder: sortBase + 1,
        isAvatar: false,
        moderationStatus: ModerationStatus.PENDING,
      },
    }),
  ]);

  for (const row of previousVideos) {
    await deletePublicUploadFile(row.storageKey);
  }

  revalidatePath("/actor/profile");
  revalidatePath("/actor/profile/edit");
  revalidatePath(`/actors/${actorProfileId}`);
  revalidatePath("/explore");

  return { publicUrl, storageKey: rel };
}
