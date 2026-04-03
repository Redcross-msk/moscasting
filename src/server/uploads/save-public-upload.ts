import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

function normalizedUploadPath(relativePath: string): string {
  return relativePath.replace(/^\/+/, "").replace(/\\/g, "/");
}

/** Сохраняет файл в `public/uploads/…` и возвращает публичный URL (`/uploads/…`). */
export async function savePublicUpload(relativePath: string, buffer: Buffer): Promise<string> {
  const normalized = normalizedUploadPath(relativePath);
  const fullPath = path.join(UPLOAD_ROOT, normalized);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buffer);
  return `/uploads/${normalized}`;
}

/** Удаляет файл из `public/uploads/…` (ошибки игнорируются — файл мог отсутствовать). */
export async function deletePublicUploadFile(relativePath: string): Promise<void> {
  const normalized = normalizedUploadPath(relativePath);
  const fullPath = path.join(UPLOAD_ROOT, normalized);
  try {
    await unlink(fullPath);
  } catch {
    /* ENOENT и пр. — не блокируем смену аватара */
  }
}
