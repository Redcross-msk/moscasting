import Link from "next/link";
import { ModerationStatus } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  castingCategoryLabelRu,
  formatShootDateParts,
} from "@/lib/casting-display";
import { formatCastingPaymentLine } from "@/lib/casting-payment-display";
import { parseShootDatesYmdFromJson } from "@/lib/casting-shoot-dates";
import { parseRoleRequirementsJson } from "@/lib/casting-role-json";
import { castingLocationParts } from "@/lib/casting-location-lines";
import type { ReactNode } from "react";
import type { getCastingPublic } from "@/server/services/casting.service";

type CastingPublic = NonNullable<Awaited<ReturnType<typeof getCastingPublic>>>;

function RoleRequirementsFull({ json, category }: { json: unknown; category: CastingPublic["castingCategory"] }) {
  if (!category) {
    return <p className="text-sm italic text-muted-foreground">Категория не указана</p>;
  }
  const p = parseRoleRequirementsJson(json);
  if (category === "MASS" && p.mass?.trim()) {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{p.mass.trim()}</p>;
  }
  if (category === "SOLO" && p.solo?.trim()) {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{p.solo.trim()}</p>;
  }
  if (category === "GROUP") {
    const roles = p.group.map((r) => r.trim()).filter(Boolean);
    if (roles.length === 0) {
      return <p className="text-sm italic text-muted-foreground">Роли не заполнены</p>;
    }
    return (
      <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-foreground">
        {roles.map((role, i) => (
          <li key={i} className="whitespace-pre-wrap pl-1">
            {role}
          </li>
        ))}
      </ol>
    );
  }
  return <p className="text-sm italic text-muted-foreground">Требования не указаны</p>;
}

function Fact({
  label,
  children,
  emphasis,
}: {
  label: string;
  children: ReactNode;
  emphasis?: "date" | "money" | "time" | "default";
}) {
  const box =
    emphasis === "money"
      ? "rounded-md border border-primary/20 bg-primary/[0.06] px-2.5 py-2 sm:rounded-lg sm:px-3 sm:py-2.5"
      : emphasis === "date" || emphasis === "time"
        ? "rounded-md border border-border bg-muted/40 px-2.5 py-2 sm:rounded-lg sm:px-3 sm:py-2.5"
        : "rounded-md border border-border/80 bg-card px-2.5 py-2 sm:rounded-lg sm:px-3 sm:py-2";

  const valClass =
    emphasis === "money"
      ? "mt-0.5 text-base font-bold tabular-nums text-primary sm:mt-1 sm:text-lg"
      : emphasis === "date" || emphasis === "time"
        ? "mt-0.5 text-xs font-semibold text-foreground sm:mt-1 sm:text-sm"
        : "mt-0.5 text-xs text-foreground sm:mt-1 sm:text-sm";

  return (
    <div className={box}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={valClass}>{children}</div>
    </div>
  );
}

export function CastingPublicDetail({
  casting,
  topActions,
}: {
  casting: CastingPublic;
  /** Справа от названия и блока «разместил» — те же размеры кнопок */
  topActions?: ReactNode;
}) {
  const producerName = casting.producerProfile.fullName?.trim() || "Продюсер";
  const shootDates = parseShootDatesYmdFromJson(casting.shootDatesJson);
  const { dateLine, timeLine } = formatShootDateParts(
    casting.scheduledAt?.toISOString() ?? null,
    casting.shootStartTime,
    shootDates,
  );
  const visibleMedia = casting.media.filter(
    (m) => m.publicUrl?.trim() && m.moderationStatus !== ModerationStatus.BLOCKED,
  );
  const loc = castingLocationParts({
    metroStation: casting.metroStation,
    addressLine: casting.addressLine,
    metroOrPlace: casting.metroOrPlace,
  });

  const deadlineStr = casting.applicationDeadline
    ? new Date(casting.applicationDeadline).toLocaleString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:gap-5 sm:pb-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{casting.title}</h1>
          <p className="text-sm text-foreground/80">
            {casting.city.name}
            {typeof casting.viewsCount === "number" ? (
              <span className="text-muted-foreground"> · просмотров: {casting.viewsCount}</span>
            ) : null}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Разместил: </span>
            <Link
              href={`/producers/${casting.producerProfile.id}`}
              className="font-semibold text-primary hover:underline"
            >
              {producerName}
            </Link>
          </p>
        </div>
        {topActions ? (
          <div className="flex w-full max-w-full shrink-0 flex-col gap-2 sm:max-w-[240px] lg:w-56">
            {topActions}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
        <Fact label="Дата съёмки" emphasis="date">
          {dateLine ?? "—"}
        </Fact>
        <Fact label="Время начала" emphasis="time">
          {timeLine ?? "—"}
        </Fact>
        {deadlineStr ? (
          <Fact label="Приём откликов до" emphasis="date">
            {deadlineStr}
          </Fact>
        ) : (
          <Fact label="Приём откликов до" emphasis="date">
            —
          </Fact>
        )}
        {casting.workHoursNote?.trim() ? (
          <Fact label="Рабочие часы">{casting.workHoursNote.trim()}</Fact>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Fact label="Оплата" emphasis="money">
          {formatCastingPaymentLine(casting.paymentRub, casting.paymentInfo, casting.paymentPeriod) ?? (
            <span className="text-sm font-normal text-muted-foreground">Уточняйте</span>
          )}
        </Fact>
        <Card className="border-border/80 shadow-none">
          <CardContent className="space-y-2 p-4 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Проект</p>
            {casting.projectType?.trim() ? (
              <p>
                <span className="font-medium text-muted-foreground">Тип: </span>
                {casting.projectType.trim()}
              </p>
            ) : (
              <p className="text-muted-foreground">Тип не указан</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loc.metro ? (
          <Fact label="Метро">
            <span>{loc.metro}</span>
          </Fact>
        ) : null}
        {loc.address ? (
          <Fact label="Адрес">
            <span>{loc.address}</span>
          </Fact>
        ) : null}
        {!loc.metro && !loc.address && loc.legacy ? (
          <Fact label="Место">
            <span>{loc.legacy}</span>
          </Fact>
        ) : null}
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Категория и требования</h2>
        <Card className="border-border/80 shadow-none">
          <CardContent className="p-4 pt-4">
            <p className="mb-2 text-xs font-semibold text-primary">{castingCategoryLabelRu(casting.castingCategory)}</p>
            <RoleRequirementsFull json={casting.roleRequirementsJson} category={casting.castingCategory} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Нам требуется</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{casting.description}</p>
      </section>

      {visibleMedia.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Материалы</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMedia.map((m) =>
              m.mimeType?.startsWith("video/") ? (
                <video
                  key={m.id}
                  src={m.publicUrl!}
                  controls
                  className="aspect-video w-full rounded-lg border border-border bg-black object-contain"
                />
              ) : (
                <a
                  key={m.id}
                  href={m.publicUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="overflow-hidden rounded-lg border border-border bg-muted/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.publicUrl!} alt="" className="aspect-video w-full object-cover" />
                </a>
              ),
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
