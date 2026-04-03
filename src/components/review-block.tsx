"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@prisma/client";
import { ReviewDirection } from "@prisma/client";
import { createReviewAction } from "@/features/reviews/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    direction === ReviewDirection.ACTOR_TO_PRODUCER ? "Оценить продюсера" : "Оценить актёра";

  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  if (existing) {
    return (
      <p className="text-sm text-muted-foreground">
        Спасибо! Ваш отзыв учтён в рейтинге ({existing.stars}★).
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-border/80 p-2.5 sm:p-3">
      <p className="mb-1.5 text-xs font-medium sm:text-sm">{title}</p>
      <div className="mb-2 flex flex-nowrap gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            className={`min-h-[44px] min-w-[36px] text-lg sm:min-h-0 sm:min-w-0 sm:text-xl ${stars >= s ? "text-amber-500" : "text-muted-foreground"}`}
            onClick={() => setStars(s)}
          >
            ★
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Текст отзыва (от 5 символов)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="mb-2 min-h-[4.5rem] text-sm"
      />
      {err && <p className="mb-2 text-xs text-destructive sm:text-sm">{err}</p>}
      <Button
        size="sm"
        className="h-9 w-full sm:w-auto"
        disabled={pending || text.length < 5}
        onClick={() => {
          setErr(null);
          start(async () => {
            try {
              await createReviewAction(applicationId, stars, text);
              router.refresh();
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Ошибка");
            }
          });
        }}
      >
        Отправить отзыв
      </Button>
    </div>
  );
}
