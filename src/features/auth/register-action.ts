"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  UserRole,
  Gender,
  BodyType,
  AvailabilityStatus,
  ModerationStatus,
  EthnicAppearance,
  TattooPiercingOption,
  FacialHairOption,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { LANGUAGE_SLUG_SET, PROFESSIONAL_SKILL_SLUG_SET } from "@/lib/actor-form-constants";

const base = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole).refine((r) => r === UserRole.ACTOR || r === UserRole.PRODUCER, {
    message: "Выберите роль актёра или продюсера",
  }),
});

const actorFields = z.object({
  fullName: z.string().min(2),
  birthDate: z.string(),
  gender: z.nativeEnum(Gender),
  heightCm: z.coerce.number().min(100).max(250),
  weightKg: z.coerce.number().min(35).max(200),
  bodyType: z.nativeEnum(BodyType),
  ethnicAppearance: z.nativeEnum(EthnicAppearance),
  tattooPiercingOption: z.nativeEnum(TattooPiercingOption),
  facialHairOption: z.nativeEnum(FacialHairOption),
  bio: z.string().min(10),
  availability: z.nativeEnum(AvailabilityStatus).optional().default(AvailabilityStatus.AVAILABLE),
});

const producerFields = z.object({
  fullName: z.string().min(2),
  companyName: z.string().min(2),
  positionTitle: z.string().min(2),
  filmography: z.string().optional(),
});

export type RegisterState = { error?: string; ok?: boolean };

export async function registerUser(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  if (formData.get("acceptLegal") !== "on") {
    return { error: "Нужно принять политику конфиденциальности и использование cookie" };
  }

  const role = formData.get("role") as UserRole;
  const parsedBase = base.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role,
  });
  if (!parsedBase.success) {
    return { error: "Проверьте email и пароль (мин. 8 символов)" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsedBase.data.email.toLowerCase() },
  });
  if (existing) return { error: "Пользователь с таким email уже есть" };

  const citySlug = (formData.get("citySlug") as string) || "moscow";
  const city = await prisma.city.findUnique({ where: { slug: citySlug } });
  if (!city) return { error: "Город не найден в справочнике" };

  const passwordHash = await hash(parsedBase.data.password, 12);

  try {
    if (parsedBase.data.role === UserRole.ACTOR) {
      const languagesRaw = formData.getAll("languages") as string[];
      const languages = [...new Set(languagesRaw.filter((s) => LANGUAGE_SLUG_SET.has(s)))];
      const profRaw = formData.getAll("professionalSkills") as string[];
      const professionalSkillKeys = [...new Set(profRaw.filter((s) => PROFESSIONAL_SKILL_SLUG_SET.has(s)))];

      const actorParsed = actorFields.safeParse({
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
      });
      if (!actorParsed.success) {
        return { error: "Заполните все обязательные поля профиля актёра" };
      }

      const birth = new Date(actorParsed.data.birthDate);
      if (Number.isNaN(birth.getTime())) return { error: "Некорректная дата рождения" };

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: parsedBase.data.email.toLowerCase(),
            passwordHash,
            role: UserRole.ACTOR,
          },
        });
        await tx.actorProfile.create({
          data: {
            userId: user.id,
            fullName: actorParsed.data.fullName,
            birthDate: birth,
            gender: actorParsed.data.gender,
            heightCm: actorParsed.data.heightCm,
            weightKg: actorParsed.data.weightKg,
            bodyType: actorParsed.data.bodyType,
            ethnicAppearance: actorParsed.data.ethnicAppearance,
            tattooPiercingOption: actorParsed.data.tattooPiercingOption,
            facialHairOption: actorParsed.data.facialHairOption,
            languages,
            professionalSkillKeys,
            bio: actorParsed.data.bio,
            availability: actorParsed.data.availability ?? AvailabilityStatus.AVAILABLE,
            cityId: city.id,
            moderationStatus: ModerationStatus.PENDING,
          },
        });
      });
    } else {
      const prodParsed = producerFields.safeParse({
        fullName: formData.get("fullName"),
        companyName: formData.get("companyName"),
        positionTitle: formData.get("positionTitle"),
        filmography: formData.get("filmography") || undefined,
      });
      if (!prodParsed.success) {
        return { error: "Заполните поля профиля продюсера" };
      }

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: parsedBase.data.email.toLowerCase(),
            passwordHash,
            role: UserRole.PRODUCER,
          },
        });
        await tx.producerProfile.create({
          data: {
            userId: user.id,
            fullName: prodParsed.data.fullName,
            companyName: prodParsed.data.companyName,
            positionTitle: prodParsed.data.positionTitle,
            filmography: prodParsed.data.filmography,
            moderationStatus: ModerationStatus.PENDING,
          },
        });
      });
    }

    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Не удалось зарегистрироваться" };
  }
}
