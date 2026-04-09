"use client";

import Link from "next/link";
import type { CastingPaymentPeriod } from "@/lib/casting-payment-period";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProducerCastingCardActions } from "@/components/producer-casting-card-actions";
import { ProducerCastingSpecGrid } from "@/components/producer-casting-spec-grid";
import { useProducerCastingsPageSize } from "@/hooks/use-producer-castings-page-size";
import { useScrollTopOnPageChange } from "@/hooks/use-scroll-top-on-page-change";
import { formatShootDateParts } from "@/lib/casting-display";
import { formatCastingPaymentLine } from "@/lib/casting-payment-display";

export type ProducerCastingListItem = {
  id: string;
  title: string;
  cityName: string;
  metroStation: string | null;
  addressLine: string | null;
  metroOrPlace: string | null;
  paymentRub: number | null;
  paymentInfo: string | null;
  paymentPeriod: CastingPaymentPeriod | null;
  shootStartTime: string | null;
  scheduledAtIso: string | null;
  shootDatesYmd: string[] | null;
  applicationDeadlineIso: string | null;
  description: string;
  moderationComment: string | null;
};

function formatDtShort(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function CastingListCard({ c, showComplete }: { c: ProducerCastingListItem; showComplete?: boolean }) {
  const loc =
    [c.metroStation, c.addressLine].filter(Boolean).join(" · ") || c.metroOrPlace || "—";
  const pay = formatCastingPaymentLine(c.paymentRub, c.paymentInfo, c.paymentPeriod) || "—";
  const { dateLine, timeLine } = formatShootDateParts(c.scheduledAtIso, c.shootStartTime, c.shootDatesYmd);
  const shootSummary =
    [dateLine, timeLine].filter(Boolean).join(", ") || formatDtShort(c.scheduledAtIso);

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="space-y-3 p-3 sm:space-y-3 sm:p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h3 className="min-w-0 text-base font-semibold leading-snug sm:text-lg">
            <Link href={`/producer/castings/${c.id}`} className="text-foreground hover:text-primary hover:underline">
              {c.title}
            </Link>
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">{c.cityName}</span>
        </div>

        <ProducerCastingSpecGrid
          rows={[
            { label: "Съёмка", value: shootSummary },
            { label: "Локация", value: loc, span: "full" },
            { label: "Оплата", value: pay, span: "full" },
            { label: "Приём откликов до", value: formatDtShort(c.applicationDeadlineIso) },
          ]}
        />

        {c.moderationComment ? (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">
            {c.moderationComment}
          </p>
        ) : null}

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{c.description}</p>

        <ProducerCastingCardActions castingId={c.id} showComplete={showComplete} />
      </CardContent>
    </Card>
  );
}

export function ProducerCastingsPaginatedList({
  items,
  showComplete,
}: {
  items: ProducerCastingListItem[];
  showComplete?: boolean;
}) {
  const pageSize = useProducerCastingsPageSize();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [pageSize, items.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useScrollTopOnPageChange(safePage);

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {slice.map((c) => (
          <CastingListCard key={c.id} c={c} showComplete={showComplete} />
        ))}
      </div>
      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 min-w-[5.5rem]"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Назад
          </Button>
          <span className="px-2 text-sm tabular-nums text-muted-foreground">
            {safePage} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 min-w-[5.5rem]"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Вперёд
          </Button>
        </div>
      ) : null}
    </div>
  );
}
