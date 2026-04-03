"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isProducerFilmographyEntryAvailable, PRISMA_CLIENT_OUTDATED_HINT } from "@/lib/prisma-runtime";
import { deletePublicUploadFile, savePublicUpload } from "@/server/uploads/save-public-upload";

const POSTER_MAX_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

async function requireProducerProfileId() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");
  const p = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!p) throw new Error("Нет профиля");
  return p.id;
}

export async function addFilmographyEntryAction(formData: FormData) {
  if (!isProducerFilmographyEntryAvailable()) throw new Error(PRISMA_CLIENT_OUTDATED_HINT);
  const producerProfileId = await requireProducerProfileId();
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 1) throw new Error("Укажите название");
  const releaseRaw = String(formData.get("releaseDate") ?? "").trim();
  const releaseDate = releaseRaw ? new Date(releaseRaw) : null;
  if (releaseDate && Number.isNaN(releaseDate.getTime())) throw new Error("Некорректная дата");
  const kinopoiskUrl = String(formData.get("kinopoiskUrl") ?? "").trim() || null;

  let posterPublicUrl: string | null = null;
  const posterFile = formData.get("poster");
  if (posterFile && typeof posterFile !== "string" && posterFile.size > 0) {
    if (!IMAGE_TYPES.has(posterFile.type)) throw new Error("Постер: допустимы JPEG, PNG, WebP");
    if (posterFile.size > POSTER_MAX_BYTES) throw new Error("Постер до 12 МБ");
    const buffer = Buffer.from(await posterFile.arrayBuffer());
    const ext = extFromMime(posterFile.type);
    const rel = `producer/${producerProfileId}/filmography/${randomUUID()}.${ext}`;
    posterPublicUrl = await savePublicUpload(rel, buffer);
  }

  const maxOrder = await prisma.producerFilmographyEntry.aggregate({
    where: { producerProfileId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  await prisma.producerFilmographyEntry.create({
    data: {
      producerProfileId,
      title,
      releaseDate,
      kinopoiskUrl,
      posterPublicUrl,
      sortOrder,
    },
  });

  revalidatePath("/producer/profile");
  revalidatePath("/producer/profile/edit");
  revalidatePath("/producers");
  revalidatePath(`/producers/${producerProfileId}`);
}

export async function deleteFilmographyEntryAction(entryId: string) {
  if (!isProducerFilmographyEntryAvailable()) throw new Error(PRISMA_CLIENT_OUTDATED_HINT);
  const producerProfileId = await requireProducerProfileId();
  const row = await prisma.producerFilmographyEntry.findFirst({
    where: { id: entryId, producerProfileId },
  });
  if (!row) throw new Error("Не найдено");
  const url = row.posterPublicUrl?.trim();
  if (url?.startsWith("/uploads/")) {
    await deletePublicUploadFile(url.replace(/^\/uploads\//, ""));
  }
  await prisma.producerFilmographyEntry.delete({ where: { id: entryId } });
  revalidatePath("/producer/profile");
  revalidatePath("/producer/profile/edit");
  revalidatePath("/producers");
  revalidatePath(`/producers/${producerProfileId}`);
}
