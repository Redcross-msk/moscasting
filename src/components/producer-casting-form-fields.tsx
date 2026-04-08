"use client";

import { useMemo, useState } from "react";
import type { CastingPaymentPeriod } from "@/lib/casting-payment-period";
import { CastingCategoryFields } from "@/components/casting-category-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { buildPaymentInfoForDb, parseCastingPaymentPeriod } from "@/lib/casting-payment-display";
import { ymdFromLocalDate } from "@/lib/casting-shoot-dates";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
  "Кино / Сериал",
  "ТВ шоу / Онлайн шоу",
  "Музыкальный клип",
  "Блог / Скетч",
  "Некоммерческий проект",
  "Реклама",
  "Фотосъемка",
] as const;

const WORK_HOURS = [
  "от 1 до 4 часов",
  "от 4 до 8 часов",
  "от 8 до 12 часов",
  "8 часов + обед",
  "10 часов + обед",
  "12 часов + обед",
] as const;

const PAYMENT_PERIODS: { value: CastingPaymentPeriod; label: string }[] = [
  { value: "HOUR", label: "час" },
  { value: "SHIFT", label: "смена" },
  { value: "DAY", label: "сутки" },
  { value: "PROJECT", label: "проект" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function parseHm(s: string): { h: string; m: string } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return { h: "10", m: "00" };
  const h = Math.min(23, Math.max(0, parseInt(m[1]!, 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2]!, 10)));
  return { h: String(h).padStart(2, "0"), m: String(min).padStart(2, "0") };
}

export type ProducerCastingFormDefaults = {
  title?: string;
  description?: string;
  projectType?: string | null;
  paymentRub?: number | null;
  paymentPeriod?: CastingPaymentPeriod | null;
  shootDatesYmd?: string[];
  scheduledAt?: Date | null;
  shootStartTime?: string | null;
  workHoursNote?: string | null;
  metroStation?: string | null;
  addressLine?: string | null;
  applicationDeadline?: Date | null;
  roleMass?: string;
  roleSolo?: string;
  roleGroup?: string[];
};

function initialDates(defaults: ProducerCastingFormDefaults): string[] {
  if (defaults.shootDatesYmd?.length) {
    return [...defaults.shootDatesYmd].sort();
  }
  if (defaults.scheduledAt) {
    return [ymdFromLocalDate(new Date(defaults.scheduledAt))];
  }
  return [];
}

export function ProducerCastingFormFields({
  defaults = {},
  categoryDefaults,
}: {
  defaults?: ProducerCastingFormDefaults;
  categoryDefaults?: {
    defaultCategory?: string | null;
    defaultMass?: string;
    defaultSolo?: string;
    defaultGroup?: string[];
  };
}) {
  const [dates, setDates] = useState<string[]>(() => initialDates(defaults));
  const [pickValue, setPickValue] = useState("");
  const { h: dh, m: dm } = parseHm(defaults.shootStartTime ?? "10:00");
  const [hour, setHour] = useState(dh);
  const [minute, setMinute] = useState(dm);
  const [payRub, setPayRub] = useState(
    defaults.paymentRub != null ? String(defaults.paymentRub) : "",
  );
  const [payPeriod, setPayPeriod] = useState<string>(defaults.paymentPeriod ?? "");

  const datesJson = useMemo(() => JSON.stringify([...dates].sort()), [dates]);

  const previewPay = useMemo(() => {
    const n = parseInt(payRub.replace(/\s/g, ""), 10);
    if (!Number.isFinite(n) || n < 0) return null;
    const per = parseCastingPaymentPeriod(payPeriod);
    return buildPaymentInfoForDb(n, per);
  }, [payRub, payPeriod]);

  function addPickedDate() {
    const v = pickValue.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
    if (dates.includes(v)) {
      setPickValue("");
      return;
    }
    setDates((d) => [...d, v].sort());
    setPickValue("");
  }

  function removeDate(ymd: string) {
    setDates((d) => d.filter((x) => x !== ymd));
  }

  const dl = defaults.applicationDeadline
    ? new Date(defaults.applicationDeadline).toISOString().slice(0, 16)
    : "";

  return (
    <div className="space-y-4">
      <input type="hidden" name="shootDatesJson" value={datesJson} />
      <input type="hidden" name="shootStartTime" value={`${hour}:${minute}`} />

      <div className="space-y-2">
        <Label htmlFor="title">Заголовок</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={defaults.title}
          placeholder="Съемка клипа / ТВ шоу «название» / Сериал про любовь и т.д."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Нам требуется</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={defaults.description}
          placeholder="Массовка для танцевального клипа, танцующие и открытые / Зрители на ТВ шоу с вопросом к спикеру / Родитель главной героини, который не хочет отпускать дочь в другой город…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="projectType">Проект</Label>
        <select
          id="projectType"
          name="projectType"
          defaultValue={defaults.projectType ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">— выберите тип проекта —</option>
          {PROJECT_TYPES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 rounded-md border border-border/80 bg-muted/20 p-3">
        <Label>Оплата</Label>
        <p className="text-xs text-muted-foreground">
          Укажите сумму и период — так строка попадёт в карточку кастинга.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Сумма, ₽</span>
            <Input
              name="paymentRub"
              type="number"
              min={0}
              inputMode="numeric"
              value={payRub}
              onChange={(e) => setPayRub(e.target.value)}
              placeholder="5000"
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Период</span>
            <select
              name="paymentPeriod"
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">— выберите —</option>
              {PAYMENT_PERIODS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {previewPay ? (
          <p className="text-xs font-medium text-foreground">В карточке: {previewPay}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Пример: 5 000 рублей / сутки</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Дата съёмки</Label>
        <p className="text-xs text-muted-foreground">Можно добавить несколько дней. Время указывается ниже.</p>
        <div className="flex flex-wrap items-end gap-2">
          <Input
            type="date"
            value={pickValue}
            onChange={(e) => setPickValue(e.target.value)}
            className="w-auto min-w-[10rem]"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addPickedDate}>
            Добавить дату
          </Button>
        </div>
        {dates.length > 0 ? (
          <ul className="flex flex-wrap gap-2 pt-1">
            {dates.map((ymd) => (
              <li
                key={ymd}
                className="flex items-center gap-1 rounded-full border bg-background px-2 py-1 text-xs"
              >
                <span className="tabular-nums">{ymd}</span>
                <button
                  type="button"
                  className="text-destructive hover:underline"
                  onClick={() => removeDate(ymd)}
                  aria-label={`Удалить дату ${ymd}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-amber-800 dark:text-amber-200">Добавьте хотя бы одну дату съёмки.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Время начала съёмки</Label>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className={cn(
              "h-10 rounded-md border border-input bg-background px-2 text-sm",
              "max-sm:min-w-[4.5rem]",
            )}
            aria-label="Часы"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">:</span>
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className={cn(
              "h-10 rounded-md border border-input bg-background px-2 text-sm",
              "max-sm:min-w-[4.5rem]",
            )}
            aria-label="Минуты"
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workHoursNote">Рабочие часы</Label>
        <select
          id="workHoursNote"
          name="workHoursNote"
          defaultValue={defaults.workHoursNote ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">— выберите —</option>
          {WORK_HOURS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="metroStation">Метро</Label>
          <Input
            id="metroStation"
            name="metroStation"
            placeholder="м. Тверская"
            defaultValue={defaults.metroStation ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressLine">Адрес</Label>
          <Input
            id="addressLine"
            name="addressLine"
            placeholder="ул. …, павильон …"
            defaultValue={defaults.addressLine ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicationDeadline">Завершить приём откликов</Label>
        <p className="text-xs text-muted-foreground">
          В указанное время кастинг автоматически закроется для новых откликов.
        </p>
        <Input id="applicationDeadline" name="applicationDeadline" type="datetime-local" defaultValue={dl} />
      </div>

      <CastingCategoryFields
        defaultCategory={categoryDefaults?.defaultCategory}
        defaultMass={categoryDefaults?.defaultMass}
        defaultSolo={categoryDefaults?.defaultSolo}
        defaultGroup={categoryDefaults?.defaultGroup}
      />
    </div>
  );
}
