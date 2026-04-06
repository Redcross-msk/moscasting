import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActorProfileView } from "@/components/actor-profile-view";

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
    take: 20,
    include: { casting: { select: { id: true, title: true, scheduledAt: true } } },
  });

  return (
    <div className="space-y-10">
      <ActorProfileView
        variant="cabinet"
        editHref="/actor/profile/edit"
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
        media={profile.media.map((m) => ({
          id: m.id,
          kind: m.kind,
          publicUrl: m.publicUrl,
          storageKey: m.storageKey,
          isAvatar: m.isAvatar,
          sortOrder: m.sortOrder,
          moderationStatus: m.moderationStatus,
        }))}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">История одобренных кастингов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {history.length === 0 ? (
            <p className="text-muted-foreground">Пока нет записей со статусом приглашение / принят / кастинг пройден.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="flex flex-wrap justify-between gap-2 border-b border-border pb-2">
                  <Link href={`/castings/${h.casting.id}`} className="font-medium text-primary hover:underline">
                    {h.casting.title}
                  </Link>
                  <Badge variant="outline">{h.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
