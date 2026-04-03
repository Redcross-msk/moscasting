"use client";

import Link from "next/link";
import type { ApplicationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SerializedHomeCasting } from "@/components/home-public-browse";
import { castingCategoryLabelRu, formatShootDateTimeRu, type SerializedRoleReq } from "@/lib/casting-display";
import { castingLocationParts } from "@/lib/casting-location-lines";
import { WithdrawButton } from "@/app/actor/applications/withdraw-button";

function RoleReqBlock({ r }: { r: SerializedRoleReq }) {
  if (r.type === "mass") {
    return <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">{r.text}</p>;
  }
  if (r.type === "solo") {
    return <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">{r.text}</p>;
  }
  return (
    <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
      {r.roles.map((role, i) => (
        <li key={i} className="line-clamp-2">
          <span className="font-medium text-foreground/80">Роль {i + 1}:</span> {role}
        </li>
      ))}
    </ul>
  );
}

const WITHDRAWN_BLOCKED = new Set<ApplicationStatus>(["WITHDRAWN", "CAST_PASSED", "REJECTED"]);

export function ActorApplicationCatalogCard({
  c,
  applicationId,
  status,
  chatId,
  coverNote,
}: {
  c: SerializedHomeCasting;
  applicationId: string;
  status: ApplicationStatus;
  chatId: string | null;
  coverNote: string | null;
}) {
  const paymentLine =
    c.paymentRub != null ? (
      <span className="text-base font-bold tabular-nums text-foreground">
        {c.paymentRub.toLocaleString("ru-RU")} ₽
      </span>
    ) : c.paymentInfo ? (
      <span className="text-sm font-semibold text-foreground">{c.paymentInfo}</span>
    ) : null;

  const producerName = c.producerProfile.fullName?.trim() || c.producerProfile.companyName || "Продюсер";
  const scheduleLine = formatShootDateTimeRu(c.scheduledAt, c.shootStartTime);
  const loc = castingLocationParts({
    metroStation: c.metroStation,
    addressLine: c.addressLine,
    metroOrPlace: c.metroOrPlace,
  });

  const canWithdraw = !WITHDRAWN_BLOCKED.has(status);

  const mainCatalog = (
    <div className="relative min-w-0 flex-1 space-y-2 border-l-4 border-primary pl-4 pr-2 md:pr-4">
      <div>
        <p className="text-lg font-semibold text-foreground group-hover/cast:text-primary group-hover/cast:underline">
          {c.title}
        </p>
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
      </div>
      {coverNote?.trim() ? (
        <p className="rounded-md border border-dashed border-border/80 bg-muted/20 px-2 py-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Ваш комментарий: </span>«{coverNote.trim()}»
        </p>
      ) : null}
      {scheduleLine ? (
        <p className="text-sm">
          <span className="font-semibold text-foreground">Дата и время съёмки: </span>
          <span className="text-muted-foreground">{scheduleLine}</span>
        </p>
      ) : null}
      {loc.metro ? (
        <p className="text-sm">
          <span className="font-semibold text-foreground">Метро: </span>
          <span className="text-muted-foreground">{loc.metro}</span>
        </p>
      ) : null}
      {loc.address ? (
        <p className="text-sm">
          <span className="font-semibold text-foreground">Адрес: </span>
          <span className="text-muted-foreground">{loc.address}</span>
        </p>
      ) : null}
      {!loc.metro && !loc.address ? (
        loc.legacy ? (
          <p className="text-sm">
            <span className="font-semibold text-foreground">Место: </span>
            <span className="text-muted-foreground">{loc.legacy}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{c.city.name}</p>
        )
      ) : null}
      {c.workHoursNote?.trim() ? (
        <p className="text-sm">
          <span className="font-semibold text-foreground">Рабочие часы: </span>
          <span className="text-muted-foreground">{c.workHoursNote.trim()}</span>
        </p>
      ) : null}
      <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {castingCategoryLabelRu(c.castingCategory)}
        </p>
        {c.roleRequirements ? (
          <RoleReqBlock r={c.roleRequirements} />
        ) : (
          <p className="mt-1 text-xs italic text-muted-foreground">Требования не заполнены</p>
        )}
      </div>
    </div>
  );

  const side = (
    <aside className="flex w-full shrink-0 flex-col items-stretch justify-center gap-3 border-border md:min-w-[200px] md:max-w-[240px] md:border-l md:pl-4">
      <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
        <Badge variant="secondary" className="font-normal">
          {status}
        </Badge>
      </div>
      {paymentLine ? <div className="md:text-right">{paymentLine}</div> : null}
      <Link
        href={`/producers/${c.producerProfile.id}`}
        className="text-sm font-medium text-primary hover:underline md:text-right"
      >
        {producerName}
      </Link>
      <div className="flex flex-col gap-2 md:items-end">
        {chatId ? (
          <Button size="sm" className="w-full md:w-auto md:min-w-[11rem]" asChild>
            <Link href={`/actor/chats?chat=${chatId}`}>Перейти в чат</Link>
          </Button>
        ) : null}
        {canWithdraw ? (
          <WithdrawButton applicationId={applicationId} className="w-full md:w-auto md:min-w-[11rem]" />
        ) : null}
      </div>
    </aside>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/25 md:flex-row md:items-stretch md:gap-6 md:px-5 md:py-4">
        <Link href={`/castings/${c.id}`} className="group/cast min-w-0 flex-1 outline-none">
          {mainCatalog}
        </Link>
        {side}
      </div>
    </div>
  );
}
