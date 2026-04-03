import {
  CastingCategory,
  CastingStatus,
  ModerationStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export type PublicCastingSort = "new" | "old" | "pay_high" | "pay_low" | "shoot_near" | "shoot_far";

export type PublicCastingFilters = {
  citySlug?: string;
  /** Поиск только по названию */
  search?: string;
  take?: number;
  skip?: number;
  sort?: PublicCastingSort;
  castingCategory?: CastingCategory;
  /** День съёмки YYYY-MM-DD (UTC), фильтр по scheduledAt */
  shootDateYmd?: string;
};

/** Парсинг YYYY-MM-DD в интервал [start, end) по UTC */
export function utcDayRangeFromYmd(ymd: string): { start: Date; end: Date } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const start = new Date(Date.UTC(y, mo - 1, d, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, mo - 1, d + 1, 0, 0, 0, 0));
  if (Number.isNaN(start.getTime())) return null;
  return { start, end };
}

export function buildPublicCastingWhere(
  filters: Pick<PublicCastingFilters, "citySlug" | "search" | "castingCategory" | "shootDateYmd">,
): Prisma.CastingWhereInput {
  const citySlug = filters.citySlug ?? "moscow";

  const where: Prisma.CastingWhereInput = {
    deletedAt: null,
    status: CastingStatus.ACTIVE,
    moderationStatus: ModerationStatus.APPROVED,
    city: { slug: citySlug },
    producerProfile: {
      isBlockedByAdmin: false,
      moderationStatus: { not: ModerationStatus.BLOCKED },
    },
  };

  if (filters.search?.trim()) {
    where.title = { contains: filters.search.trim(), mode: "insensitive" };
  }

  if (filters.castingCategory === CastingCategory.MASS || filters.castingCategory === CastingCategory.GROUP || filters.castingCategory === CastingCategory.SOLO) {
    where.castingCategory = filters.castingCategory;
  }

  const dayRange = filters.shootDateYmd ? utcDayRangeFromYmd(filters.shootDateYmd) : null;
  if (dayRange) {
    where.scheduledAt = { gte: dayRange.start, lt: dayRange.end };
  }

  return where;
}

function publicCastingOrderBy(
  sort?: PublicCastingSort,
): Prisma.CastingOrderByWithRelationInput | Prisma.CastingOrderByWithRelationInput[] {
  switch (sort) {
    case "old":
      return { createdAt: "asc" };
    case "pay_high":
      return [{ paymentRub: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];
    case "pay_low":
      return [{ paymentRub: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }];
    case "shoot_near":
      return [{ scheduledAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }];
    case "shoot_far":
      return [{ scheduledAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];
    default:
      return { createdAt: "desc" };
  }
}

function safeTake(take: number | undefined): number {
  const t = take ?? 30;
  if (!Number.isFinite(t)) return 30;
  return Math.min(100, Math.max(1, Math.floor(t)));
}

function safeSkip(skip: number | undefined): number | undefined {
  if (skip === undefined) return undefined;
  if (!Number.isFinite(skip)) return 0;
  return Math.max(0, Math.floor(skip));
}

export async function listPublicCastings(filters: PublicCastingFilters) {
  const where = buildPublicCastingWhere(filters);

  return prisma.casting.findMany({
    where,
    orderBy: publicCastingOrderBy(filters.sort),
    skip: safeSkip(filters.skip),
    take: safeTake(filters.take),
    include: {
      city: true,
      producerProfile: {
        select: { id: true, companyName: true, fullName: true },
      },
    },
  });
}

export async function countPublicCastings(
  filters: Pick<PublicCastingFilters, "citySlug" | "search" | "castingCategory" | "shootDateYmd">,
) {
  const where = buildPublicCastingWhere(filters);
  return prisma.casting.count({ where });
}

export async function getCastingPublic(id: string) {
  return prisma.casting.findFirst({
    where: {
      id,
      deletedAt: null,
      status: CastingStatus.ACTIVE,
      moderationStatus: ModerationStatus.APPROVED,
      producerProfile: { isBlockedByAdmin: false },
    },
    include: {
      city: true,
      producerProfile: {
        select: {
          id: true,
          companyName: true,
          fullName: true,
          positionTitle: true,
          userId: true,
        },
      },
      media: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function recordCastingView(castingId: string, viewerId?: string | null) {
  await prisma.$transaction([
    prisma.castingView.create({
      data: { castingId, viewerId: viewerId ?? undefined },
    }),
    prisma.casting.update({
      where: { id: castingId },
      data: { viewsCount: { increment: 1 } },
    }),
  ]);
}

export async function listProducerCastings(producerProfileId: string) {
  return prisma.casting.findMany({
    where: { producerProfileId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: { city: true },
  });
}

export async function getCastingForProducer(castingId: string, producerProfileId: string) {
  return prisma.casting.findFirst({
    where: { id: castingId, producerProfileId, deletedAt: null },
    include: { city: true, media: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createCasting(
  producerProfileId: string,
  data: Omit<Prisma.CastingCreateInput, "producerProfile">,
) {
  return prisma.casting.create({
    data: {
      ...data,
      producerProfile: { connect: { id: producerProfileId } },
    },
  });
}

export async function updateCasting(
  castingId: string,
  producerProfileId: string,
  data: Prisma.CastingUpdateInput,
) {
  const existing = await prisma.casting.findFirst({
    where: { id: castingId, producerProfileId, deletedAt: null },
  });
  if (!existing) throw new Error("Casting not found");

  return prisma.casting.update({
    where: { id: castingId },
    data,
  });
}

export async function softDeleteCasting(castingId: string, producerProfileId: string) {
  const existing = await prisma.casting.findFirst({
    where: { id: castingId, producerProfileId, deletedAt: null },
  });
  if (!existing) throw new Error("Casting not found");

  return prisma.casting.update({
    where: { id: castingId },
    data: { deletedAt: new Date(), status: CastingStatus.ARCHIVED },
  });
}
