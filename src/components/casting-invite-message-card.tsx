import Link from "next/link";
import type { CastingInviteDetailsPayload } from "@/lib/message-payload";

export function CastingInviteMessageCard({ data }: { data: CastingInviteDetailsPayload }) {
  const when = data.scheduledAt
    ? new Intl.DateTimeFormat("ru-RU", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(data.scheduledAt))
    : null;

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Детали съёмки</p>
      <p className="mt-1 font-semibold text-foreground">{data.title}</p>
      <dl className="mt-3 space-y-2 text-muted-foreground">
        {data.cityName ? (
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium text-foreground/80">Город</dt>
            <dd>{data.cityName}</dd>
          </div>
        ) : null}
        {when ? (
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium text-foreground/80">Дата и время</dt>
            <dd>{when}</dd>
          </div>
        ) : null}
        {data.shootStartTime ? (
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium text-foreground/80">Сбор / старт</dt>
            <dd className="text-foreground">{data.shootStartTime}</dd>
          </div>
        ) : null}
        {(data.metroStation || data.addressLine || data.metroOrPlace) && (
          <div className="flex flex-col gap-1">
            <dt className="font-medium text-foreground/80">Место</dt>
            <dd className="text-foreground">
              {[data.metroStation, data.addressLine].filter(Boolean).join(" · ") || data.metroOrPlace}
            </dd>
          </div>
        )}
        {data.workHoursNote ? (
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium text-foreground/80">Смена</dt>
            <dd>{data.workHoursNote}</dd>
          </div>
        ) : null}
        {(data.paymentRub != null || data.paymentInfo) && (
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium text-foreground/80">Оплата</dt>
            <dd className="text-foreground">
              {data.paymentRub != null ? `${data.paymentRub.toLocaleString("ru-RU")} ₽` : ""}
              {data.paymentRub != null && data.paymentInfo ? " · " : ""}
              {data.paymentInfo}
            </dd>
          </div>
        )}
      </dl>
      <Link
        href={`/castings/${data.castingId}`}
        className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
      >
        Открыть кастинг в каталоге
      </Link>
    </div>
  );
}
