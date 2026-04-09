"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CastingRow, type SerializedHomeCasting } from "@/components/home-public-browse";
import { Button } from "@/components/ui/button";
import { useCastingHistoryPageSize } from "@/hooks/use-casting-history-page-size";
import { useScrollTopOnPageChange } from "@/hooks/use-scroll-top-on-page-change";

const STATUS_RU: Record<string, string> = {
  ACCEPTED: "Принят",
  INVITED: "Приглашение",
  CAST_PASSED: "Кастинг пройден",
};

export function CastingHistoryList({
  rows,
  canBrowse = true,
}: {
  rows: { serialized: SerializedHomeCasting; status: string }[];
  /** Для витрины: гости не открывают карточку кастинга без входа */
  canBrowse?: boolean;
}) {
  const router = useRouter();
  const pageSize = useCastingHistoryPageSize();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useScrollTopOnPageChange(safePage);

  const onNeedAuth = () => {
    void router.push("/login");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {slice.map(({ serialized, status }) => (
          <CastingRow
            key={serialized.id}
            c={serialized}
            canBrowse={canBrowse}
            loading={false}
            onNeedAuth={onNeedAuth}
            historyMode
            statusFooter={STATUS_RU[status] ?? status}
          />
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
