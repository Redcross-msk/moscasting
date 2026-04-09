import { randomUUID } from "crypto";
import { mkdir, rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { PUBLIC_UPLOADS_DIR } from "@/server/uploads/public-uploads-root";

function normalizedUploadPath(relativePath: string): string {
  return relativePath.replace(/^\/+/, "").replace(/\\/g, "/");
}

/** Из URL, сохранённого в БД, получить относительный путь под `public/uploads`. */
export function relativePathFromPublicUploadUrl(url: string): string | null {
  const u = url.trim();
  if (u.startsWith("/api/media/")) return normalizedUploadPath(u.slice("/api/media/".length));
  if (u.startsWith("/uploads/")) return normalizedUploadPath(u.slice("/uploads/".length));
  return null;
}

/** Сохраняет в `public/uploads/…`. URL — `/api/media/…` (чтение с диска в рантайме; статика `/uploads/` из билда часто даёт 404 для новых файлов). */
export async function savePublicUpload(relativePath: string, buffer: Buffer): Promise<string> {
  const normalized = normalizedUploadPath(relativePath);
  const fullPath = path.join(PUBLIC_UPLOADS_DIR, normalized);
  const dir = path.dirname(fullPath);
  await mkdir(dir, { recursive: true });
  const tmpPath = path.join(dir, `.${randomUUID()}.upload.tmp`);
  await writeFile(tmpPath, buffer);
  await rename(tmpPath, fullPath);
  return `/api/media/${normalized}`;
}

/** Удаляет файл из `public/uploads/…` (ошибки игнорируются — файл мог отсутствовать). */
export async function deletePublicUploadFile(relativePath: string): Promise<void> {
  const normalized = normalizedUploadPath(relativePath);
  const fullPath = path.join(PUBLIC_UPLOADS_DIR, normalized);
  try {
    await unlink(fullPath);
  } catch {
    /* ENOENT и пр. — не блокируем смену аватара */
  }
}
