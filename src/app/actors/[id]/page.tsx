import { notFound } from "next/navigation";
import { CastingStatus, ModerationStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPublicActorProfile } from "@/server/services/actor-profile.service";
import { ActorProfileView } from "@/components/actor-profile-view";

export default async function ActorPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getPublicActorProfile(id);
  if (!profile) notFound();

  const session = await auth();

  const role = session?.user?.role;
  const showCatalogBack =
    role === "ACTOR" || role === "PRODUCER" || role === "ADMIN";

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
      media={profile.media.map((m) => ({
        id: m.id,
        kind: m.kind,
        publicUrl: m.publicUrl,
        isAvatar: m.isAvatar,
        sortOrder: m.sortOrder,
        moderationStatus: m.moderationStatus,
      }))}
    />
  );
}
