import {
  ModerationStatus,
  UserRole,
  UserStatus,
  CastingStatus,
  ReportStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export async function getAdminStats() {
  const [
    users,
    actors,
    producers,
    castings,
    applications,
    chats,
    reportsOpen,
    blockedActorProfiles,
    blockedCastings,
    castingViews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: UserRole.ACTOR } }),
    prisma.user.count({ where: { role: UserRole.PRODUCER } }),
    prisma.casting.count({ where: { deletedAt: null } }),
    prisma.application.count(),
    prisma.chat.count(),
    prisma.report.count({ where: { status: { in: [ReportStatus.OPEN, ReportStatus.IN_REVIEW] } } }),
    prisma.actorProfile.count({ where: { isBlockedByAdmin: true } }),
    prisma.casting.count({
      where: { OR: [{ moderationStatus: ModerationStatus.BLOCKED }, { status: CastingStatus.BLOCKED }] },
    }),
    prisma.castingView.count(),
  ]);

  return {
    users,
    actors,
    producers,
    castings,
    applications,
    chats,
    reports: reportsOpen,
    blockedProfiles: blockedActorProfiles,
    blockedCastings,
    castingViews,
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

export async function setCastingBlocked(castingId: string, blocked: boolean) {
  return prisma.casting.update({
    where: { id: castingId },
    data: {
      moderationStatus: blocked ? ModerationStatus.BLOCKED : ModerationStatus.APPROVED,
      status: blocked ? CastingStatus.BLOCKED : CastingStatus.ACTIVE,
    },
  });
}

export async function listAllCastings() {
  return prisma.casting.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      city: true,
      producerProfile: { select: { companyName: true, fullName: true } },
    },
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
