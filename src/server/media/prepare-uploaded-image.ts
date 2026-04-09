import "server-only";
import { effectiveImageMime, sniffImageMimeFromBuffer } from "@/server/media/effective-upload-mime";
import { normalizePortfolioImageBuffer } from "@/server/media/portfolio-image-normalize";

const INPUT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
]);

/**
 * Один вход для аватаров, постеров и т.п.: MIME с телефона + сигнатура файла → нормализованный буфер.
 */
export async function prepareUploadedProfileImage(
  file: File,
): Promise<{ buffer: Buffer; mime: string; ext: string } | null> {
  const raw = Buffer.from(await file.arrayBuffer());
  let mime = effectiveImageMime(file).toLowerCase();
  if (mime === "image/jpg") mime = "image/jpeg";
  if (!INPUT_TYPES.has(mime)) {
    const sniffed = sniffImageMimeFromBuffer(raw);
    if (sniffed && INPUT_TYPES.has(sniffed)) mime = sniffed;
  }
  const allowDecodeAttempt =
    INPUT_TYPES.has(mime) || mime === "application/octet-stream" || !mime.trim();
  if (!allowDecodeAttempt) return null;
  return normalizePortfolioImageBuffer(raw, mime || "application/octet-stream");
}
