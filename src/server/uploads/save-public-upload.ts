import { randomUUID } from "crypto";
import { mkdir, rename, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

function normalizedUploadPath(relativePath: string): string {
  return relativePath.replace(/^\/+/, "").replace(/\\/g, "/");
}

/** Сохраняет файл в `public/uploads/…` и возвращает публичный URL (`/uploads/…`). Запись через tmp + rename, чтобы не отдавать обрезанный файл при сбое. */
export async function savePublicUpload(relativePath: string, buffer: Buffer): Promise<string> {
  const normalized = normalizedUploadPath(relativePath);
  const fullPath = path.join(UPLOAD_ROOT, normalized);
  const dir = path.dirname(fullPath);
  await mkdir(dir, { recursive: true });
  const tmpPath = path.join(dir, `.${randomUUID()}.upload.tmp`);
  await writeFile(tmpPath, buffer);
  await rename(tmpPath, fullPath);
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
