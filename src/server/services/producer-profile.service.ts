import {
  CastingStatus,
  ModerationStatus,
  ReviewDirection,
  ReviewModerationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export async function getPublicProducerProfile(id: string) {
  const profile = await prisma.producerProfile.findFirst({
    where: {
      id,
      deletedAt: null,
      isBlockedByAdmin: false,
      isHiddenByUser: false,
      moderationStatus: { not: ModerationStatus.BLOCKED },
    },
    include: {
      /** Как у публичного актёра: всё кроме BLOCKED (PENDING тоже виден гостям). В кабинете — без фильтра. */
      media: {
        where: { moderationStatus: { not: ModerationStatus.BLOCKED } },
        orderBy: [{ isAvatar: "desc" }, { sortOrder: "asc" }],
      },
      user: { select: { id: true } },
      filmographyEntries: { orderBy: { sortOrder: "asc" } },
      castings: {
        where: {
          deletedAt: null,
          status: CastingStatus.ACTIVE,
          moderationStatus: ModerationStatus.APPROVED,
        },
        take: 12,
        orderBy: { createdAt: "desc" },
        include: { city: true },
      },
    },
  });
  if (!profile) return null;

  const completedCastings = await prisma.casting.findMany({
    where: {
      producerProfileId: profile.id,
      deletedAt: null,
      status: { in: [CastingStatus.CLOSED, CastingStatus.ARCHIVED] },
      moderationStatus: ModerationStatus.APPROVED,
    },
    take: 20,
    orderBy: { updatedAt: "desc" },
    include: { city: true },
  });

  const reviewsAbout = await prisma.review.findMany({
    where: {
      subjectId: profile.userId,
      direction: ReviewDirection.ACTOR_TO_PRODUCER,
      moderationStatus: ReviewModerationStatus.APPROVED,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      author: {
        select: {
          email: true,
          actorProfile: { select: { fullName: true } },
        },
      },
    },
  });

  return { ...profile, reviewsAbout, completedCastingsPublic: completedCastings };
}
