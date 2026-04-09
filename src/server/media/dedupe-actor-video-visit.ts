import { prisma } from "@/lib/db";
import { MediaKind } from "@prisma/client";
import { deletePublicUploadFile } from "@/server/uploads/save-public-upload";

/** Оставляет одну видеовизитку (самую новую), остальные удаляет — для профилей, залитых до лимита «несколько видео». */
export async function dedupeActorPortfolioVideoToSingle(actorProfileId: string): Promise<void> {
  const videos = await prisma.mediaFile.findMany({
    where: { actorProfileId, kind: MediaKind.VIDEO },
    orderBy: { createdAt: "desc" },
    select: { id: true, storageKey: true },
  });
  if (videos.length <= 1) return;
  const [, ...drop] = videos;
  for (const v of drop) {
    await deletePublicUploadFile(v.storageKey);
    await prisma.mediaFile.delete({ where: { id: v.id } });
  }
}
