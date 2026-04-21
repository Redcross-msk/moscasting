/**
 * 15 демо-продюсеров + по одному активному кастингу на май (даты 2026).
 * Запуск на сервере/локально при настроенном DATABASE_URL:
 *   npx tsx prisma/seed-may-demo-producers.ts
 * или:
 *   npm run db:seed-may-demo
 *
 * Логины: bulk-may2026-p01@moscasting.local … p15@ ; пароль: MayDemo2026! (см. константу ниже)
 * Повторный запуск идемпотентен по email + уникальному заголовку кастинга у продюсера.
 */

import {
  Prisma,
  PrismaClient,
  UserRole,
  UserStatus,
  CastingStatus,
  ModerationStatus,
  CastingCategory,
  CastingPaymentPeriod,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "MayDemo2026!";

type CastingTpl = {
  title: string;
  description: string;
  paymentInfo: string;
  paymentRub: number;
  paymentPeriod: CastingPaymentPeriod;
  projectType: string;
  candidateRequirements: string;
  slotsNeeded: number;
  /** YYYY-MM-DD съёмки */
  shootDay: string;
  /** YYYY-MM-DD дедлайн откликов */
  deadlineDay: string;
  shootStartTime: string;
  workHoursNote: string;
  metroOrPlace: string;
  castingCategory: CastingCategory;
  roleRequirementsJson: Prisma.InputJsonValue;
};

const PRODUCERS: Array<{
  email: string;
  fullName: string;
  companyName: string;
  positionTitle: string;
  filmography: string;
  casting: CastingTpl;
}> = [
  {
    email: "bulk-may2026-p01@moscasting.local",
    fullName: "Игорь Вернеч",
    companyName: "ООО «Вернеч Продакшн»",
    positionTitle: "Кастинг-директор",
    filmography: "Рекламные кампании брендов FMCG, сериалы второго плана.",
    casting: {
      title: "Массовка — проспект Мира (рекламный фон)",
      description:
        "Съёмка городского фона для рекламного ролика. Нужны 22 человека 25–48 лет, нейтральный стиль. Слегка изменённый бриф относительно стандартной массовки на центральной улице.",
      paymentInfo: "2100 ₽ / смена",
      paymentRub: 2100,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Реклама",
      candidateRequirements: "Без яркого макияжа, без крупных логотипов на одежде",
      slotsNeeded: 22,
      shootDay: "2026-05-08",
      deadlineDay: "2026-05-05",
      shootStartTime: "09:30",
      workHoursNote: "8–10 часов",
      metroOrPlace: "м. Рижская, сбор у выхода 1",
      castingCategory: CastingCategory.MASS,
      roleRequirementsJson: { type: "mass", text: "25–48 лет, городской casual" },
    },
  },
  {
    email: "bulk-may2026-p02@moscasting.local",
    fullName: "Антон Заблотнов",
    companyName: "ИП Заблотнов А.В.",
    positionTitle: "Исполнительный продюсер",
    filmography: "Клипы, ТВ-шоу, документальные проекты.",
    casting: {
      title: "Сериал «Ночной город» — эпизод «Кафе»",
      description:
        "Фоновые посетители заведения, 2–4 секунды в кадре. Павильонная съёмка; задача аналогична классическому «кафе»-эпизоду, локация и название проекта другие.",
      paymentInfo: "3600 ₽ / смена",
      paymentRub: 3600,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Сериал",
      candidateRequirements: "Нейтральная одежда, без спортивных брендов на крупных планах",
      slotsNeeded: 14,
      shootDay: "2026-05-11",
      deadlineDay: "2026-05-07",
      shootStartTime: "08:00",
      workHoursNote: "полная смена",
      metroOrPlace: "м. Водный стадион, павильон 12",
      castingCategory: CastingCategory.MASS,
      roleRequirementsJson: { type: "mass", text: "18–55 лет, спокойная мимика" },
    },
  },
  {
    email: "bulk-may2026-p03@moscasting.local",
    fullName: "Мария Крылова",
    companyName: "ООО «Крылова Кастинг Студио»",
    positionTitle: "Кастинг-директор",
    filmography: "Банковская реклама, корпоративные ролики.",
    casting: {
      title: "Реклама финтеха — офисный open space",
      description:
        "Имитация рабочего пространства: мужчины и женщины 30–52 года. Формат и оплата сопоставимы с банковской рекламой, проект — другой заказчик.",
      paymentInfo: "5200 ₽ / смена",
      paymentRub: 5200,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Реклама",
      candidateRequirements: "Деловой стиль, готовность к смене до 10 часов",
      slotsNeeded: 16,
      shootDay: "2026-05-14",
      deadlineDay: "2026-05-10",
      shootStartTime: "10:00",
      workHoursNote: "до 10 ч на площадке",
      metroOrPlace: "м. Деловой центр, бизнес-центр «Орион»",
      castingCategory: CastingCategory.MASS,
      roleRequirementsJson: { type: "mass", text: "30–52, office smart" },
    },
  },
  {
    email: "bulk-may2026-p04@moscasting.local",
    fullName: "Денис Орлов",
    companyName: "ООО «Орлов Медиа»",
    positionTitle: "Продюсер съёмочной группы",
    filmography: "Музыкальные клипы, концертные записи.",
    casting: {
      title: "Клип — танцпол (вечерняя смена)",
      description:
        "Массовка на танцполе, вечерняя съёмка 18+. Аналогичный по нагрузке проект клипа с клубной локацией.",
      paymentInfo: "2600 ₽ / ночь",
      paymentRub: 2600,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Клип",
      candidateRequirements: "Устойчивость к громкой музыке, активность в кадре",
      slotsNeeded: 38,
      shootDay: "2026-05-16",
      deadlineDay: "2026-05-12",
      shootStartTime: "20:00",
      workHoursNote: "ночь, до 6 часов",
      metroOrPlace: "м. Курская, клуб (адрес в брифинге)",
      castingCategory: CastingCategory.MASS,
      roleRequirementsJson: { type: "mass", text: "18+, нейтральный clubwear" },
    },
  },
  {
    email: "bulk-may2026-p05@moscasting.local",
    fullName: "Екатерина Смирнова",
    companyName: "Кинокомпания «Смирнова Каст»",
    positionTitle: "Кастинг-директор",
    filmography: "ТВ-шоу, развлекательные форматы.",
    casting: {
      title: "ТВ-шоу — зрители в зале (запись выпуска)",
      description:
        "Нужны зрители для общих планов зала. Объём и оплата близки к типовому ТВ-формату, дата съёмки — в мае.",
      paymentInfo: "1600 ₽ / выпуск",
      paymentRub: 1600,
      paymentPeriod: CastingPaymentPeriod.PROJECT,
      projectType: "ТВ",
      candidateRequirements: "Приход за 2 часа до записи, без ярких цветов в верхнем ряду",
      slotsNeeded: 75,
      shootDay: "2026-05-18",
      deadlineDay: "2026-05-14",
      shootStartTime: "15:00",
      workHoursNote: "4–5 часов",
      metroOrPlace: "м. Технопарк, павильон ТВ",
      castingCategory: CastingCategory.MASS,
      roleRequirementsJson: { type: "mass", text: "18–65, зрители статисты" },
    },
  },
  {
    email: "bulk-may2026-p06@moscasting.local",
    fullName: "Алексей Панов",
    companyName: "ООО «Панов Фильм»",
    positionTitle: "Режиссёр постановки / кастинг",
    filmography: "Короткий метр, фестивальное кино.",
    casting: {
      title: "Короткий метр — прохожие в парке Горького",
      description:
        "Несколько планов осенне-весеннего парка (дубль локации). Оплата и требования как у аналогичной массовки в парке.",
      paymentInfo: "3100 ₽ / смена",
      paymentRub: 3100,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Кино",
      candidateRequirements: "Тёплая верхняя одежда своими силами",
      slotsNeeded: 10,
      shootDay: "2026-05-06",
      deadlineDay: "2026-05-03",
      shootStartTime: "09:00",
      workHoursNote: "8–9 часов",
      metroOrPlace: "м. Парк культуры, выход 3",
      castingCategory: CastingCategory.MASS,
      roleRequirementsJson: { type: "mass", text: "25–42, верхняя одежда без логотипов" },
    },
  },
  {
    email: "bulk-may2026-p07@moscasting.local",
    fullName: "Светлана Громова",
    companyName: "ООО «Громова Продюсирование»",
    positionTitle: "Кастинг-директор",
    filmography: "Реклама напитков и FMCG.",
    casting: {
      title: "Реклама напитков — крупный план рук у стойки",
      description:
        "Крупные планы рук за барной стойкой, лицо в кадре не требуется. Вариация на тему «бариста руки».",
      paymentInfo: "4700 ₽ / смена",
      paymentRub: 4700,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Реклама",
      candidateRequirements: "Аккуратные руки, короткие ногти",
      slotsNeeded: 2,
      shootDay: "2026-05-09",
      deadlineDay: "2026-05-06",
      shootStartTime: "11:00",
      workHoursNote: "до 6 часов",
      metroOrPlace: "м. Белорусская, студия «Свет»",
      castingCategory: CastingCategory.SOLO,
      roleRequirementsJson: { type: "solo", text: "Мужские или женские руки, без тату на видимых зонах" },
    },
  },
  {
    email: "bulk-may2026-p08@moscasting.local",
    fullName: "Виктор Данилов",
    companyName: "ООО «Данилов Сериал Продакшн»",
    positionTitle: "Кастинг-директор",
    filmography: "Семейные сцены в сериалах.",
    casting: {
      title: "Сериал — семья за столом (групповка, 4 человека)",
      description:
        "Родители и двое детей, обеденная сцена. Логика и гонорар сопоставимы с типовой семейной групповкой.",
      paymentInfo: "12500 ₽ / смена на семью",
      paymentRub: 12500,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Сериал",
      candidateRequirements: "Реальная семья или подобранная группа 8–14 лет у детей",
      slotsNeeded: 4,
      shootDay: "2026-05-20",
      deadlineDay: "2026-05-15",
      shootStartTime: "08:30",
      workHoursNote: "полная смена",
      metroOrPlace: "м. Киевская, кинопавильон 4",
      castingCategory: CastingCategory.GROUP,
      roleRequirementsJson: {
        type: "group",
        roles: ["Отец 35–46", "Мать 30–41", "Сын 11 лет", "Дочь 9 лет", ""],
      },
    },
  },
  {
    email: "bulk-may2026-p09@moscasting.local",
    fullName: "Олег Мирный",
    companyName: "ООО «Мирный Спорт Медиа»",
    positionTitle: "Продюсер",
    filmography: "Спортивные трансляции, реклама стадионов.",
    casting: {
      title: "Массовка — трибуны (общий план)",
      description:
        "Заполнение трибун, общие планы. Масштаб и ставка близки к стадионной массовке, другая дата и стадион уточняется.",
      paymentInfo: "1900 ₽ / смена",
      paymentRub: 1900,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Спорт",
      candidateRequirements: "Спортивная одежда нейтральных цветов",
      slotsNeeded: 180,
      shootDay: "2026-05-22",
      deadlineDay: "2026-05-17",
      shootStartTime: "07:00",
      workHoursNote: "до 12:00",
      metroOrPlace: "Спорткомплекс, точка сбора у координатора",
      castingCategory: CastingCategory.MASS,
      roleRequirementsJson: { type: "mass", text: "18+, без ярких цветов и политических символов" },
    },
  },
  {
    email: "bulk-may2026-p10@moscasting.local",
    fullName: "Наталья Весёлкина",
    companyName: "ООО «Весёлкина Подкасты»",
    positionTitle: "Кастинг-директор",
    filmography: "Студийные интервью, digital.",
    casting: {
      title: "Подкаст — спикер talking head",
      description:
        "Один спикер в кадре, формат talking head. Условия аналогичны типовому подкасту в студии.",
      paymentInfo: "8200 ₽ / съёмочный день",
      paymentRub: 8200,
      paymentPeriod: CastingPaymentPeriod.DAY,
      projectType: "Подкаст",
      candidateRequirements: "Опыт публичных выступлений приветствуется",
      slotsNeeded: 1,
      shootDay: "2026-05-13",
      deadlineDay: "2026-05-09",
      shootStartTime: "14:00",
      workHoursNote: "до 4 часов",
      metroOrPlace: "м. Технопарк, студия «Весна»",
      castingCategory: CastingCategory.SOLO,
      roleRequirementsJson: { type: "solo", text: "Мужчина или женщина 28–52, деловой стиль" },
    },
  },
  {
    email: "bulk-may2026-p11@moscasting.local",
    fullName: "Роман Чистяков",
    companyName: "ООО «Чистяков Реклама»",
    positionTitle: "Кастинг-директор",
    filmography: "Автореклама, урбанистические сюжеты.",
    casting: {
      title: "Реклама кроссовера — группа у перехода",
      description:
        "Трое прохожих переходят дорогу в кадре. Вариация на тему автомобильной рекламы с пешими.",
      paymentInfo: "6200 ₽ на человека",
      paymentRub: 6200,
      paymentPeriod: CastingPaymentPeriod.PROJECT,
      projectType: "Реклама",
      candidateRequirements: "Слаженная группа приветствуется; согласованные костюмы",
      slotsNeeded: 3,
      shootDay: "2026-05-19",
      deadlineDay: "2026-05-15",
      shootStartTime: "06:15",
      workHoursNote: "утро, до 4 часов",
      metroOrPlace: "Садовое кольцо, точка на карте в брифинге",
      castingCategory: CastingCategory.GROUP,
      roleRequirementsJson: {
        type: "group",
        roles: ["Мужчина 29–41, куртка", "Женщина 26–36", "Мужчина 24–32", "", ""],
      },
    },
  },
  {
    email: "bulk-may2026-p12@moscasting.local",
    fullName: "Полина Артёмова",
    companyName: "ООО «Артёмова Док»",
    positionTitle: "Кастинг-директор",
    filmography: "Документальное кино, репортаж.",
    casting: {
      title: "Документальный проект — очередь у музея",
      description:
        "Фоновые кадры очереди, несколько планов. Соответствует типовой документальной массовке.",
      paymentInfo: "2300 ₽ / смена",
      paymentRub: 2300,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Документалистика",
      candidateRequirements: "Нейтральная одежда, без ярких аксессуаров",
      slotsNeeded: 32,
      shootDay: "2026-05-21",
      deadlineDay: "2026-05-17",
      shootStartTime: "10:00",
      workHoursNote: "6–8 часов",
      metroOrPlace: "м. Пушкинская, выход к музею",
      castingCategory: CastingCategory.MASS,
      roleRequirementsJson: { type: "mass", text: "18–62, готовность стоять в очереди по сценарию" },
    },
  },
  {
    email: "bulk-may2026-p13@moscasting.local",
    fullName: "Георгий Сафонов",
    companyName: "Театр-студия «Сафонов»",
    positionTitle: "Постановщик / кастинг",
    filmography: "Театр, съёмки спектаклей.",
    casting: {
      title: "Театральная съёмка — зрители первых рядов",
      description:
        "Зрители на первых рядах для кино о спектакле. Условия как у типовой театральной массовки.",
      paymentInfo: "1100 ₽ / вечер",
      paymentRub: 1100,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Театр",
      candidateRequirements: "Тихое поведение, телефоны только вне кадра",
      slotsNeeded: 22,
      shootDay: "2026-05-24",
      deadlineDay: "2026-05-19",
      shootStartTime: "18:30",
      workHoursNote: "3 часа + антракт",
      metroOrPlace: "м. Чеховская, театральный зал (уточняется)",
      castingCategory: CastingCategory.MASS,
      roleRequirementsJson: { type: "mass", text: "Взрослые 26–58, smart casual" },
    },
  },
  {
    email: "bulk-may2026-p14@moscasting.local",
    fullName: "Дарья Никитина",
    companyName: "ООО «Никитина Каст»",
    positionTitle: "Кастинг-директор",
    filmography: "Реклама недвижимости, lifestyle.",
    casting: {
      title: "Lifestyle — прогулка с детьми во дворе ЖК",
      description:
        "Семейная прогулка для рекламного блока про ЖК. Лёгкая постановка, дети с родителями.",
      paymentInfo: "9000 ₽ / смена на семью из 3",
      paymentRub: 9000,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Реклама",
      candidateRequirements: "Родители + один ребёнок 6–10 лет, согласие на съёмку ребёнка",
      slotsNeeded: 3,
      shootDay: "2026-05-26",
      deadlineDay: "2026-05-22",
      shootStartTime: "11:00",
      workHoursNote: "5–6 часов",
      metroOrPlace: "м. Фили, ЖК (точка — в брифинге)",
      castingCategory: CastingCategory.GROUP,
      roleRequirementsJson: {
        type: "group",
        roles: ["Мать 28–38", "Отец 30–42", "Ребёнок 6–10", "", ""],
      },
    },
  },
  {
    email: "bulk-may2026-p15@moscasting.local",
    fullName: "Константин Баранов",
    companyName: "ООО «Баранов Продакшн Хаб»",
    positionTitle: "Кастинг-директор",
    filmography: "Онлайн-курсы, промо, корпоративные фильмы.",
    casting: {
      title: "Промо IT-продукта — офисные проходы и переговорка",
      description:
        "Фоновые сотрудники в коридоре и одна сцена в переговорке. Аналог корпоративной рекламы с другим продуктом.",
      paymentInfo: "4800 ₽ / смена",
      paymentRub: 4800,
      paymentPeriod: CastingPaymentPeriod.SHIFT,
      projectType: "Реклама",
      candidateRequirements: "Деловой стиль, готовность к нескольким переодеваниям фона",
      slotsNeeded: 12,
      shootDay: "2026-05-28",
      deadlineDay: "2026-05-24",
      shootStartTime: "09:00",
      workHoursNote: "8–9 часов",
      metroOrPlace: "м. Белорусская, коворкинг-павильон",
      castingCategory: CastingCategory.MASS,
      roleRequirementsJson: { type: "mass", text: "25–50, office casual" },
    },
  },
];

function dayAtUtc(isoDate: string, hourUtc: number) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hourUtc, 0, 0, 0));
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const moscow = await prisma.city.findUnique({ where: { slug: "moscow" } });
  if (!moscow) {
    throw new Error('Город moscow не найден. Сначала выполните миграции и базовый seed (npm run db:seed).');
  }

  let createdCastings = 0;
  let skippedCastings = 0;

  for (const row of PRODUCERS) {
    const user = await prisma.user.upsert({
      where: { email: row.email },
      update: { passwordHash, role: UserRole.PRODUCER, status: UserStatus.ACTIVE },
      create: {
        email: row.email,
        passwordHash,
        role: UserRole.PRODUCER,
        status: UserStatus.ACTIVE,
      },
    });

    const profile =
      (await prisma.producerProfile.findUnique({ where: { userId: user.id } })) ??
      (await prisma.producerProfile.create({
        data: {
          userId: user.id,
          fullName: row.fullName,
          companyName: row.companyName,
          positionTitle: row.positionTitle,
          filmography: row.filmography,
          moderationStatus: ModerationStatus.APPROVED,
        },
      }));

    if (!profile) continue;

    const exists = await prisma.casting.findFirst({
      where: { producerProfileId: profile.id, title: row.casting.title, deletedAt: null },
    });
    if (exists) {
      skippedCastings++;
      continue;
    }

    const c = row.casting;
    const shootDatesJson = [c.shootDay];
    await prisma.casting.create({
      data: {
        producerProfileId: profile.id,
        title: c.title,
        description: c.description,
        cityId: moscow.id,
        paymentInfo: c.paymentInfo,
        paymentRub: c.paymentRub,
        paymentPeriod: c.paymentPeriod,
        status: CastingStatus.ACTIVE,
        moderationStatus: ModerationStatus.APPROVED,
        applicationDeadline: dayAtUtc(c.deadlineDay, 21),
        scheduledAt: dayAtUtc(c.shootDay, 12),
        shootDatesJson,
        projectType: c.projectType,
        candidateRequirements: c.candidateRequirements,
        slotsNeeded: c.slotsNeeded,
        castingCategory: c.castingCategory,
        metroOrPlace: c.metroOrPlace,
        shootStartTime: c.shootStartTime,
        workHoursNote: c.workHoursNote,
        roleRequirementsJson: c.roleRequirementsJson,
      },
    });
    createdCastings++;
  }

  console.log("seed-may-demo-producers: готово.");
  console.log(`Обработано продюсеров (upsert): ${PRODUCERS.length}`);
  console.log(`Новых кастингов: ${createdCastings}, пропущено (уже есть): ${skippedCastings}`);
  console.log(`Email: bulk-may2026-p01@moscasting.local … p15@ ; пароль: ${DEMO_PASSWORD}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
