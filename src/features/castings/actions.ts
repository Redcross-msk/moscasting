"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CastingCategory, CastingStatus, ModerationStatus, Prisma } from "@prisma/client";
import {
  createCasting,
  updateCasting,
  softDeleteCasting,
} from "@/server/services/casting.service";

function buildRoleRequirementsJson(formData: FormData): Prisma.InputJsonValue | undefined {
  const cat = String(formData.get("castingCategory") ?? "").trim();
  if (cat === "MASS") {
    const text = String(formData.get("massRequirements") ?? "").trim();
    return { type: "mass", text };
  }
  if (cat === "GROUP") {
    const roles = [1, 2, 3, 4, 5].map((i) => String(formData.get(`groupRole_${i}`) ?? "").trim());
    return { type: "group", roles };
  }
  if (cat === "SOLO") {
    const text = String(formData.get("soloRequirements") ?? "").trim();
    return { type: "solo", text };
  }
  return undefined;
}

function parseCastingCategory(formData: FormData): CastingCategory | undefined {
  const raw = String(formData.get("castingCategory") ?? "").trim();
  if (raw === "MASS" || raw === "GROUP" || raw === "SOLO") return raw as CastingCategory;
  return undefined;
}

function sharedCastingPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const citySlug = String(formData.get("citySlug") ?? "moscow");
  const paymentInfo = String(formData.get("paymentInfo") ?? "").trim() || undefined;
  const projectType = String(formData.get("projectType") ?? "").trim() || undefined;
  const candidateRequirements = String(formData.get("candidateRequirements") ?? "").trim() || undefined;
  const slotsNeededRaw = formData.get("slotsNeeded");
  const slotsNeeded = slotsNeededRaw ? parseInt(String(slotsNeededRaw), 10) : undefined;
  const paymentRubRaw = formData.get("paymentRub");
  const paymentRub = paymentRubRaw ? parseInt(String(paymentRubRaw), 10) : undefined;
  const deadline = formData.get("applicationDeadline");
  const scheduled = formData.get("scheduledAt");
  const shootStartTime = String(formData.get("shootStartTime") ?? "").trim() || undefined;
  const workHoursNote = String(formData.get("workHoursNote") ?? "").trim() || undefined;
  const metroStation = String(formData.get("metroStation") ?? "").trim() || undefined;
  const addressLine = String(formData.get("addressLine") ?? "").trim() || undefined;
  const metroOrPlaceLegacy = String(formData.get("metroOrPlace") ?? "").trim() || undefined;
  const metroOrPlace =
    [metroStation, addressLine].filter(Boolean).join(" · ") || metroOrPlaceLegacy || undefined;
  const castingCategory = parseCastingCategory(formData);
  const roleRequirementsJson = buildRoleRequirementsJson(formData);

  return {
    title,
    description,
    citySlug,
    paymentInfo,
    projectType,
    candidateRequirements,
    slotsNeeded: Number.isFinite(slotsNeeded) ? slotsNeeded : undefined,
    paymentRub: Number.isFinite(paymentRub) ? paymentRub : undefined,
    deadline,
    scheduled,
    shootStartTime,
    workHoursNote,
    metroStation,
    addressLine,
    metroOrPlace,
    castingCategory,
    roleRequirementsJson,
  };
}

export async function createCastingAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Нет профиля продюсера");

  const p = sharedCastingPayload(formData);

  const city = await prisma.city.findUnique({ where: { slug: p.citySlug } });
  if (!city) throw new Error("Город не найден");

  if (p.title) {
    const dup = await prisma.casting.findFirst({
      where: {
        producerProfileId: profile.id,
        title: p.title,
        deletedAt: null,
        createdAt: { gte: new Date(Date.now() - 120_000) },
      },
    });
    if (dup) {
      revalidatePath("/producer/castings");
      redirect("/producer/castings");
    }
  }

  await createCasting(profile.id, {
    title: p.title,
    description: p.description,
    paymentInfo: p.paymentInfo,
    projectType: p.projectType,
    candidateRequirements: p.candidateRequirements,
    slotsNeeded: p.slotsNeeded,
    paymentRub: p.paymentRub,
    shootStartTime: p.shootStartTime,
    workHoursNote: p.workHoursNote,
    metroStation: p.metroStation,
    addressLine: p.addressLine,
    metroOrPlace: p.metroOrPlace,
    castingCategory: p.castingCategory,
    roleRequirementsJson: p.roleRequirementsJson,
    applicationDeadline: p.deadline ? new Date(String(p.deadline)) : undefined,
    scheduledAt: p.scheduled ? new Date(String(p.scheduled)) : undefined,
    status: CastingStatus.DRAFT,
    moderationStatus: ModerationStatus.PENDING,
    moderationComment: null,
    city: { connect: { id: city.id } },
  });

  revalidatePath("/producer/castings");
  revalidatePath("/admin/moderation");
  redirect("/producer/castings");
}

export async function updateCastingFromFormAction(formData: FormData) {
  const castingId = String(formData.get("castingId") ?? "");
  if (!castingId) throw new Error("Нет id кастинга");
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Нет профиля");

  const p = sharedCastingPayload(formData);

  await updateCasting(castingId, profile.id, {
    title: p.title,
    description: p.description,
    paymentInfo: p.paymentInfo,
    projectType: p.projectType,
    candidateRequirements: p.candidateRequirements,
    slotsNeeded: p.slotsNeeded,
    paymentRub: p.paymentRub,
    shootStartTime: p.shootStartTime,
    workHoursNote: p.workHoursNote,
    metroStation: p.metroStation,
    addressLine: p.addressLine,
    metroOrPlace: p.metroOrPlace,
    castingCategory: p.castingCategory,
    roleRequirementsJson: p.roleRequirementsJson,
    applicationDeadline: p.deadline ? new Date(String(p.deadline)) : undefined,
    scheduledAt: p.scheduled ? new Date(String(p.scheduled)) : undefined,
    status: CastingStatus.DRAFT,
    moderationStatus: ModerationStatus.PENDING,
    moderationComment: null,
  });

  revalidatePath("/producer/castings");
  revalidatePath(`/producer/castings/${castingId}`);
  revalidatePath(`/producer/castings/${castingId}/edit`);
  revalidatePath(`/castings/${castingId}`);
  revalidatePath("/admin/moderation");
  revalidatePath("/");
  redirect("/producer/castings");
}

export async function deleteCastingAction(castingId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Нет профиля");

  await softDeleteCasting(castingId, profile.id);
  revalidatePath("/producer/castings");
  revalidatePath("/castings");
  revalidatePath("/");
  revalidatePath("/explore");
}

export async function completeCastingAction(castingId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") throw new Error("Forbidden");

  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Нет профиля");

  await updateCasting(castingId, profile.id, { status: CastingStatus.CLOSED });
  revalidatePath("/producer/castings");
  revalidatePath(`/producer/castings/${castingId}`);
  revalidatePath("/castings");
  revalidatePath(`/castings/${castingId}`);
  revalidatePath("/");
  revalidatePath("/explore");
}
