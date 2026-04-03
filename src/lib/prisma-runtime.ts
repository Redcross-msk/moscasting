import { prisma } from "@/lib/db";

/** Сообщение, если после `prisma migrate` не выполнили `npx prisma generate` (часто EPERM на Windows — остановите dev-сервер). */
export const PRISMA_CLIENT_OUTDATED_HINT =
  "Обновите Prisma Client: остановите «npm run dev», выполните в папке проекта «npx prisma generate», затем снова запустите dev.";

export function isProducerActorDirectThreadAvailable(): boolean {
  const d = (prisma as unknown as { producerActorDirectThread?: { findMany?: unknown } }).producerActorDirectThread;
  return typeof d?.findMany === "function";
}

export function isDirectThreadMessageAvailable(): boolean {
  const d = (prisma as unknown as { directThreadMessage?: { create?: unknown } }).directThreadMessage;
  return typeof d?.create === "function";
}

export function isProducerFilmographyEntryAvailable(): boolean {
  const d = (prisma as unknown as { producerFilmographyEntry?: { findMany?: unknown } }).producerFilmographyEntry;
  return typeof d?.findMany === "function";
}
