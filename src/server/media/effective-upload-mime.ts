/** MIME для загрузок с телефонов: часто пустой type или application/octet-stream. */

export function effectiveImageMime(file: File): string {
  const raw = (file.type || "").trim().toLowerCase();
  if (raw && raw !== "application/octet-stream") {
    if (raw === "image/jpg" || raw === "image/pjpeg" || raw === "image/x-citrix-jpeg") return "image/jpeg";
    if (raw === "image/x-png") return "image/png";
    return raw;
  }
  const n = file.name.toLowerCase();
  if (n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".jpe")) return "image/jpeg";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".heic")) return "image/heic";
  if (n.endsWith(".heif")) return "image/heif";
  if (n.endsWith(".avif")) return "image/avif";
  return raw || "";
}

/** Если браузер не прислал тип — определяем по «магическим» байтам (iOS/Android). */
export function sniffImageMimeFromBuffer(buf: Buffer): string | null {
  if (buf.length < 16) return null;
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "image/gif";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return "image/webp";
  }
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    const brand = buf.toString("ascii", 8, 12).toLowerCase();
    const heicBrands = ["heic", "heix", "hevc", "hevx", "mif1", "msf1", "heim", "heis", "avic"];
    if (heicBrands.includes(brand)) return "image/heic";
    if (["avif", "mif2", "miaf"].includes(brand)) return "image/avif";
  }
  return null;
}

/** Видео с iOS: часто пустой type или application/octet-stream. */
export function effectiveVideoMime(file: File): string {
  const raw = (file.type || "").trim().toLowerCase();
  if (raw && raw !== "application/octet-stream") {
    if (raw === "video/x-m4v" || raw === "video/m4v") return "video/mp4";
    return raw;
  }
  const n = file.name.toLowerCase();
  if (n.endsWith(".mp4") || n.endsWith(".m4v")) return "video/mp4";
  if (n.endsWith(".webm")) return "video/webm";
  if (n.endsWith(".mov") || n.endsWith(".qt")) return "video/quicktime";
  return raw || "";
}
