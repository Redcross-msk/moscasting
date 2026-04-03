"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { completeCastingAction, deleteCastingAction } from "@/features/castings/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const btnClass =
  "h-8 shrink-0 whitespace-nowrap px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm";

export function ProducerCastingCardActions({
  castingId,
  showComplete,
  mode = "list",
}: {
  castingId: string;
  showComplete?: boolean;
  mode?: "list" | "detail";
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const bar = cn(
    "flex max-w-full flex-nowrap gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]",
    "sm:flex-wrap sm:overflow-visible",
  );

  if (mode === "detail") {
    return (
      <div className={bar}>
        {showComplete ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={pending}
            type="button"
            className={btnClass}
            onClick={() => {
              if (!confirm("Завершить кастинг? Он перейдёт в раздел «Завершённые».")) return;
              start(async () => {
                await completeCastingAction(castingId);
                router.refresh();
              });
            }}
          >
            Завершить
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          type="button"
          className={btnClass}
          onClick={() => {
            if (!confirm("Удалить кастинг? Он пропадёт из каталога для всех пользователей.")) return;
            start(async () => {
              await deleteCastingAction(castingId);
              router.push("/producer/castings");
              router.refresh();
            });
          }}
        >
          Удалить
        </Button>
      </div>
    );
  }

  return (
    <div className={bar}>
      <Button size="sm" variant="default" asChild className={btnClass}>
        <Link href={`/producer/castings/${castingId}`}>Карточка</Link>
      </Button>
      <Button size="sm" variant="outline" asChild className={btnClass}>
        <Link href={`/producer/castings/${castingId}/edit`}>Правка</Link>
      </Button>
      {showComplete ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          type="button"
          className={btnClass}
          onClick={() => {
            if (!confirm("Завершить кастинг? Он перейдёт в раздел «Завершённые».")) return;
            start(async () => {
              await completeCastingAction(castingId);
              router.refresh();
            });
          }}
        >
          Завершить
        </Button>
      ) : null}
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        type="button"
        className={btnClass}
        onClick={() => {
          if (!confirm("Удалить кастинг? Он пропадёт из каталога для всех пользователей.")) return;
          start(async () => {
            await deleteCastingAction(castingId);
            router.refresh();
          });
        }}
      >
        Удалить
      </Button>
    </div>
  );
}
