import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

/** Склонение «год / года / лет» для целого возраста. */
export function russianYearsWord(n: number): string {
  const abs = Math.abs(n) % 100;
  if (abs > 10 && abs < 20) return "лет";
  const d = abs % 10;
  if (d === 1) return "год";
  if (d >= 2 && d <= 4) return "года";
  return "лет";
}

/** Фамилия и имя для карточки профиля в чате (первые два слова ФИО, без отчества). */
export function formatActorSurnameAndFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return parts.join(" ");
  return `${parts[0]} ${parts[1]}`;
}
