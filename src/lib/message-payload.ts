export type ActorProfileMessagePayload = {
  kind: "actor_profile";
  actorProfileId: string;
  fullName: string;
  cityName: string;
  age: number;
  heightCm: number | null;
  weightKg: number | null;
};

export function parseActorProfilePayload(payload: unknown): ActorProfileMessagePayload | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  if (o.kind !== "actor_profile" || typeof o.actorProfileId !== "string") return null;
  if (typeof o.fullName !== "string" || typeof o.cityName !== "string") return null;
  const age = typeof o.age === "number" ? o.age : 0;
  return {
    kind: "actor_profile",
    actorProfileId: o.actorProfileId,
    fullName: o.fullName,
    cityName: o.cityName,
    age,
    heightCm: typeof o.heightCm === "number" ? o.heightCm : null,
    weightKg: typeof o.weightKg === "number" ? o.weightKg : null,
  };
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
  cityName: string;
};

export function parseCastingInviteDetailsPayload(payload: unknown): CastingInviteDetailsPayload | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  if (o.kind !== "casting_invite_details" || typeof o.castingId !== "string" || typeof o.title !== "string") {
    return null;
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
