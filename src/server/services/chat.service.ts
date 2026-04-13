import { CastingStatus, Prisma, UserRole } from "@prisma/client";
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
        select: { body: true, senderId: true, createdAt: true },
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

/** Помечает входящие сообщения в чате отклика как прочитанные текущим пользователем. */
export async function markApplicationChatReadForViewer(chatId: string, viewerUserId: string) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      application: {
        include: {
          actorProfile: { select: { userId: true } },
          producerProfile: { select: { userId: true } },
        },
      },
      messages: { select: { id: true, senderId: true } },
    },
  });
  if (!chat) return;
  const allowed =
    chat.application.actorProfile.userId === viewerUserId ||
    chat.application.producerProfile.userId === viewerUserId;
  if (!allowed) return;

  const incoming = chat.messages.filter((m) => m.senderId !== viewerUserId);
  if (!incoming.length) return;

  await prisma.$transaction(
    incoming.map((m) =>
      prisma.messageRead.upsert({
        where: { messageId_userId: { messageId: m.id, userId: viewerUserId } },
        create: { messageId: m.id, userId: viewerUserId },
        update: {},
      }),
    ),
  );
}

async function applicationChatIdsWithUnreadFromViewer(
  chatIds: string[],
  viewerUserId: string,
): Promise<Set<string>> {
  const counts = await applicationUnreadMessageCountsFromViewer(chatIds, viewerUserId);
  return new Set([...counts.entries()].filter(([, n]) => n > 0).map(([id]) => id));
}

/** Сколько входящих непрочитанных сообщений по каждому чату отклика. */
async function applicationUnreadMessageCountsFromViewer(
  chatIds: string[],
  viewerUserId: string,
): Promise<Map<string, number>> {
  if (chatIds.length === 0) return new Map();
  const rows = await prisma.message.groupBy({
    by: ["chatId"],
    where: {
      chatId: { in: chatIds },
      senderId: { not: viewerUserId },
      reads: { none: { userId: viewerUserId } },
    },
    _count: { _all: true },
  });
  const m = new Map<string, number>();
  for (const r of rows) {
    m.set(r.chatId, r._count._all);
  }
  return m;
}

export async function getChatWithAccess(
  chatId: string,
  userId: string,
  options?: { markRead?: boolean },
) {
  if (options?.markRead) {
    await markApplicationChatReadForViewer(chatId, userId);
  }

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
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              actorProfile: { select: { fullName: true } },
              producerProfile: { select: { fullName: true, companyName: true } },
            },
          },
          reads: { select: { userId: true } },
        },
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

/** Данные для инбокса продюсера: только чаты по откликам (как у актёра в списке кастингов). Личный тред — по ссылке ?direct=. */
export async function getProducerChatInboxData(producerProfileId: string, viewerUserId: string) {
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
          createdAt: true,
          chat: {
            select: {
              id: true,
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { body: true, senderId: true, createdAt: true },
              },
            },
          },
          actorProfile: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  const applicationItems = castings.flatMap((c) =>
    c.applications.map((a) => {
      const last = a.chat!.messages[0];
      return {
        kind: "application" as const,
        castingId: c.id,
        castingTitle: c.title,
        chatId: a.chat!.id,
        actorName: a.actorProfile.fullName,
        actorProfileId: a.actorProfile.id,
        preview: last?.body?.slice(0, 120) ?? "",
        applicationSubmittedAt: a.createdAt.toISOString(),
        lastMessageIsMine: last?.senderId != null ? last.senderId === viewerUserId : null,
        lastMessageAt: (last?.createdAt ?? a.createdAt).toISOString(),
      };
    }),
  );

  const producerAppChatIds = applicationItems.map((i) => i.chatId);
  const producerUnreadCounts = await applicationUnreadMessageCountsFromViewer(
    producerAppChatIds,
    viewerUserId,
  );

  const applicationItemsWithUnread = applicationItems
    .map((row) => {
      const unreadCount = producerUnreadCounts.get(row.chatId) ?? 0;
      return {
        ...row,
        unreadCount,
        hasUnread: unreadCount > 0,
      };
    })
    .sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt));

  return {
    items: applicationItemsWithUnread,
  };
}

/** Инбокс актёра: по одному чату на кастинг + личные треды. */
export async function getActorChatInboxData(actorProfileId: string, viewerUserId: string) {
  const chats = await listChatsForActor(actorProfileId);
  const byCasting = new Map<
    string,
    {
      castingId: string;
      castingTitle: string;
      chatId: string;
      producerLabel: string;
      preview: string;
      applicationSubmittedAt: string;
      lastMessageIsMine: boolean | null;
      lastMessageAt: string;
    }
  >();
  for (const c of chats) {
    const cid = c.application.casting.id;
    if (byCasting.has(cid)) continue;
    const last = c.messages[0];
    byCasting.set(cid, {
      castingId: cid,
      castingTitle: c.application.casting.title,
      chatId: c.id,
      producerLabel: c.application.producerProfile.companyName || c.application.producerProfile.fullName,
      preview: last?.body?.slice(0, 120) ?? "",
      applicationSubmittedAt: c.application.createdAt.toISOString(),
      lastMessageIsMine: last?.senderId != null ? last.senderId === viewerUserId : null,
      lastMessageAt: (last?.createdAt ?? c.updatedAt).toISOString(),
    });
  }

  const actorAppChatIds = [...byCasting.values()].map((r) => r.chatId);
  const actorUnreadCounts = await applicationUnreadMessageCountsFromViewer(actorAppChatIds, viewerUserId);

  const byCastingRows = [...byCasting.values()]
    .map((row) => {
      const unreadCount = actorUnreadCounts.get(row.chatId) ?? 0;
      return {
        ...row,
        unreadCount,
        hasUnread: unreadCount > 0,
      };
    })
    .sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt));

  const directThreads = isProducerActorDirectThreadAvailable()
    ? await prisma.producerActorDirectThread.findMany({
        where: { actorProfileId },
        orderBy: { updatedAt: "desc" },
        include: {
          producerProfile: { select: { userId: true, fullName: true, companyName: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { body: true, senderId: true, createdAt: true },
          },
        },
      })
    : [];

  const directRows = await Promise.all(
    directThreads.map(
      async (t: {
        id: string;
        updatedAt: Date;
        lastSeenAtActor: Date | null;
        producerProfile: { userId: string; fullName: string; companyName: string | null };
        messages: { body: string; senderId: string; createdAt: Date }[];
      }) => {
        const last = t.messages[0];
        let unreadCount = 0;
        if (isDirectThreadMessageAvailable()) {
          unreadCount = await prisma.directThreadMessage.count({
            where: {
              threadId: t.id,
              senderId: t.producerProfile.userId,
              ...(t.lastSeenAtActor ? { createdAt: { gt: t.lastSeenAtActor } } : {}),
            },
          });
        }
        return {
          threadId: t.id,
          producerLabel: t.producerProfile.companyName || t.producerProfile.fullName,
          preview: last?.body?.slice(0, 120) ?? "",
          threadUpdatedAt: t.updatedAt.toISOString(),
          lastMessageIsMine: last?.senderId != null ? last.senderId === viewerUserId : null,
          lastMessageAt: (last?.createdAt ?? t.updatedAt).toISOString(),
          unreadCount,
          hasUnread: unreadCount > 0,
        };
      },
    ),
  );

  return {
    byCasting: byCastingRows,
    direct: directRows,
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
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              actorProfile: { select: { fullName: true } },
              producerProfile: { select: { fullName: true, companyName: true } },
            },
          },
        },
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

/** Помечает личный тред просмотренным (бейдж непрочитанных). */
export async function markDirectThreadReadForViewer(threadId: string, viewerUserId: string) {
  if (!isProducerActorDirectThreadAvailable()) return;
  const t = await prisma.producerActorDirectThread.findUnique({
    where: { id: threadId },
    include: {
      producerProfile: { select: { userId: true } },
      actorProfile: { select: { userId: true } },
    },
  });
  if (!t) return;
  const now = new Date();
  if (t.producerProfile.userId === viewerUserId) {
    await prisma.producerActorDirectThread.update({
      where: { id: threadId },
      data: { lastSeenAtProducer: now },
    });
  } else if (t.actorProfile.userId === viewerUserId) {
    await prisma.producerActorDirectThread.update({
      where: { id: threadId },
      data: { lastSeenAtActor: now },
    });
  }
}

/** Число «диалогов» с непрочитанными входящими (как в инбоксе актёра: один чат на кастинг + личные треды). */
export async function countUnreadActorChatConversations(
  actorProfileId: string,
  viewerUserId: string,
): Promise<number> {
  const chats = await listChatsForActor(actorProfileId);
  const byCasting = new Map<string, string>();
  for (const c of chats) {
    const cid = c.application.casting.id;
    if (byCasting.has(cid)) continue;
    byCasting.set(cid, c.id);
  }
  const appChatIds = [...byCasting.values()];
  const unreadApp = await applicationChatIdsWithUnreadFromViewer(appChatIds, viewerUserId);
  let count = 0;
  for (const id of appChatIds) {
    if (unreadApp.has(id)) count++;
  }

  if (!isProducerActorDirectThreadAvailable() || !isDirectThreadMessageAvailable()) return count;

  const directThreads = await prisma.producerActorDirectThread.findMany({
    where: { actorProfileId },
    select: {
      id: true,
      lastSeenAtActor: true,
      producerProfile: { select: { userId: true } },
    },
  });

  for (const t of directThreads) {
    const otherUserId = t.producerProfile.userId;
    const lastSeen = t.lastSeenAtActor;
    const n = await prisma.directThreadMessage.count({
      where: {
        threadId: t.id,
        senderId: otherUserId,
        ...(lastSeen ? { createdAt: { gt: lastSeen } } : {}),
      },
    });
    if (n > 0) count++;
  }

  return count;
}

/** Число строк инбокса продюсера с непрочитанными входящими (отклики + личные треды). */
export async function countUnreadProducerChatConversations(
  producerProfileId: string,
  viewerUserId: string,
): Promise<number> {
  const castings = await prisma.casting.findMany({
    where: {
      producerProfileId,
      deletedAt: null,
      status: CastingStatus.ACTIVE,
      applications: { some: { chat: { isNot: null } } },
    },
    select: {
      applications: {
        where: { chat: { isNot: null } },
        select: { chat: { select: { id: true } } },
      },
    },
  });
  const appChatIds = castings.flatMap((c) => c.applications.map((a) => a.chat!.id));
  const unreadApp = await applicationChatIdsWithUnreadFromViewer(appChatIds, viewerUserId);
  let count = 0;
  for (const id of appChatIds) {
    if (unreadApp.has(id)) count++;
  }

  if (!isProducerActorDirectThreadAvailable() || !isDirectThreadMessageAvailable()) return count;

  const directThreads = await prisma.producerActorDirectThread.findMany({
    where: { producerProfileId },
    select: {
      id: true,
      lastSeenAtProducer: true,
      actorProfile: { select: { userId: true } },
    },
  });

  for (const t of directThreads) {
    const otherUserId = t.actorProfile.userId;
    const lastSeen = t.lastSeenAtProducer;
    const n = await prisma.directThreadMessage.count({
      where: {
        threadId: t.id,
        senderId: otherUserId,
        ...(lastSeen ? { createdAt: { gt: lastSeen } } : {}),
      },
    });
    if (n > 0) count++;
  }

  return count;
}

export async function countUnreadChatConversationsForUser(
  userId: string,
  role: UserRole,
): Promise<number> {
  if (role === UserRole.ADMIN) return 0;
  if (role === UserRole.ACTOR) {
    const p = await prisma.actorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!p) return 0;
    return countUnreadActorChatConversations(p.id, userId);
  }
  if (role === UserRole.PRODUCER) {
    const p = await prisma.producerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!p) return 0;
    return countUnreadProducerChatConversations(p.id, userId);
  }
  return 0;
}
