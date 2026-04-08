import { isCastingPaymentPeriod, type CastingPaymentPeriod } from "@/lib/casting-payment-period";

const PERIOD_LABELS: Record<CastingPaymentPeriod, string> = {
  HOUR: "час",
  SHIFT: "смена",
  DAY: "сутки",
  PROJECT: "проект",
};

export function castingPaymentPeriodLabelRu(p: CastingPaymentPeriod): string {
  return PERIOD_LABELS[p];
}

export function parseCastingPaymentPeriod(raw: string): CastingPaymentPeriod | null {
  const t = raw.trim();
  return isCastingPaymentPeriod(t) ? t : null;
}

/** Строка оплаты для карточек и чатов: сумма + рублей + период. */
export function formatCastingPaymentLine(
  paymentRub: number | null | undefined,
  paymentInfo: string | null | undefined,
  paymentPeriod: CastingPaymentPeriod | null | undefined,
): string | null {
  if (paymentRub != null && Number.isFinite(paymentRub) && paymentPeriod) {
    return `${paymentRub.toLocaleString("ru-RU")} рублей / ${PERIOD_LABELS[paymentPeriod]}`;
  }
  if (paymentRub != null && Number.isFinite(paymentRub)) {
    const extra = paymentInfo?.trim();
    if (extra) return `${paymentRub.toLocaleString("ru-RU")} ₽ · ${extra}`;
    return `${paymentRub.toLocaleString("ru-RU")} ₽`;
  }
  if (paymentInfo?.trim()) return paymentInfo.trim();
  return null;
}

export function buildPaymentInfoForDb(
  paymentRub: number | undefined,
  paymentPeriod: CastingPaymentPeriod | null,
): string | undefined {
  if (paymentRub == null || !Number.isFinite(paymentRub)) return undefined;
  if (paymentPeriod) {
    return `${paymentRub.toLocaleString("ru-RU")} рублей / ${PERIOD_LABELS[paymentPeriod]}`;
  }
  return `${paymentRub.toLocaleString("ru-RU")} рублей`;
}
