import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";
import { ActorProfileView } from "@/components/actor-profile-view";
import { serializeCastingForBrowse } from "@/lib/serialize-casting-browse";
import { attachPortfolioLikesToPhotos } from "@/server/media/portfolio-photo-likes";

export default async function ActorProfileCabinetPage() {
  const session = await auth();
  const profile = await prisma.actorProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      city: true,
      media: { orderBy: [{ isAvatar: "desc" }, { sortOrder: "asc" }] },
    },
  });
  if (!profile) return <p className="text-sm text-muted-foreground">Профиль не найден</p>;

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

  const mediaWithLikes = await attachPortfolioLikesToPhotos(profile.media, session?.user?.id);

  const historyRows = history.map((h) => ({
    serialized: serializeCastingForBrowse(h.casting),
    status: h.status,
  }));

  return (
    <div className="space-y-10">
      <ActorProfileView
        variant="cabinet"
        editHref="/actor/profile/edit"
        canLikePortfolioPhotos={Boolean(session?.user?.id)}
        castingHistory={historyRows}
        historyCanBrowseCastings
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
          moderationStatus: profile.moderationStatus,
          moderationComment: profile.moderationComment,
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
    </div>
  );
}
