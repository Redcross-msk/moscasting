import type { ReactNode } from "react";

/** Компактная сетка «подпись — значение» для кабинета кастинг-директора */
export function ProducerCastingSpecGrid({
  rows,
  className = "",
}: {
  rows: { label: string; value: ReactNode; span?: "full" }[];
  className?: string;
}) {
  return (
    <dl
      className={`grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 ${className}`}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          className={
            row.span === "full"
              ? "sm:col-span-2"
              : "flex min-h-[2.25rem] flex-col justify-center border-b border-border/50 py-1.5 sm:border-0 sm:py-0"
          }
        >
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{row.label}</dt>
          <dd className="mt-0.5 break-words text-foreground sm:mt-0">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
