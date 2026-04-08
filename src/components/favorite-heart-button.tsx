"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteActorAction, toggleFavoriteCastingAction } from "@/features/favorites/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteHeartButton({
  kind,
  targetId,
  initial,
  className,
  label = "В избранное",
  /** Карточка кастинга в каталоге: моб. — квадрат с сердцем у «Откликнуться»; десктоп — текст под кнопкой. */
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
        variant="outline"
        disabled={pending}
        className={cn(
          "shrink-0 rounded-xl shadow-sm",
          "h-11 w-11 p-0 md:h-11 md:w-full md:px-3",
          on
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            : "border-primary/30 bg-background text-primary hover:bg-primary/5",
          className,
        )}
        aria-label={on ? "Убрать из избранного" : "Добавить в избранное"}
        aria-pressed={on}
        onClick={onClick}
      >
        <Heart
          className={cn(
            "mx-auto h-5 w-5 transition-colors md:hidden",
            on ? "fill-primary-foreground text-primary-foreground" : "text-primary",
          )}
          fill={on ? "currentColor" : "none"}
          strokeWidth={1.75}
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
        "h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary",
        on && "text-primary",
        className,
      )}
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
    >
      <Heart
        className={cn("h-5 w-5 transition-colors", on ? "fill-primary text-primary" : "text-muted-foreground")}
        fill={on ? "currentColor" : "none"}
        strokeWidth={1.75}
      />
    </Button>
  );
}
