"use client";

import { Children, useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

const DEFAULT_PAGE_MOBILE = 4;
/** Совпадает с breakpoint `md` в Tailwind */
const DEFAULT_PAGE_DESKTOP = 8;

function useAdminResponsivePageSize(mobile: number, desktop: number) {
  const [pageSize, setPageSize] = useState(mobile);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const apply = () => setPageSize(mql.matches ? desktop : mobile);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [mobile, desktop]);
  return pageSize;
}

export type AdminPaginatedCardListProps = {
  children: ReactNode;
  /** По умолчанию 4 (< md) */
  pageSizeMobile?: number;
  /** По умолчанию 8 (от md) */
  pageSizeDesktop?: number;
};

/**
 * Пагинация карточек в админке. Принимает карточки как children (RSC → client).
 * По умолчанию: 4 на мобиле, 8 от md (обучение / портфолио).
 */
export function AdminPaginatedCardList({
  children,
  pageSizeMobile = DEFAULT_PAGE_MOBILE,
  pageSizeDesktop = DEFAULT_PAGE_DESKTOP,
}: AdminPaginatedCardListProps) {
  const items = useMemo(
    () =>
      Children.toArray(children).filter(
        (c) => c != null && typeof c !== "boolean",
      ),
    [children],
  );
  const pageSize = useAdminResponsivePageSize(pageSizeMobile, pageSizeDesktop);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const sliceStart = (safePage - 1) * pageSize;
  const visible = items.slice(sliceStart, sliceStart + pageSize);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-4">{visible}</div>
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
