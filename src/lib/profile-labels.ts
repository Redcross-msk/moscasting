import { AvailabilityStatus, BodyType, Gender } from "@prisma/client";

export const genderLabel: Record<Gender, string> = {
  MALE: "Мужской",
  FEMALE: "Женский",
  NON_BINARY: "Небинарный",
  OTHER: "Другое",
};

export const bodyTypeLabel: Record<BodyType, string> = {
  SLIM: "Худощавое",
  ATHLETIC: "Спортивное",
  AVERAGE: "Среднее",
  STOCKY: "Плотное",
  HEAVY: "Крупное",
};

export const availabilityLabel: Record<AvailabilityStatus, string> = {
  AVAILABLE: "График свободен",
  BUSY: "График занят",
  PARTIAL: "График частично занят",
};
