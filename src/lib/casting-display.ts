import { CastingCategory } from "@prisma/client";
import { parseRoleRequirementsJson } from "@/lib/casting-role-json";

export function castingCategoryLabelRu(cat: CastingCategory | null | undefined): string {
  switch (cat) {
    case "MASS":
      return "Массовка";
    case "GROUP":
      return "Групповка";
    case "SOLO":
      return "Роль второго плана";
    default:
      return "Не указана";
  }
}

export type SerializedRoleReq =
  | { type: "mass"; text: string }
  | { type: "group"; roles: string[] }
  | { type: "solo"; text: string };

export function serializeRoleRequirements(
  json: unknown,
  cat: CastingCategory | null | undefined,
): SerializedRoleReq | null {
  if (!cat) return null;
  const p = parseRoleRequirementsJson(json);
  if (cat === "MASS" && p.mass?.trim()) return { type: "mass", text: p.mass.trim() };
  if (cat === "GROUP") {
    const roles = p.group.map((r) => r.trim()).filter(Boolean);
    if (roles.length) return { type: "group", roles };
    return null;
  }
  if (cat === "SOLO" && p.solo?.trim()) return { type: "solo", text: p.solo.trim() };
  return null;
}

export function formatShootDateTimeRu(
  scheduledAtIso: string | null,
  shootStartTime: string | null | undefined,
): string | null {
  const st = shootStartTime?.trim();
  if (!scheduledAtIso) {
    return st ? `Время начала: ${st}` : null;
  }
  const d = new Date(scheduledAtIso);
  const dateStr = d.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (st) return `${dateStr}, начало: ${st}`;
  const hm = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const isMidnight = d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
  if (!isMidnight) return `${dateStr}, ${hm}`;
  return dateStr;
}

/** Дата и время начала отдельно для карточки кастинга. */
export function formatShootDateParts(
  scheduledAtIso: string | null,
  shootStartTime: string | null | undefined,
): { dateLine: string | null; timeLine: string | null } {
  const st = shootStartTime?.trim() || null;
  if (!scheduledAtIso) {
    return { dateLine: null, timeLine: st };
  }
  const d = new Date(scheduledAtIso);
  const dateLine = d.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hm = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const isMidnight = d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
  const timeFromDate = !isMidnight ? hm : null;
  const timeLine = st ?? timeFromDate;
  return { dateLine, timeLine };
}
