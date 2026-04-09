/**
 * Ссылки на файлы из `public/uploads`: в БД хранятся `publicUrl` и `storageKey`.
 * Реальный путь к файлу на диске задаёт `storageKey`; `publicUrl` бывает неверным
 * (другой хост, заглушка S3, устаревшее значение) — тогда <img> даёт «битую» картинку.
 * Поэтому при наличии ключа всегда строим URL из него.
 */
export function resolveUploadedMediaSrc(
  publicUrl: string | null | undefined,
  storageKey: string | null | undefined,
): string | null {
  const key = storageKey?.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  const fromKey = key ? `/uploads/${key}` : null;

  if (fromKey) return fromKey;

  const u = publicUrl?.trim() ?? "";
  if (!u) return null;

  if (u.startsWith("/uploads/")) return u;

  if (u.startsWith("http://") || u.startsWith("https://")) {
    try {
      const parsed = new URL(u);
      const host = parsed.hostname.toLowerCase();
      const pathLower = `${parsed.pathname}${parsed.search}`.toLowerCase();
      if (
        host === "storage.local" ||
        host === "localhost" ||
        pathLower.includes("/placeholder") ||
        pathLower.includes("placeholder/")
      ) {
        return null;
      }
      const p = parsed.pathname;
      if (p.startsWith("/uploads/")) {
        return p;
      }
    } catch {
      return null;
    }
    return u;
  }

  return u;
}
