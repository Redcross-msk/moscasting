import {
  CastingStatus,
  ModerationStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { listPublicCastings } from "@/server/services/casting.service";
import {
  actorProfileCatalogInclude,
  listPublicActors,
} from "@/server/services/actor-profile.service";

const castingHomeInclude = {
  city: true,
  producerProfile: {
    select: { id: true, companyName: true, fullName: true },
  },
} as const;

export type HomeCastingRow = Prisma.CastingGetPayload<{ include: typeof castingHomeInclude }>;

export type HomeActorRow = Prisma.ActorProfileGetPayload<{
  include: typeof actorProfileCatalogInclude;
}>;

function isPublicCasting(c: HomeCastingRow, citySlug: string): boolean {
  if (c.deletedAt) return false;
  if (c.status !== CastingStatus.ACTIVE || c.moderationStatus !== ModerationStatus.APPROVED) return false;
  if (c.city.slug !== citySlug) return false;
  return true;
}

function isPublicActor(a: HomeActorRow, citySlug: string): boolean {
  if (a.deletedAt) return false;
  if (a.isBlockedByAdmin || a.isHiddenByUser) return false;
  if (a.moderationStatus !== ModerationStatus.APPROVED) return false;
  if (a.city.slug !== citySlug) return false;
  return true;
}

export async function getHomepageCastings(citySlug: string): Promise<HomeCastingRow[]> {
  const slots = await prisma.homepageFeaturedCasting.findMany({
    orderBy: { position: "asc" },
    include: { casting: { include: castingHomeInclude } },
  });

  const ordered: HomeCastingRow[] = [];
  for (const s of slots) {
    if (s.position >= 1 && s.position <= 6 && isPublicCasting(s.casting, citySlug)) {
      ordered.push(s.casting);
    }
  }

  if (ordered.length >= 6) return ordered.slice(0, 6);

  const used = new Set(ordered.map((c) => c.id));
  const rest = await listPublicCastings({ citySlug, take: 24 });
  for (const c of rest) {
    if (ordered.length >= 6) break;
    if (!used.has(c.id)) {
      ordered.push(c);
      used.add(c.id);
    }
  }
  return ordered.slice(0, 6);
}

export async function getHomepageActors(citySlug: string): Promise<HomeActorRow[]> {
  const slots = await prisma.homepageFeaturedActor.findMany({
    orderBy: { position: "asc" },
    include: {
      actorProfile: {
        include: actorProfileCatalogInclude,
      },
    },
  });

  const ordered: HomeActorRow[] = [];
  for (const s of slots) {
    if (s.position >= 1 && s.position <= 6 && isPublicActor(s.actorProfile, citySlug)) {
      ordered.push(s.actorProfile);
    }
  }

  if (ordered.length >= 6) return ordered.slice(0, 6);

  const used = new Set(ordered.map((a) => a.id));
  const rest = await listPublicActors({ citySlug, take: 24 });
  for (const a of rest) {
    if (ordered.length >= 6) break;
    if (!used.has(a.id)) {
      ordered.push(a);
      used.add(a.id);
    }
  }
  return ordered.slice(0, 6);
}

export async function listCastingsForHomepageAdminPicker(citySlug?: string) {
  const where: Prisma.CastingWhereInput = {
    deletedAt: null,
    status: CastingStatus.ACTIVE,
    moderationStatus: ModerationStatus.APPROVED,
    producerProfile: {
      isBlockedByAdmin: false,
      moderationStatus: { not: ModerationStatus.BLOCKED },
    },
  };
  if (citySlug) {
    where.city = { slug: citySlug };
  }

  return prisma.casting.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      city: true,
      producerProfile: { select: { companyName: true, fullName: true } },
    },
  });
}

export async function listActorsForHomepageAdminPicker(citySlug?: string) {
  const where: Prisma.ActorProfileWhereInput = {
    deletedAt: null,
    isBlockedByAdmin: false,
    isHiddenByUser: false,
    moderationStatus: ModerationStatus.APPROVED,
  };
  if (citySlug) {
    where.city = { slug: citySlug };
  }

  return prisma.actorProfile.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 300,
    include: { city: true },
  });
}

export async function getHomepageFeaturedSlotsAdmin() {
  const [castingSlots, actorSlots] = await Promise.all([
    prisma.homepageFeaturedCasting.findMany({
      orderBy: { position: "asc" },
      include: {
        casting: {
          include: {
            city: true,
            producerProfile: { select: { companyName: true, fullName: true } },
          },
        },
      },
    }),
    prisma.homepageFeaturedActor.findMany({
      orderBy: { position: "asc" },
      include: { actorProfile: { include: { city: true } } },
    }),
  ]);
  return { castingSlots, actorSlots };
}

export async function replaceHomepageFeaturedCastings(
  positions: { position: number; castingId: string | null }[],
) {
  await prisma.$transaction(async (tx) => {
    await tx.homepageFeaturedCasting.deleteMany({});
    for (const { position, castingId } of positions) {
      if (position < 1 || position > 6) continue;
      if (!castingId) continue;
      await tx.homepageFeaturedCasting.create({
        data: { position, castingId },
      });
    }
  });
}

export async function replaceHomepageFeaturedActors(
  positions: { position: number; actorProfileId: string | null }[],
) {
  await prisma.$transaction(async (tx) => {
    await tx.homepageFeaturedActor.deleteMany({});
    for (const { position, actorProfileId } of positions) {
      if (position < 1 || position > 6) continue;
      if (!actorProfileId) continue;
      await tx.homepageFeaturedActor.create({
        data: { position, actorProfileId },
      });
    }
  });
}
