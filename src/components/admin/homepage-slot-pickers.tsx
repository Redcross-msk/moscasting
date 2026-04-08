"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveHomepageFeaturedActorsAction, saveHomepageFeaturedCastingsAction } from "@/features/admin/actions";

export type HomepageCastingOpt = { id: string; title: string; cityName: string };
export type HomepageActorOpt = { id: string; fullName: string; cityName: string };

function castingLabel(c: HomepageCastingOpt) {
  return `${c.title} (${c.cityName})`;
}

function actorLabel(a: HomepageActorOpt) {
  return `${a.fullName} (${a.cityName})`;
}

export function AdminHomepageCastingsPickForm({
  castings,
  initialByPosition,
}: {
  castings: HomepageCastingOpt[];
  initialByPosition: Record<number, string>;
}) {
  const [vals, setVals] = useState<Record<number, string>>(() => {
    const o: Record<number, string> = {};
    for (let p = 1; p <= 6; p++) o[p] = initialByPosition[p] ?? "";
    return o;
  });
  const [open, setOpen] = useState(false);
  const [pickPos, setPickPos] = useState<number | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return castings;
    return castings.filter(
      (c) => c.title.toLowerCase().includes(t) || c.cityName.toLowerCase().includes(t),
    );
  }, [castings, q]);

  function openPick(p: number) {
    setPickPos(p);
    setQ("");
    setOpen(true);
  }

  function applyPick(id: string) {
    if (pickPos == null) return;
    setVals((v) => ({ ...v, [pickPos]: id }));
    setOpen(false);
    setPickPos(null);
  }

  function displayForSlot(p: number) {
    const id = vals[p] ?? "";
    if (!id) return "— автоматически из каталога —";
    const c = castings.find((x) => x.id === id);
    return c ? castingLabel(c) : `ID: ${id.slice(0, 8)}…`;
  }

  return (
    <>
      <form action={saveHomepageFeaturedCastingsAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((p) => (
            <div key={p} className="space-y-2">
              <Label>Слот {p}</Label>
              <input type="hidden" name={`casting_slot_${p}`} value={vals[p] ?? ""} />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <p className="flex min-h-10 flex-1 items-center truncate rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                  {displayForSlot(p)}
                </p>
                <Button type="button" variant="outline" size="sm" className="shrink-0 sm:w-auto" onClick={() => openPick(p)}>
                  Выбрать
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="submit">Сохранить кастинги</Button>
      </form>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[min(85dvh,30rem)] max-h-[85dvh] w-[calc(100vw-1.25rem)] max-w-lg flex-col gap-4 overflow-hidden p-4 max-sm:top-[5dvh] max-sm:translate-y-0 sm:w-full sm:p-6">
          <DialogHeader className="shrink-0 space-y-1.5 text-left">
            <DialogTitle>Кастинг — слот {pickPos ?? "—"}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Поиск по названию или городу…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            inputMode="search"
            enterKeyHint="search"
            className="h-11 shrink-0 text-base"
          />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain rounded-md border border-border [-webkit-overflow-scrolling:touch]">
            <button
              type="button"
              className="block w-full border-b px-3 py-2.5 text-left text-sm hover:bg-muted"
              onClick={() => applyPick("")}
            >
              — Очистить (автоматически из каталога) —
            </button>
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                className="block w-full border-b px-3 py-2.5 text-left text-sm hover:bg-muted"
                onClick={() => applyPick(c.id)}
              >
                {castingLabel(c)}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AdminHomepageActorsPickForm({
  actors,
  initialByPosition,
}: {
  actors: HomepageActorOpt[];
  initialByPosition: Record<number, string>;
}) {
  const [vals, setVals] = useState<Record<number, string>>(() => {
    const o: Record<number, string> = {};
    for (let p = 1; p <= 6; p++) o[p] = initialByPosition[p] ?? "";
    return o;
  });
  const [open, setOpen] = useState(false);
  const [pickPos, setPickPos] = useState<number | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return actors;
    return actors.filter(
      (a) => a.fullName.toLowerCase().includes(t) || a.cityName.toLowerCase().includes(t),
    );
  }, [actors, q]);

  function openPick(p: number) {
    setPickPos(p);
    setQ("");
    setOpen(true);
  }

  function applyPick(id: string) {
    if (pickPos == null) return;
    setVals((v) => ({ ...v, [pickPos]: id }));
    setOpen(false);
    setPickPos(null);
  }

  function displayForSlot(p: number) {
    const id = vals[p] ?? "";
    if (!id) return "— автоматически из каталога —";
    const a = actors.find((x) => x.id === id);
    return a ? actorLabel(a) : `ID: ${id.slice(0, 8)}…`;
  }

  return (
    <>
      <form action={saveHomepageFeaturedActorsAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((p) => (
            <div key={p} className="space-y-2">
              <Label>Слот {p}</Label>
              <input type="hidden" name={`actor_slot_${p}`} value={vals[p] ?? ""} />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <p className="flex min-h-10 flex-1 items-center truncate rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                  {displayForSlot(p)}
                </p>
                <Button type="button" variant="outline" size="sm" className="shrink-0 sm:w-auto" onClick={() => openPick(p)}>
                  Выбрать
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="submit">Сохранить актёров</Button>
      </form>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[min(85dvh,30rem)] max-h-[85dvh] w-[calc(100vw-1.25rem)] max-w-lg flex-col gap-4 overflow-hidden p-4 max-sm:top-[5dvh] max-sm:translate-y-0 sm:w-full sm:p-6">
          <DialogHeader className="shrink-0 space-y-1.5 text-left">
            <DialogTitle>Актёр — слот {pickPos ?? "—"}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Поиск по имени или городу…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            inputMode="search"
            enterKeyHint="search"
            className="h-11 shrink-0 text-base"
          />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain rounded-md border border-border [-webkit-overflow-scrolling:touch]">
            <button
              type="button"
              className="block w-full border-b px-3 py-2.5 text-left text-sm hover:bg-muted"
              onClick={() => applyPick("")}
            >
              — Очистить (автоматически из каталога) —
            </button>
            {filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                className="block w-full border-b px-3 py-2.5 text-left text-sm hover:bg-muted"
                onClick={() => applyPick(a.id)}
              >
                {actorLabel(a)}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
