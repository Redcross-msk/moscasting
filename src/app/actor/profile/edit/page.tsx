import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ActorAnketaFields } from "@/components/actor-anketa-fields";
import { ActorAnketaSaveForm } from "@/components/actor-anketa-save-form";
import { ActorEditMediaUploads } from "@/components/actor-edit-media-uploads";
import { ActorEditVideoVisit } from "@/components/actor-edit-video-visit";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MediaKind } from "@prisma/client";
import { dedupeActorPortfolioVideoToSingle } from "@/server/media/dedupe-actor-video-visit";

export const dynamic = "force-dynamic";

export default async function ActorProfileEditPage() {
  noStore();
  const session = await auth();
  const userId = session!.user.id;

  const profileStub = await prisma.actorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profileStub) return <p>Профиль не найден</p>;
  await dedupeActorPortfolioVideoToSingle(profileStub.id);

  const [profile, cities] = await Promise.all([
    prisma.actorProfile.findUnique({
      where: { userId },
      include: { city: true, media: true },
    }),
    prisma.city.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
  ]);
  if (!profile) return <p>Профиль не найден</p>;

  const birthStr = profile.birthDate.toISOString().slice(0, 10);
  const avatarMedia =
    profile.media.find(
      (m) => m.kind === MediaKind.PHOTO && m.isAvatar && (m.publicUrl?.trim() || m.storageKey?.trim()),
    ) ?? profile.media.find((m) => m.kind === MediaKind.PHOTO && (m.publicUrl?.trim() || m.storageKey?.trim()));

  /** Только портфолио без текущего аватара — сетка превью не дублирует круг. */
  const portfolioPhotos = profile.media
    .filter((m) => m.kind === MediaKind.PHOTO && !m.isAvatar)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => ({
      id: m.id,
      publicUrl: m.publicUrl,
      sortOrder: m.sortOrder,
      storageKey: m.storageKey,
    }));
  const portfolioVideos = profile.media
    .filter((m) => m.kind === MediaKind.VIDEO)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => ({ id: m.id, publicUrl: m.publicUrl, storageKey: m.storageKey }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Редактирование анкеты</h1>
      </div>

      <Card className="overflow-hidden border-primary/15 shadow-md">
        <div className="h-1.5 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" aria-hidden />
        <CardContent className="space-y-12 pt-8">
          <ActorEditMediaUploads
            initialAvatarUrl={avatarMedia?.publicUrl ?? null}
            initialAvatarStorageKey={avatarMedia?.storageKey ?? null}
            portfolioPhotos={portfolioPhotos}
          />

          <div className="space-y-2 border-t border-border pt-10">
            <h2 className="text-sm font-semibold text-primary">Город и персональные данные</h2>
            <p className="text-xs text-muted-foreground">Сохраните изменения кнопкой внизу формы.</p>
          </div>

          <ActorAnketaSaveForm>
            <div className="space-y-2">
              <Label htmlFor="citySlug">Город</Label>
              <select
                id="citySlug"
                name="citySlug"
                required
                defaultValue={profile.city.slug}
                className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <ActorAnketaFields
              defaults={{
                fullName: profile.fullName,
                birthDate: birthStr,
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
              }}
            />

            <ActorEditVideoVisit portfolioVideos={portfolioVideos} />

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isHiddenByUser" defaultChecked={profile.isHiddenByUser} />
              Скрыть профиль из каталога
            </label>
          </ActorAnketaSaveForm>
        </CardContent>
      </Card>
    </div>
  );
}
