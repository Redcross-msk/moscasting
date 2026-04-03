import type { EthnicAppearance, FacialHairOption, TattooPiercingOption } from "@prisma/client";

/** Коды для формы и БД (массив languages) */
export const ACTOR_LANGUAGE_OPTIONS = [
  { slug: "russian", label: "Русский" },
  { slug: "english", label: "Английский" },
  { slug: "chinese", label: "Китайский" },
  { slug: "japanese", label: "Японский" },
  { slug: "italian", label: "Итальянский" },
  { slug: "french", label: "Французский" },
  { slug: "german", label: "Немецкий" },
  { slug: "korean", label: "Корейский" },
  { slug: "turkish", label: "Турецкий" },
  { slug: "kazakh", label: "Казахский" },
] as const;

export const LANGUAGE_SLUG_SET = new Set<string>(ACTOR_LANGUAGE_OPTIONS.map((o) => o.slug));

export const languageLabel: Record<(typeof ACTOR_LANGUAGE_OPTIONS)[number]["slug"], string> =
  Object.fromEntries(ACTOR_LANGUAGE_OPTIONS.map((o) => [o.slug, o.label])) as Record<
    (typeof ACTOR_LANGUAGE_OPTIONS)[number]["slug"],
    string
  >;

export const ACTOR_PROFESSIONAL_SKILL_OPTIONS = [
  { slug: "vocal", label: "Вокал" },
  { slug: "musical_instrument", label: "Игра на музыкальном инструменте" },
  { slug: "dance", label: "Танцы" },
  { slug: "fine_arts", label: "Изобразительное искусство" },
  { slug: "culinary", label: "Кулинария" },
  { slug: "martial_arts", label: "Боевые искусства" },
  { slug: "first_aid", label: "Оказание первой помощи" },
  { slug: "shooting", label: "Стрельба" },
  { slug: "drill_marching", label: "Строевое марширование" },
  { slug: "horse_riding", label: "Верховая езда" },
  { slug: "drive_car", label: "Вождение транспорта: авто (права)" },
  { slug: "drive_moto", label: "Вождение транспорта: мото-техника (права)" },
  { slug: "drive_water", label: "Вождение транспорта: водная техника (права)" },
] as const;

export const PROFESSIONAL_SKILL_SLUG_SET = new Set<string>(
  ACTOR_PROFESSIONAL_SKILL_OPTIONS.map((o) => o.slug),
);

export const professionalSkillLabel: Record<
  (typeof ACTOR_PROFESSIONAL_SKILL_OPTIONS)[number]["slug"],
  string
> = Object.fromEntries(ACTOR_PROFESSIONAL_SKILL_OPTIONS.map((o) => [o.slug, o.label])) as Record<
  (typeof ACTOR_PROFESSIONAL_SKILL_OPTIONS)[number]["slug"],
  string
>;

export const ethnicAppearanceLabel: Record<EthnicAppearance, string> = {
  EUROPEAN: "Европейская",
  ASIAN: "Азиатская",
  AFRO_AMERICAN: "Афро-американская",
  SLAVIC: "Славянская",
};

export const tattooPiercingLabel: Record<TattooPiercingOption, string> = {
  NONE: "Татуировок и пирсинга нет",
  COVERED_AREAS:
    "Есть татуировки и пирсинг на закрытых местах (предплечье, икры, торс)",
  OPEN_AREAS: "Есть татуировки и пирсинг на открытых местах (лицо, шея, пальцы)",
};

export const facialHairLabel: Record<FacialHairOption, string> = {
  BEARD_REFUSES_SHAVE: "Есть борода/усы, сбривать отказываюсь",
  BEARD_CAN_SHAVE: "Есть борода/усы, могу сбрить",
  NO_CAN_GROW: "Бороды/усов нет, могу отрастить",
  NO_REFUSES_GROW: "Бороды/усов нет, отрастить отказываюсь",
};
