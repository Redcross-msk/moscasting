import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { ModerationStatus, ReviewModerationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { StarRatingDisplay } from "@/components/star-rating-display";
import { cn } from "@/lib/utils";
import { resolveUploadedMediaSrc } from "@/lib/media-url";

export type ProducerProfileViewMedia = {
  id: string;
  publicUrl: string | null;
  storageKey?: string;
  isAvatar: boolean;
  moderationStatus?: ModerationStatus;
};

type CastingRow = {
  id: string;
  title: string;
  city: { name: string };
  status?: string;
  moderationStatus?: string;
  moderationComment?: string | null;
};

export type ProducerFilmographyCard = {
  id: string;
  title: string;
  releaseDate: Date | null;
  kinopoiskUrl: string | null;
  posterPublicUrl: string | null;
};

export type ProducerReviewRow = {
  id: string;
  stars: number;
  text: string;
  authorLabel: string;
  createdAt: Date;
  moderationStatus?: ReviewModerationStatus;
};

type Props = {
  profile: {
    companyName: string;
    fullName: string;
    positionTitle: string;
    filmography: string | null;
    ratingAverage: unknown;
    ratingCount: number;
    moderationStatus?: ModerationStatus;
    moderationComment?: string | null;
  };
  media: ProducerProfileViewMedia[];
  /** Активные опубликованные кастинги */
  castings: CastingRow[];
  /** Завершённые (архив / закрыты) */
  completedCastings?: CastingRow[];
  /** Черновики, на модерации и пр. */
  otherCastings?: CastingRow[];
  variant: "public" | "cabinet";
  editHref?: string;
  castingLinkPrefix?: string;
  filmographyEntries?: ProducerFilmographyCard[];
  reviews?: ProducerReviewRow[];
};

function InfoBlock({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-gradient-to-br from-muted/40 to-muted/10 px-5 py-4 shadow-sm",
        className,
      )}
    >
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h2>
      <div className="text-base font-medium leading-snug text-foreground">{children}</div>
    </div>
  );
}

export function ProducerProfileView({
  profile,
  media,
  castings,
  completedCastings = [],
  otherCastings = [],
  variant,
  editHref,
  castingLinkPrefix = "/castings",
  filmographyEntries = [],
  reviews = [],
}: Props) {
  const mediaSrc = (m: ProducerProfileViewMedia) => resolveUploadedMediaSrc(m.publicUrl, m.storageKey);
  const avatar =
    media.find((m) => m.isAvatar && mediaSrc(m)) ?? media.find((m) => mediaSrc(m));
  const gallery = media.filter(
    (m) => !m.isAvatar && !!(m.publicUrl?.trim() || m.storageKey?.trim()) && mediaSrc(m),
  );

  return (
    <div className="space-y-10 pb-10">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" aria-hidden />
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
            <div className="mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted shadow-md ring-4 ring-background sm:mx-0 sm:h-36 sm:w-36">
              {avatar && mediaSrc(avatar) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaSrc(avatar)!} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-3 text-center text-xs text-muted-foreground">
                  Нет фото
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{profile.fullName}</h1>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end sm:pt-0.5">
                  <StarRatingDisplay
                    average={Number(profile.ratingAverage)}
                    count={profile.ratingCount}
                    size="lg"
                  />
                </div>
              </div>

              {variant === "cabinet" && editHref ? (
                <Button variant="default" size="default" className="w-full sm:w-auto" asChild>
                  <Link href={editHref}>Редактировать профиль</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoBlock label="Компания">{profile.companyName}</InfoBlock>
          <InfoBlock label="Должность">{profile.positionTitle}</InfoBlock>
        </div>

        {gallery.length > 0 ? (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Фото портфолио
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {gallery.map((m) => (
                <div
                  key={m.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaSrc(m)!}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {filmographyEntries.length > 0 ? (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Фильмография
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filmographyEntries.map((e) => (
                <div
                  key={e.id}
                  className="overflow-hidden rounded-xl border border-border/80 bg-muted/15 shadow-sm transition hover:border-primary/25 hover:shadow-md"
                >
                  <div className="aspect-[2/3] max-h-64 bg-muted">
                    {e.posterPublicUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.posterPublicUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
                        Нет постера
                      </div>
                    )}
                  </div>
                  <CardContent className="space-y-2 p-4 text-sm">
                    <p className="font-semibold leading-snug">{e.title}</p>
                    {e.releaseDate ? (
                      <p className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(e.releaseDate))}
                      </p>
                    ) : null}
                    {e.kinopoiskUrl ? (
                      <a
                        href={e.kinopoiskUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Кинопоиск <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </CardContent>
                </div>
              ))}
            </div>
          </section>
        ) : profile.filmography ? (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Фильмография
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{profile.filmography}</p>
          </section>
        ) : null}

        <CastingSection
          title="Активные кастинги"
          castings={castings}
          castingLinkPrefix={castingLinkPrefix}
        />
        <CastingSection
          title="Завершённые кастинги"
          castings={completedCastings}
          castingLinkPrefix={castingLinkPrefix}
        />
        <CastingSection
          title="Черновики и на модерации"
          castings={otherCastings}
          castingLinkPrefix={castingLinkPrefix}
        />

        {reviews.length > 0 ? (
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:rounded-2xl sm:p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-4">
              Оценки актёров
            </h2>
            <ul className="space-y-2 sm:space-y-3">
              {reviews.map((r) => {
                const filled = Math.min(5, Math.max(0, r.stars));
                return (
                  <li
                    key={r.id}
                    className="rounded-lg border border-border/70 bg-muted/15 p-3 text-sm sm:rounded-xl sm:p-4"
                  >
                    <div className="flex flex-nowrap items-center justify-between gap-2">
                      <span className="min-w-0 truncate font-medium">{r.authorLabel}</span>
                      <span className="shrink-0 text-sm text-amber-500 tabular-nums" aria-label={`${filled} из 5`}>
                        {"★".repeat(filled)}
                        <span className="text-muted-foreground/40">{"☆".repeat(5 - filled)}</span>
                      </span>
                    </div>
                    {r.text.trim() ? (
                      <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {r.text}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-[10px] text-muted-foreground sm:text-xs">
                      {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(r.createdAt))}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function CastingSection({
  title,
  castings,
  castingLinkPrefix,
}: {
  title: string;
  castings: CastingRow[];
  castingLinkPrefix: string;
}) {
  if (castings.length === 0) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="space-y-2">
        {castings.map((c) => (
          <Link
            key={c.id}
            href={`${castingLinkPrefix}/${c.id}`}
            className="block rounded-xl border border-border/70 bg-muted/10 p-3 text-sm transition hover:border-primary/30 hover:bg-muted/20"
          >
            <span className="font-medium text-primary">{c.title}</span>
            <span className="text-muted-foreground"> · {c.city.name}</span>
            {c.moderationComment ? (
              <span className="mt-1 block text-xs text-destructive">Модерация: {c.moderationComment}</span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
