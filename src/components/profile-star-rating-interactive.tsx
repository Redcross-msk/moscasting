"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { setProfileStarRatingAction } from "@/features/profile-star-rating/actions";
import { cn } from "@/lib/utils";

type Props = {
  subjectUserId: string;
  initialStars: number | null;
};

export function ProfileStarRatingInteractive({ subjectUserId, initialStars }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [hover, setHover] = useState(0);
  const [localStars, setLocalStars] = useState(initialStars);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalStars(initialStars);
  }, [initialStars]);

  const displayHover = hover || localStars || 0;

  function submit(star: number) {
    setError(null);
    start(async () => {
      const res = await setProfileStarRatingAction(subjectUserId, star);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setLocalStars(star);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center gap-1.5 sm:items-start">
      <p className="text-xs text-muted-foreground">Ваша оценка</p>
      <div
        className="flex items-center gap-0.5"
        role="group"
        aria-label="Поставить оценку от 1 до 5 звёзд"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={pending}
            className={cn(
              "rounded p-0.5 text-2xl leading-none transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:text-3xl",
              n <= displayHover ? "text-amber-500" : "text-amber-500/35",
            )}
            aria-label={`${n} ${n === 1 ? "звезда" : n < 5 ? "звезды" : "звёзд"}`}
            aria-pressed={localStars === n}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => submit(n)}
          >
            {n <= displayHover ? "★" : "☆"}
          </button>
        ))}
      </div>
      {localStars != null ? (
        <p className="text-xs text-muted-foreground">Сохранено: {localStars} из 5 — при необходимости нажмите другую звезду</p>
      ) : null}
      {error ? <p className="max-w-xs text-center text-xs text-destructive sm:text-left">{error}</p> : null}
    </div>
  );
}
