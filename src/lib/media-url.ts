/**
 * Файлы лежат в `public/uploads`, но отдаём через `/api/media/…` (Route Handler читает с диска).
 * Иначе Next отдаёт только то, что было в билде, и свежие загрузки с телефона часто дают 404 на `/uploads/…`.
 */
function mediaApiPathFromRelativeKey(key: string): string {
  const clean = key.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  return `/api/media/${clean}`;
}

/**
 * Ссылки на файлы из `public/uploads`: в БД хранятся `publicUrl` и `storageKey`.
 * Реальный путь к файлу задаёт `storageKey`; при его наличии строим URL через API.
 */
export function resolveUploadedMediaSrc(
  publicUrl: string | null | undefined,
  storageKey: string | null | undefined,
): string | null {
  const key = storageKey?.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  if (key) return mediaApiPathFromRelativeKey(key);

  const u = publicUrl?.trim() ?? "";
  if (!u) return null;

  if (u.startsWith("/api/media/")) return u;

  if (u.startsWith("/uploads/")) {
    return mediaApiPathFromRelativeKey(u.slice("/uploads/".length));
  }

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
      if (p.startsWith("/api/media/")) {
        return `${parsed.origin}${p}${parsed.search}`;
      }
      if (p.startsWith("/uploads/")) {
        return `${parsed.origin}${mediaApiPathFromRelativeKey(p.slice("/uploads/".length))}${parsed.search}`;
      }
    } catch {
      return null;
    }
    return u;
  }

  return u;
}
