"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/server/services/chat.service";
import { effectiveImageMime, sniffImageMimeFromBuffer } from "@/server/media/effective-upload-mime";
import { normalizePortfolioImageBuffer } from "@/server/media/portfolio-image-normalize";
import { savePublicUpload } from "@/server/uploads/save-public-upload";

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const CHAT_NORMALIZABLE_IMAGE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
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

function resolveChatMime(file: File, buffer: Buffer): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".mov") || name.endsWith(".qt")) return "video/quicktime";
  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".webm")) return "video/webm";

  let mime = effectiveImageMime(file).toLowerCase();
  if (mime === "image/jpg") mime = "image/jpeg";
  const declared = (file.type || "").trim().toLowerCase();
  if (declared === "image/gif") return "image/gif";
  if (VIDEO_TYPES.has(declared)) return declared;
  if (declared === "application/pdf") return "application/pdf";
  if (mime && mime !== "application/octet-stream") {
    if (mime === "image/gif") return mime;
    if (VIDEO_TYPES.has(mime)) return mime;
    if (mime === "application/pdf") return mime;
    if (CHAT_NORMALIZABLE_IMAGE.has(mime)) return mime;
  }
  const sniffed = sniffImageMimeFromBuffer(buffer);
  if (sniffed) return sniffed;
  return declared || mime || "";
}

export async function uploadAndSendChatFileAction(chatId: string, formData: FormData): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Войдите в систему" };

  const file = formData.get("file");
  if (!file || typeof file === "string" || file.size === 0) return { error: "Выберите файл" };
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

  let buffer = Buffer.from(await file.arrayBuffer());
  const mime = resolveChatMime(file, buffer);

  let outMime: string;
  let ext: string;
  let attachmentKind: "image" | "video" | "file";

  if (CHAT_NORMALIZABLE_IMAGE.has(mime)) {
    const normalized = await normalizePortfolioImageBuffer(buffer, mime);
    if (!normalized) return { error: "Не удалось обработать фото. Попробуйте другое изображение." };
    buffer = normalized.buffer;
    outMime = normalized.mime;
    ext = normalized.ext;
    attachmentKind = "image";
  } else if (mime === "image/gif") {
    outMime = "image/gif";
    ext = "gif";
    attachmentKind = "image";
  } else if (VIDEO_TYPES.has(mime)) {
    outMime = mime;
    ext = extFromMime(mime);
    attachmentKind = "video";
  } else if (mime === "application/pdf") {
    outMime = "application/pdf";
    ext = "pdf";
    attachmentKind = "file";
  } else {
    return { error: "Допустимы фото, видео (mp4, webm, mov) или PDF" };
  }

  try {
    const rel = `chat/${chatId}/${randomUUID()}.${ext}`;
    const publicUrl = await savePublicUpload(rel, buffer);
    const captionFromForm = String(formData.get("caption") ?? "").trim();
    const caption = captionFromForm || (file as File).name?.trim() || "Вложение";
    await sendMessage(chatId, session.user.id, caption, {
      kind: "chat_attachment",
      url: publicUrl,
      mimeType: outMime,
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
