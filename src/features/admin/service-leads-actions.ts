"use server";

import { revalidatePath } from "next/cache";
import { CourseSlotType, ServiceLeadStatus } from "@prisma/client";
import { auth } from "@/auth";
import {
  createCourseSlot,
  deleteCourseSlot,
  updateCourseSlot,
  setCourseApplicationStatus,
} from "@/server/services/course-slot.service";
import {
  createPortfolioShootDay,
  deletePortfolioShootDay,
  updatePortfolioShootDay,
  setPortfolioApplicationStatus,
} from "@/server/services/portfolio-slot.service";
import { logAdminAction } from "@/server/services/admin.service";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session.user;
}

function parseDateYmd(s: string): Date {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) throw new Error("Некорректная дата");
  const d = new Date(`${t}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new Error("Некорректная дата");
  return d;
}

export async function adminCreateCourseSlotAction(formData: FormData) {
  const admin = await requireAdmin();
  const type =
    String(formData.get("type") ?? "") === "SIXTEEN_HOURS"
      ? CourseSlotType.SIXTEEN_HOURS
      : CourseSlotType.EIGHT_HOURS;
  const startDay = parseDateYmd(String(formData.get("startDay") ?? ""));
  const secondRaw = String(formData.get("secondDay") ?? "").trim();
  const secondDay = secondRaw ? parseDateYmd(secondRaw) : null;
  const maxParticipants = Math.max(1, Math.min(500, Number.parseInt(String(formData.get("maxParticipants") ?? "10"), 10) || 10));

  await createCourseSlot({ type, startDay, secondDay, maxParticipants });
  await logAdminAction(admin.id, "course_slot.create", "CourseSlot", undefined);
  revalidatePath("/admin/obuchenie");
}

export async function adminUpdateCourseSlotAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Нет id");
  const maxParticipants = Math.max(
    1,
    Math.min(500, Number.parseInt(String(formData.get("maxParticipants") ?? "1"), 10) || 1),
  );
  const isActive = String(formData.get("isActive") ?? "") === "true";
  await updateCourseSlot(id, { maxParticipants, isActive });
  await logAdminAction(admin.id, "course_slot.update", "CourseSlot", id);
  revalidatePath("/admin/obuchenie");
}

export async function adminDeleteCourseSlotAction(slotId: string) {
  const admin = await requireAdmin();
  await deleteCourseSlot(slotId);
  await logAdminAction(admin.id, "course_slot.delete", "CourseSlot", slotId);
  revalidatePath("/admin/obuchenie");
}

export async function adminSetCourseLeadStatusAction(leadId: string, status: ServiceLeadStatus) {
  const admin = await requireAdmin();
  await setCourseApplicationStatus(leadId, status);
  await logAdminAction(admin.id, "course_lead.status", "CourseApplication", leadId, { status });
  revalidatePath("/admin/obuchenie");
}

export async function adminCreatePortfolioDayAction(formData: FormData) {
  const admin = await requireAdmin();
  const shootDate = parseDateYmd(String(formData.get("shootDate") ?? ""));
  const maxBookings = Math.max(1, Math.min(200, Number.parseInt(String(formData.get("maxBookings") ?? "5"), 10) || 5));
  try {
    await createPortfolioShootDay({ shootDate, maxBookings });
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") throw new Error("Эта дата уже есть в календаре");
    throw e;
  }
  await logAdminAction(admin.id, "portfolio_day.create", "PortfolioShootDay", undefined);
  revalidatePath("/admin/portfolio");
}

export async function adminUpdatePortfolioDayAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Нет id");
  const maxBookings = Math.max(
    1,
    Math.min(200, Number.parseInt(String(formData.get("maxBookings") ?? "1"), 10) || 1),
  );
  const isActive = String(formData.get("isActive") ?? "") === "true";
  await updatePortfolioShootDay(id, { maxBookings, isActive });
  await logAdminAction(admin.id, "portfolio_day.update", "PortfolioShootDay", id);
  revalidatePath("/admin/portfolio");
}

export async function adminDeletePortfolioDayAction(dayId: string) {
  const admin = await requireAdmin();
  await deletePortfolioShootDay(dayId);
  await logAdminAction(admin.id, "portfolio_day.delete", "PortfolioShootDay", dayId);
  revalidatePath("/admin/portfolio");
}

export async function adminSetPortfolioLeadStatusAction(leadId: string, status: ServiceLeadStatus) {
  const admin = await requireAdmin();
  await setPortfolioApplicationStatus(leadId, status);
  await logAdminAction(admin.id, "portfolio_lead.status", "PortfolioApplication", leadId, { status });
  revalidatePath("/admin/portfolio");
}

export async function adminSetCourseLeadFromFormAction(formData: FormData) {
  const id = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "") as ServiceLeadStatus;
  if (!id || !Object.values(ServiceLeadStatus).includes(status)) throw new Error("Некорректные данные");
  await adminSetCourseLeadStatusAction(id, status);
}

export async function adminSetPortfolioLeadFromFormAction(formData: FormData) {
  const id = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "") as ServiceLeadStatus;
  if (!id || !Object.values(ServiceLeadStatus).includes(status)) throw new Error("Некорректные данные");
  await adminSetPortfolioLeadStatusAction(id, status);
}
