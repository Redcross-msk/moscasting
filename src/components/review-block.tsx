"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@prisma/client";
import { ReviewDirection } from "@prisma/client";
import { createReviewAction } from "@/features/reviews/actions";
import { Button } from "@/components/ui/button";

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

  const [stars, setStars] = useState(5);
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

  return (
    <div className="rounded-lg border border-dashed border-border/80 p-2.5 sm:p-3">
      <p className="mb-1.5 text-xs font-medium sm:text-sm">{title}</p>
      <p className="mb-2 text-[11px] text-muted-foreground sm:text-xs">
        Только звёзды, без текста. Оценка не отображается собеседнику в переписке.
      </p>
      <div className="mb-3 flex flex-nowrap gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            className={`min-h-[44px] min-w-[36px] text-lg sm:min-h-0 sm:min-w-0 sm:text-xl ${stars >= s ? "text-amber-500" : "text-muted-foreground"}`}
            onClick={() => setStars(s)}
            aria-label={`${s} из 5`}
          >
            ★
          </button>
        ))}
      </div>
      {err ? <p className="mb-2 text-xs text-destructive sm:text-sm">{err}</p> : null}
      <Button
        size="sm"
        className="h-9 w-full sm:w-auto"
        disabled={pending}
        onClick={() => {
          setErr(null);
          start(async () => {
            try {
              await createReviewAction(applicationId, stars, "");
              router.refresh();
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Ошибка");
            }
          });
        }}
      >
        Отправить оценку
      </Button>
    </div>
  );
}
