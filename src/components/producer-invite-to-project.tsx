"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { producerInviteActorAction } from "@/features/applications/actions";
import { startDirectThreadWithActorAction } from "@/features/chat/direct-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProducerInviteToProject({
  actorProfileId,
  castings,
}: {
  actorProfileId: string;
  castings: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }
  }, [open]);

  function invite(castingId: string) {
    setErr(null);
    startTransition(async () => {
      const res = await producerInviteActorAction(castingId, actorProfileId);
      if ("error" in res) {
        setErr(res.error);
        return;
      }
      router.push(`/producer/chats?chat=${res.chatId}`);
    });
  }

  return (
    <div ref={rootRef} className="relative w-full sm:w-auto">
      <Button
        type="button"
        variant="secondary"
        size="default"
        disabled={pending}
        className="w-full gap-1.5 sm:w-auto"
        onClick={() => {
          setOpen((v) => !v);
          setErr(null);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {pending ? "Открываем чат…" : "Предложить проект"}
        <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-70 transition", open && "rotate-180")} aria-hidden />
      </Button>

      {open ? (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(70vh,320px)] min-w-[min(100%,280px)] overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-md sm:left-auto sm:right-0 sm:min-w-[280px]"
          role="listbox"
        >
          <div className="border-b border-border py-1">
            <button
              type="button"
              role="option"
              disabled={pending}
              className="w-full px-3 py-2.5 text-left text-sm font-medium text-foreground transition hover:bg-muted"
              onClick={() => {
                setOpen(false);
                setErr(null);
                startTransition(async () => {
                  await startDirectThreadWithActorAction(actorProfileId);
                });
              }}
            >
              Личный чат без кастинга
            </button>
          </div>
          {castings.length === 0 ? (
            <div className="space-y-3 p-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                У вас пока нет опубликованных кастингов. Создайте кастинг и дождитесь одобрения модерации — после этого
                здесь появится список кастингов для приглашения в чат по проекту.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/producer/castings/new" onClick={() => setOpen(false)}>
                  Добавить кастинг
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {castings.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    disabled={pending}
                    className="w-full px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-muted"
                    onClick={() => {
                      setOpen(false);
                      invite(c.id);
                    }}
                  >
                    {c.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {err ? <p className="mt-2 max-w-xs text-left text-sm text-destructive sm:text-right">{err}</p> : null}
    </div>
  );
}
