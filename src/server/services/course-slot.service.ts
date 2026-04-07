import { CourseSlotType } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function countCourseApplicationsForSlot(slotId: string) {
  return prisma.courseApplication.count({
    where: { slotId, status: { not: "CANCELLED" } },
  });
}

export async function listAvailableCourseSlots(type: CourseSlotType) {
  const slots = await prisma.courseSlot.findMany({
    where: { isActive: true, type },
    orderBy: { startDay: "asc" },
  });
  const withCounts = await Promise.all(
    slots.map(async (s) => {
      const booked = await countCourseApplicationsForSlot(s.id);
      const remaining = Math.max(0, s.maxParticipants - booked);
      return { ...s, booked, remaining };
    }),
  );
  return withCounts.filter((s) => s.remaining > 0);
}

export async function listAllCourseSlotsForAdmin() {
  const slots = await prisma.courseSlot.findMany({
    orderBy: [{ startDay: "desc" }, { type: "asc" }],
    include: {
      _count: { select: { applications: true } },
    },
  });
  return slots;
}

export async function listCourseApplicationsForAdmin() {
  return prisma.courseApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { slot: true },
  });
}

export async function createCourseSlot(data: {
  type: CourseSlotType;
  startDay: Date;
  secondDay: Date | null;
  maxParticipants: number;
}) {
  if (data.type === "SIXTEEN_HOURS" && !data.secondDay) {
    throw new Error("Для 16-часового курса укажите второй день");
  }
  if (data.type === "EIGHT_HOURS" && data.secondDay) {
    throw new Error("Для 8-часового курса второй день не нужен");
  }
  return prisma.courseSlot.create({
    data: {
      type: data.type,
      startDay: data.startDay,
      secondDay: data.secondDay,
      maxParticipants: data.maxParticipants,
    },
  });
}

export async function updateCourseSlot(
  id: string,
  data: Partial<{ maxParticipants: number; isActive: boolean; startDay: Date; secondDay: Date | null }>,
) {
  return prisma.courseSlot.update({ where: { id }, data });
}

export async function deleteCourseSlot(id: string) {
  return prisma.courseSlot.delete({ where: { id } });
}

export async function setCourseApplicationStatus(id: string, status: import("@prisma/client").ServiceLeadStatus) {
  return prisma.courseApplication.update({ where: { id }, data: { status } });
}
