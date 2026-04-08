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

function formatOneYmdRu(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return dt.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function collectShootYmdList(
  scheduledAtIso: string | null,
  shootDatesYmd: string[] | null | undefined,
): string[] {
  const fromExtra = [...(shootDatesYmd ?? [])].filter(Boolean).sort();
  if (fromExtra.length) return fromExtra;
  if (scheduledAtIso) return [scheduledAtIso.slice(0, 10)];
  return [];
}

export function formatShootDateTimeRu(
  scheduledAtIso: string | null,
  shootStartTime: string | null | undefined,
  shootDatesYmd?: string[] | null,
): string | null {
  const st = shootStartTime?.trim();
  const ymds = collectShootYmdList(scheduledAtIso, shootDatesYmd);
  if (ymds.length === 0) {
    return st ? `Начало съёмки: ${st}` : null;
  }
  const parts = ymds.map((y) => formatOneYmdRu(y));
  const dateStr = parts.length === 1 ? parts[0]! : parts.join(" · ");
  if (st) return `${dateStr}, начало: ${st}`;
  if (scheduledAtIso && ymds.length === 1) {
    const d = new Date(scheduledAtIso);
    const hm = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const isMidnight = d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
    if (!isMidnight) return `${dateStr}, ${hm}`;
  }
  return dateStr;
}

/** Дата и время начала отдельно для карточки кастинга. */
export function formatShootDateParts(
  scheduledAtIso: string | null,
  shootStartTime: string | null | undefined,
  shootDatesYmd?: string[] | null,
): { dateLine: string | null; timeLine: string | null } {
  const st = shootStartTime?.trim() || null;
  const ymds = collectShootYmdList(scheduledAtIso, shootDatesYmd);
  if (ymds.length === 0) {
    return { dateLine: null, timeLine: st };
  }
  const parts = ymds.map((y) => formatOneYmdRu(y));
  const dateLine = parts.length === 1 ? parts[0]! : parts.join(" · ");
  return { dateLine, timeLine: st };
}
