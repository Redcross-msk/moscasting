import { formatActorSurnameAndFirstName } from "@/lib/utils";

type SenderProfiles = {
  email: string;
  actorProfile: { fullName: string } | null;
  producerProfile: { fullName: string; companyName: string | null } | null;
};

/** Подпись к сообщению: актёр — фамилия и имя; продюсер — компания или ФИ. */
export function chatSenderPublicLabel(sender: SenderProfiles): string {
  if (sender.actorProfile?.fullName) {
    return formatActorSurnameAndFirstName(sender.actorProfile.fullName);
  }
  if (sender.producerProfile) {
    const co = sender.producerProfile.companyName?.trim();
    if (co) return co;
    return formatActorSurnameAndFirstName(sender.producerProfile.fullName);
  }
  return sender.email;
}

export function formatChatMessageTimeHm(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });
}
