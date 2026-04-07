"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "lucide-react";
import { CastingQuickApply } from "@/components/casting-quick-apply";
import { FavoriteHeartButton } from "@/components/favorite-heart-button";
import { castingCategoryLabelRu, formatShootDateTimeRu, type SerializedRoleReq } from "@/lib/casting-display";
import { castingLocationParts } from "@/lib/casting-location-lines";
import { calculateAge, cn, russianYearsWord } from "@/lib/utils";

export type SerializedHomeCasting = {
  id: string;
  title: string;
  description: string;
  city: { name: string };
  scheduledAt: string | null;
  shootStartTime: string | null;
  workHoursNote: string | null;
  metroOrPlace: string | null;
  castingCategory: "MASS" | "GROUP" | "SOLO" | null;
  roleRequirements: SerializedRoleReq | null;
  paymentInfo: string | null;
  paymentRub: number | null;
  createdAt: string;
  producerProfile: { id: string; companyName: string; fullName: string };
  /** Если текущий пользователь — актёр и уже откликнулся */
  myApplicationChatId?: string | null;
  metroStation?: string | null;
  addressLine?: string | null;
  isFavorite?: boolean;
};

export type SerializedHomeActor = {
  id: string;
  fullName: string;
  birthDate: string;
  city: { name: string };
  avatarUrl: string | null;
  heightCm: number;
  weightKg: number;
  professionalLabels: string[];
  isFavorite?: boolean;
};

function RoleReqBlock({ r }: { r: SerializedRoleReq }) {
  if (r.type === "mass") {
    return <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">{r.text}</p>;
  }
  if (r.type === "solo") {
    return <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">{r.text}</p>;
  }
  return (
    <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
      {r.roles.map((role, i) => (
        <li key={i} className="line-clamp-2">
          <span className="font-medium text-foreground/80">Роль {i + 1}:</span> {role}
        </li>
      ))}
    </ul>
  );
}

function CastingRow({
  c,
  canBrowse,
  loading,
  onNeedAuth,
  catalogLayout,
  userRole,
  showFavorite,
}: {
  c: SerializedHomeCasting;
  canBrowse: boolean;
  loading: boolean;
  onNeedAuth: () => void;
  catalogLayout?: boolean;
  userRole?: string;
  showFavorite?: boolean;
}) {
  const paymentLine =
    c.paymentRub != null ? (
      <span className="text-sm font-bold tabular-nums text-foreground sm:text-base">
        {c.paymentRub.toLocaleString("ru-RU")} ₽
      </span>
    ) : c.paymentInfo ? (
      <span className="text-xs font-semibold leading-snug text-foreground sm:text-sm">{c.paymentInfo}</span>
    ) : null;

  const producerName = c.producerProfile.fullName?.trim() || c.producerProfile.companyName || "Продюсер";

  const scheduleLine = formatShootDateTimeRu(c.scheduledAt, c.shootStartTime);
  const loc = castingLocationParts({
    metroStation: c.metroStation,
    addressLine: c.addressLine,
    metroOrPlace: c.metroOrPlace,
  });

  const mainCatalog = (
    <div
      className={cn(
        "relative min-w-0 flex-1 space-y-2 pr-1 sm:pr-2 md:pr-4",
        "border-l-0 pl-0 md:border-l-4 md:border-primary md:pl-4",
      )}
    >
      <div>
        <p className="text-base font-semibold text-foreground group-hover/cast:text-primary group-hover/cast:underline sm:text-lg">
          {c.title}
        </p>
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
      </div>
      {scheduleLine ? (
        <p className="text-sm">
          <span className="font-semibold text-foreground">Дата и время съёмки: </span>
          <span className="text-muted-foreground">{scheduleLine}</span>
        </p>
      ) : null}
      {loc.metro ? (
        <p className="text-sm">
          <span className="font-semibold text-foreground">Метро: </span>
          <span className="text-muted-foreground">{loc.metro}</span>
        </p>
      ) : null}
      {loc.address ? (
        <p className="text-sm">
          <span className="font-semibold text-foreground">Адрес: </span>
          <span className="text-muted-foreground">{loc.address}</span>
        </p>
      ) : null}
      {!loc.metro && !loc.address ? (
        loc.legacy ? (
          <p className="text-sm">
            <span className="font-semibold text-foreground">Место: </span>
            <span className="text-muted-foreground">{loc.legacy}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{c.city.name}</p>
        )
      ) : null}
      {c.workHoursNote?.trim() ? (
        <p className="text-sm">
          <span className="font-semibold text-foreground">Рабочие часы: </span>
          <span className="text-muted-foreground">{c.workHoursNote.trim()}</span>
        </p>
      ) : null}
      <div className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {castingCategoryLabelRu(c.castingCategory)}
        </p>
        {c.roleRequirements ? <RoleReqBlock r={c.roleRequirements} /> : (
          <p className="mt-1 text-xs italic text-muted-foreground">Требования не заполнены</p>
        )}
      </div>
    </div>
  );

  const mainSimple = (
    <div className="min-w-0 flex-1 border-l-4 border-primary pl-4">
      <p className="font-semibold text-primary group-hover/cast:underline">{c.title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>{c.city.name}</span>
        {scheduleLine ? (
          <>
            <span className="text-border">·</span>
            <span>{scheduleLine}</span>
          </>
        ) : null}
      </div>
    </div>
  );

  const applyBlock =
    catalogLayout && !loading ? (
      <CastingQuickApply
        castingId={c.id}
        castingTitle={c.title}
        myApplicationChatId={c.myApplicationChatId ?? null}
        userRole={userRole}
        onNeedAuth={onNeedAuth}
        variant="catalogSide"
      />
    ) : catalogLayout && loading ? (
      <div className="h-9 w-full max-w-full shrink-0 rounded-md bg-muted md:max-w-[220px]" aria-hidden />
    ) : null;

  /** Каталог: на телефоне — полная ширина текста, блок цена/автор/кнопка снизу; на md+ — колонка справа */
  const sideCatalog = (
    <aside
      className={cn(
        "flex w-full flex-col gap-3 border-t border-border/60 bg-muted/25 px-4 pb-4 pt-4 text-left sm:px-5",
        "md:min-w-[180px] md:w-auto md:border-l md:border-border/60 md:border-t-0 md:bg-transparent md:px-5 md:py-0 md:text-right md:items-end md:justify-center",
      )}
    >
      <div className="flex flex-row items-start justify-between gap-3 md:flex-col md:items-end">
        <div className="min-w-0 flex-1 md:w-full md:flex-none">
          {canBrowse ? (
            <Link
              href={`/producers/${c.producerProfile.id}`}
              className="line-clamp-2 break-words text-left text-sm font-medium text-primary hover:underline md:text-right"
            >
              {producerName}
            </Link>
          ) : (
            <span className="line-clamp-2 break-words text-left text-sm text-muted-foreground md:text-right">
              {producerName}
            </span>
          )}
        </div>
        {paymentLine ? <div className="shrink-0 text-right leading-tight">{paymentLine}</div> : null}
      </div>
      {applyBlock ? <div className="w-full md:max-w-[220px] md:self-end">{applyBlock}</div> : null}
    </aside>
  );

  const sideCompact = (
    <aside
      className={cn(
        "flex shrink-0 flex-col gap-1.5 text-right sm:gap-2",
        "border-l-0 border-t-0 pt-0 md:border-l md:border-border",
        "w-[5.25rem] min-w-[5.25rem] pl-2 sm:w-auto sm:min-w-[7rem] md:min-w-[180px] md:justify-center md:gap-3 md:pl-4",
      )}
    >
      {paymentLine ? <div className="leading-tight">{paymentLine}</div> : null}
      {canBrowse ? (
        <Link
          href={`/producers/${c.producerProfile.id}`}
          className="line-clamp-2 break-words text-xs font-medium text-primary hover:underline sm:text-sm md:max-w-[220px]"
        >
          {producerName}
        </Link>
      ) : (
        <span className="line-clamp-2 break-words text-xs text-muted-foreground sm:text-sm md:max-w-[220px]">
          {producerName}
        </span>
      )}
    </aside>
  );

  const innerRowClass = catalogLayout
    ? "flex flex-col gap-0 p-4 pt-12 transition-colors sm:p-5 sm:pt-12 md:flex-row md:items-stretch md:gap-6 md:px-6 md:py-5 md:pt-5"
    : "flex flex-row items-start gap-2 p-3 transition-colors hover:bg-muted/40 sm:gap-4 sm:p-4 md:gap-6 md:px-5 md:py-4";

  const mainBlock = catalogLayout ? mainCatalog : mainSimple;
  const showHeart = Boolean(catalogLayout && showFavorite && userRole);

  const body = (
    <div className={innerRowClass}>
      {canBrowse ? (
        <Link href={`/castings/${c.id}`} className="group/cast min-w-0 w-full outline-none md:flex-1">
          {mainBlock}
        </Link>
      ) : (
        <button type="button" onClick={onNeedAuth} className="min-w-0 w-full text-left md:flex-1">
          {mainBlock}
        </button>
      )}
      {catalogLayout ? sideCatalog : sideCompact}
    </div>
  );

  const cardShellClass = catalogLayout
    ? cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card",
        "shadow-[0_2px_14px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_20px_-4px_rgba(0,0,0,0.35)]",
        "transition-shadow duration-200 hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.45)]",
      )
    : "relative overflow-hidden bg-card";

  if (loading) {
    return (
      <div className={cardShellClass}>
        {showHeart ? (
          <div className="pointer-events-none absolute right-2 top-2 z-20 opacity-50 sm:right-4 sm:top-4">
            <div className="h-8 w-8 rounded-full bg-muted" />
          </div>
        ) : null}
        <div className={cn(innerRowClass, "cursor-wait opacity-80")}>
          <div className="min-w-0 w-full md:flex-1">{mainBlock}</div>
          {catalogLayout ? sideCatalog : sideCompact}
        </div>
      </div>
    );
  }

  return (
    <div className={cardShellClass}>
      {showHeart ? (
        <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
          <FavoriteHeartButton
            kind="casting"
            targetId={c.id}
            initial={Boolean(c.isFavorite)}
            label="Избранный кастинг"
          />
        </div>
      ) : null}
      {body}
    </div>
  );
}

function ActorCard({
  a,
  canBrowse,
  loading,
  onNeedAuth,
  catalogLayout,
  showFavorite,
  userRole,
}: {
  a: SerializedHomeActor;
  canBrowse: boolean;
  loading: boolean;
  onNeedAuth: () => void;
  catalogLayout?: boolean;
  showFavorite?: boolean;
  userRole?: string;
}) {
  const age = calculateAge(new Date(a.birthDate));
  const ageStr = `${age} ${russianYearsWord(age)}`;
  const heightStr =
    typeof a.heightCm === "number" && a.heightCm > 0 ? `${a.heightCm} см` : "—";
  const weightStr =
    typeof a.weightKg === "number" && a.weightKg > 0 ? `${a.weightKg} кг` : "—";
  const hasPhoto = Boolean(a.avatarUrl?.trim());

  const inner = (
    <Card
      className={cn(
        "flex h-full w-full max-w-none flex-col overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md",
      )}
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted">
        {showFavorite && userRole ? (
          <div className="absolute right-1 top-1 z-10">
            <FavoriteHeartButton
              kind="actor"
              targetId={a.id}
              initial={Boolean(a.isFavorite)}
              label="Избранный актёр"
              className="bg-background/80 shadow-sm backdrop-blur-sm"
            />
          </div>
        ) : null}
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.avatarUrl!}
            alt=""
            className={cn(
              "h-full w-full object-center",
              catalogLayout ? "object-cover" : "object-contain",
            )}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <User
              className={cn("opacity-35", catalogLayout ? "h-10 w-10" : "h-12 w-12")}
              strokeWidth={1.25}
              aria-hidden
            />
            <span className={cn("font-medium opacity-70", catalogLayout ? "text-[10px]" : "text-[11px]")}>
              Нет фото
            </span>
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-3">
        <div className="min-h-0 shrink-0">
          <p className="line-clamp-2 text-base font-semibold leading-snug text-foreground group-hover:text-primary group-hover:underline">
            {a.fullName.trim() || "Без имени"}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{a.city.name}</p>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-1 rounded-lg border border-border/60 bg-muted/25 px-2 py-2 text-center">
          <div className="min-w-0">
            <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Возраст
            </span>
            <span className="mt-0.5 block text-xs font-semibold tabular-nums text-foreground">{ageStr}</span>
          </div>
          <div className="min-w-0 border-x border-border/50">
            <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Рост
            </span>
            <span className="mt-0.5 block text-xs font-semibold tabular-nums text-foreground">{heightStr}</span>
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Вес
            </span>
            <span className="mt-0.5 block text-xs font-semibold tabular-nums text-foreground">{weightStr}</span>
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <span className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Навыки
          </span>
          {a.professionalLabels.length > 0 ? (
            catalogLayout ? (
              <>
                <div className="flex flex-wrap content-start gap-1 md:hidden">
                  <Badge
                    variant="secondary"
                    className="max-w-full truncate px-2 py-0.5 text-left text-[10px] font-normal leading-tight"
                    title={a.professionalLabels.join(", ")}
                  >
                    {a.professionalLabels[0]}
                  </Badge>
                </div>
                <div className="hidden flex-wrap content-start gap-1 sm:gap-1.5 md:flex">
                  {a.professionalLabels.map((label, i) => (
                    <Badge
                      key={`${a.id}-p-${i}-${label}`}
                      variant="secondary"
                      className={cn(
                        "max-w-full whitespace-normal break-words px-2 py-0.5 text-left font-normal leading-tight sm:px-2.5 sm:py-1 sm:leading-snug",
                        "text-[10px] sm:text-xs",
                      )}
                      title={label}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-wrap content-start gap-1 sm:gap-1.5">
                {a.professionalLabels.map((label, i) => (
                  <Badge
                    key={`${a.id}-p-${i}-${label}`}
                    variant="secondary"
                    className={cn(
                      "max-w-full whitespace-normal break-words px-2 py-0.5 text-left font-normal leading-tight sm:px-2.5 sm:py-1 sm:leading-snug",
                      "text-xs",
                    )}
                    title={label}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            )
          ) : (
            <p className="text-sm italic text-muted-foreground">Не указано</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const wrapClass = cn("group flex h-full w-full justify-stretch");

  if (loading) {
    return <div className={cn(wrapClass, "cursor-wait opacity-80")}>{inner}</div>;
  }

  if (canBrowse) {
    return (
      <Link href={`/actors/${a.id}`} className={wrapClass}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onNeedAuth} className={cn(wrapClass, "text-left")}>
      {inner}
    </button>
  );
}

function canBrowseActorsRole(role: string | undefined) {
  return role === "ACTOR" || role === "PRODUCER" || role === "ADMIN";
}

export function HomePublicBrowse({
  castings,
  actors,
  activeTab = "both",
  showActorsSeeAllLink = true,
  actorsCatalogGrid = false,
  actorsCatalogToolbar,
  showCastingsSeeAllLink = true,
  castingsCatalogToolbar,
  castingsCatalogLayout = false,
  betweenCastingsAndActors,
}: {
  castings: SerializedHomeCasting[];
  actors: SerializedHomeActor[];
  activeTab?: "castings" | "actors" | "both";
  /** На странице «все актёры» ссылка «Все актёры» не нужна */
  showActorsSeeAllLink?: boolean;
  /** Каталог /explore?tab=actors: 2 колонки на телефоне, 3 с sm */
  actorsCatalogGrid?: boolean;
  /** Панель фильтра справа от заголовка «Актёры» на странице каталога */
  actorsCatalogToolbar?: ReactNode;
  /** На /explore?tab=castings ссылку «Все кастинги» не показываем */
  showCastingsSeeAllLink?: boolean;
  /** Панель фильтра справа от «Кастинги» на странице каталога */
  castingsCatalogToolbar?: ReactNode;
  /** Развёрнутая карточка каталога (/explore?tab=castings) */
  castingsCatalogLayout?: boolean;
  /** Вставка между блоками «Кастинги» и «Актёры» (главная для гостей) */
  betweenCastingsAndActors?: ReactNode;
}) {
  const { data: session, status } = useSession();
  const [castModalOpen, setCastModalOpen] = useState(false);
  const [actorModalOpen, setActorModalOpen] = useState(false);
  const role = session?.user?.role;
  const authed = status === "authenticated";
  const loading = status === "loading";
  const canBrowseCastings = authed;
  const canBrowseActors = authed && canBrowseActorsRole(role);

  const showCastings = activeTab === "both" || activeTab === "castings";
  const showActors = activeTab === "both" || activeTab === "actors";

  return (
    <>
      {showCastings && (
      <section>
        <div className="mb-3 flex min-w-0 flex-row items-center justify-between gap-3 border-b border-border pb-3 sm:mb-4 sm:gap-x-4">
          <h2 className="min-w-0 shrink truncate pr-1 text-lg font-bold text-foreground sm:text-xl md:max-w-none md:text-2xl">
            Кастинги
          </h2>
          {castingsCatalogToolbar ? (
            <div className="flex max-w-[min(100%,18rem)] min-w-0 shrink-0 flex-nowrap items-center justify-end gap-2 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] sm:max-w-none sm:gap-3">
              {castingsCatalogToolbar}
            </div>
          ) : showCastingsSeeAllLink ? (
            loading ? (
              <span className="shrink-0 text-sm text-muted-foreground">…</span>
            ) : canBrowseCastings ? (
              <Link
                href="/explore?tab=castings"
                className="shrink-0 whitespace-nowrap text-sm font-medium text-primary hover:underline"
              >
                Все кастинги
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setCastModalOpen(true)}
                className="shrink-0 whitespace-nowrap text-sm font-medium text-primary hover:underline"
              >
                Все кастинги
              </button>
            )
          ) : null}
        </div>
        <div
          className={cn(
            castingsCatalogLayout
              ? "flex flex-col gap-3 sm:gap-4"
              : "flex flex-col gap-px overflow-hidden rounded-lg border border-border bg-border",
          )}
        >
          {castings.length === 0 ? (
            <div
              className={cn(
                "p-5 text-center text-sm text-muted-foreground sm:p-8",
                castingsCatalogLayout
                  ? "rounded-2xl border border-border/80 bg-card shadow-sm"
                  : "bg-card",
              )}
            >
              Пока нет активных кастингов
            </div>
          ) : (
            castings.map((c) => (
              <CastingRow
                key={c.id}
                c={c}
                catalogLayout={castingsCatalogLayout}
                canBrowse={canBrowseCastings}
                loading={loading}
                userRole={role}
                showFavorite={castingsCatalogLayout && Boolean(role)}
                onNeedAuth={() => setCastModalOpen(true)}
              />
            ))
          )}
        </div>
      </section>
      )}

      {activeTab === "both" && betweenCastingsAndActors ? (
        <div className="py-2 sm:py-3">{betweenCastingsAndActors}</div>
      ) : null}

      {showActors && (
      <section>
        <div className="mb-3 flex min-w-0 flex-row items-center justify-between gap-3 border-b border-border pb-3 sm:mb-4 sm:gap-x-4">
          <h2 className="min-w-0 shrink truncate pr-1 text-lg font-bold text-foreground sm:text-xl md:max-w-none md:text-2xl">
            Актёры
          </h2>
          {actorsCatalogToolbar ? (
            <div className="flex max-w-[min(100%,18rem)] min-w-0 shrink-0 flex-nowrap items-center justify-end gap-2 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] sm:max-w-none sm:gap-3">
              {actorsCatalogToolbar}
            </div>
          ) : showActorsSeeAllLink ? (
            loading ? (
              <span className="shrink-0 text-sm text-muted-foreground">…</span>
            ) : canBrowseActors ? (
              <Link
                href="/explore?tab=actors"
                className="shrink-0 whitespace-nowrap text-sm font-medium text-primary hover:underline"
              >
                Все актёры
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setActorModalOpen(true)}
                className="shrink-0 whitespace-nowrap text-sm font-medium text-primary hover:underline"
              >
                Все актёры
              </button>
            )
          ) : null}
        </div>
        {actors.length === 0 ? (
          <p className="text-sm text-muted-foreground">В каталоге пока нет профилей</p>
        ) : (
          <div
            className={cn(
              "grid justify-items-stretch gap-2 sm:gap-5",
              actorsCatalogGrid
                ? "grid-cols-2 sm:grid-cols-3"
                : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              actorsCatalogGrid && "auto-rows-fr items-stretch",
            )}
          >
            {actors.map((a) => (
              <ActorCard
                key={a.id}
                a={a}
                catalogLayout={actorsCatalogGrid}
                canBrowse={canBrowseActors}
                loading={loading}
                showFavorite={actorsCatalogGrid && Boolean(role)}
                userRole={role}
                onNeedAuth={() => setActorModalOpen(true)}
              />
            ))}
          </div>
        )}
      </section>
      )}

      <Dialog open={castModalOpen} onOpenChange={setCastModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Кастинги</DialogTitle>
            <DialogDescription>
              Чтобы просматривать объявления и откликаться, войдите или зарегистрируйтесь как актёр.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild>
              <Link href="/login">Вход</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register/actor">Регистрация актёра</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={actorModalOpen} onOpenChange={setActorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Каталог актёров</DialogTitle>
            <DialogDescription>
              Чтобы открыть профили коллег или кандидатов, войдите (аккаунт актёра или кастинг-директора).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild>
              <Link href="/login">Вход</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register/actor">Регистрация актёра</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register/producer">Регистрация кастинг-директора</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
