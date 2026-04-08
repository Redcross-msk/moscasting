import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CastingStatus, ModerationStatus, ReviewDirection } from "@prisma/client";
import { ProducerProfileView } from "@/components/producer-profile-view";
import { attachPortfolioLikesToPhotos } from "@/server/media/portfolio-photo-likes";

export default async function ProducerProfileCabinetPage() {
  const session = await auth();
  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      media: { orderBy: [{ isAvatar: "desc" }, { sortOrder: "asc" }] },
      filmographyEntries: { orderBy: { sortOrder: "asc" } },
      castings: {
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 80,
        include: { city: true },
      },
    },
  });
  if (!profile) return <p className="text-sm text-muted-foreground">Профиль не найден</p>;

  const reviewsAbout = await prisma.review.findMany({
    where: {
      subjectId: profile.userId,
      direction: ReviewDirection.ACTOR_TO_PRODUCER,
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      author: {
        select: {
          email: true,
          actorProfile: { select: { fullName: true } },
        },
      },
    },
  });

  const activeCastings = profile.castings.filter(
    (c) => c.status === CastingStatus.ACTIVE && c.moderationStatus === ModerationStatus.APPROVED,
  );
  const completedCastings = profile.castings.filter(
    (c) => c.status === CastingStatus.CLOSED || c.status === CastingStatus.ARCHIVED,
  );
  const otherCastings = profile.castings.filter(
    (c) => !activeCastings.includes(c) && !completedCastings.includes(c),
  );

  const mapRow = (c: (typeof profile.castings)[0]) => ({
    id: c.id,
    title: c.title,
    city: c.city,
    status: c.status,
    moderationStatus: c.moderationStatus,
    moderationComment: c.moderationComment,
  });

  const mediaWithLikes = await attachPortfolioLikesToPhotos(profile.media, session?.user?.id);

  return (
    <ProducerProfileView
      variant="cabinet"
      editHref="/producer/profile/edit"
      castingLinkPrefix="/producer/castings"
      canLikePortfolioPhotos={Boolean(session?.user?.id)}
      profile={{
        companyName: profile.companyName,
        fullName: profile.fullName,
        positionTitle: profile.positionTitle,
        filmography: profile.filmography,
        ratingAverage: profile.ratingAverage,
        ratingCount: profile.ratingCount,
        moderationStatus: profile.moderationStatus,
        moderationComment: profile.moderationComment,
      }}
      media={mediaWithLikes.map((m) => ({
        id: m.id,
        publicUrl: m.publicUrl,
        storageKey: m.storageKey,
        isAvatar: m.isAvatar,
        moderationStatus: m.moderationStatus,
        likeCount: m.likeCount,
        likedByMe: m.likedByMe,
      }))}
      castings={activeCastings.map(mapRow)}
      completedCastings={completedCastings.map(mapRow)}
      otherCastings={otherCastings.map(mapRow)}
      filmographyEntries={profile.filmographyEntries.map((e) => ({
        id: e.id,
        title: e.title,
        releaseDate: e.releaseDate,
        kinopoiskUrl: e.kinopoiskUrl,
        posterPublicUrl: e.posterPublicUrl,
      }))}
      reviews={reviewsAbout.map((r) => ({
        id: r.id,
        stars: r.stars,
        text: r.text,
        authorLabel: r.author.actorProfile?.fullName ?? r.author.email ?? "Актёр",
        createdAt: r.createdAt,
        moderationStatus: r.moderationStatus,
      }))}
    />
  );
}
