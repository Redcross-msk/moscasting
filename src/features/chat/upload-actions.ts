"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/server/services/chat.service";
import { savePublicUpload } from "@/server/uploads/save-public-upload";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
]);
const MAX_BYTES = 80 * 1024 * 1024;

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/webm") return "webm";
  if (mime === "video/quicktime") return "mov";
  if (mime === "application/pdf") return "pdf";
  return "bin";
}

export async function uploadAndSendChatFileAction(chatId: string, formData: FormData): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Войдите в систему" };

  const file = formData.get("file");
  if (!file || typeof file === "string" || file.size === 0) return { error: "Выберите файл" };
  if (!ALLOWED.has(file.type)) return { error: "Допустимы фото, видео (mp4, webm, mov) или PDF" };
  if (file.size > MAX_BYTES) return { error: "Файл до 80 МБ" };

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      application: { include: { actorProfile: true, producerProfile: true } },
    },
  });
  if (!chat) return { error: "Чат не найден" };
  if (chat.closedAt) return { error: "Чат закрыт" };

  const ok =
    chat.application.actorProfile.userId === session.user.id ||
    chat.application.producerProfile.userId === session.user.id;
  if (!ok) return { error: "Нет доступа" };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extFromMime(file.type);
    const rel = `chat/${chatId}/${randomUUID()}.${ext}`;
    const publicUrl = await savePublicUpload(rel, buffer);
    const attachmentKind = file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("image/")
        ? "image"
        : "file";
    const captionFromForm = String(formData.get("caption") ?? "").trim();
    const caption =
      captionFromForm || (file as File).name?.trim() || "Вложение";
    await sendMessage(chatId, session.user.id, caption, {
      kind: "chat_attachment",
      url: publicUrl,
      mimeType: file.type,
      fileName: (file as File).name || caption,
      attachmentKind,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не удалось отправить файл" };
  }

  revalidatePath("/actor/chats");
  revalidatePath("/producer/chats");
  revalidatePath(`/actor/chats/${chatId}`);
  revalidatePath(`/producer/chats/${chatId}`);
  return {};
}
