import { ReviewModerationStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Средняя оценка на профиле: звёзды с публичной страницы + одобренные отзывы из чатов,
 * если у автора ещё нет оценки с профиля (чтобы не считать дважды).
 */
export async function recalculateSubjectProfileAggregates(subjectUserId: string) {
  const starRows = await prisma.profileStarRating.findMany({
    where: { subjectUserId },
    select: { stars: true, authorId: true },
  });
  const authorsWithProfileStar = new Set(starRows.map((r) => r.authorId));

  const legacyReviews = await prisma.review.findMany({
    where: {
      subjectId: subjectUserId,
      moderationStatus: ReviewModerationStatus.APPROVED,
      ...(authorsWithProfileStar.size > 0 ? { authorId: { notIn: [...authorsWithProfileStar] } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: { authorId: true, stars: true },
  });

  const seenLegacyAuthors = new Set<string>();
  const legacyStars: number[] = [];
  for (const r of legacyReviews) {
    if (seenLegacyAuthors.has(r.authorId)) continue;
    seenLegacyAuthors.add(r.authorId);
    legacyStars.push(r.stars);
  }

  const profileStars = starRows.map((r) => r.stars);
  const all = [...profileStars, ...legacyStars];
  const count = all.length;
  const avg = count ? all.reduce((a, b) => a + b, 0) / count : 0;
  const dec = new Prisma.Decimal(Number(avg).toFixed(2));

  await prisma.actorProfile.updateMany({
    where: { userId: subjectUserId },
    data: { ratingAverage: dec, ratingCount: count },
  });
  await prisma.producerProfile.updateMany({
    where: { userId: subjectUserId },
    data: { ratingAverage: dec, ratingCount: count },
  });
}

export async function upsertProfileStarRating(authorUserId: string, subjectUserId: string, stars: number) {
  if (stars < 1 || stars > 5 || !Number.isInteger(stars)) {
    throw new Error("Оценка от 1 до 5 звёзд");
  }
  if (authorUserId === subjectUserId) {
    throw new Error("Нельзя оценить свой профиль");
  }

  await prisma.profileStarRating.upsert({
    where: {
      authorId_subjectUserId: { authorId: authorUserId, subjectUserId },
    },
    create: { authorId: authorUserId, subjectUserId, stars },
    update: { stars },
  });

  await recalculateSubjectProfileAggregates(subjectUserId);
}

/** Однократно после деплоя: пересчитать средние по всем, у кого есть отзывы или звёзды с профиля. */
export async function backfillAllProfileRatingAggregates() {
  const fromReviews = await prisma.review.groupBy({
    by: ["subjectId"],
    where: { moderationStatus: ReviewModerationStatus.APPROVED },
  });
  const fromStars = await prisma.profileStarRating.groupBy({
    by: ["subjectUserId"],
  });
  const ids = new Set<string>();
  for (const r of fromReviews) ids.add(r.subjectId);
  for (const r of fromStars) ids.add(r.subjectUserId);
  for (const id of ids) {
    await recalculateSubjectProfileAggregates(id);
  }
}
