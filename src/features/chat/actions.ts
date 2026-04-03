"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendMessage } from "@/server/services/chat.service";

export async function sendChatMessageAction(chatId: string, body: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Войдите в систему");

  const text = body.trim();
  if (!text) throw new Error("Пустое сообщение");

  await sendMessage(chatId, session.user.id, text);
  revalidatePath("/actor/chats");
  revalidatePath("/producer/chats");
  revalidatePath(`/actor/chats/${chatId}`);
  revalidatePath(`/producer/chats/${chatId}`);
}
