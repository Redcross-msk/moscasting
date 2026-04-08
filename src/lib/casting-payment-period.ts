/** Совпадает с Prisma enum `CastingPaymentPeriod` (после `npx prisma generate`). */
export type CastingPaymentPeriod = "HOUR" | "SHIFT" | "DAY" | "PROJECT";

export const CASTING_PAYMENT_PERIOD_VALUES: CastingPaymentPeriod[] = [
  "HOUR",
  "SHIFT",
  "DAY",
  "PROJECT",
];

export function isCastingPaymentPeriod(v: string): v is CastingPaymentPeriod {
  return (CASTING_PAYMENT_PERIOD_VALUES as string[]).includes(v);
}

/** Для `as` при отстающем `prisma generate`: колонки уже есть в БД. */
export type CastingDbPaymentAndDates = {
  paymentPeriod: CastingPaymentPeriod | null;
  shootDatesJson: unknown;
};
