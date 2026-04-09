/**
 * Локальное превью через blob: URL на iPhone часто ломается для HEIC/HEIF
 * (в т.ч. когда файл назван .jpg, а внутри — HEIC).
 * Сервер перекодирует в JPEG; до ответа показываем заглушку, а не битую картинку.
 */

const HEIC_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "mif1",
  "msf1",
  "heim",
  "heis",
  "avic",
]);

function isHeicFamilyBrand(brand: string): boolean {
  const b = brand.toLowerCase();
  return HEIC_BRANDS.has(b);
}

/** Синхронные эвристики по имени и MIME (без чтения файла). */
export function canUseBlobImagePreviewByMeta(file: File): boolean {
  const t = (file.type || "").toLowerCase();
  if (t === "image/heic" || t === "image/heif") return false;
  const n = file.name.toLowerCase();
  if (n.endsWith(".heic") || n.endsWith(".heif")) return false;
  return true;
}

/**
 * Читает начало файла и отклоняет HEIC/HEIF по «ftyp» (как на сервере).
 * Вызывать перед URL.createObjectURL, чтобы не показывать битое превью.
 */
export async function shouldUseObjectUrlForLocalImagePreview(file: File): Promise<boolean> {
  if (!canUseBlobImagePreviewByMeta(file)) return false;
  try {
    const buf = new Uint8Array(await file.slice(0, 32).arrayBuffer());
    if (buf.length < 12) return true;
    if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
      const brand = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]);
      if (isHeicFamilyBrand(brand)) return false;
    }
  } catch {
    return true;
  }
  return true;
}
