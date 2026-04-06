/**
 * Ссылки на файлы из `public/uploads`: в БД хранятся `publicUrl` (`/uploads/…`) и `storageKey`.
 * Старые записи могли получить фейковый URL из заглушки S3 (`storage.local`, `/placeholder/`).
 */
export function resolveUploadedMediaSrc(
  publicUrl: string | null | undefined,
  storageKey: string | null | undefined,
): string | null {
  const key = storageKey?.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  const fromKey = key ? `/uploads/${key}` : null;

  const u = publicUrl?.trim() ?? "";
  if (!u) return fromKey;

  if (u.startsWith("/uploads/")) return u;

  if (u.startsWith("http://") || u.startsWith("https://")) {
    try {
      const parsed = new URL(u);
      const host = parsed.hostname.toLowerCase();
      const path = `${parsed.pathname}${parsed.search}`.toLowerCase();
      if (
        host === "storage.local" ||
        host === "localhost" ||
        path.includes("/placeholder") ||
        path.includes("placeholder/")
      ) {
        return fromKey;
      }
    } catch {
      return fromKey ?? u;
    }
    return u;
  }

  return u || fromKey;
}
