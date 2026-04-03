import { NotificationChannel, NotificationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function createInAppNotification(input: {
  userId: string;
  title: string;
  body?: string;
  payload?: Prisma.InputJsonValue;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      channel: NotificationChannel.IN_APP,
      status: NotificationStatus.SENT,
      title: input.title,
      body: input.body,
      payload: input.payload,
      sentAt: new Date(),
    },
  });
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function listRecentNotifications(userId: string, take = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
