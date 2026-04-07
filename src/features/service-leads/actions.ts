"use server";

import { CourseSlotType, ServiceLeadStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

function parseDateYmd(s: string): Date | null {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(`${t}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function submitCourseApplicationAction(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const birthRaw = String(formData.get("birthDate") ?? "").trim();
  const experience = String(formData.get("experience") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const courseTypeRaw = String(formData.get("courseType") ?? "").trim();
  const slotId = String(formData.get("slotId") ?? "").trim();

  const birthDate = parseDateYmd(birthRaw);
  const courseType =
    courseTypeRaw === "EIGHT_HOURS" || courseTypeRaw === "SIXTEEN_HOURS"
      ? (courseTypeRaw as CourseSlotType)
      : null;

  if (
    fullName.length < 2 ||
    !birthDate ||
    experience.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phone.replace(/\D/g, "").length < 10 ||
    !courseType ||
    !slotId
  ) {
    throw new Error("Заполните все поля корректно");
  }

  await prisma.$transaction(async (tx) => {
    const slot = await tx.courseSlot.findFirst({
      where: { id: slotId, isActive: true, type: courseType },
    });
    if (!slot) throw new Error("Выбранный слот недоступен");

    const booked = await tx.courseApplication.count({
      where: { slotId, status: { not: ServiceLeadStatus.CANCELLED } },
    });
    if (booked >= slot.maxParticipants) throw new Error("На эту дату мест больше нет");

    await tx.courseApplication.create({
      data: {
        fullName,
        birthDate,
        experience,
        email,
        phone,
        courseType,
        slotId,
      },
    });
  });
}

export async function submitPortfolioApplicationAction(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const birthRaw = String(formData.get("birthDate") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const slotId = String(formData.get("slotId") ?? "").trim();

  const birthDate = parseDateYmd(birthRaw);

  if (
    fullName.length < 2 ||
    !birthDate ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phone.replace(/\D/g, "").length < 10 ||
    !slotId
  ) {
    throw new Error("Заполните все поля корректно");
  }

  await prisma.$transaction(async (tx) => {
    const day = await tx.portfolioShootDay.findFirst({
      where: { id: slotId, isActive: true },
    });
    if (!day) throw new Error("Выбранная дата недоступна");

    const booked = await tx.portfolioApplication.count({
      where: { slotId, status: { not: ServiceLeadStatus.CANCELLED } },
    });
    if (booked >= day.maxBookings) throw new Error("На эту дату заявок больше не принимаем");

    await tx.portfolioApplication.create({
      data: {
        fullName,
        birthDate,
        email,
        phone,
        slotId,
      },
    });
  });
}
