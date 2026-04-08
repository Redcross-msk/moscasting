"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@prisma/client";
import { ReviewDirection } from "@prisma/client";
import { createReviewAction } from "@/features/reviews/actions";
import { cn } from "@/lib/utils";

export function ReviewBlock({
  applicationId,
  direction,
  existing,
}: {
  applicationId: string;
  direction: ReviewDirection;
  existing?: Review;
}) {
  const title =
    direction === ReviewDirection.ACTOR_TO_PRODUCER ? "Оценить кастинг-директора" : "Оценить актёра";

  const [stars, setStars] = useState(0);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  if (existing) {
    return (
      <p className="text-sm text-muted-foreground">
        Спасибо! Оценка отправлена и учитывается в рейтинге. Собеседник не видит вашу оценку в чате.
      </p>
    );
  }

  function submitStars(value: number) {
    setErr(null);
    setStars(value);
    start(async () => {
      const res = await createReviewAction(applicationId, value, "");
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-dashed border-border/80 p-2.5 sm:p-3">
      <p className="mb-1.5 text-xs font-medium sm:text-sm">{title}</p>
      <p className="mb-2 text-[11px] text-muted-foreground sm:text-xs">
        Нажмите на звёзды — оценка сохранится сразу, без текста. Собеседник не увидит её в переписке.
      </p>
      <div className="flex flex-nowrap gap-0.5" role="group" aria-label="Оценка от 1 до 5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            className={cn(
              "min-h-[44px] min-w-[36px] text-lg transition-colors sm:min-h-0 sm:min-w-0 sm:text-xl",
              "rounded-md enabled:active:scale-95 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-ring",
              (stars > 0 ? stars >= s : false) ? "text-amber-500" : "text-muted-foreground/50",
              pending && "opacity-60",
            )}
            onClick={() => submitStars(s)}
            aria-label={`Оценка ${s} из 5`}
            aria-pressed={stars === s}
          >
            ★
          </button>
        ))}
      </div>
      {pending ? <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">Сохраняем…</p> : null}
      {err ? <p className="mt-2 text-xs text-destructive sm:text-sm">{err}</p> : null}
    </div>
  );
}
