import { notFound } from "next/navigation";
import { ApplicationStatus, CastingStatus, ModerationStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPublicActorProfile } from "@/server/services/actor-profile.service";
import { attachPortfolioLikesToPhotos } from "@/server/media/portfolio-photo-likes";
import { ActorProfileView } from "@/components/actor-profile-view";
import { serializeCastingForBrowse } from "@/lib/serialize-casting-browse";

export default async function ActorPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getPublicActorProfile(id);
  if (!profile) notFound();

  const session = await auth();
  const mediaWithLikes = await attachPortfolioLikesToPhotos(profile.media, session?.user?.id);

  const historyStatuses: ApplicationStatus[] = [
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.INVITED,
    ApplicationStatus.CAST_PASSED,
  ];
  const history = await prisma.application.findMany({
    where: { actorProfileId: profile.id, status: { in: historyStatuses } },
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      casting: {
        include: {
          city: true,
          producerProfile: { select: { id: true, companyName: true, fullName: true } },
        },
      },
    },
  });
  const castingHistoryRows = history.map((h) => ({
    serialized: serializeCastingForBrowse(h.casting),
    status: h.status,
  }));

  const role = session?.user?.role;
  const showCatalogBack =
    role === "ACTOR" || role === "PRODUCER" || role === "ADMIN";

  let ratingInteractive: { subjectUserId: string; initialStars: number | null } | undefined;
  const subjectUserId = profile.user.id;
  if (session?.user?.id && session.user.id !== subjectUserId) {
    const row = await prisma.profileStarRating.findUnique({
      where: {
        authorId_subjectUserId: { authorId: session.user.id, subjectUserId },
      },
      select: { stars: true },
    });
    ratingInteractive = { subjectUserId, initialStars: row?.stars ?? null };
  }

  let producerInvite: { actorProfileId: string; castings: { id: string; title: string }[] } | undefined;
  if (session?.user?.role === "PRODUCER") {
    const producer = await prisma.producerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (producer) {
      const castings = await prisma.casting.findMany({
        where: {
          producerProfileId: producer.id,
          deletedAt: null,
          status: CastingStatus.ACTIVE,
          moderationStatus: ModerationStatus.APPROVED,
        },
        select: { id: true, title: true },
        orderBy: { updatedAt: "desc" },
        take: 80,
      });
      producerInvite = { actorProfileId: profile.id, castings };
    }
  }

  return (
    <ActorProfileView
      variant="public"
      showCatalogBack={showCatalogBack}
      producerInvite={producerInvite}
      canLikePortfolioPhotos={Boolean(session?.user?.id)}
      ratingInteractive={ratingInteractive}
      castingHistory={castingHistoryRows}
      historyCanBrowseCastings={Boolean(session?.user?.id)}
      profile={{
        fullName: profile.fullName,
        birthDate: profile.birthDate,
        gender: profile.gender,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        bodyType: profile.bodyType,
        ethnicAppearance: profile.ethnicAppearance,
        tattooPiercingOption: profile.tattooPiercingOption,
        facialHairOption: profile.facialHairOption,
        languages: profile.languages,
        professionalSkillKeys: profile.professionalSkillKeys,
        bio: profile.bio,
        availability: profile.availability,
        city: profile.city,
        ratingAverage: profile.ratingAverage,
        ratingCount: profile.ratingCount,
      }}
      media={mediaWithLikes.map((m) => ({
        id: m.id,
        kind: m.kind,
        publicUrl: m.publicUrl,
        storageKey: m.storageKey,
        isAvatar: m.isAvatar,
        sortOrder: m.sortOrder,
        moderationStatus: m.moderationStatus,
        likeCount: m.likeCount,
        likedByMe: m.likedByMe,
      }))}
    />
  );
}
