import Link from "next/link";
import type { ModerationStatus, ReviewModerationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { StarRatingDisplay } from "@/components/star-rating-display";
import { ProfilePortfolioSection } from "@/components/profile-portfolio-section";
import { cn } from "@/lib/utils";
import { resolveUploadedMediaSrc } from "@/lib/media-url";

export type ProducerProfileViewMedia = {
  id: string;
  publicUrl: string | null;
  storageKey?: string;
  isAvatar: boolean;
  moderationStatus?: ModerationStatus;
  likeCount?: number;
  likedByMe?: boolean;
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
  canLikePortfolioPhotos?: boolean;
};

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
  canLikePortfolioPhotos = false,
}: Props) {
  const mediaSrc = (m: ProducerProfileViewMedia) => resolveUploadedMediaSrc(m.publicUrl, m.storageKey);
  const avatar =
    media.find((m) => m.isAvatar && mediaSrc(m)) ?? media.find((m) => mediaSrc(m));
  const gallery = media.filter(
    (m) => !m.isAvatar && !!(m.publicUrl?.trim() || m.storageKey?.trim()) && mediaSrc(m),
  );

  return (
    <div className="space-y-10 pb-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm sm:mx-0 sm:h-36 sm:w-36">
            {avatar && mediaSrc(avatar) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaSrc(avatar)!} alt="" className="h-full w-full object-cover" />
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
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <section
          className={cn(
            "px-5 py-5 sm:px-6",
            filmographyEntries.length === 0 &&
              Boolean(profile.filmography?.trim()) &&
              "border-b border-border",
          )}
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Компания и должность
          </h2>
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-[minmax(7rem,auto)_1fr] sm:gap-x-6 sm:gap-y-2.5">
              <dt className="text-muted-foreground">Компания</dt>
              <dd className="font-medium text-foreground">{profile.companyName}</dd>
              <dt className="text-muted-foreground">Должность</dt>
              <dd className="font-medium text-foreground">{profile.positionTitle}</dd>
            </dl>
          </div>
        </section>

        {filmographyEntries.length === 0 && profile.filmography ? (
          <section className="px-5 py-5 sm:px-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Фильмография</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{profile.filmography}</p>
          </section>
        ) : null}
      </div>

      <div className="space-y-6">
        {gallery.length > 0 ? (
          <ProfilePortfolioSection
            photos={gallery.map((m) => ({
              id: m.id,
              src: mediaSrc(m)!,
              likeCount: m.likeCount ?? 0,
              likedByMe: m.likedByMe ?? false,
            }))}
            videos={[]}
            canLike={canLikePortfolioPhotos}
          />
        ) : null}

        {filmographyEntries.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Фильмография</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
              {filmographyEntries.map((e) => {
                const posterSrc = resolveUploadedMediaSrc(e.posterPublicUrl, null);
                const releaseLabel = e.releaseDate
                  ? new Intl.DateTimeFormat("ru-RU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(e.releaseDate))
                  : null;
                const inner = (
                  <>
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
                      {posterSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={posterSrc} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-muted-foreground">
                          Нет постера
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5 pt-2">
                      <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">{e.title}</p>
                      {releaseLabel ? (
                        <p className="text-[11px] text-muted-foreground">{releaseLabel}</p>
                      ) : null}
                    </div>
                  </>
                );
                const cardClass = cn(
                  "block overflow-hidden rounded-xl border border-border/80 bg-card p-2 shadow-sm transition-colors",
                  e.kinopoiskUrl?.trim()
                    ? "cursor-pointer hover:border-primary/35 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    : "cursor-default",
                );
                return e.kinopoiskUrl?.trim() ? (
                  <a
                    key={e.id}
                    href={e.kinopoiskUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                    aria-label={`${e.title}, открыть страницу на Кинопоиске`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={e.id} className={cardClass}>
                    {inner}
                  </div>
                );
              })}
            </div>
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
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="px-5 py-4 sm:px-6 sm:py-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
            </div>
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
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        <div className="space-y-2">
        {castings.map((c) => (
          <Link
            key={c.id}
            href={`${castingLinkPrefix}/${c.id}`}
            className="block rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5 text-sm transition hover:border-primary/30 hover:bg-muted/20"
          >
            <span className="font-medium text-primary">{c.title}</span>
            <span className="text-muted-foreground"> · {c.city.name}</span>
            {c.moderationComment ? (
              <span className="mt-1 block text-xs text-destructive">Модерация: {c.moderationComment}</span>
            ) : null}
          </Link>
        ))}
        </div>
      </div>
    </section>
  );
}
