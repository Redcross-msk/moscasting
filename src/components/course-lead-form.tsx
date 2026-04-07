"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCourseApplicationAction } from "@/features/service-leads/actions";
import { ServiceLeadThankYouDialog } from "@/components/service-lead-thank-you-dialog";

type SlotRow = {
  id: string;
  type: "EIGHT_HOURS" | "SIXTEEN_HOURS";
  startDay: string;
  secondDay: string | null;
  remaining: number;
};

function formatSlotLabel(s: SlotRow): string {
  const a = new Date(`${s.startDay}T12:00:00`);
  const ds = a.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  if (s.type === "SIXTEEN_HOURS" && s.secondDay) {
    const b = new Date(`${s.secondDay}T12:00:00`);
    const ds2 = b.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    return `${ds} — ${ds2} (16 ч), свободно мест: ${s.remaining}`;
  }
  return `${ds} (8 ч), свободно мест: ${s.remaining}`;
}

export function CourseLeadForm() {
  const [courseType, setCourseType] = useState<"EIGHT_HOURS" | "SIXTEEN_HOURS">("EIGHT_HOURS");
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotId, setSlotId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [thanksOpen, setThanksOpen] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    setSlotId("");
    fetch(`/api/services/course-slots?type=${courseType}`)
      .then((r) => r.json())
      .then((d: { slots?: SlotRow[] }) => {
        if (!cancelled) {
          setSlots(Array.isArray(d.slots) ? d.slots : []);
        }
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseType]);

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
              await submitCourseApplicationAction(fd);
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
          <Label htmlFor="course-fullName">ФИО</Label>
          <Input id="course-fullName" name="fullName" required autoComplete="name" placeholder="Иванов Иван Иванович" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-birthDate">Дата рождения</Label>
          <Input id="course-birthDate" name="birthDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-experience">Опыт (курсы, съёмки, студия)</Label>
          <Textarea
            id="course-experience"
            name="experience"
            required
            rows={4}
            placeholder="Кратко опишите ваш опыт"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-email">Email</Label>
          <Input id="course-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-phone">Контактный телефон</Label>
          <Input id="course-phone" name="phone" type="tel" required autoComplete="tel" placeholder="+7 …" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-type-select">Желаемый курс</Label>
          <select
            id="course-type-select"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={courseType}
            onChange={(e) => setCourseType(e.target.value as "EIGHT_HOURS" | "SIXTEEN_HOURS")}
          >
            <option value="EIGHT_HOURS">8 часов</option>
            <option value="SIXTEEN_HOURS">16 часов (2 дня)</option>
          </select>
          <input type="hidden" name="courseType" value={courseType} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-slot">Дата курса</Label>
          {loadingSlots ? (
            <p className="text-sm text-muted-foreground">Загрузка доступных дат…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Сейчас нет открытых наборов на выбранный формат. Загляните позже или свяжитесь с нами по телефону /
              email из шапки сайта.
            </p>
          ) : (
            <select
              id="course-slot"
              name="slotId"
              required
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Выберите дату</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatSlotLabel(s)}
                </option>
              ))}
            </select>
          )}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={pending || slots.length === 0 || !slotId}>
          Отправить заявку
        </Button>
      </form>
      <ServiceLeadThankYouDialog open={thanksOpen} onOpenChange={setThanksOpen} />
    </>
  );
}
