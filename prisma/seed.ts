import {
  PrismaClient,
  Prisma,
  UserRole,
  CastingStatus,
  ModerationStatus,
  ApplicationStatus,
  Gender,
  BodyType,
  EthnicAppearance,
  TattooPiercingOption,
  FacialHairOption,
  CastingCategory,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CASTINGS_SEED = [
  {
    title: "Массовка — улица Тверская",
    description: "Съёмка фона для рекламы. Нужны 20 человек 25–45 лет.",
    paymentInfo: "2000 ₽ / смена",
    paymentRub: 2000,
    projectType: "Реклама",
    candidateRequirements: "Без яркого макияжа",
    slotsNeeded: 20,
    daysToDeadline: 7,
    daysToShoot: 14,
  },
  {
    title: "Сериал «Ночной дозор» — эпизод «Кафе»",
    description: "Фоновые посетители, 2–3 секунды в кадре. Съёмка павильон.",
    paymentInfo: "3500 ₽ / смена",
    paymentRub: 3500,
    projectType: "Сериал",
    candidateRequirements: "Нейтральная одежда, без логотипов",
    slotsNeeded: 12,
    daysToDeadline: 10,
    daysToShoot: 21,
  },
  {
    title: "Реклама банка — офисные сотрудники",
    description: "Имитация open space. Мужчины и женщины 30–50 лет.",
    paymentInfo: "5000 ₽ / смена",
    paymentRub: 5000,
    projectType: "Реклама",
    candidateRequirements: "Деловой стиль, готовность к 10 часам на площадке",
    slotsNeeded: 15,
    daysToDeadline: 5,
    daysToShoot: 12,
  },
  {
    title: "Клип — танцпол в клубе",
    description: "Массовка на танцполе, вечерняя съёмка. 18+.",
    paymentInfo: "2500 ₽ / ночь",
    paymentRub: 2500,
    projectType: "Клип",
    candidateRequirements: "Активность, устойчивость к громкой музыке",
    slotsNeeded: 40,
    daysToDeadline: 3,
    daysToShoot: 9,
  },
  {
    title: "ТВ-шоу — зрители в зале",
    description: "Запись выпуска, нужны зрители для кадров общего плана.",
    paymentInfo: "1500 ₽ / выпуск",
    paymentRub: 1500,
    projectType: "ТВ",
    candidateRequirements: "Приход за 2 часа до записи",
    slotsNeeded: 80,
    daysToDeadline: 14,
    daysToShoot: 18,
  },
  {
    title: "Короткий метр — прохожие в парке",
    description: "Несколько планов в Горького. Осенний антураж.",
    paymentInfo: "3000 ₽ / смена",
    paymentRub: 3000,
    projectType: "Кино",
    candidateRequirements: "Тёплая верхняя одежда своими силами",
    slotsNeeded: 8,
    daysToDeadline: 6,
    daysToShoot: 11,
    castingCategory: CastingCategory.MASS,
    metroOrPlace: "м. Парк культуры, выход 2",
    shootStartTime: "09:00",
    workHoursNote: "8–10 часов",
    roleRequirementsJson: { type: "mass", text: "25–40 лет, осенняя верхняя одежда" },
  },
  {
    title: "Реклама кофе — бариста руки",
    description: "Крупные планы рук за стойкой, без лица в кадре.",
    paymentInfo: "4500 ₽ / смена",
    paymentRub: 4500,
    projectType: "Реклама",
    candidateRequirements: "Аккуратные руки",
    slotsNeeded: 2,
    daysToDeadline: 4,
    daysToShoot: 8,
    castingCategory: CastingCategory.SOLO,
    metroOrPlace: "м. Белорусская, павильон",
    shootStartTime: "11:00",
    workHoursNote: "до 6 часов",
    roleRequirementsJson: { type: "solo", text: "Мужские руки, без тату на видимых зонах" },
  },
  {
    title: "Сериал — семья за столом (групповка)",
    description: "Родители и двое детей, обеденная сцена.",
    paymentInfo: "12000 ₽ / смена на семью",
    paymentRub: 12000,
    projectType: "Сериал",
    candidateRequirements: "Семейная пара с детьми 8–12 лет",
    slotsNeeded: 4,
    daysToDeadline: 9,
    daysToShoot: 16,
    castingCategory: CastingCategory.GROUP,
    metroOrPlace: "м. Киевская, кинопавильон",
    shootStartTime: "08:30",
    workHoursNote: "полная смена",
    roleRequirementsJson: {
      type: "group",
      roles: ["Отец 35–45, деловой", "Мать 30–40", "Сын 10 лет", "Дочь 8 лет", ""],
    },
  },
  {
    title: "Массовка — стадион (трибуны)",
    description: "Заполнение трибун, общие планы.",
    paymentInfo: "1800 ₽",
    paymentRub: 1800,
    projectType: "Спорт",
    candidateRequirements: "Спортивная одежда нейтральных цветов",
    slotsNeeded: 200,
    daysToDeadline: 12,
    daysToShoot: 20,
    castingCategory: CastingCategory.MASS,
    metroOrPlace: "Лужники, уточняется у координатора",
    shootStartTime: "07:00",
    workHoursNote: "до 12:00",
    roleRequirementsJson: { type: "mass", text: "Любой возраст от 18, без ярких цветов" },
  },
  {
    title: "Подкаст — эксперт в кадре",
    description: "Один спикер, формат talking head.",
    paymentInfo: "8000 ₽",
    paymentRub: 8000,
    projectType: "Подкаст",
    candidateRequirements: "Опыт публичных выступлений приветствуется",
    slotsNeeded: 1,
    daysToDeadline: 6,
    daysToShoot: 10,
    castingCategory: CastingCategory.SOLO,
    metroOrPlace: "м. Технопарк, студия",
    shootStartTime: "14:00",
    workHoursNote: "3 часа",
    roleRequirementsJson: { type: "solo", text: "Мужчина или женщина 28–50, деловой стиль" },
  },
  {
    title: "Реклама авто — прохожие у перехода",
    description: "Группа 3 человека переходит дорогу в кадре.",
    paymentInfo: "6000 ₽ на человека",
    paymentRub: 6000,
    projectType: "Реклама",
    candidateRequirements: "Слаженная группа приветствуется",
    slotsNeeded: 3,
    daysToDeadline: 5,
    daysToShoot: 7,
    castingCategory: CastingCategory.GROUP,
    metroOrPlace: "Садовое кольцо, точка на карте в брифинге",
    shootStartTime: "06:00",
    workHoursNote: "утро, до 4 часов",
    roleRequirementsJson: {
      type: "group",
      roles: ["Мужчина 30–40, куртка", "Женщина 25–35", "Мужчина 25–30", "", ""],
    },
  },
  {
    title: "Документальный фильм — очередь у музея",
    description: "Фоновые кадры очереди, несколько планов.",
    paymentInfo: "2200 ₽ / смена",
    paymentRub: 2200,
    projectType: "Документалистика",
    candidateRequirements: "Нейтральная одежда, без ярких аксессуаров",
    slotsNeeded: 35,
    daysToDeadline: 8,
    daysToShoot: 15,
    castingCategory: CastingCategory.MASS,
    metroOrPlace: "м. Пушкинская, выход к музею",
    shootStartTime: "10:00",
    workHoursNote: "6–8 часов",
    roleRequirementsJson: { type: "mass", text: "18–60 лет, готовность стоять в очереди по сценарию" },
  },
  {
    title: "Театральная постановка — статисты в зале",
    description: "Зрители на первых рядах для съёмки спектакля.",
    paymentInfo: "1000 ₽ / вечер",
    paymentRub: 1000,
    projectType: "Театр",
    candidateRequirements: "Тихое поведение, без телефонов в кадре",
    slotsNeeded: 24,
    daysToDeadline: 11,
    daysToShoot: 19,
    castingCategory: CastingCategory.MASS,
    metroOrPlace: "м. Чеховская, МХТ",
    shootStartTime: "18:00",
    workHoursNote: "3 часа + антракт",
    roleRequirementsJson: { type: "mass", text: "Взрослые 25–55, деловой или smart casual" },
  },
];

const ACTORS_SEED = [
  {
    email: "actor@moscasting.local",
    fullName: "Мария Актёрова",
    birthDate: new Date("1995-06-15"),
    gender: Gender.FEMALE,
    heightCm: 168,
    weightKg: 55,
    bodyType: BodyType.SLIM,
    ethnicAppearance: EthnicAppearance.EUROPEAN,
    tattooPiercingOption: TattooPiercingOption.NONE,
    facialHairOption: FacialHairOption.NO_REFUSES_GROW,
    languages: ["russian", "english"],
    professionalSkillKeys: ["vocal", "dance", "drive_car"],
    bio: "Опыт массовки и эпизодических ролей.",
  },
  {
    email: "demo-actor-2@moscasting.local",
    fullName: "Алексей Смирнов",
    birthDate: new Date("1990-03-22"),
    gender: Gender.MALE,
    heightCm: 182,
    weightKg: 78,
    bodyType: BodyType.ATHLETIC,
    ethnicAppearance: EthnicAppearance.SLAVIC,
    tattooPiercingOption: TattooPiercingOption.COVERED_AREAS,
    facialHairOption: FacialHairOption.BEARD_CAN_SHAVE,
    languages: ["russian", "english"],
    professionalSkillKeys: ["drive_car", "shooting"],
    bio: "Съёмки в рекламе и сериалах второго плана.",
  },
  {
    email: "demo-actor-3@moscasting.local",
    fullName: "Елена Волкова",
    birthDate: new Date("1998-11-08"),
    gender: Gender.FEMALE,
    heightCm: 172,
    weightKg: 58,
    bodyType: BodyType.AVERAGE,
    ethnicAppearance: EthnicAppearance.EUROPEAN,
    tattooPiercingOption: TattooPiercingOption.NONE,
    facialHairOption: FacialHairOption.NO_CAN_GROW,
    languages: ["russian"],
    professionalSkillKeys: ["dance", "vocal"],
    bio: "Танцы, массовка, музыкальные клипы.",
  },
  {
    email: "demo-actor-4@moscasting.local",
    fullName: "Дмитрий Козлов",
    birthDate: new Date("1987-01-30"),
    gender: Gender.MALE,
    heightCm: 175,
    weightKg: 82,
    bodyType: BodyType.STOCKY,
    ethnicAppearance: EthnicAppearance.SLAVIC,
    tattooPiercingOption: TattooPiercingOption.NONE,
    facialHairOption: FacialHairOption.BEARD_REFUSES_SHAVE,
    languages: ["russian"],
    professionalSkillKeys: ["martial_arts", "first_aid"],
    bio: "Опыт театра и массовки в историческом кино.",
  },
  {
    email: "demo-actor-5@moscasting.local",
    fullName: "Анна Мельникова",
    birthDate: new Date("1992-09-14"),
    gender: Gender.FEMALE,
    heightCm: 165,
    weightKg: 52,
    bodyType: BodyType.SLIM,
    ethnicAppearance: EthnicAppearance.ASIAN,
    tattooPiercingOption: TattooPiercingOption.OPEN_AREAS,
    facialHairOption: FacialHairOption.NO_REFUSES_GROW,
    languages: ["russian", "korean", "english"],
    professionalSkillKeys: ["vocal", "fine_arts"],
    bio: "Вокал, массовка, фон в ТВ.",
  },
  {
    email: "demo-actor-6@moscasting.local",
    fullName: "Игорь Лебедев",
    birthDate: new Date("1994-07-01"),
    gender: Gender.MALE,
    heightCm: 178,
    weightKg: 70,
    bodyType: BodyType.AVERAGE,
    ethnicAppearance: EthnicAppearance.EUROPEAN,
    tattooPiercingOption: TattooPiercingOption.NONE,
    facialHairOption: FacialHairOption.NO_CAN_GROW,
    languages: ["russian", "english", "german"],
    professionalSkillKeys: ["drive_moto", "culinary"],
    bio: "Языки, массовка, дубляж фона.",
  },
  {
    email: "demo-actor-7@moscasting.local",
    fullName: "Ольга Соколова",
    birthDate: new Date("1996-04-20"),
    gender: Gender.FEMALE,
    heightCm: 170,
    weightKg: 56,
    bodyType: BodyType.SLIM,
    ethnicAppearance: EthnicAppearance.EUROPEAN,
    tattooPiercingOption: TattooPiercingOption.NONE,
    facialHairOption: FacialHairOption.NO_REFUSES_GROW,
    languages: ["russian"],
    professionalSkillKeys: ["dance", "vocal"],
    bio: "Хореография, массовка, клипы.",
  },
  {
    email: "demo-actor-8@moscasting.local",
    fullName: "Павел Орлов",
    birthDate: new Date("1988-12-05"),
    gender: Gender.MALE,
    heightCm: 180,
    weightKg: 85,
    bodyType: BodyType.ATHLETIC,
    ethnicAppearance: EthnicAppearance.SLAVIC,
    tattooPiercingOption: TattooPiercingOption.NONE,
    facialHairOption: FacialHairOption.BEARD_CAN_SHAVE,
    languages: ["russian", "english"],
    professionalSkillKeys: ["martial_arts", "drive_car"],
    bio: "Каскадёрский опыт, массовка боевиков.",
  },
  {
    email: "demo-actor-9@moscasting.local",
    fullName: "Ксения Романова",
    birthDate: new Date("2000-02-28"),
    gender: Gender.FEMALE,
    heightCm: 163,
    weightKg: 50,
    bodyType: BodyType.SLIM,
    ethnicAppearance: EthnicAppearance.EUROPEAN,
    tattooPiercingOption: TattooPiercingOption.NONE,
    facialHairOption: FacialHairOption.NO_CAN_GROW,
    languages: ["russian", "english"],
    professionalSkillKeys: ["fine_arts", "vocal"],
    bio: "Студентка театрального, эпизоды и реклама.",
  },
  {
    email: "demo-actor-10@moscasting.local",
    fullName: "Сергей Никифоров",
    birthDate: new Date("1985-08-17"),
    gender: Gender.MALE,
    heightCm: 176,
    weightKg: 88,
    bodyType: BodyType.STOCKY,
    ethnicAppearance: EthnicAppearance.SLAVIC,
    tattooPiercingOption: TattooPiercingOption.COVERED_AREAS,
    facialHairOption: FacialHairOption.BEARD_REFUSES_SHAVE,
    languages: ["russian"],
    professionalSkillKeys: ["first_aid", "drive_car"],
    bio: "Массовка, охранники, военные эпизоды.",
  },
  {
    email: "demo-actor-11@moscasting.local",
    fullName: "Татьяна Зайцева",
    birthDate: new Date("1993-05-09"),
    gender: Gender.FEMALE,
    heightCm: 166,
    weightKg: 54,
    bodyType: BodyType.AVERAGE,
    ethnicAppearance: EthnicAppearance.ASIAN,
    tattooPiercingOption: TattooPiercingOption.NONE,
    facialHairOption: FacialHairOption.NO_REFUSES_GROW,
    languages: ["russian", "english", "chinese"],
    professionalSkillKeys: ["languages", "dance"],
    bio: "Языки, фон в международных проектах.",
  },
  {
    email: "demo-actor-12@moscasting.local",
    fullName: "Максим Фёдоров",
    birthDate: new Date("1991-10-01"),
    gender: Gender.MALE,
    heightCm: 184,
    weightKg: 76,
    bodyType: BodyType.ATHLETIC,
    ethnicAppearance: EthnicAppearance.EUROPEAN,
    tattooPiercingOption: TattooPiercingOption.NONE,
    facialHairOption: FacialHairOption.NO_CAN_GROW,
    languages: ["russian"],
    professionalSkillKeys: ["shooting", "drive_moto"],
    bio: "Реклама спорттоваров, массовка стадионов.",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const moscow = await prisma.city.upsert({
    where: { slug: "moscow" },
    update: {},
    create: {
      name: "Москва",
      slug: "moscow",
      region: "Москва",
      isDefault: true,
      sortOrder: 0,
    },
  });

  const skillsData = [
    { name: "Вождение", slug: "driving" },
    { name: "Танцы", slug: "dance" },
    { name: "Вокал", slug: "vocal" },
    { name: "Боевые искусства", slug: "martial-arts" },
    { name: "Иностранные языки", slug: "languages" },
  ];

  for (const s of skillsData) {
    await prisma.skill.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@moscasting.local" },
    update: {},
    create: {
      email: "admin@moscasting.local",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const producerUser = await prisma.user.upsert({
    where: { email: "producer@moscasting.local" },
    update: {},
    create: {
      email: "producer@moscasting.local",
      passwordHash,
      role: UserRole.PRODUCER,
    },
  });

  const producerProfile =
    (await prisma.producerProfile.findUnique({ where: { userId: producerUser.id } })) ??
    (await prisma.producerProfile.create({
      data: {
        userId: producerUser.id,
        fullName: "Иван Продюсеров",
        companyName: "ООО «Тестовый продакшн»",
        positionTitle: "Кастинг-директор",
        filmography: "Сериал «Пример», реклама «Бренд»",
        moderationStatus: ModerationStatus.APPROVED,
      },
    }));

  let firstActorProfileId: string | null = null;

  for (const a of ACTORS_SEED) {
    const user = await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: {
        email: a.email,
        passwordHash,
        role: UserRole.ACTOR,
      },
    });

    const existing = await prisma.actorProfile.findUnique({ where: { userId: user.id } });
    if (!existing) {
      const profile = await prisma.actorProfile.create({
        data: {
          userId: user.id,
          fullName: a.fullName,
          birthDate: a.birthDate,
          gender: a.gender,
          heightCm: a.heightCm,
          weightKg: a.weightKg,
          bodyType: a.bodyType,
          ethnicAppearance: a.ethnicAppearance,
          tattooPiercingOption: a.tattooPiercingOption,
          facialHairOption: a.facialHairOption,
          languages: a.languages,
          professionalSkillKeys: a.professionalSkillKeys,
          bio: a.bio,
          cityId: moscow.id,
          moderationStatus: ModerationStatus.APPROVED,
        },
      });
      if (a.email === "actor@moscasting.local") firstActorProfileId = profile.id;
    } else if (a.email === "actor@moscasting.local") {
      firstActorProfileId = existing.id;
    }
  }

  if (!firstActorProfileId) {
    const maria = await prisma.actorProfile.findFirst({
      where: { user: { email: "actor@moscasting.local" } },
    });
    firstActorProfileId = maria?.id ?? null;
  }

  for (const c of CASTINGS_SEED) {
    const exists = await prisma.casting.findFirst({
      where: { producerProfileId: producerProfile.id, title: c.title },
    });
    if (exists) continue;

    const now = Date.now();
    const cx = c as typeof c & {
      castingCategory?: CastingCategory;
      metroOrPlace?: string;
      shootStartTime?: string;
      workHoursNote?: string;
      roleRequirementsJson?: Prisma.InputJsonValue;
    };
    const casting = await prisma.casting.create({
      data: {
        producerProfileId: producerProfile.id,
        title: c.title,
        description: c.description,
        cityId: moscow.id,
        paymentInfo: c.paymentInfo,
        paymentRub: c.paymentRub,
        status: CastingStatus.ACTIVE,
        moderationStatus: ModerationStatus.APPROVED,
        applicationDeadline: new Date(now + c.daysToDeadline * 24 * 60 * 60 * 1000),
        scheduledAt: new Date(now + c.daysToShoot * 24 * 60 * 60 * 1000),
        projectType: c.projectType,
        candidateRequirements: c.candidateRequirements,
        slotsNeeded: c.slotsNeeded,
        castingCategory: cx.castingCategory,
        metroOrPlace: cx.metroOrPlace,
        shootStartTime: cx.shootStartTime,
        workHoursNote: cx.workHoursNote,
        roleRequirementsJson: cx.roleRequirementsJson,
      },
    });

    if (c.title === "Массовка — улица Тверская" && firstActorProfileId) {
      const dup = await prisma.application.findUnique({
        where: {
          castingId_actorProfileId: {
            castingId: casting.id,
            actorProfileId: firstActorProfileId,
          },
        },
      });
      if (!dup) {
        const application = await prisma.application.create({
          data: {
            castingId: casting.id,
            actorProfileId: firstActorProfileId,
            producerProfileId: producerProfile.id,
            status: ApplicationStatus.SUBMITTED,
            coverNote: "Готова выйти на съёмку в указанные даты.",
          },
        });
        await prisma.chat.create({ data: { applicationId: application.id } });
        await prisma.casting.update({
          where: { id: casting.id },
          data: { applicationsCount: 1 },
        });
      }
    }
  }

  const castingsForHome = await prisma.casting.findMany({
    where: { producerProfileId: producerProfile.id },
    orderBy: { createdAt: "asc" },
    take: 6,
  });
  for (let i = 0; i < castingsForHome.length; i++) {
    const pos = i + 1;
    await prisma.homepageFeaturedCasting.upsert({
      where: { position: pos },
      update: { castingId: castingsForHome[i].id },
      create: { position: pos, castingId: castingsForHome[i].id },
    });
  }

  const actorsForHome = await prisma.actorProfile.findMany({
    where: { cityId: moscow.id, moderationStatus: ModerationStatus.APPROVED },
    orderBy: { createdAt: "asc" },
    take: 6,
  });
  for (let i = 0; i < actorsForHome.length; i++) {
    const pos = i + 1;
    await prisma.homepageFeaturedActor.upsert({
      where: { position: pos },
      update: { actorProfileId: actorsForHome[i].id },
      create: { position: pos, actorProfileId: actorsForHome[i].id },
    });
  }

  console.log("Seed OK.");
  console.log(
    "Админ: admin@moscasting.local | Продюсер: producer@moscasting.local | Актёры: actor@ + demo-actor-2..12@",
  );
  console.log("Пароль везде: password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
