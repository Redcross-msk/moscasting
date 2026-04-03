import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type {
  AvailabilityStatus,
  BodyType,
  EthnicAppearance,
  FacialHairOption,
  Gender,
  MediaKind,
  ModerationStatus,
  TattooPiercingOption,
} from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRatingDisplay } from "@/components/star-rating-display";
import { calculateAge, cn, russianYearsWord } from "@/lib/utils";
import {
  ethnicAppearanceLabel,
  facialHairLabel,
  languageLabel,
  professionalSkillLabel,
  tattooPiercingLabel,
} from "@/lib/actor-form-constants";
import { availabilityLabel, bodyTypeLabel, genderLabel } from "@/lib/profile-labels";
import { ProducerInviteToProject } from "@/components/producer-invite-to-project";

export type ActorProfileViewMedia = {
  id: string;
  kind: MediaKind;
  publicUrl: string | null;
  isAvatar: boolean;
  sortOrder?: number;
  moderationStatus?: ModerationStatus;
};

type Props = {
  profile: {
    fullName: string;
    birthDate: Date;
    gender: Gender;
    heightCm: number;
    weightKg: number;
    bodyType: BodyType;
    ethnicAppearance: EthnicAppearance;
    tattooPiercingOption: TattooPiercingOption;
    facialHairOption: FacialHairOption;
    languages: string[];
    professionalSkillKeys: string[];
    bio: string;
    availability: AvailabilityStatus;
    city: { name: string };
    ratingAverage: unknown;
    ratingCount: number;
    moderationStatus?: ModerationStatus;
    moderationComment?: string | null;
  };
  media: ActorProfileViewMedia[];
  variant: "public" | "cabinet";
  editHref?: string;
  /** Другой актёр в каталоге — вернуться к списку актёров */
  showCatalogBack?: boolean;
  /** Продюсер: приглашение в чат по выбранному кастингу */
  producerInvite?: { actorProfileId: string; castings: { id: string; title: string }[] };
};

export function ActorProfileView({
  profile,
  media,
  variant,
  editHref,
  showCatalogBack,
  producerInvite,
}: Props) {
  const avatar =
    media.find((m) => m.kind === "PHOTO" && m.isAvatar && m.publicUrl) ??
    media.find((m) => m.kind === "PHOTO" && m.publicUrl);

  const gridPhotos = media
    .filter((m) => m.kind === "PHOTO" && m.publicUrl && !m.isAvatar)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const videos = media.filter((m) => m.kind === "VIDEO" && m.publicUrl);

  const langLabels = profile.languages
    .map((slug) => languageLabel[slug as keyof typeof languageLabel] ?? slug)
    .filter(Boolean);
  const profLabels = profile.professionalSkillKeys
    .map((slug) => professionalSkillLabel[slug as keyof typeof professionalSkillLabel] ?? slug)
    .filter(Boolean);

  const hasPortfolioBlock = gridPhotos.length > 0 || videos.length > 0;

  const birthFormatted = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(profile.birthDate));
  const ageYears = calculateAge(profile.birthDate);

  return (
    <div className="space-y-10 pb-8">
      {showCatalogBack ? (
        <div className="border-b border-border pb-4">
          <Button variant="outline" size="sm" className="w-fit" asChild>
            <Link href="/explore?tab=actors">
              <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
              К актёрам
            </Link>
          </Button>
        </div>
      ) : null}

      <header className="space-y-4">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm sm:mx-0 sm:h-36 sm:w-36">
            {avatar?.publicUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar.publicUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                Нет фото
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{profile.fullName}</h1>
              </div>
              <div
                className={cn(
                  "flex shrink-0 flex-col items-center gap-3 sm:items-end sm:pt-0.5",
                  producerInvite ? "sm:min-w-[220px]" : "",
                )}
              >
                <StarRatingDisplay
                  average={Number(profile.ratingAverage)}
                  count={profile.ratingCount}
                  size="lg"
                />
                {producerInvite ? (
                  <ProducerInviteToProject
                    actorProfileId={producerInvite.actorProfileId}
                    castings={producerInvite.castings}
                  />
                ) : null}
              </div>
            </div>

            {variant === "cabinet" && editHref ? (
              <Button variant="default" size="default" className="w-full sm:w-auto" asChild>
                <Link href={editHref}>Редактировать профиль</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {langLabels.length > 0 ? (
          <section className="border-b border-border px-5 py-5 sm:px-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Языки</h2>
            <div className="flex flex-wrap gap-2">
              {langLabels.map((label) => (
                <Badge key={label} variant="secondary" className="font-normal">
                  {label}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-b border-border px-5 py-5 sm:px-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Внешность и параметры
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary/90">Город и личные данные</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-[minmax(7rem,auto)_1fr] sm:gap-x-6 sm:gap-y-2.5">
                <dt className="text-muted-foreground">Город</dt>
                <dd className="font-medium text-foreground">{profile.city.name}</dd>
                <dt className="text-muted-foreground">Дата рождения</dt>
                <dd className="text-foreground">
                  <span className="font-medium tabular-nums">{birthFormatted}</span>
                  <span className="text-muted-foreground"> · </span>
                  <span>
                    {ageYears} {russianYearsWord(ageYears)}
                  </span>
                </dd>
                <dt className="text-muted-foreground">Пол</dt>
                <dd className="font-medium text-foreground">{genderLabel[profile.gender]}</dd>
              </dl>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary/90">Телосложение</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-[minmax(7rem,auto)_1fr] sm:gap-x-6 sm:gap-y-2.5">
                <dt className="text-muted-foreground">Рост</dt>
                <dd className="font-medium tabular-nums text-foreground">{profile.heightCm} см</dd>
                <dt className="text-muted-foreground">Вес</dt>
                <dd className="font-medium tabular-nums text-foreground">{profile.weightKg} кг</dd>
                <dt className="text-muted-foreground">Телосложение</dt>
                <dd className="text-foreground">{bodyTypeLabel[profile.bodyType]}</dd>
              </dl>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary/90">Внешность</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-[minmax(7rem,auto)_1fr] sm:gap-x-6 sm:gap-y-2.5">
                <dt className="text-muted-foreground">Тип внешности</dt>
                <dd className="text-foreground">{ethnicAppearanceLabel[profile.ethnicAppearance]}</dd>
                <dt className="text-muted-foreground">Тату и пирсинг</dt>
                <dd className="text-foreground">{tattooPiercingLabel[profile.tattooPiercingOption]}</dd>
                <dt className="text-muted-foreground">Борода и усы</dt>
                <dd className="text-foreground">{facialHairLabel[profile.facialHairOption]}</dd>
              </dl>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary/90">График</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-[minmax(7rem,auto)_1fr] sm:gap-x-6 sm:gap-y-2.5">
                <dt className="text-muted-foreground">Доступность</dt>
                <dd className="font-medium text-foreground">{availabilityLabel[profile.availability]}</dd>
              </dl>
            </div>
          </div>
        </section>

        {profLabels.length > 0 ? (
          <section className="border-b border-border px-5 py-5 sm:px-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Профессиональные навыки
            </h2>
            <div className="flex flex-wrap gap-2">
              {profLabels.map((label) => (
                <Badge key={label} variant="outline" className="font-normal">
                  {label}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        <section className="px-5 py-5 sm:px-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">О себе</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{profile.bio}</p>
        </section>
      </div>

      {hasPortfolioBlock ? (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Портфолио</h2>
          <div
            className={
              gridPhotos.length > 0
                ? "flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8"
                : "flex flex-col gap-6"
            }
          >
            {gridPhotos.length > 0 ? (
              <div className="w-full lg:min-w-0 lg:flex-1">
                <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-xl bg-muted">
                  {gridPhotos.map((m) => (
                    <div key={m.id} className="aspect-square overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.publicUrl!}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 hover:opacity-95"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {videos.length > 0 ? (
              <div
                className={
                  gridPhotos.length > 0
                    ? "w-full shrink-0 lg:w-[min(100%,340px)] xl:w-[min(100%,380px)]"
                    : "mx-auto w-full max-w-xl"
                }
              >
                <p
                  className={
                    gridPhotos.length > 0
                      ? "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:mb-3"
                      : "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  }
                >
                  Видеовизитка
                </p>
                <div className="space-y-3">
                  {videos.map((m) => (
                    <div
                      key={m.id}
                      className="overflow-hidden rounded-xl border border-border bg-black shadow-md"
                    >
                      <video src={m.publicUrl!} controls className="aspect-video w-full" preload="metadata" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
