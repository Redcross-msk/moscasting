import Link from "next/link";
import { redirect } from "next/navigation";
import { CastingCategory, CastingStatus, Gender, ModerationStatus } from "@prisma/client";
import { auth } from "@/auth";
import {
  HomePublicBrowse,
  type SerializedHomeActor,
} from "@/components/home-public-browse";
import { ExploreActorsPagination, ExploreActorsToolbar } from "@/components/explore-actors-toolbar";
import {
  ACTORS_CATALOG_PAGE_SIZE as PAGE_SIZE,
  CASTINGS_CATALOG_PAGE_SIZE as CAST_PAGE_SIZE,
} from "@/lib/explore-actors-catalog";
import { serializeCastingForBrowse } from "@/lib/serialize-casting-browse";
import {
  countPublicCastings,
  listPublicCastings,
  utcDayRangeFromYmd,
  type PublicCastingSort,
} from "@/server/services/casting.service";
import {
  actorProfileCatalogInclude,
  countPublicActors,
  listPublicActors,
  type PublicActorSort,
} from "@/server/services/actor-profile.service";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { ExploreCastingsPagination, ExploreCastingsToolbar } from "@/components/explore-castings-toolbar";
import { ExploreRoleBar } from "@/components/explore-role-bar";
import { professionalSkillLabel } from "@/lib/actor-form-constants";

function parseCastingSort(v: string | undefined): PublicCastingSort {
  if (
    v === "old" ||
    v === "pay_high" ||
    v === "pay_low" ||
    v === "shoot_near" ||
    v === "shoot_far"
  ) {
    return v;
  }
  return "new";
}

function parseCastingCategory(v: string | undefined): CastingCategory | undefined {
  if (v === "MASS" || v === "GROUP" || v === "SOLO") return v as CastingCategory;
  return undefined;
}

function parseActorSort(v: string | undefined): PublicActorSort {
  if (v === "young" || v === "old") return v;
  return "new";
}

function parseBoundedInt(v: string | undefined, min: number, max: number): number | undefined {
  if (v === undefined || v === "") return undefined;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, n));
}

function parseActorPage(v: string | undefined): number {
  const n = Number.parseInt(v ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function parseGender(v: string | undefined): Gender | undefined {
  if (v === "MALE" || v === "FEMALE") return v as Gender;
  return undefined;
}

function serializeActors(
  rows: Awaited<ReturnType<typeof listPublicActors>>,
  favoriteIds?: Set<string>,
): SerializedHomeActor[] {
  return rows.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    birthDate: a.birthDate.toISOString(),
    city: { name: a.city.name },
    avatarUrl: a.media[0]?.publicUrl?.trim() ?? null,
    heightCm: a.heightCm,
    weightKg: a.weightKg,
    professionalLabels: a.professionalSkillKeys.map(
      (slug) => professionalSkillLabel[slug as keyof typeof professionalSkillLabel] ?? slug,
    ),
    isFavorite: favoriteIds ? favoriteIds.has(a.id) : false,
  }));
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    cSort?: string;
    aSort?: string;
    q?: string;
    shootDate?: string;
    cCat?: string;
    page?: string;
    cPage?: string;
    ageMin?: string;
    ageMax?: string;
    gender?: string;
    heightMin?: string;
    heightMax?: string;
  }>;
}) {
  const session = await auth();
  if (!session) redirect("/");

  const sp = await searchParams;
  const tab =
    sp.tab === "actors" ? "actors" : sp.tab === "favorites" ? "favorites" : "castings";
  const cSort = parseCastingSort(sp.cSort);
  const aSort = parseActorSort(sp.aSort);
  const city = env.NEXT_PUBLIC_DEFAULT_CITY_SLUG;

  const rawShoot = sp.shootDate?.trim();
  const shootDateYmd = rawShoot && utcDayRangeFromYmd(rawShoot) ? rawShoot : undefined;
  const castingCategoryFilter = parseCastingCategory(sp.cCat);

  const castingListBase = {
    citySlug: city,
    search: sp.q,
    shootDateYmd,
    castingCategory: castingCategoryFilter,
  };

  const [favActorRows, favCastingRows] = await Promise.all([
    prisma.favoriteActor.findMany({
      where: { userId: session.user.id },
      select: { actorProfileId: true },
    }),
    prisma.favoriteCasting.findMany({
      where: { userId: session.user.id },
      select: { castingId: true },
    }),
  ]);
  const favoriteActorIds = new Set(favActorRows.map((x) => x.actorProfileId));
  const favoriteCastingIds = new Set(favCastingRows.map((x) => x.castingId));

  let castings: Awaited<ReturnType<typeof listPublicCastings>> = [];
  let castingTotal = 0;
  let castingTotalPages = 1;
  const castingPage = parseActorPage(sp.cPage);

  let favoriteCastingsList: Awaited<ReturnType<typeof listPublicCastings>> = [];
  let favoriteActorsList: Awaited<ReturnType<typeof listPublicActors>> = [];

  if (tab === "favorites") {
    const favCLinks = await prisma.favoriteCasting.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { castingId: true },
    });
    const cIds = favCLinks.map((x) => x.castingId);
    if (cIds.length > 0) {
      const raw = await prisma.casting.findMany({
        where: {
          id: { in: cIds },
          deletedAt: null,
          status: CastingStatus.ACTIVE,
          moderationStatus: ModerationStatus.APPROVED,
          city: { slug: city },
          producerProfile: { isBlockedByAdmin: false },
        },
        include: {
          city: true,
          producerProfile: { select: { id: true, companyName: true, fullName: true } },
        },
      });
      const byId = new Map(raw.map((c) => [c.id, c]));
      favoriteCastingsList = cIds.map((id) => byId.get(id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
    }

    const favALinks = await prisma.favoriteActor.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { actorProfileId: true },
    });
    const aIds = favALinks.map((x) => x.actorProfileId);
    if (aIds.length > 0) {
      const raw = await prisma.actorProfile.findMany({
        where: {
          id: { in: aIds },
          deletedAt: null,
          moderationStatus: ModerationStatus.APPROVED,
          isBlockedByAdmin: false,
          isHiddenByUser: false,
          city: { slug: city },
        },
        include: actorProfileCatalogInclude,
      });
      const byId = new Map(raw.map((a) => [a.id, a]));
      favoriteActorsList = aIds.map((id) => byId.get(id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
    }
  }

  if (tab === "castings") {
    castingTotal = await countPublicCastings(castingListBase);
    castingTotalPages = Math.max(1, Math.ceil(castingTotal / CAST_PAGE_SIZE));
    let cPg = castingPage;
    if (cPg > castingTotalPages) cPg = castingTotalPages;
    castings = await listPublicCastings({
      ...castingListBase,
      sort: cSort,
      take: CAST_PAGE_SIZE,
      skip: (cPg - 1) * CAST_PAGE_SIZE,
    });
    if (castingPage !== cPg && castingTotal > 0) {
      const q = new URLSearchParams();
      q.set("tab", "castings");
      q.set("cSort", cSort);
      if (sp.q) q.set("q", sp.q);
      if (shootDateYmd) q.set("shootDate", shootDateYmd);
      if (castingCategoryFilter) q.set("cCat", castingCategoryFilter);
      if (cPg > 1) q.set("cPage", String(cPg));
      redirect(`/explore?${q.toString()}`);
    }
  }

  const castingApplyChats: Record<string, string> = {};
  const castingIdsForApply =
    tab === "favorites" ? favoriteCastingsList.map((x) => x.id) : castings.map((x) => x.id);
  if (
    (tab === "castings" || tab === "favorites") &&
    session.user.role === "ACTOR" &&
    castingIdsForApply.length > 0
  ) {
    const prof = await prisma.actorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (prof) {
      const apps = await prisma.application.findMany({
        where: {
          actorProfileId: prof.id,
          castingId: { in: castingIdsForApply },
        },
        include: { chat: { select: { id: true } } },
      });
      for (const a of apps) {
        if (a.chat) castingApplyChats[a.castingId] = a.chat.id;
      }
    }
  }

  const ageMin = parseBoundedInt(sp.ageMin, 1, 120);
  const ageMax = parseBoundedInt(sp.ageMax, 1, 120);
  const heightMin = parseBoundedInt(sp.heightMin, 100, 250);
  const heightMax = parseBoundedInt(sp.heightMax, 100, 250);
  const genderFilter = parseGender(sp.gender);
  const actorPage = parseActorPage(sp.page);

  const actorFilterBase = {
    citySlug: city,
    search: sp.q,
    ageMin,
    ageMax,
    gender: genderFilter,
    heightMin,
    heightMax,
  };

  let actors: Awaited<ReturnType<typeof listPublicActors>> = [];
  let actorTotal = 0;
  let actorTotalPages = 1;

  if (tab === "actors") {
    actorTotal = await countPublicActors(actorFilterBase);
    actorTotalPages = Math.max(1, Math.ceil(actorTotal / PAGE_SIZE));
    let page = actorPage;
    if (page > actorTotalPages) {
      page = actorTotalPages;
    }
    actors = await listPublicActors({
      ...actorFilterBase,
      sort: aSort,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    });
    if (actorPage !== page && actorTotal > 0) {
      const q = new URLSearchParams();
      q.set("tab", "actors");
      q.set("aSort", aSort);
      if (sp.ageMin) q.set("ageMin", sp.ageMin);
      if (sp.ageMax) q.set("ageMax", sp.ageMax);
      if (genderFilter) q.set("gender", genderFilter);
      if (sp.heightMin) q.set("heightMin", sp.heightMin);
      if (sp.heightMax) q.set("heightMax", sp.heightMax);
      if (page > 1) q.set("page", String(page));
      redirect(`/explore?${q.toString()}`);
    }
  }

  const base = "/explore";

  const displayCastings = tab === "favorites" ? favoriteCastingsList : castings;
  const displayActors = tab === "favorites" ? favoriteActorsList : actors;
  const browseTab = tab === "favorites" ? ("both" as const) : tab;

  return (
    <div className="min-w-0 space-y-6 pb-8 sm:space-y-8 sm:pb-10">
      <div className="flex min-w-0 flex-row flex-nowrap items-center gap-2 overflow-x-auto border-b border-border pb-3 [-webkit-overflow-scrolling:touch] sm:gap-3 md:gap-4">
        <div className="flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2">
          <Link
            href={`${base}?tab=castings`}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
              tab === "castings" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            Кастинги
          </Link>
          <Link
            href={`${base}?tab=actors`}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
              tab === "actors" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            Актёры
          </Link>
          <Link
            href={`${base}?tab=favorites`}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
              tab === "favorites"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            Избранное
          </Link>
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] md:pb-0">
          <ExploreRoleBar role={session.user.role} className="justify-end" />
        </div>
      </div>

      <HomePublicBrowse
        castings={displayCastings.map((c) =>
          serializeCastingForBrowse(c, {
            myApplicationChatId: castingApplyChats[c.id] ?? null,
            isFavorite: favoriteCastingIds.has(c.id),
          }),
        )}
        actors={serializeActors(displayActors, favoriteActorIds)}
        activeTab={browseTab}
        showActorsSeeAllLink={tab !== "actors" && tab !== "favorites"}
        showCastingsSeeAllLink={tab !== "castings" && tab !== "favorites"}
        actorsCatalogGrid={tab === "actors" || tab === "favorites"}
        actorsCatalogToolbar={
          tab === "actors" ? (
            <ExploreActorsToolbar
              sort={aSort}
              ageMin={sp.ageMin}
              ageMax={sp.ageMax}
              gender={sp.gender}
              heightMin={sp.heightMin}
              heightMax={sp.heightMax}
              totalCount={actorTotal}
            />
          ) : undefined
        }
        castingsCatalogToolbar={
          tab === "castings" ? (
            <ExploreCastingsToolbar
              sort={cSort}
              q={sp.q}
              shootDate={sp.shootDate ?? ""}
              category={sp.cCat}
              totalCount={castingTotal}
            />
          ) : undefined
        }
        castingsCatalogLayout={tab === "castings" || tab === "favorites"}
      />

      {tab === "actors" ? (
        <ExploreActorsPagination
          page={Math.min(actorPage, actorTotalPages)}
          totalPages={actorTotalPages}
          sort={aSort}
          ageMin={sp.ageMin}
          ageMax={sp.ageMax}
          gender={sp.gender}
          heightMin={sp.heightMin}
          heightMax={sp.heightMax}
        />
      ) : null}
      {tab === "castings" && (
        <ExploreCastingsPagination
          page={Math.min(castingPage, castingTotalPages)}
          totalPages={castingTotalPages}
          sort={cSort}
          q={sp.q}
          shootDate={sp.shootDate}
          cCat={sp.cCat}
        />
      )}
    </div>
  );
}
