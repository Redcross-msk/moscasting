"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  ensureDirectThread,
  getDirectThreadWithAccess,
  sendDirectThreadMessage,
} from "@/server/services/chat.service";

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
  const chat = await getChatWithAccess(chatId, session.user.id);
  if (!chat) return null;
  return {
    kind: "application" as const,
    chatId: chat.id,
    title: chat.application.casting.title,
    subtitle: `${chat.application.actorProfile.fullName} · отклик`,
    closedAt: chat.closedAt ? chat.closedAt.toISOString() : null,
    applicationId: chat.application.id,
    applicationStatus: chat.application.status,
    messages: chat.messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderEmail: m.sender.email,
      body: m.body,
      payload: m.payload,
    })),
  };
}

export async function fetchDirectThreadPanelAction(threadId: string) {
  const session = await auth();
  if (!session?.user) return null;
  const thread = await getDirectThreadWithAccess(threadId, session.user.id);
  if (!thread) return null;
  const isProducer = thread.producerProfile.userId === session.user.id;
  return {
    kind: "direct" as const,
    threadId: thread.id,
    title: "Личный чат",
    subtitle: isProducer
      ? thread.actorProfile.fullName
      : thread.producerProfile.companyName || thread.producerProfile.fullName,
    messages: thread.messages.map(
      (m: { id: string; senderId: string; body: string; sender: { email: string } }) => ({
        id: m.id,
        senderId: m.senderId,
        senderEmail: m.sender.email,
        body: m.body,
      }),
    ),
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
