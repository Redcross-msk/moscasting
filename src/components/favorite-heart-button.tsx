"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteActorAction, toggleFavoriteCastingAction } from "@/features/favorites/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function HeartIcon({
  on,
  className,
}: {
  on: boolean;
  className?: string;
}) {
  return (
    <Heart
      className={cn(
        "h-5 w-5 shrink-0 text-current transition-all duration-150 ease-out",
        /* Заливка при нажатии только внутри контура сердца (fill-opacity), не прямоугольник кнопки */
        on
          ? "fill-current group-active:scale-[0.88]"
          : "fill-current fill-opacity-0 group-active:fill-opacity-[0.48] group-active:scale-[0.9]",
        className,
      )}
      fill="currentColor"
      strokeWidth={1.75}
    />
  );
}

export function FavoriteHeartButton({
  kind,
  targetId,
  initial,
  className,
  label = "В избранное",
  /** Карточка кастинга в каталоге: моб. — только сердце; десктоп — текст в кнопке. */
  presentation = "default",
}: {
  kind: "casting" | "actor";
  targetId: string;
  initial: boolean;
  className?: string;
  /** aria-label */
  label?: string;
  presentation?: "default" | "castingCatalog";
}) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    start(async () => {
      const fn = kind === "casting" ? toggleFavoriteCastingAction : toggleFavoriteActorAction;
      const { favorited } = await fn(targetId);
      setOn(favorited);
    });
  };

  if (presentation === "castingCatalog") {
    return (
      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        className={cn(
          "group shrink-0 [-webkit-tap-highlight-color:transparent] touch-manipulation",
          /* Мобилка: без заливки подложки — только кольцо фокуса и сердце */
          "h-11 w-11 min-h-11 min-w-11 rounded-full border-0 bg-transparent p-0 shadow-none",
          "hover:bg-transparent active:bg-transparent",
          "focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          /* md+: прежняя широкая кнопка с фоном */
          "md:flex md:h-11 md:w-full md:min-w-0 md:rounded-xl md:border md:px-3 md:py-0 md:shadow-sm",
          "md:focus-visible:ring-offset-background",
          on
            ? "text-primary md:border-primary md:bg-primary md:text-primary-foreground md:hover:bg-primary/90 md:hover:text-primary-foreground md:active:bg-primary/80"
            : "text-primary md:border-primary/30 md:bg-background md:hover:bg-primary/5 md:hover:text-primary md:active:bg-primary/10",
          className,
        )}
        aria-label={on ? "Убрать из избранного" : "Добавить в избранное"}
        aria-pressed={on}
        onClick={onClick}
      >
        <HeartIcon
          on={on}
          className={cn(
            "mx-auto md:hidden",
            on ? "text-primary md:text-primary-foreground" : "text-primary",
          )}
        />
        <span
          className={cn(
            "hidden px-1 text-center text-xs font-semibold uppercase leading-tight tracking-wide md:inline",
            on && "text-primary-foreground",
          )}
        >
          {on ? "В ИЗБРАННОМ" : "Добавить в избранное"}
        </span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={pending}
      className={cn(
        "group h-9 w-9 shrink-0 rounded-full [-webkit-tap-highlight-color:transparent] touch-manipulation",
        "border-0 bg-transparent hover:bg-transparent active:bg-transparent",
        "focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        on ? "text-primary" : "text-muted-foreground",
        className,
      )}
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
    >
      <HeartIcon on={on} />
    </Button>
  );
}
