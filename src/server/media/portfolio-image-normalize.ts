import "server-only";
import sharp from "sharp";
import { sniffImageMimeFromBuffer } from "@/server/media/effective-upload-mime";

const LIMIT_INPUT_PIXELS = 268_402_689;
const MAX_OUTPUT_EDGE = 4096;
const MIN_OUTPUT_BYTES = 64;

function sharpFromBuffer(buffer: Buffer) {
  return sharp(buffer, { failOn: "none", limitInputPixels: LIMIT_INPUT_PIXELS }).rotate();
}

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

async function legacyNormalizeByMime(
  buffer: Buffer,
  mime: string,
): Promise<{ buffer: Buffer; mime: string; ext: string } | null> {
  const m = effectiveMimeForDecode(buffer, mime);
  try {
    const meta = await sharpFromBuffer(buffer).metadata();
    const needsResize =
      meta.width &&
      meta.height &&
      (meta.width > MAX_OUTPUT_EDGE || meta.height > MAX_OUTPUT_EDGE);
    const pipe = needsResize
      ? sharpFromBuffer(buffer).resize(MAX_OUTPUT_EDGE, MAX_OUTPUT_EDGE, {
          fit: "inside",
          withoutEnlargement: true,
        })
      : sharpFromBuffer(buffer);

    if (m === "image/jpeg" || m === "image/jpg") {
      const out = await pipe.jpeg({ quality: 88, mozjpeg: true, progressive: false }).toBuffer();
      return out.length >= MIN_OUTPUT_BYTES ? { buffer: out, mime: "image/jpeg", ext: "jpg" } : null;
    }
    if (m === "image/png") {
      const out = await pipe.png({ compressionLevel: 8 }).toBuffer();
      return out.length >= MIN_OUTPUT_BYTES ? { buffer: out, mime: "image/png", ext: "png" } : null;
    }
    if (m === "image/webp") {
      const out = await pipe.webp({ quality: 88 }).toBuffer();
      return out.length >= MIN_OUTPUT_BYTES ? { buffer: out, mime: "image/webp", ext: "webp" } : null;
    }
    if (m === "image/heic" || m === "image/heif" || m === "image/avif") {
      const out = await pipe.jpeg({ quality: 88, mozjpeg: true, progressive: false }).toBuffer();
      return out.length >= MIN_OUTPUT_BYTES ? { buffer: out, mime: "image/jpeg", ext: "jpg" } : null;
    }
  } catch {
    return null;
  }
  return null;
}

const SHARP_DECODE_FORMATS = new Set([
  "jpeg",
  "png",
  "webp",
  "gif",
  "tiff",
  "heif",
  "avif",
  "jp2",
  "jxl",
]);

/**
 * Нормализация для веба: опора на sharp().metadata().format — иначе HEIC с типом image/jpeg
 * декодируется как JPEG и даёт мусор/пустой вывод. По возможности ужимаем огромные кадры.
 * JPEG на выходе — baseline (progressive: false) для стабильного показа в Safari.
 */
export async function normalizePortfolioImageBuffer(
  buffer: Buffer,
  declaredMime: string,
): Promise<{ buffer: Buffer; mime: string; ext: string } | null> {
  if (!buffer?.length || buffer.length < 24) return null;

  try {
    const meta = await sharpFromBuffer(buffer).metadata();
    const fmt = meta.format;
    if (!fmt) return legacyNormalizeByMime(buffer, declaredMime);

    const needsResize =
      meta.width &&
      meta.height &&
      (meta.width > MAX_OUTPUT_EDGE || meta.height > MAX_OUTPUT_EDGE);

    function pipeline() {
      return needsResize
        ? sharpFromBuffer(buffer).resize(MAX_OUTPUT_EDGE, MAX_OUTPUT_EDGE, {
            fit: "inside",
            withoutEnlargement: true,
          })
        : sharpFromBuffer(buffer);
    }

    if (fmt === "png" && meta.hasAlpha) {
      const out = await pipeline().png({ compressionLevel: 8 }).toBuffer();
      if (out.length >= MIN_OUTPUT_BYTES) return { buffer: out, mime: "image/png", ext: "png" };
    }

    if (!SHARP_DECODE_FORMATS.has(fmt)) {
      return legacyNormalizeByMime(buffer, declaredMime);
    }

    const out = await pipeline().jpeg({ quality: 88, mozjpeg: true, progressive: false }).toBuffer();
    if (out.length >= MIN_OUTPUT_BYTES) return { buffer: out, mime: "image/jpeg", ext: "jpg" };
  } catch {
    /* запасной путь */
  }

  return legacyNormalizeByMime(buffer, declaredMime);
}
