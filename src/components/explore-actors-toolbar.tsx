"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SortKey = "new" | "young" | "old";

function buildActorsQuery(params: {
  sort: SortKey;
  ageMin: string;
  ageMax: string;
  gender: string;
  heightMin: string;
  heightMax: string;
  page: number;
}): string {
  const q = new URLSearchParams();
  q.set("tab", "actors");
  q.set("aSort", params.sort);
  if (params.ageMin.trim()) q.set("ageMin", params.ageMin.trim());
  if (params.ageMax.trim()) q.set("ageMax", params.ageMax.trim());
  if (params.gender === "MALE" || params.gender === "FEMALE") q.set("gender", params.gender);
  if (params.heightMin.trim()) q.set("heightMin", params.heightMin.trim());
  if (params.heightMax.trim()) q.set("heightMax", params.heightMax.trim());
  if (params.page > 1) q.set("page", String(params.page));
  return `/explore?${q.toString()}`;
}

export function ExploreActorsToolbar({
  sort,
  ageMin: ageMinInit,
  ageMax: ageMaxInit,
  gender: genderInit,
  heightMin: heightMinInit,
  heightMax: heightMaxInit,
  totalCount,
}: {
  sort: SortKey;
  ageMin?: string;
  ageMax?: string;
  gender?: string;
  heightMin?: string;
  heightMax?: string;
  totalCount: number;
}) {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSort, setDraftSort] = useState<SortKey>(sort);
  const [draftAgeMin, setDraftAgeMin] = useState(ageMinInit ?? "");
  const [draftAgeMax, setDraftAgeMax] = useState(ageMaxInit ?? "");
  const [draftGender, setDraftGender] = useState(genderInit ?? "");
  const [draftHeightMin, setDraftHeightMin] = useState(heightMinInit ?? "");
  const [draftHeightMax, setDraftHeightMax] = useState(heightMaxInit ?? "");

  useEffect(() => {
    setDraftSort(sort);
    setDraftAgeMin(ageMinInit ?? "");
    setDraftAgeMax(ageMaxInit ?? "");
    setDraftGender(genderInit ?? "");
    setDraftHeightMin(heightMinInit ?? "");
    setDraftHeightMax(heightMaxInit ?? "");
  }, [sort, ageMinInit, ageMaxInit, genderInit, heightMinInit, heightMaxInit]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      ageMinInit ||
        ageMaxInit ||
        (genderInit && (genderInit === "MALE" || genderInit === "FEMALE")) ||
        heightMinInit ||
        heightMaxInit,
    );
  }, [ageMinInit, ageMaxInit, genderInit, heightMinInit, heightMaxInit]);

  function applyFilters() {
    const href = buildActorsQuery({
      sort: draftSort,
      ageMin: draftAgeMin,
      ageMax: draftAgeMax,
      gender: draftGender,
      heightMin: draftHeightMin,
      heightMax: draftHeightMax,
      page: 1,
    });
    setFilterOpen(false);
    router.push(href);
  }

  function resetFilters() {
    setDraftSort("new");
    setDraftAgeMin("");
    setDraftAgeMax("");
    setDraftGender("");
    setDraftHeightMin("");
    setDraftHeightMax("");
    router.push(`/explore?tab=actors&aSort=new`);
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
            <Link href="/explore?tab=actors&aSort=new">
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
            <DialogTitle>Фильтр актёров</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="filter-sort">Порядок списка</Label>
              <select
                id="filter-sort"
                value={draftSort}
                onChange={(e) => setDraftSort(e.target.value as SortKey)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="new">По дате профиля (новые)</option>
                <option value="young">Сначала моложе</option>
                <option value="old">Сначала старше</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ageMin">Возраст от</Label>
                <Input
                  id="ageMin"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  placeholder="лет"
                  value={draftAgeMin}
                  onChange={(e) => setDraftAgeMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageMax">Возраст до</Label>
                <Input
                  id="ageMax"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  placeholder="лет"
                  value={draftAgeMax}
                  onChange={(e) => setDraftAgeMax(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Пол</Label>
              <select
                id="gender"
                value={draftGender}
                onChange={(e) => setDraftGender(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Любой</option>
                <option value="MALE">Мужской</option>
                <option value="FEMALE">Женский</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="heightMin">Рост от (см)</Label>
                <Input
                  id="heightMin"
                  type="number"
                  inputMode="numeric"
                  min={100}
                  max={250}
                  placeholder="см"
                  value={draftHeightMin}
                  onChange={(e) => setDraftHeightMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heightMax">Рост до (см)</Label>
                <Input
                  id="heightMax"
                  type="number"
                  inputMode="numeric"
                  min={100}
                  max={250}
                  placeholder="см"
                  value={draftHeightMax}
                  onChange={(e) => setDraftHeightMax(e.target.value)}
                />
              </div>
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

export function ExploreActorsPagination({
  page,
  totalPages,
  sort,
  ageMin,
  ageMax,
  gender,
  heightMin,
  heightMax,
}: {
  page: number;
  totalPages: number;
  sort: SortKey;
  ageMin?: string;
  ageMax?: string;
  gender?: string;
  heightMin?: string;
  heightMax?: string;
}) {
  if (totalPages <= 1) return null;

  const pageLink = (p: number) =>
    buildActorsQuery({
      sort,
      ageMin: ageMin ?? "",
      ageMax: ageMax ?? "",
      gender: gender ?? "",
      heightMin: heightMin ?? "",
      heightMax: heightMax ?? "",
      page: p,
    });

  return (
    <nav
      className="flex min-w-0 flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:pt-6"
      aria-label="Страницы каталога актёров"
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
