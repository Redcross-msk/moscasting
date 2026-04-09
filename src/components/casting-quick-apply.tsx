"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  applyToCastingAction,
  getActorProfilePreviewForApply,
  type ActorApplyPreview,
} from "@/features/applications/actions";
import { ActorProfileSnapshotCard } from "@/components/actor-profile-snapshot-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function previewToPayload(p: Exclude<ActorApplyPreview, { error: string }>) {
  return {
    kind: "actor_profile" as const,
    actorProfileId: p.actorProfileId,
    fullName: p.fullName,
    cityName: p.cityName,
    age: p.age,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    avatarUrl: p.avatarUrl,
    avatarStorageKey: p.avatarStorageKey,
  };
}

export function CastingQuickApply({
  castingId,
  castingTitle,
  myApplicationChatId,
  userRole,
  onNeedAuth,
  variant = "card",
}: {
  castingId: string;
  castingTitle?: string;
  myApplicationChatId?: string | null;
  userRole?: string;
  /** Для гостя: открыть модалку входа. По умолчанию — переход на /login */
  onNeedAuth?: () => void;
  /** detailPageColumn — страница кастинга: широкая кнопка столбиком */
  variant?: "card" | "catalogSide" | "detail" | "detailPageColumn";
}) {
  const router = useRouter();
  const [producerDialogOpen, setProducerDialogOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<ActorApplyPreview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [successChatId, setSuccessChatId] = useState<string | null>(null);

  const isActor = userRole === "ACTOR";
  const cannotApplyAsActor = userRole === "PRODUCER" || userRole === "ADMIN";

  function openApplyFlow() {
    setErr(null);
    setSuccessChatId(null);
    setNote("");
    setPreview(null);
    if (!userRole) {
      (onNeedAuth ?? (() => router.push("/login")))();
      return;
    }
    if (cannotApplyAsActor) {
      setProducerDialogOpen(true);
      return;
    }
    if (!isActor) {
      setProducerDialogOpen(true);
      return;
    }
    setApplyOpen(true);
    start(async () => {
      const p = await getActorProfilePreviewForApply();
      setPreview(p);
    });
  }

  function submitApply() {
    setErr(null);
    start(async () => {
      try {
        const { chatId } = await applyToCastingAction(castingId, note.trim() || undefined);
        setSuccessChatId(chatId);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Ошибка");
      }
    });
  }

  const isPageColumn = variant === "detailPageColumn";
  const isCatalogSide = variant === "catalogSide";

  if (myApplicationChatId) {
    return (
      <div
        className={cn(
          variant === "detail" && "max-w-md",
          isCatalogSide && "w-full max-w-full md:max-w-[220px]",
          isPageColumn && "w-full",
        )}
      >
        <Button
          variant="secondary"
          size={isPageColumn ? "default" : "default"}
          className={cn(
            !isPageColumn && !isCatalogSide && "w-full sm:w-auto",
            isCatalogSide && "h-11 w-full rounded-xl font-semibold shadow-sm",
            isPageColumn && "h-11 w-full text-base",
          )}
          asChild
        >
          <Link href={`/actor/chats?chat=${myApplicationChatId}`}>Перейти в чат по отклику</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          variant === "detail" && "max-w-md",
          isCatalogSide && "w-full max-w-full md:max-w-[220px]",
          isPageColumn && "w-full",
        )}
      >
        <Button
          type="button"
          className={cn(
            !isPageColumn && !isCatalogSide && "w-full",
            variant === "detail" && "sm:w-auto",
            isCatalogSide && "h-11 w-full rounded-xl text-base font-semibold shadow-sm",
            isPageColumn && "h-11 w-full text-base font-semibold",
          )}
          onClick={openApplyFlow}
          disabled={pending && !applyOpen}
        >
          Откликнуться
        </Button>
      </div>

      <Dialog open={producerDialogOpen} onOpenChange={setProducerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Отклик недоступен</DialogTitle>
            <DialogDescription>
              Откликаться на кастинги могут только актёры. Кастинг-директор и администратор не отправляют отклики
              в этом разделе — войдите под аккаунтом актёра.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setProducerDialogOpen(false)}>
              Понятно
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Отклик на кастинг</DialogTitle>
            <DialogDescription>
              {castingTitle ? `«${castingTitle}»` : "Сообщение уйдёт кастинг-директору в чат вместе с вашим профилем."}
            </DialogDescription>
          </DialogHeader>

          {successChatId ? (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">Отклик отправлен. Продюсер увидит ваш профиль в чате.</p>
              <Button asChild className="w-full">
                <Link href={`/actor/chats?chat=${successChatId}`}>Открыть чат</Link>
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => setApplyOpen(false)}>
                Закрыть
              </Button>
            </div>
          ) : preview === null && pending ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Загрузка профиля…</p>
          ) : preview && "error" in preview ? (
            <div className="space-y-2 py-2">
              <p className="text-sm text-destructive">{preview.error}</p>
              <Button variant="outline" asChild>
                <Link href="/actor/profile">Заполнить профиль</Link>
              </Button>
            </div>
          ) : preview ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Так продюсер увидит ваш профиль</p>
                <ActorProfileSnapshotCard data={previewToPayload(preview)} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Сообщение</p>
                <Textarea
                  placeholder="Коротко о себе или вопрос по кастингу (необязательно)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </div>
              {err ? <p className="text-sm text-destructive">{err}</p> : null}
              <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="order-2 w-full sm:order-1 sm:w-auto"
                  onClick={() => setApplyOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  className="order-1 w-full sm:order-2 sm:w-auto"
                  disabled={pending}
                  onClick={submitApply}
                >
                  {pending ? "Отправка…" : "Отправить отклик"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">Не удалось загрузить данные профиля.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
