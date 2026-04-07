"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPortfolioApplicationAction } from "@/features/service-leads/actions";
import { ServiceLeadThankYouDialog } from "@/components/service-lead-thank-you-dialog";
import { cn } from "@/lib/utils";

type DayRow = { id: string; shootDate: string; remaining: number };

export function PortfolioLeadForm() {
  const [days, setDays] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotId, setSlotId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [thanksOpen, setThanksOpen] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/services/portfolio-days")
      .then((r) => r.json())
      .then((d: { days?: DayRow[] }) => {
        if (!cancelled) setDays(Array.isArray(d.days) ? d.days : []);
      })
      .catch(() => {
        if (!cancelled) setDays([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          const fd = new FormData(e.currentTarget);
          start(async () => {
            try {
              await submitPortfolioApplicationAction(fd);
              setThanksOpen(true);
              (e.target as HTMLFormElement).reset();
              setSlotId("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Не удалось отправить заявку");
            }
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="pf-fullName">ФИО</Label>
          <Input id="pf-fullName" name="fullName" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-birthDate">Дата рождения</Label>
          <Input id="pf-birthDate" name="birthDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-email">Email</Label>
          <Input id="pf-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-phone">Контактный телефон</Label>
          <Input id="pf-phone" name="phone" type="tel" required autoComplete="tel" placeholder="+7 …" />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium leading-none">Желаемая дата съёмки</span>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка календаря…</p>
          ) : days.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Свободные слоты пока не открыты. Попробуйте позже — администратор обновляет календарь.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Доступные даты">
              {days.map((d) => {
                const label = new Date(`${d.shootDate}T12:00:00`).toLocaleDateString("ru-RU", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
                const selected = slotId === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-muted",
                    )}
                    onClick={() => setSlotId(d.id)}
                  >
                    {label}
                    <span className="ml-1 text-xs opacity-80">({d.remaining})</span>
                  </button>
                );
              })}
            </div>
          )}
          <input type="hidden" name="slotId" value={slotId} />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={pending || days.length === 0 || !slotId}>
          Отправить заявку
        </Button>
      </form>
      <ServiceLeadThankYouDialog open={thanksOpen} onOpenChange={setThanksOpen} />
    </>
  );
}
