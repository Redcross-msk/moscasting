import { ApplicationStatus, CastingStatus, ModerationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { calculateAge } from "@/lib/utils";
import { createInAppNotification } from "@/server/services/notification.service";

export async function applyToCasting(params: {
  castingId: string;
  actorProfileId: string;
  coverNote?: string;
}): Promise<{ application: { id: string }; chatId: string }> {
  const casting = await prisma.casting.findFirst({
    where: {
      id: params.castingId,
      deletedAt: null,
      status: CastingStatus.ACTIVE,
      moderationStatus: ModerationStatus.APPROVED,
    },
    include: { producerProfile: true },
  });
  if (!casting) throw new Error("Кастинг недоступен");

  const existing = await prisma.application.findUnique({
    where: {
      castingId_actorProfileId: {
        castingId: params.castingId,
        actorProfileId: params.actorProfileId,
      },
    },
  });
  if (existing) throw new Error("Вы уже откликались на этот кастинг");

  const result = await prisma.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        castingId: params.castingId,
        actorProfileId: params.actorProfileId,
        producerProfileId: casting.producerProfileId,
        coverNote: params.coverNote,
        status: ApplicationStatus.SUBMITTED,
      },
    });
    const chat = await tx.chat.create({ data: { applicationId: app.id } });
    await tx.casting.update({
      where: { id: params.castingId },
      data: { applicationsCount: { increment: 1 } },
    });

    const actor = await tx.actorProfile.findUnique({
      where: { id: params.actorProfileId },
      include: { city: true },
    });
    if (!actor) throw new Error("Профиль актёра не найден");

    const age = calculateAge(new Date(actor.birthDate));
    const payload: Prisma.InputJsonValue = {
      kind: "actor_profile",
      actorProfileId: actor.id,
      fullName: actor.fullName,
      cityName: actor.city.name,
      age,
      heightCm: actor.heightCm,
      weightKg: actor.weightKg,
    };
    const body =
      params.coverNote?.trim() ||
      "Здравствуйте! Прикрепляю профиль к отклику. Буду рад обсудить детали.";

    await tx.message.create({
      data: {
        chatId: chat.id,
        senderId: actor.userId,
        body,
        payload,
      },
    });

    return { application: app, chatId: chat.id };
  });

  return result;
}

/** Продюсер открывает чат с актёром по выбранному кастингу: создаёт отклик + чат или ведёт в существующий. */
export async function ensureProducerInvitationApplication(params: {
  castingId: string;
  actorProfileId: string;
  producerUserId: string;
}) {
  const producer = await prisma.producerProfile.findUnique({
    where: { userId: params.producerUserId },
    select: { id: true, fullName: true, companyName: true },
  });
  if (!producer) throw new Error("Профиль продюсера не найден");

  const casting = await prisma.casting.findFirst({
    where: {
      id: params.castingId,
      producerProfileId: producer.id,
      deletedAt: null,
      status: CastingStatus.ACTIVE,
      moderationStatus: ModerationStatus.APPROVED,
    },
    select: { id: true, title: true },
  });
  if (!casting) throw new Error("Кастинг недоступен или не принадлежит вам");

  const existing = await prisma.application.findUnique({
    where: {
      castingId_actorProfileId: {
        castingId: params.castingId,
        actorProfileId: params.actorProfileId,
      },
    },
    include: { chat: true },
  });

  if (existing) {
    if (existing.chat) {
      return { chatId: existing.chat.id, created: false };
    }
    const chat = await prisma.chat.create({ data: { applicationId: existing.id } });
    return { chatId: chat.id, created: false };
  }

  const actor = await prisma.actorProfile.findUnique({
    where: { id: params.actorProfileId },
    select: { userId: true, fullName: true },
  });
  if (!actor) throw new Error("Актёр не найден");

  const { chat } = await prisma.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        castingId: params.castingId,
        actorProfileId: params.actorProfileId,
        producerProfileId: producer.id,
        coverNote: "Приглашение от продюсера обсудить проект",
        status: ApplicationStatus.SUBMITTED,
      },
    });
    const c = await tx.chat.create({ data: { applicationId: app.id } });
    await tx.casting.update({
      where: { id: params.castingId },
      data: { applicationsCount: { increment: 1 } },
    });
    return { app, chat: c };
  });

  await createInAppNotification({
    userId: actor.userId,
    title: "Приглашение обсудить проект",
    body: `«${producer.companyName || producer.fullName}» пригласил вас по кастингу «${casting.title}». Откройте чат в откликах.`,
    payload: { type: "producer_invite", castingId: casting.id },
  });

  return { chatId: chat.id, created: true };
}

export async function listApplicationsForActor(actorProfileId: string) {
  return prisma.application.findMany({
    where: { actorProfileId },
    orderBy: { createdAt: "desc" },
    include: {
      casting: {
        include: {
          city: true,
          producerProfile: { select: { id: true, companyName: true, fullName: true } },
        },
      },
      reviews: true,
      chat: { select: { id: true } },
    },
  });
}

export async function listApplicationsForCasting(castingId: string, producerProfileId: string) {
  const casting = await prisma.casting.findFirst({
    where: { id: castingId, producerProfileId, deletedAt: null },
  });
  if (!casting) throw new Error("Casting not found");

  return prisma.application.findMany({
    where: { castingId },
    orderBy: { createdAt: "desc" },
    include: {
      actorProfile: {
        include: { city: true, user: { select: { id: true, email: true } } },
      },
      chat: { select: { id: true } },
      reviews: true,
    },
  });
}

export async function getApplicationForUser(applicationId: string, userId: string, role: "ACTOR" | "PRODUCER") {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      casting: true,
      actorProfile: { include: { user: true } },
      producerProfile: { include: { user: true } },
      chat: true,
    },
  });
  if (!app) return null;

  if (role === "ACTOR" && app.actorProfile.userId !== userId) return null;
  if (role === "PRODUCER" && app.producerProfile.userId !== userId) return null;

  return app;
}

export async function markApplicationViewed(applicationId: string, producerUserId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { producerProfile: true },
  });
  if (!app || app.producerProfile.userId !== producerUserId) throw new Error("Forbidden");

  return prisma.application.update({
    where: { id: applicationId },
    data: {
      viewedAt: app.viewedAt ?? new Date(),
      status:
        app.status === ApplicationStatus.SUBMITTED ? ApplicationStatus.VIEWED : app.status,
    },
  });
}

export async function markCastPassed(applicationId: string, producerUserId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      producerProfile: true,
      actorProfile: { include: { user: true } },
      casting: { select: { title: true } },
    },
  });
  if (!app || app.producerProfile.userId !== producerUserId) throw new Error("Forbidden");

  if (app.status === ApplicationStatus.WITHDRAWN || app.status === ApplicationStatus.REJECTED) {
    throw new Error("Нельзя подтвердить этот отклик");
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: ApplicationStatus.CAST_PASSED,
      castPassedAt: new Date(),
    },
  });

  await createInAppNotification({
    userId: app.actorProfile.userId,
    title: "Кастинг пройден",
    body: `Продюсер подтвердил участие: «${app.casting.title}». Можно оставить отзыв.`,
    payload: { type: "application_cast_passed", applicationId },
  });

  return updated;
}

export async function withdrawApplication(applicationId: string, actorUserId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { actorProfile: true },
  });
  if (!app || app.actorProfile.userId !== actorUserId) throw new Error("Forbidden");
  if (app.status === ApplicationStatus.CAST_PASSED) throw new Error("Нельзя отозвать после подтверждения");
  if (app.status === ApplicationStatus.WITHDRAWN) return app;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.WITHDRAWN,
        withdrawnAt: new Date(),
      },
    });
    await tx.casting.update({
      where: { id: app.castingId },
      data: { applicationsCount: { decrement: 1 } },
    });
    return updated;
  });
}

const REJECT_CHAT_MESSAGE =
  "Извините, сейчас мы не готовы пригласить вас на этот проект. Мы ждём ваши отклики на следующие кастинги — следите за обновлениями на площадке.";

export async function rejectApplication(applicationId: string, producerUserId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      producerProfile: true,
      actorProfile: { include: { user: true } },
      casting: { select: { title: true } },
      chat: true,
    },
  });
  if (!app || app.producerProfile.userId !== producerUserId) throw new Error("Forbidden");

  if (app.status === ApplicationStatus.REJECTED) return app;

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.REJECTED,
        rejectedAt: new Date(),
      },
    });
    if (app.chat && !app.chat.closedAt) {
      await tx.message.create({
        data: {
          chatId: app.chat.id,
          senderId: producerUserId,
          body: REJECT_CHAT_MESSAGE,
          payload: { kind: "system_template", template: "casting_reject" },
        },
      });
      await tx.chat.update({
        where: { id: app.chat.id },
        data: { closedAt: new Date(), updatedAt: new Date() },
      });
    }
    return u;
  });

  await createInAppNotification({
    userId: app.actorProfile.userId,
    title: "Ответ по отклику",
    body: `По кастингу «${app.casting.title}»: чат закрыт. ${REJECT_CHAT_MESSAGE.slice(0, 80)}…`,
    payload: { type: "application_rejected", applicationId },
  });

  return updated;
}

/** «Принять в проект»: статус INVITED, в чат уходит карточка с деталями съёмки. */
export async function acceptToProjectApplication(applicationId: string, producerUserId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      producerProfile: true,
      actorProfile: { include: { user: true } },
      casting: true,
      chat: true,
    },
  });
  if (!app || app.producerProfile.userId !== producerUserId) throw new Error("Forbidden");
  if (app.chat?.closedAt) throw new Error("Чат закрыт");
  if (app.status === ApplicationStatus.REJECTED || app.status === ApplicationStatus.WITHDRAWN) {
    throw new Error("Отклик недоступен");
  }
  if (app.status === ApplicationStatus.INVITED || app.status === ApplicationStatus.CAST_PASSED) {
    throw new Error("Уже принято в проект");
  }

  const c = app.casting;
  const city = await prisma.city.findUnique({ where: { id: c.cityId }, select: { name: true } });
  const payload: Prisma.InputJsonValue = {
    kind: "casting_invite_details",
    castingId: c.id,
    title: c.title,
    scheduledAt: c.scheduledAt ? c.scheduledAt.toISOString() : null,
    shootStartTime: c.shootStartTime,
    metroStation: c.metroStation,
    addressLine: c.addressLine,
    metroOrPlace: c.metroOrPlace,
    workHoursNote: c.workHoursNote,
    paymentInfo: c.paymentInfo,
    paymentRub: c.paymentRub,
    cityName: city?.name ?? "",
  };

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.INVITED, invitedAt: new Date() },
    });
    if (app.chat) {
      await tx.message.create({
        data: {
          chatId: app.chat.id,
          senderId: producerUserId,
          body: "Вы приглашены в проект. Ниже детали съёмки — время, место и условия.",
          payload,
        },
      });
      await tx.chat.update({
        where: { id: app.chat.id },
        data: { updatedAt: new Date() },
      });
    }
  });

  await createInAppNotification({
    userId: app.actorProfile.userId,
    title: "Приглашение в проект",
    body: `По кастингу «${c.title}» вам отправлены детали съёмки в чате.`,
    payload: { type: "application_invited", applicationId },
  });

  return prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
}
