import { CastingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  isDirectThreadMessageAvailable,
  isProducerActorDirectThreadAvailable,
  PRISMA_CLIENT_OUTDATED_HINT,
} from "@/lib/prisma-runtime";

export async function listChatsForActor(actorProfileId: string) {
  return prisma.chat.findMany({
    where: {
      application: { actorProfileId },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      application: {
        include: {
          casting: { select: { id: true, title: true } },
          producerProfile: { select: { fullName: true, companyName: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function listChatsForProducer(producerProfileId: string) {
  return prisma.chat.findMany({
    where: {
      application: { producerProfileId },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      application: {
        include: {
          casting: { select: { id: true, title: true } },
          actorProfile: { select: { fullName: true, id: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getChatWithAccess(chatId: string, userId: string) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      application: {
        include: {
          actorProfile: true,
          producerProfile: true,
          casting: { select: { id: true, title: true } },
          reviews: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, email: true } } },
      },
    },
  });
  if (!chat) return null;

  const allowed =
    chat.application.actorProfile.userId === userId ||
    chat.application.producerProfile.userId === userId;

  if (!allowed) return null;
  return chat;
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  body: string,
  payload?: Prisma.InputJsonValue,
) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      application: {
        include: { actorProfile: true, producerProfile: true },
      },
    },
  });
  if (!chat) throw new Error("Чат не найден");
  if (chat.closedAt) throw new Error("Чат закрыт — сообщения недоступны");

  const allowed =
    chat.application.actorProfile.userId === senderId ||
    chat.application.producerProfile.userId === senderId;
  if (!allowed) throw new Error("Forbidden");

  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: { chatId, senderId, body, ...(payload !== undefined ? { payload } : {}) },
    });
    await tx.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });
    return msg;
  });

  return message;
}

/** Данные для инбокса продюсера: кастинги с чатами по откликам + личные треды. */
export async function getProducerChatInboxData(producerProfileId: string) {
  const castings = await prisma.casting.findMany({
    where: {
      producerProfileId,
      deletedAt: null,
      status: CastingStatus.ACTIVE,
      applications: { some: { chat: { isNot: null } } },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      applications: {
        where: { chat: { isNot: null } },
        select: {
          chat: { select: { id: true } },
          actorProfile: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  const directThreads = isProducerActorDirectThreadAvailable()
    ? await prisma.producerActorDirectThread.findMany({
        where: { producerProfileId },
        orderBy: { updatedAt: "desc" },
        include: {
          actorProfile: { select: { id: true, fullName: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true } },
        },
      })
    : [];

  return {
    castings: castings.map((c) => ({
      id: c.id,
      title: c.title,
      chats: c.applications.map((a) => ({
        chatId: a.chat!.id,
        actorName: a.actorProfile.fullName,
        actorProfileId: a.actorProfile.id,
      })),
    })),
    direct: directThreads.map(
      (t: {
        id: string;
        actorProfile: { id: string; fullName: string };
        messages: { body: string }[];
      }) => ({
        threadId: t.id,
        actorName: t.actorProfile.fullName,
        actorProfileId: t.actorProfile.id,
        preview: t.messages[0]?.body?.slice(0, 120) ?? "",
      }),
    ),
  };
}

/** Инбокс актёра: по одному чату на кастинг + личные треды. */
export async function getActorChatInboxData(actorProfileId: string) {
  const chats = await listChatsForActor(actorProfileId);
  const byCasting = new Map<
    string,
    {
      castingId: string;
      castingTitle: string;
      chatId: string;
      producerLabel: string;
      preview: string;
    }
  >();
  for (const c of chats) {
    const cid = c.application.casting.id;
    if (byCasting.has(cid)) continue;
    byCasting.set(cid, {
      castingId: cid,
      castingTitle: c.application.casting.title,
      chatId: c.id,
      producerLabel: c.application.producerProfile.companyName || c.application.producerProfile.fullName,
      preview: c.messages[0]?.body?.slice(0, 120) ?? "",
    });
  }

  const directThreads = isProducerActorDirectThreadAvailable()
    ? await prisma.producerActorDirectThread.findMany({
        where: { actorProfileId },
        orderBy: { updatedAt: "desc" },
        include: {
          producerProfile: { select: { fullName: true, companyName: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true } },
        },
      })
    : [];

  return {
    byCasting: [...byCasting.values()],
    direct: directThreads.map(
      (t: {
        id: string;
        producerProfile: { fullName: string; companyName: string | null };
        messages: { body: string }[];
      }) => ({
        threadId: t.id,
        producerLabel: t.producerProfile.companyName || t.producerProfile.fullName,
        preview: t.messages[0]?.body?.slice(0, 120) ?? "",
      }),
    ),
  };
}

export async function getDirectThreadWithAccess(threadId: string, userId: string) {
  if (!isProducerActorDirectThreadAvailable()) return null;
  const thread = await prisma.producerActorDirectThread.findUnique({
    where: { id: threadId },
    include: {
      producerProfile: {
        select: { userId: true, fullName: true, companyName: true },
      },
      actorProfile: { select: { userId: true, fullName: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, email: true } } },
      },
    },
  });
  if (!thread) return null;
  const ok =
    thread.producerProfile.userId === userId || thread.actorProfile.userId === userId;
  if (!ok) return null;
  return thread;
}

export async function sendDirectThreadMessage(threadId: string, senderId: string, body: string) {
  if (!isProducerActorDirectThreadAvailable() || !isDirectThreadMessageAvailable()) {
    throw new Error(PRISMA_CLIENT_OUTDATED_HINT);
  }
  const thread = await prisma.producerActorDirectThread.findUnique({
    where: { id: threadId },
    include: {
      producerProfile: { select: { userId: true } },
      actorProfile: { select: { userId: true } },
    },
  });
  if (!thread) throw new Error("Чат не найден");
  const ok =
    thread.producerProfile.userId === senderId || thread.actorProfile.userId === senderId;
  if (!ok) throw new Error("Forbidden");

  return prisma.$transaction(async (tx) => {
    const msg = await tx.directThreadMessage.create({
      data: { threadId, senderId, body },
    });
    await tx.producerActorDirectThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });
    return msg;
  });
}

export async function ensureDirectThread(producerProfileId: string, actorProfileId: string) {
  if (!isProducerActorDirectThreadAvailable()) {
    throw new Error(PRISMA_CLIENT_OUTDATED_HINT);
  }
  const existing = await prisma.producerActorDirectThread.findUnique({
    where: {
      producerProfileId_actorProfileId: { producerProfileId, actorProfileId },
    },
  });
  if (existing) return existing.id;
  const created = await prisma.producerActorDirectThread.create({
    data: { producerProfileId, actorProfileId },
  });
  return created.id;
}
