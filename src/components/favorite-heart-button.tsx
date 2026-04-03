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
}: {
  kind: "casting" | "actor";
  targetId: string;
  initial: boolean;
  className?: string;
  /** aria-label */
  label?: string;
}) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();

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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(async () => {
          const fn = kind === "casting" ? toggleFavoriteCastingAction : toggleFavoriteActorAction;
          const { favorited } = await fn(targetId);
          setOn(favorited);
        });
      }}
    >
      <Heart
        className={cn("h-5 w-5 transition-colors", on ? "fill-primary text-primary" : "text-muted-foreground")}
        fill={on ? "currentColor" : "none"}
        strokeWidth={1.75}
      />
    </Button>
  );
}
