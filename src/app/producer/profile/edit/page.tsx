import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { MediaKind } from "@prisma/client";
import { ProducerEditMediaUploads } from "@/components/producer-edit-media-uploads";
import { ProducerFilmographyEditor } from "@/components/producer-filmography-editor";
import { ProducerProfileSaveForm } from "@/components/producer-profile-save-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function ProducerProfileEditPage() {
  noStore();
  const session = await auth();
  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      filmographyEntries: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!profile) return <p>Профиль не найден</p>;

  const avatarMedia =
    profile.media.find((m) => m.kind === MediaKind.PHOTO && m.isAvatar && m.publicUrl) ??
    profile.media.find((m) => m.kind === MediaKind.PHOTO && m.publicUrl);

  const portfolioPhotos = profile.media
    .filter((m) => m.kind === MediaKind.PHOTO && !m.isAvatar)
    .map((m) => ({
      id: m.id,
      publicUrl: m.publicUrl,
      sortOrder: m.sortOrder,
      storageKey: m.storageKey,
    }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Редактирование профиля</h1>
      </div>

      <Card className="overflow-hidden border-primary/15 shadow-md">
        <div className="h-1.5 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" aria-hidden />
        <CardContent className="space-y-12 pt-8">
          <ProducerEditMediaUploads
            initialAvatarUrl={avatarMedia?.publicUrl ?? null}
            portfolioPhotos={portfolioPhotos}
          />

          <ProducerFilmographyEditor
            entries={profile.filmographyEntries.map((e) => ({
              id: e.id,
              title: e.title,
              releaseDate: e.releaseDate,
              kinopoiskUrl: e.kinopoiskUrl,
              posterPublicUrl: e.posterPublicUrl,
            }))}
          />

          <ProducerProfileSaveForm>
            <div className="space-y-2 border-t border-border pt-10">
              <h2 className="text-sm font-semibold text-primary">Данные компании</h2>
              <p className="text-xs text-muted-foreground">Сохраните изменения кнопкой внизу формы.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО</Label>
              <Input id="fullName" name="fullName" defaultValue={profile.fullName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Компания</Label>
              <Input id="companyName" name="companyName" defaultValue={profile.companyName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="positionTitle">Должность</Label>
              <Input id="positionTitle" name="positionTitle" defaultValue={profile.positionTitle} required />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isHiddenByUser" defaultChecked={profile.isHiddenByUser} />
              Скрыть профиль из каталога
            </label>
          </ProducerProfileSaveForm>
        </CardContent>
      </Card>
    </div>
  );
}
