import type { ReactNode } from "react";
import Link from "next/link";
import type { CastingInviteDetailsPayload } from "@/lib/message-payload";
import { formatShootDateTimeRu } from "@/lib/casting-display";
import { formatCastingPaymentLine } from "@/lib/casting-payment-display";

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
  const when = formatShootDateTimeRu(data.scheduledAt, data.shootStartTime, data.shootDates);
  const payLine = formatCastingPaymentLine(data.paymentRub, data.paymentInfo, data.paymentPeriod);

  const place =
    [data.metroStation, data.addressLine].filter(Boolean).join(" · ") || data.metroOrPlace || null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm sm:p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Детали съёмки</p>
      <p className="mt-1 text-sm font-semibold leading-snug text-foreground">{data.title}</p>
      <div className="mt-2.5 space-y-2 sm:space-y-2.5" role="list">
        {data.cityName ? <Row label="Город">{data.cityName}</Row> : null}
        {when ? <Row label="Дата съёмки">{when}</Row> : null}
        {place ? <Row label="Место">{place}</Row> : null}
        {data.workHoursNote ? <Row label="Смена">{data.workHoursNote}</Row> : null}
        {payLine ? <Row label="Оплата">{payLine}</Row> : null}
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
