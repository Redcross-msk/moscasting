"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  AvailabilityStatus,
  BodyType,
  EthnicAppearance,
  FacialHairOption,
  Gender,
  TattooPiercingOption,
} from "@prisma/client";
import { LANGUAGE_SLUG_SET, PROFESSIONAL_SKILL_SLUG_SET } from "@/lib/actor-form-constants";

const actorUpdateFields = z.object({
  fullName: z.string().min(2),
  birthDate: z.string(),
  gender: z.nativeEnum(Gender),
  heightCm: z.coerce.number().min(100).max(250),
  weightKg: z.coerce.number().min(35).max(200),
  bodyType: z.nativeEnum(BodyType),
  ethnicAppearance: z.nativeEnum(EthnicAppearance),
  tattooPiercingOption: z.nativeEnum(TattooPiercingOption),
  facialHairOption: z.nativeEnum(FacialHairOption),
  bio: z.string().min(1, "Заполните поле «О себе»"),
  availability: z.nativeEnum(AvailabilityStatus).optional().default(AvailabilityStatus.AVAILABLE),
  citySlug: z.string().min(1),
});

export type ActorProfileUpdateState = { error?: string };

export async function updateActorProfileAction(
  _prevState: ActorProfileUpdateState | undefined,
  formData: FormData,
): Promise<ActorProfileUpdateState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ACTOR") {
    return { error: "Нет доступа" };
  }

  const profileRow = await prisma.actorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profileRow) return { error: "Профиль не найден" };

  const languagesRaw = formData.getAll("languages") as string[];
  const languages = [...new Set(languagesRaw.filter((s) => LANGUAGE_SLUG_SET.has(s)))];
  const profRaw = formData.getAll("professionalSkills") as string[];
  const professionalSkillKeys = [...new Set(profRaw.filter((s) => PROFESSIONAL_SKILL_SLUG_SET.has(s)))];

  const parsed = actorUpdateFields.safeParse({
    fullName: formData.get("fullName"),
    birthDate: formData.get("birthDate"),
    gender: formData.get("gender"),
    heightCm: formData.get("heightCm"),
    weightKg: formData.get("weightKg"),
    bodyType: formData.get("bodyType"),
    ethnicAppearance: formData.get("ethnicAppearance"),
    tattooPiercingOption: formData.get("tattooPiercingOption"),
    facialHairOption: formData.get("facialHairOption"),
    bio: formData.get("bio"),
    availability: formData.get("availability") || AvailabilityStatus.AVAILABLE,
    citySlug: formData.get("citySlug"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.length ? String(issue.path[0]) : "";
    const msg = issue?.message ?? "Проверьте заполнение полей анкеты";
    return { error: field ? `${field}: ${msg}` : msg };
  }

  const birth = new Date(parsed.data.birthDate);
  if (Number.isNaN(birth.getTime())) return { error: "Некорректная дата рождения" };

  const city = await prisma.city.findUnique({ where: { slug: parsed.data.citySlug } });
  if (!city) return { error: "Город не найден" };

  const isHiddenByUser = formData.get("isHiddenByUser") === "on";

  await prisma.actorProfile.update({
    where: { id: profileRow.id },
    data: {
      fullName: parsed.data.fullName,
      birthDate: birth,
      gender: parsed.data.gender,
      heightCm: parsed.data.heightCm,
      weightKg: parsed.data.weightKg,
      bodyType: parsed.data.bodyType,
      ethnicAppearance: parsed.data.ethnicAppearance,
      tattooPiercingOption: parsed.data.tattooPiercingOption,
      facialHairOption: parsed.data.facialHairOption,
      languages,
      professionalSkillKeys,
      bio: parsed.data.bio,
      availability: parsed.data.availability ?? AvailabilityStatus.AVAILABLE,
      cityId: city.id,
      isHiddenByUser,
    },
  });

  revalidatePath("/actor/profile/edit");
  revalidatePath("/actor/profile");
  revalidatePath("/actors");
  revalidatePath(`/actors/${profileRow.id}`);
  revalidatePath("/explore");
  redirect("/actor/profile");
}

export type ProducerProfileUpdateState = { error?: string };

export async function updateProducerProfileAction(
  _prevState: ProducerProfileUpdateState | undefined,
  formData: FormData,
): Promise<ProducerProfileUpdateState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") {
    return { error: "Нет доступа" };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const positionTitle = String(formData.get("positionTitle") ?? "").trim();
  const isHiddenByUser = formData.get("isHiddenByUser") === "on";

  if (fullName.length < 2) return { error: "Укажите ФИО" };
  if (companyName.length < 1) return { error: "Укажите компанию" };
  if (positionTitle.length < 1) return { error: "Укажите должность" };

  const row = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!row) return { error: "Профиль не найден" };

  await prisma.producerProfile.update({
    where: { userId: session.user.id },
    data: { fullName, companyName, positionTitle, isHiddenByUser },
  });

  revalidatePath("/producer/profile/edit");
  revalidatePath("/producer/profile");
  revalidatePath("/producers");
  revalidatePath(`/producers/${row.id}`);
  revalidatePath("/explore");
  redirect("/producer/profile");
}
