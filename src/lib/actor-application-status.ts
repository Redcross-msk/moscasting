import type { ApplicationStatus } from "@prisma/client";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

/**
 * Подписи и цвет бейджа для «Мои отклики».
 * — РАССМОТРЕНИЕ (серый): директор ещё не принял решение.
 * — ПРИГЛАШЕНИЕ (зелёный): приглашение / принятие / кастинг пройден.
 * — ОТКАЗ (красный): отклонено.
 */
export function actorApplicationStatusPresentation(status: ApplicationStatus): {
  label: string;
  variant: BadgeVariant;
} {
  switch (status) {
    case "SUBMITTED":
    case "VIEWED":
    case "SHORTLISTED":
      return { label: "РАССМОТРЕНИЕ", variant: "statusReview" };
    case "INVITED":
      return { label: "ПРИГЛАШЕНИЕ", variant: "statusSuccess" };
    case "ACCEPTED":
      return { label: "ПРИНЯТО", variant: "statusSuccess" };
    case "CAST_PASSED":
      return { label: "КАСТИНГ ПРОЙДЕН", variant: "statusSuccess" };
    case "REJECTED":
      return { label: "ОТКАЗ", variant: "statusRejected" };
    case "WITHDRAWN":
      return { label: "ОТОЗВАН", variant: "statusReview" };
    case "ARCHIVED":
      return { label: "АРХИВ", variant: "statusReview" };
    default:
      return { label: String(status), variant: "secondary" };
  }
}
