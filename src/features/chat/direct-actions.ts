"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  ensureDirectThread,
  getDirectThreadWithAccess,
  markDirectThreadReadForViewer,
  sendDirectThreadMessage,
} from "@/server/services/chat.service";
import { applicationChatMessageReceipt, directThreadMessageReceipt } from "@/lib/chat-message-receipt";
import { chatSenderPublicLabel, formatChatMessageTimeHm } from "@/lib/chat-sender-display";
import { formatActorSurnameAndFirstName } from "@/lib/utils";

export async function startDirectThreadWithActorAction(actorProfileId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");
  const producer = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!producer) throw new Error("Нет профиля");
  const threadId = await ensureDirectThread(producer.id, actorProfileId);
  revalidatePath("/producer/chats");
  redirect(`/producer/chats?direct=${threadId}`);
}

export async function fetchApplicationChatPanelAction(chatId: string) {
  const session = await auth();
  if (!session?.user) return null;
  const { getChatWithAccess } = await import("@/server/services/chat.service");
  const chat = await getChatWithAccess(chatId, session.user.id, { markRead: true });
  if (!chat) return null;

  const counterpartyUserId =
    chat.application.actorProfile.userId === session.user.id
      ? chat.application.producerProfile.userId
      : chat.application.actorProfile.userId;

  return {
    kind: "application" as const,
    chatId: chat.id,
    title: chat.application.casting.title,
    subtitle: `${formatActorSurnameAndFirstName(chat.application.actorProfile.fullName)} · отклик`,
    closedAt: chat.closedAt ? chat.closedAt.toISOString() : null,
    applicationId: chat.application.id,
    applicationStatus: chat.application.status,
    messages: chat.messages.map((m) => {
      const isMine = m.senderId === session.user.id;
      return {
        id: m.id,
        senderId: m.senderId,
        senderLabel: chatSenderPublicLabel(m.sender),
        createdAtIso: m.createdAt.toISOString(),
        timeHm: formatChatMessageTimeHm(m.createdAt),
        receipt: applicationChatMessageReceipt({
          isMine,
          viewerUserId: session.user.id,
          counterpartyUserId,
          reads: m.reads,
        }),
        body: m.body,
        payload: m.payload,
      };
    }),
  };
}

export async function fetchDirectThreadPanelAction(threadId: string) {
  const session = await auth();
  if (!session?.user) return null;
  const thread = await getDirectThreadWithAccess(threadId, session.user.id);
  if (!thread) return null;
  const lastSeenAtProducer = thread.lastSeenAtProducer;
  const lastSeenAtActor = thread.lastSeenAtActor;
  const producerUserId = thread.producerProfile.userId;
  const actorUserId = thread.actorProfile.userId;
  await markDirectThreadReadForViewer(threadId, session.user.id);
  const isProducer = producerUserId === session.user.id;
  return {
    kind: "direct" as const,
    threadId: thread.id,
    title: "Личный чат",
    subtitle: isProducer
      ? formatActorSurnameAndFirstName(thread.actorProfile.fullName)
      : thread.producerProfile.companyName?.trim() || formatActorSurnameAndFirstName(thread.producerProfile.fullName),
    messages: thread.messages.map((m) => {
      const isMine = m.senderId === session.user.id;
      return {
        id: m.id,
        senderId: m.senderId,
        senderLabel: chatSenderPublicLabel(m.sender),
        createdAtIso: m.createdAt.toISOString(),
        timeHm: formatChatMessageTimeHm(m.createdAt),
        receipt: directThreadMessageReceipt({
          isMine,
          viewerUserId: session.user.id,
          producerUserId,
          actorUserId,
          messageCreatedAt: m.createdAt,
          lastSeenAtProducer,
          lastSeenAtActor,
        }),
        body: m.body,
      };
    }),
  };
}

export async function sendDirectThreadMessageAction(threadId: string, body: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Войдите в систему");
  const text = body.trim();
  if (!text) throw new Error("Пустое сообщение");
  await sendDirectThreadMessage(threadId, session.user.id, text);
  revalidatePath("/producer/chats");
  revalidatePath("/actor/chats");
  revalidatePath(`/producer/chats/direct/${threadId}`);
  revalidatePath(`/actor/chats/direct/${threadId}`);
}
