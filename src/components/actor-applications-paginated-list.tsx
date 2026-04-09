"use client";

import { useEffect, useMemo, useState } from "react";
import type { ApplicationStatus } from "@prisma/client";
import { ActorApplicationCatalogCard } from "@/components/actor-application-catalog-card";
import { Button } from "@/components/ui/button";
import { useActorApplicationsPageSize } from "@/hooks/use-applications-page-size";
import { useScrollTopOnPageChange } from "@/hooks/use-scroll-top-on-page-change";
import type { SerializedHomeCasting } from "@/components/home-public-browse";

export type ActorApplicationListRow = {
  applicationId: string;
  status: ApplicationStatus;
  chatId: string | null;
  coverNote: string | null;
  c: SerializedHomeCasting;
};

export function ActorApplicationsPaginatedList({ rows }: { rows: ActorApplicationListRow[] }) {
  const pageSize = useActorApplicationsPageSize();
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

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Пока нет откликов — загляните в каталог кастингов.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {slice.map((row) => (
          <div key={row.applicationId} className="space-y-3">
            <ActorApplicationCatalogCard
              c={row.c}
              applicationId={row.applicationId}
              status={row.status}
              chatId={row.chatId}
              coverNote={row.coverNote}
            />
          </div>
        ))}
      </div>
      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border/60 pt-6">
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
