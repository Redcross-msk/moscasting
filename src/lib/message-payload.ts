import { isCastingPaymentPeriod, type CastingPaymentPeriod } from "@/lib/casting-payment-period";

export type ActorProfileMessagePayload = {
  kind: "actor_profile";
  actorProfileId: string;
  fullName: string;
  cityName: string;
  age: number;
  heightCm: number | null;
  weightKg: number | null;
  /** Превью в чате; старые сообщения могли сохраниться без поля */
  avatarUrl?: string | null;
  /** Ключ в `public/uploads` — для ссылок через `/api/media/…` */
  avatarStorageKey?: string | null;
};

export function parseActorProfilePayload(payload: unknown): ActorProfileMessagePayload | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  if (o.kind !== "actor_profile" || typeof o.actorProfileId !== "string") return null;
  if (typeof o.fullName !== "string" || typeof o.cityName !== "string") return null;
  const age = typeof o.age === "number" ? o.age : 0;
  const avatarUrl =
    typeof o.avatarUrl === "string" && o.avatarUrl.trim() ? o.avatarUrl.trim() : null;
  const avatarStorageKey =
    typeof o.avatarStorageKey === "string" && o.avatarStorageKey.trim()
      ? o.avatarStorageKey.trim()
      : null;
  return {
    kind: "actor_profile",
    actorProfileId: o.actorProfileId,
    fullName: o.fullName,
    cityName: o.cityName,
    age,
    heightCm: typeof o.heightCm === "number" ? o.heightCm : null,
    weightKg: typeof o.weightKg === "number" ? o.weightKg : null,
    avatarUrl,
    avatarStorageKey,
  };
}

function parsePaymentPeriodJson(v: unknown): CastingPaymentPeriod | null {
  if (typeof v !== "string") return null;
  return isCastingPaymentPeriod(v) ? v : null;
}

export type CastingInviteDetailsPayload = {
  kind: "casting_invite_details";
  castingId: string;
  title: string;
  scheduledAt: string | null;
  shootStartTime: string | null;
  metroStation: string | null;
  addressLine: string | null;
  metroOrPlace: string | null;
  workHoursNote: string | null;
  paymentInfo: string | null;
  paymentRub: number | null;
  paymentPeriod: CastingPaymentPeriod | null;
  shootDates: string[] | null;
  cityName: string;
};

export function parseCastingInviteDetailsPayload(payload: unknown): CastingInviteDetailsPayload | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  if (o.kind !== "casting_invite_details" || typeof o.castingId !== "string" || typeof o.title !== "string") {
    return null;
  }
  const shootDatesRaw = o.shootDates;
  let shootDates: string[] | null = null;
  if (Array.isArray(shootDatesRaw)) {
    const dates = shootDatesRaw
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
    shootDates = dates.length ? [...new Set(dates)].sort() : null;
  }

  return {
    kind: "casting_invite_details",
    castingId: o.castingId,
    title: o.title,
    scheduledAt: typeof o.scheduledAt === "string" ? o.scheduledAt : null,
    shootStartTime: typeof o.shootStartTime === "string" ? o.shootStartTime : null,
    metroStation: typeof o.metroStation === "string" ? o.metroStation : null,
    addressLine: typeof o.addressLine === "string" ? o.addressLine : null,
    metroOrPlace: typeof o.metroOrPlace === "string" ? o.metroOrPlace : null,
    workHoursNote: typeof o.workHoursNote === "string" ? o.workHoursNote : null,
    paymentInfo: typeof o.paymentInfo === "string" ? o.paymentInfo : null,
    paymentRub: typeof o.paymentRub === "number" ? o.paymentRub : null,
    paymentPeriod: parsePaymentPeriodJson(o.paymentPeriod),
    shootDates,
    cityName: typeof o.cityName === "string" ? o.cityName : "",
  };
}

export type ChatAttachmentPayload = {
  kind: "chat_attachment";
  url: string;
  mimeType: string;
  fileName: string;
  attachmentKind: "image" | "video" | "file";
};

export function parseChatAttachmentPayload(payload: unknown): ChatAttachmentPayload | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  if (o.kind !== "chat_attachment" || typeof o.url !== "string") return null;
  const ak = o.attachmentKind === "video" || o.attachmentKind === "image" || o.attachmentKind === "file" ? o.attachmentKind : "file";
  return {
    kind: "chat_attachment",
    url: o.url,
    mimeType: typeof o.mimeType === "string" ? o.mimeType : "",
    fileName: typeof o.fileName === "string" ? o.fileName : "Файл",
    attachmentKind: ak,
  };
}
