import "server-only";
import sharp from "sharp";

/** JPEG/PNG/WebP как есть; HEIC/HEIF → JPEG для отображения в браузере. */
export async function normalizePortfolioImageBuffer(
  buffer: Buffer,
  mime: string,
): Promise<{ buffer: Buffer; mime: string; ext: string } | null> {
  const m = mime.toLowerCase();
  if (m === "image/jpeg" || m === "image/jpg") {
    return { buffer, mime: "image/jpeg", ext: "jpg" };
  }
  if (m === "image/png") {
    return { buffer, mime: "image/png", ext: "png" };
  }
  if (m === "image/webp") {
    return { buffer, mime: "image/webp", ext: "webp" };
  }
  if (m === "image/heic" || m === "image/heif") {
    try {
      const out = await sharp(buffer).rotate().jpeg({ quality: 88 }).toBuffer();
      return { buffer: out, mime: "image/jpeg", ext: "jpg" };
    } catch {
      return null;
    }
  }
  return null;
}
