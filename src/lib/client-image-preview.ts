/**
 * HEIC/HEIF с камеры телефона часто не отображаются в <img src={blob:…}> в мобильных браузерах.
 * Показываем заглушку до ответа сервера (там файл перекодируется в JPEG).
 */
export function canUseBlobImagePreview(file: File): boolean {
  const t = (file.type || "").toLowerCase();
  if (t === "image/heic" || t === "image/heif") return false;
  const n = file.name.toLowerCase();
  if (n.endsWith(".heic") || n.endsWith(".heif")) return false;
  return true;
}
