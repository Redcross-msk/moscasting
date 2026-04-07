import type { ReactNode } from "react";
import Link from "next/link";
import type { CastingInviteDetailsPayload } from "@/lib/message-payload";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:items-baseline sm:gap-x-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:normal-case sm:tracking-normal">
        {label}
      </div>
      <div className="min-w-0 break-words text-sm text-foreground">{children}</div>
    </div>
  );
}

export function CastingInviteMessageCard({ data }: { data: CastingInviteDetailsPayload }) {
  const when = data.scheduledAt
    ? new Intl.DateTimeFormat("ru-RU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(data.scheduledAt))
    : null;

  const place =
    [data.metroStation, data.addressLine].filter(Boolean).join(" · ") || data.metroOrPlace || null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm sm:p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Детали съёмки</p>
      <p className="mt-1 text-sm font-semibold leading-snug text-foreground">{data.title}</p>
      <div className="mt-2.5 space-y-2 sm:space-y-2.5" role="list">
        {data.cityName ? <Row label="Город">{data.cityName}</Row> : null}
        {when ? <Row label="Дата и время">{when}</Row> : null}
        {data.shootStartTime ? <Row label="Сбор / старт">{data.shootStartTime}</Row> : null}
        {place ? <Row label="Место">{place}</Row> : null}
        {data.workHoursNote ? <Row label="Смена">{data.workHoursNote}</Row> : null}
        {(data.paymentRub != null || data.paymentInfo) && (
          <Row label="Оплата">
            {data.paymentRub != null ? `${data.paymentRub.toLocaleString("ru-RU")} ₽` : null}
            {data.paymentRub != null && data.paymentInfo ? " · " : null}
            {data.paymentInfo}
          </Row>
        )}
      </div>
      <Link
        href={`/castings/${data.castingId}`}
        className="mt-2.5 inline-block text-xs font-medium text-primary hover:underline"
      >
        Открыть кастинг в каталоге
      </Link>
    </div>
  );
}
