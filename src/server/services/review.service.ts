import {
  ApplicationStatus,
  ReviewDirection,
  ReviewModerationStatus,
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function createReview(params: {
  applicationId: string;
  authorUserId: string;
  stars: number;
  text: string;
}) {
  if (params.stars < 1 || params.stars > 5) throw new Error("Оценка от 1 до 5");

  const app = await prisma.application.findUnique({
    where: { id: params.applicationId },
    include: {
      actorProfile: true,
      producerProfile: true,
    },
  });
  if (!app) {
    throw new Error("Отклик не найден");
  }

  const actorUserId = app.actorProfile.userId;
  const producerUserId = app.producerProfile.userId;

  const actorCanReview =
    app.status === ApplicationStatus.CAST_PASSED || app.status === ApplicationStatus.INVITED;
  const producerCanReviewBase =
    app.status === ApplicationStatus.CAST_PASSED || app.status === ApplicationStatus.INVITED;

  let direction: ReviewDirection;
  let subjectId: string;

  if (params.authorUserId === actorUserId) {
    if (!actorCanReview) {
      throw new Error("Отзыв о кастинг-директоре доступен после приглашения в проект или «Кастинг пройден»");
    }
    direction = ReviewDirection.ACTOR_TO_PRODUCER;
    subjectId = producerUserId;
  } else if (params.authorUserId === producerUserId) {
    if (!producerCanReviewBase) {
      throw new Error("Отзыв об актёре недоступен для этого отклика");
    }
    direction = ReviewDirection.PRODUCER_TO_ACTOR;
    subjectId = actorUserId;
  } else {
    throw new Error("Вы не участник этого отклика");
  }

  const review = await prisma.review.create({
    data: {
      applicationId: app.id,
      authorId: params.authorUserId,
      subjectId,
      direction,
      stars: params.stars,
      text: params.text,
      moderationStatus: ReviewModerationStatus.APPROVED,
    },
  });

  await recalculateSubjectRating(subjectId);

  return review;
}

export async function approveReview(reviewId: string) {
  await prisma.review.update({
    where: { id: reviewId },
    data: { moderationStatus: ReviewModerationStatus.APPROVED },
  });
  const review = await prisma.review.findUniqueOrThrow({ where: { id: reviewId } });
  await recalculateSubjectRating(review.subjectId);
  return review;
}

export async function hideReview(reviewId: string) {
  await prisma.review.update({
    where: { id: reviewId },
    data: { moderationStatus: ReviewModerationStatus.HIDDEN },
  });
  const review = await prisma.review.findUniqueOrThrow({ where: { id: reviewId } });
  await recalculateSubjectRating(review.subjectId);
  return review;
}

async function recalculateSubjectRating(subjectUserId: string) {
  const agg = await prisma.review.aggregate({
    where: {
      subjectId: subjectUserId,
      moderationStatus: ReviewModerationStatus.APPROVED,
    },
    _avg: { stars: true },
    _count: { _all: true },
  });

  const avg = agg._avg.stars ?? 0;
  const count = agg._count._all;
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

export async function listPendingReviews() {
  return prisma.review.findMany({
    where: { moderationStatus: ReviewModerationStatus.PENDING },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, email: true } },
      application: {
        include: { casting: { select: { title: true } } },
      },
    },
  });
}
