"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SortKey = "new" | "old" | "pay_high" | "pay_low" | "shoot_near" | "shoot_far";
type CategoryKey = "" | "MASS" | "GROUP" | "SOLO";

function appendCastingFilters(
  q: URLSearchParams,
  params: { sort: SortKey; q: string; shootDate: string; category: CategoryKey; cPage?: number },
) {
  q.set("tab", "castings");
  q.set("cSort", params.sort);
  const title = params.q.trim();
  if (title) q.set("q", title);
  if (params.shootDate.trim()) q.set("shootDate", params.shootDate.trim());
  if (params.category === "MASS" || params.category === "GROUP" || params.category === "SOLO") {
    q.set("cCat", params.category);
  }
  if (params.cPage != null && params.cPage > 1) q.set("cPage", String(params.cPage));
}

function buildCastingsQuery(params: {
  sort: SortKey;
  q: string;
  shootDate: string;
  category: CategoryKey;
  cPage?: number;
}): string {
  const q = new URLSearchParams();
  appendCastingFilters(q, params);
  return `/explore?${q.toString()}`;
}

export function ExploreCastingsToolbar({
  sort,
  q: qInit,
  shootDate: shootDateInit,
  category: categoryInit,
  totalCount,
}: {
  sort: SortKey;
  q?: string;
  shootDate?: string;
  category?: string;
  totalCount: number;
}) {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSort, setDraftSort] = useState<SortKey>(sort);
  const [draftQ, setDraftQ] = useState(qInit ?? "");
  const [draftShootDate, setDraftShootDate] = useState(shootDateInit ?? "");
  const [draftCategory, setDraftCategory] = useState<CategoryKey>(() => {
    const c = categoryInit ?? "";
    return c === "MASS" || c === "GROUP" || c === "SOLO" ? c : "";
  });

  useEffect(() => {
    setDraftSort(sort);
    setDraftQ(qInit ?? "");
    setDraftShootDate(shootDateInit ?? "");
    const c = categoryInit ?? "";
    setDraftCategory(c === "MASS" || c === "GROUP" || c === "SOLO" ? c : "");
  }, [sort, qInit, shootDateInit, categoryInit]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (qInit && qInit.trim()) ||
        (shootDateInit && shootDateInit.trim()) ||
        (categoryInit && (categoryInit === "MASS" || categoryInit === "GROUP" || categoryInit === "SOLO")),
    );
  }, [qInit, shootDateInit, categoryInit]);

  function applyFilters() {
    const href = buildCastingsQuery({
      sort: draftSort,
      q: draftQ,
      shootDate: draftShootDate,
      category: draftCategory,
      cPage: 1,
    });
    setFilterOpen(false);
    router.push(href);
  }

  function resetFilters() {
    setDraftSort("new");
    setDraftQ("");
    setDraftShootDate("");
    setDraftCategory("");
    router.push("/explore?tab=castings&cSort=new");
    setFilterOpen(false);
  }

  return (
    <>
      <div className="flex flex-nowrap items-center justify-end gap-2 sm:gap-3">
        <Button
          type="button"
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          className="shrink-0 gap-2"
          onClick={() => setFilterOpen(true)}
        >
          <Filter className="h-4 w-4" aria-hidden />
          Фильтр
          {hasActiveFilters ? (
            <span className="rounded-full bg-primary-foreground/20 px-1.5 text-[10px] font-semibold">ON</span>
          ) : null}
        </Button>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1 text-muted-foreground"
            asChild
          >
            <Link href="/explore?tab=castings&cSort=new">
              <X className="h-4 w-4" aria-hidden />
              Сбросить
            </Link>
          </Button>
        ) : null}
        <span className="whitespace-nowrap text-xs text-muted-foreground sm:text-sm">
          Найдено: <span className="font-medium text-foreground">{totalCount}</span>
        </span>
      </div>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Фильтр кастингов</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cast-filter-sort">Порядок списка</Label>
              <select
                id="cast-filter-sort"
                value={draftSort}
                onChange={(e) => setDraftSort(e.target.value as SortKey)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="new">По дате публикации (новые)</option>
                <option value="old">По дате публикации (старые)</option>
                <option value="shoot_near">По дате съёмки (сначала ближайшие)</option>
                <option value="shoot_far">По дате съёмки (сначала поздние)</option>
                <option value="pay_high">По оплате за смену (выше)</option>
                <option value="pay_low">По оплате за смену (ниже)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cast-filter-shoot">Дата съёмки</Label>
              <Input
                id="cast-filter-shoot"
                type="date"
                value={draftShootDate}
                onChange={(e) => setDraftShootDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Показать только кастинги с указанной датой съёмки. Очистите поле, чтобы не фильтровать.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cast-filter-cat">Категория</Label>
              <select
                id="cast-filter-cat"
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value as CategoryKey)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Любая</option>
                <option value="MASS">Массовка</option>
                <option value="GROUP">Групповка</option>
                <option value="SOLO">Роль второго плана</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cast-filter-q">Название</Label>
              <Input
                id="cast-filter-q"
                type="search"
                placeholder="Поиск только по названию"
                value={draftQ}
                onChange={(e) => setDraftQ(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setFilterOpen(false)}>
              Отмена
            </Button>
            <Button type="button" variant="secondary" onClick={resetFilters}>
              Сбросить всё
            </Button>
            <Button type="button" onClick={applyFilters}>
              Применить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ExploreCastingsPagination({
  page,
  totalPages,
  sort,
  q,
  shootDate,
  cCat,
}: {
  page: number;
  totalPages: number;
  sort: SortKey;
  q?: string;
  shootDate?: string;
  cCat?: string;
}) {
  if (totalPages <= 1) return null;

  const category: CategoryKey =
    cCat === "MASS" || cCat === "GROUP" || cCat === "SOLO" ? cCat : "";

  const pageLink = (p: number) =>
    buildCastingsQuery({
      sort,
      q: q ?? "",
      shootDate: shootDate ?? "",
      category,
      cPage: p > 1 ? p : undefined,
    });

  return (
    <nav
      className="flex min-w-0 flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:pt-6"
      aria-label="Страницы каталога кастингов"
    >
      <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
        Страница {page} из {totalPages}
      </span>
      <div className="flex max-w-full gap-1 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible sm:pb-0">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={pageLink(p)}
            className={cn(
              "inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md border px-2 text-sm font-medium transition",
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {p}
          </Link>
        ))}
      </div>
    </nav>
  );
}
