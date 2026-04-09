import path from "path";

/** Абсолютный каталог `public/uploads` в рантайме (Docker: том смонтирован сюда). */
export const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
