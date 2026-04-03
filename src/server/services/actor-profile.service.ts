import { Gender, MediaKind, ModerationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Для карточек в каталоге: город + превью-фото как в кабинете (не BLOCKED), аватар приоритетно. */
export const actorProfileCatalogInclude = {
  city: true,
  media: {
    where: {
      kind: MediaKind.PHOTO,
      publicUrl: { not: null },
      moderationStatus: { not: ModerationStatus.BLOCKED },
    },
    orderBy: [{ isAvatar: "desc" as const }, { sortOrder: "asc" as const }],
    take: 1,
    select: { publicUrl: true },
  },
} satisfies Prisma.ActorProfileInclude;

export type PublicActorSort = "new" | "young" | "old";

export type ListActorsFilters = {
  citySlug?: string;
  search?: string;
  take?: number;
  skip?: number;
  sort?: PublicActorSort;
  ageMin?: number;
  ageMax?: number;
  gender?: Gender;
  heightMin?: number;
  heightMax?: number;
};

function birthDateFilterForAgeRange(ageMin?: number, ageMax?: number): Prisma.DateTimeFilter | undefined {
  const today = new Date();
  const f: Prisma.DateTimeFilter = {};
  if (ageMin !== undefined && Number.isFinite(ageMin) && ageMin >= 1 && ageMin <= 120) {
    f.lte = new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate());
  }
  if (ageMax !== undefined && Number.isFinite(ageMax) && ageMax >= 1 && ageMax <= 120) {
    f.gte = new Date(today.getFullYear() - ageMax, today.getMonth(), today.getDate());
  }
  return Object.keys(f).length ? f : undefined;
}

export function buildPublicActorWhere(
  filters: Pick<
    ListActorsFilters,
    "citySlug" | "search" | "ageMin" | "ageMax" | "gender" | "heightMin" | "heightMax"
  >,
): Prisma.ActorProfileWhereInput {
  const citySlug = filters.citySlug ?? "moscow";

  const where: Prisma.ActorProfileWhereInput = {
    deletedAt: null,
    isBlockedByAdmin: false,
    isHiddenByUser: false,
    moderationStatus: ModerationStatus.APPROVED,
    city: { slug: citySlug },
  };

  if (filters.search?.trim()) {
    where.OR = [
      { fullName: { contains: filters.search.trim(), mode: "insensitive" } },
      { bio: { contains: filters.search.trim(), mode: "insensitive" } },
    ];
  }

  let ageLo = filters.ageMin;
  let ageHi = filters.ageMax;
  if (ageLo !== undefined && ageHi !== undefined && ageLo > ageHi) {
    [ageLo, ageHi] = [ageHi, ageLo];
  }
  const bd = birthDateFilterForAgeRange(ageLo, ageHi);
  if (bd) {
    where.birthDate = bd;
  }

  if (filters.gender === Gender.MALE || filters.gender === Gender.FEMALE) {
    where.gender = filters.gender;
  }

  let hMin = filters.heightMin;
  let hMax = filters.heightMax;
  if (hMin !== undefined && hMax !== undefined && hMin > hMax) {
    [hMin, hMax] = [hMax, hMin];
  }

  const h: Prisma.IntFilter = {};
  if (hMin !== undefined && Number.isFinite(hMin)) {
    const v = Math.round(hMin);
    if (v >= 100 && v <= 250) h.gte = v;
  }
  if (hMax !== undefined && Number.isFinite(hMax)) {
    const v = Math.round(hMax);
    if (v >= 100 && v <= 250) h.lte = v;
  }
  if (Object.keys(h).length) {
    where.heightCm = h;
  }

  return where;
}

function publicActorOrderBy(
  sort?: PublicActorSort,
): Prisma.ActorProfileOrderByWithRelationInput {
  switch (sort) {
    case "young":
      return { birthDate: "desc" };
    case "old":
      return { birthDate: "asc" };
    default:
      return { updatedAt: "desc" };
  }
}

function safeSkipTake(skip: number | undefined, take: number | undefined): { skip: number; take: number } {
  const rawSkip = skip ?? 0;
  const rawTake = take ?? 30;
  const s = Number.isFinite(rawSkip) ? Math.max(0, Math.floor(rawSkip)) : 0;
  const t = Number.isFinite(rawTake) ? Math.min(100, Math.max(1, Math.floor(rawTake))) : 30;
  return { skip: s, take: t };
}

export async function listPublicActors(filters: ListActorsFilters) {
  const where = buildPublicActorWhere(filters);
  const { skip, take } = safeSkipTake(filters.skip, filters.take);

  return prisma.actorProfile.findMany({
    where,
    orderBy: publicActorOrderBy(filters.sort),
    skip,
    take,
    include: actorProfileCatalogInclude,
  });
}

export async function countPublicActors(
  filters: Pick<
    ListActorsFilters,
    | "citySlug"
    | "search"
    | "ageMin"
    | "ageMax"
    | "gender"
    | "heightMin"
    | "heightMax"
  >,
) {
  const where = buildPublicActorWhere(filters);
  return prisma.actorProfile.count({ where });
}

export async function getPublicActorProfile(id: string) {
  return prisma.actorProfile.findFirst({
    where: {
      id,
      deletedAt: null,
      isBlockedByAdmin: false,
      isHiddenByUser: false,
      moderationStatus: { not: ModerationStatus.BLOCKED },
    },
    include: {
      city: true,
      media: {
        where: { moderationStatus: { not: ModerationStatus.BLOCKED } },
        orderBy: [{ isAvatar: "desc" }, { sortOrder: "asc" }],
      },
      user: { select: { id: true } },
    },
  });
}
