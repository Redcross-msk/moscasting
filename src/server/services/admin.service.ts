import {
  ModerationStatus,
  Prisma,
  UserRole,
  UserStatus,
  CastingStatus,
  ReportStatus,
  ReportTargetType,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export type AdminStatsPeriod = "day" | "week" | "month" | "year";

function periodStartUtc(period: AdminStatsPeriod): Date {
  const d = new Date();
  if (period === "day") {
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
  if (period === "week") d.setUTCDate(d.getUTCDate() - 7);
  else if (period === "month") d.setUTCMonth(d.getUTCMonth() - 1);
  else d.setUTCFullYear(d.getUTCFullYear() - 1);
  return d;
}

/** Обзор админки: посещения за период + накопительные счётчики пользователей и кастингов. */
export async function getAdminDashboardStats(period: AdminStatsPeriod = "week") {
  const from = periodStartUtc(period);
  const [
    portalVisitsTotal,
    portalVisitsRegistered,
    usersRegistered,
    actors,
    producers,
    castings,
  ] = await Promise.all([
    prisma.portalVisit.count({ where: { createdAt: { gte: from } } }),
    prisma.portalVisit.count({ where: { createdAt: { gte: from }, userId: { not: null } } }),
    prisma.user.count({ where: { role: { not: UserRole.ADMIN } } }),
    prisma.user.count({ where: { role: UserRole.ACTOR } }),
    prisma.user.count({ where: { role: UserRole.PRODUCER } }),
    prisma.casting.count({ where: { deletedAt: null } }),
  ]);

  return {
    period,
    periodFrom: from,
    portalVisitsTotal,
    portalVisitsGuest: portalVisitsTotal - portalVisitsRegistered,
    portalVisitsRegistered,
    usersRegistered,
    actors,
    producers,
    castings,
  };
}

export async function listUsers(role?: UserRole) {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      actorProfile: { select: { id: true, fullName: true, moderationStatus: true } },
      producerProfile: { select: { id: true, companyName: true, moderationStatus: true } },
    },
  });
}

export async function setUserSuspended(userId: string, suspended: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { status: suspended ? UserStatus.SUSPENDED : UserStatus.ACTIVE },
  });
}

export async function setActorBlocked(profileId: string, blocked: boolean) {
  return prisma.actorProfile.update({
    where: { id: profileId },
    data: { isBlockedByAdmin: blocked, moderationStatus: blocked ? ModerationStatus.BLOCKED : ModerationStatus.APPROVED },
  });
}

export async function setProducerBlocked(profileId: string, blocked: boolean) {
  return prisma.producerProfile.update({
    where: { id: profileId },
    data: { isBlockedByAdmin: blocked, moderationStatus: blocked ? ModerationStatus.BLOCKED : ModerationStatus.APPROVED },
  });
}

export async function setCastingBlocked(castingId: string, blocked: boolean) {
  return prisma.casting.update({
    where: { id: castingId },
    data: {
      moderationStatus: blocked ? ModerationStatus.BLOCKED : ModerationStatus.APPROVED,
      status: blocked ? CastingStatus.BLOCKED : CastingStatus.ACTIVE,
    },
  });
}

export async function listAllCastings(filters?: {
  q?: string;
  dateFrom?: Date;
  dateTo?: Date;
  producerQ?: string;
}) {
  const q = filters?.q?.trim();
  const producerQ = filters?.producerQ?.trim();
  const where: Prisma.CastingWhereInput = { deletedAt: null };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }
  if (producerQ) {
    where.producerProfile = {
      OR: [
        { companyName: { contains: producerQ, mode: "insensitive" } },
        { fullName: { contains: producerQ, mode: "insensitive" } },
      ],
    };
  }
  return prisma.casting.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      city: true,
      producerProfile: { select: { id: true, companyName: true, fullName: true, userId: true } },
    },
  });
}

export async function adminSoftDeleteCasting(castingId: string) {
  return prisma.casting.update({
    where: { id: castingId },
    data: { deletedAt: new Date(), status: CastingStatus.ARCHIVED },
  });
}

export async function adminUpdateCastingBasics(castingId: string, data: { title: string; description: string }) {
  return prisma.casting.update({
    where: { id: castingId },
    data: { title: data.title.trim(), description: data.description.trim() },
  });
}

export async function listPendingCastingModeration() {
  return prisma.casting.findMany({
    where: {
      deletedAt: null,
      moderationStatus: ModerationStatus.PENDING,
    },
    orderBy: { updatedAt: "asc" },
    include: {
      city: true,
      producerProfile: { select: { companyName: true, fullName: true, userId: true } },
    },
  });
}

export async function listPendingActorRegistrations() {
  return prisma.actorProfile.findMany({
    where: { moderationStatus: ModerationStatus.PENDING, deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { email: true } }, city: true },
  });
}

export async function listPendingProducerRegistrations() {
  return prisma.producerProfile.findMany({
    where: { moderationStatus: ModerationStatus.PENDING, deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { email: true } } },
  });
}

export async function listChatsForAdmin() {
  return prisma.chat.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      application: {
        include: {
          casting: { select: { id: true, title: true } },
          actorProfile: { select: { fullName: true, id: true } },
          producerProfile: { select: { companyName: true, id: true } },
        },
      },
    },
  });
}

export async function getChatForAdmin(chatId: string) {
  return prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      application: {
        include: {
          casting: true,
          actorProfile: true,
          producerProfile: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, email: true, role: true } } },
      },
    },
  });
}

export async function logAdminAction(
  adminId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
) {
  return prisma.adminActivityLog.create({
    data: {
      adminId,
      action,
      entityType,
      entityId,
      metadata: metadata as object | undefined,
    },
  });
}

/** Полное удаление пользователя и каскадных данных (кроме того, что в схеме Restrict). */
export async function deleteUserCascade(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!u || u.role === UserRole.ADMIN) throw new Error("Нельзя удалить этого пользователя");
  await prisma.user.delete({ where: { id: userId } });
}
