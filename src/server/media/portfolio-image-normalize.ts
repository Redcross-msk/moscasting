import "server-only";
import sharp from "sharp";
import { sniffImageMimeFromBuffer } from "@/server/media/effective-upload-mime";

function sharpWithLenientInput(buffer: Buffer) {
  return sharp(buffer, { failOn: "none" }).rotate();
}

/**
 * Реальный тип по байтам важнее объявленного MIME: iOS/Android часто шлют HEIC как image/jpeg.
 */
function effectiveMimeForDecode(buffer: Buffer, declaredMime: string): string {
  const sniffed = sniffImageMimeFromBuffer(buffer);
  const d = declaredMime.toLowerCase();
  if (sniffed === "image/heic") return "image/heic";
  if (sniffed === "image/avif") return "image/avif";
  if (sniffed === "image/gif") return "image/gif";
  if (sniffed === "image/webp" && (d === "application/octet-stream" || !d.trim())) return "image/webp";
  if (sniffed === "image/png" && (d === "application/octet-stream" || !d.trim())) return "image/png";
  if (sniffed === "image/jpeg" && (d === "application/octet-stream" || !d.trim())) return "image/jpeg";
  return d;
}

/**
 * Приводит фото к формату, который стабильно показывается в браузере:
 * — JPEG/PNG/WebP: EXIF-ориентация (телефоны), перекодирование через sharp;
 * — HEIC/HEIF/AVIF → JPEG;
 * — иначе null.
 */
export async function normalizePortfolioImageBuffer(
  buffer: Buffer,
  mime: string,
): Promise<{ buffer: Buffer; mime: string; ext: string } | null> {
  const m = effectiveMimeForDecode(buffer, mime);
  try {
    if (m === "image/jpeg" || m === "image/jpg") {
      const out = await sharpWithLenientInput(buffer).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
      return { buffer: out, mime: "image/jpeg", ext: "jpg" };
    }
    if (m === "image/png") {
      const out = await sharpWithLenientInput(buffer).png({ compressionLevel: 8 }).toBuffer();
      return { buffer: out, mime: "image/png", ext: "png" };
    }
    if (m === "image/webp") {
      const out = await sharpWithLenientInput(buffer).webp({ quality: 88 }).toBuffer();
      return { buffer: out, mime: "image/webp", ext: "webp" };
    }
    if (m === "image/heic" || m === "image/heif") {
      const out = await sharpWithLenientInput(buffer).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
      return { buffer: out, mime: "image/jpeg", ext: "jpg" };
    }
    if (m === "image/avif") {
      const out = await sharpWithLenientInput(buffer).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
      return { buffer: out, mime: "image/jpeg", ext: "jpg" };
    }
  } catch {
    return null;
  }
  return null;
}
