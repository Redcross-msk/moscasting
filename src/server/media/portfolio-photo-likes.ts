import "server-only";
import { MediaKind } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function attachPortfolioLikesToPhotos<T extends { id: string; kind: MediaKind }>(
  items: T[],
  viewerUserId: string | undefined,
): Promise<(T & { likeCount: number; likedByMe: boolean })[]> {
  const photoIds = items.filter((m) => m.kind === MediaKind.PHOTO).map((m) => m.id);
  if (photoIds.length === 0) {
    return items.map((m) => ({ ...m, likeCount: 0, likedByMe: false }));
  }

  const [counts, mine] = await Promise.all([
    prisma.mediaFileLike.groupBy({
      by: ["mediaFileId"],
      where: { mediaFileId: { in: photoIds } },
      _count: { _all: true },
    }),
    viewerUserId
      ? prisma.mediaFileLike.findMany({
          where: { userId: viewerUserId, mediaFileId: { in: photoIds } },
          select: { mediaFileId: true },
        })
      : Promise.resolve([] as { mediaFileId: string }[]),
  ]);

  const countMap = new Map(counts.map((c) => [c.mediaFileId, c._count._all]));
  const mineSet = new Set(mine.map((m) => m.mediaFileId));

  return items.map((m) => {
    if (m.kind !== MediaKind.PHOTO) {
      return { ...m, likeCount: 0, likedByMe: false };
    }
    return {
      ...m,
      likeCount: countMap.get(m.id) ?? 0,
      likedByMe: mineSet.has(m.id),
    };
  });
}
