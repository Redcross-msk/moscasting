"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ApplicationStatus } from "@prisma/client";
import { ChatComposerUnified } from "@/components/chat-composer-unified";
import { ChatMessageContent } from "@/components/chat-message-content";
import { Button } from "@/components/ui/button";
import {
  fetchApplicationChatPanelAction,
  fetchDirectThreadPanelAction,
  sendDirectThreadMessageAction,
} from "@/features/chat/direct-actions";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CastingRow = {
  castingId: string;
  castingTitle: string;
  chatId: string;
  producerLabel: string;
  preview: string;
};

type DirectRow = { threadId: string; producerLabel: string; preview: string };

type PanelApp = {
  kind: "application";
  chatId: string;
  title: string;
  subtitle: string;
  closedAt: string | null;
  applicationId: string;
  applicationStatus: ApplicationStatus;
  messages: { id: string; senderId: string; senderEmail: string; body: string; payload: unknown }[];
};

type PanelDirect = {
  kind: "direct";
  threadId: string;
  title: string;
  subtitle: string;
  messages: { id: string; senderId: string; senderEmail: string; body: string }[];
};

type Panel = PanelApp | PanelDirect | null;

export function ActorChatsInbox({
  byCasting,
  direct,
  currentUserId,
  directChatDisabledMessage,
}: {
  byCasting: CastingRow[];
  direct: DirectRow[];
  currentUserId: string;
  directChatDisabledMessage?: string | null;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>(null);
  const [pending, start] = useTransition();
  const [composer, setComposer] = useState("");

  const loadApp = useCallback((chatId: string) => {
    start(async () => {
      const data = await fetchApplicationChatPanelAction(chatId);
      setPanel(data);
    });
  }, []);

  const loadDirect = useCallback((threadId: string) => {
    start(async () => {
      const data = await fetchDirectThreadPanelAction(threadId);
      setPanel(data);
    });
  }, []);

  useEffect(() => {
    const d = searchParams.get("direct");
    const ch = searchParams.get("chat");
    if (d) loadDirect(d);
    else if (ch) loadApp(ch);
  }, [searchParams, loadDirect, loadApp]);

  function sendDirect() {
    const text = composer.trim();
    if (!text || !panel || panel.kind !== "direct") return;
    start(async () => {
      await sendDirectThreadMessageAction(panel.threadId, text);
      setComposer("");
      loadDirect(panel.threadId);
    });
  }

  function closePanel() {
    setPanel(null);
    router.replace(pathname);
  }

  const hasAnyChat = byCasting.length > 0 || direct.length > 0;

  return (
    <div className="space-y-4">
      {directChatDisabledMessage ? (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          {directChatDisabledMessage}
        </div>
      ) : null}
      <div className="grid min-h-0 gap-0 md:grid-cols-12 md:items-start md:gap-4 md:min-h-[480px]">
      <aside
        className={cn(
          "border-b border-border pb-4 md:col-span-4 md:border-b-0 md:border-r md:pb-0 md:pr-4",
          panel ? "hidden md:flex" : "flex",
        )}
      >
        <div className="w-full rounded-xl border border-border bg-card p-3 shadow-sm">
          {!hasAnyChat ? (
            <p className="text-sm text-muted-foreground">Пока нет чатов</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {byCasting.map((c) => (
                <li key={`cast-${c.chatId}`}>
                  <button
                    type="button"
                    onClick={() => loadApp(c.chatId)}
                    className={cn(
                      "w-full rounded-lg border border-border bg-background/90 px-3 py-3 text-left text-sm shadow-sm transition hover:bg-muted/40 active:bg-muted/60",
                      panel?.kind === "application" &&
                        panel.chatId === c.chatId &&
                        "border-primary/40 bg-primary/5 font-medium ring-2 ring-primary/20",
                    )}
                  >
                    <span className="block font-semibold leading-snug">{c.castingTitle}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{c.producerLabel}</span>
                    {c.preview ? (
                      <span className="mt-2 block border-t border-border/50 pt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {c.preview}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
              {direct.map((d) => (
                <li key={`dir-${d.threadId}`}>
                  <button
                    type="button"
                    onClick={() => loadDirect(d.threadId)}
                    className={cn(
                      "w-full rounded-lg border border-border bg-background/90 px-3 py-3 text-left text-sm shadow-sm transition hover:bg-muted/40 active:bg-muted/60",
                      panel?.kind === "direct" && panel.threadId === d.threadId && "border-primary/40 bg-primary/5 font-medium ring-2 ring-primary/20",
                    )}
                  >
                    <span className="block font-semibold leading-snug">{d.producerLabel}</span>
                    {d.preview ? (
                      <span className="mt-2 block border-t border-border/50 pt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {d.preview}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section
        className={cn(
          "flex flex-col md:col-span-8 md:min-h-[480px]",
          !panel && "hidden md:flex",
          panel && "flex min-h-[min(420px,70dvh)]",
        )}
      >
        {!panel ? (
          <div className="flex min-h-[480px] flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground md:p-8">
            Выберите чат в списке слева.
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full shrink-0 sm:order-2 sm:w-auto md:hidden"
                onClick={closePanel}
              >
                ← К списку чатов
              </Button>
              <div className="min-w-0 flex-1 sm:order-1">
                <h2 className="text-lg font-bold leading-tight">{panel.title}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{panel.subtitle}</p>
              </div>
            </div>
            <div className="min-h-[min(280px,40dvh)] flex-1 space-y-2 overflow-y-auto rounded-xl border border-border/80 bg-muted/20 p-2 sm:min-h-[240px] sm:p-3">
              {panel.messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.senderId === currentUserId
                      ? "ml-auto max-w-[min(100%,20rem)] rounded-2xl border border-primary/25 bg-white/90 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur-sm dark:border-primary/35 dark:bg-background/85 sm:max-w-[80%]"
                      : "mr-auto max-w-[min(100%,20rem)] rounded-2xl border border-border bg-white/85 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur-sm dark:bg-background/80 sm:max-w-[80%]"
                  }
                >
                  <p className="text-[10px] opacity-70 sm:text-xs">{m.senderEmail}</p>
                  {panel.kind === "application" ? (
                    <ChatMessageContent body={m.body} payload={(m as { payload?: unknown }).payload} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  )}
                </div>
              ))}
            </div>
            {panel.kind === "application" ? (
              <div className="mt-2 sm:mt-3">
                <ChatComposerUnified
                  chatId={panel.chatId}
                  disabled={!!panel.closedAt}
                  compact
                  onAfterSend={() => loadApp(panel.chatId)}
                />
              </div>
            ) : (
              <form
                className="mt-2 flex flex-col gap-2 sm:mt-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendDirect();
                }}
              >
                <Textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder="Сообщение…"
                  rows={2}
                  className="min-h-[2.5rem] text-sm"
                />
                <Button type="submit" size="sm" className="h-9 w-full sm:w-auto" disabled={pending || !composer.trim()}>
                  Отправить
                </Button>
              </form>
            )}
          </>
        )}
      </section>
      </div>
    </div>
  );
}
