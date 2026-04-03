"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
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

  return (
    <div className="space-y-4">
      {directChatDisabledMessage ? (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          {directChatDisabledMessage}
        </div>
      ) : null}
      <div className="grid min-h-[480px] gap-4 md:grid-cols-12 md:items-start">
      <aside className="flex flex-col gap-4 border-b border-border pb-4 md:col-span-4 md:border-b-0 md:border-r md:pb-0 md:pr-4">
        <div className="rounded-xl border border-border bg-muted/25 p-3 shadow-sm">
          <h2 className="mb-3 border-b border-border/80 pb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
            Личные сообщения
          </h2>
          {direct.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет личных диалогов</p>
          ) : (
            <ul className="space-y-1">
              {direct.map((d) => (
                <li key={d.threadId}>
                  <button
                    type="button"
                    onClick={() => loadDirect(d.threadId)}
                    className={cn(
                      "w-full rounded-lg px-2 py-2.5 text-left text-sm transition hover:bg-background/80",
                      panel?.kind === "direct" && panel.threadId === d.threadId && "bg-background font-medium shadow-sm ring-1 ring-primary/25",
                    )}
                  >
                    <span className="block font-medium">{d.producerLabel}</span>
                    {d.preview ? (
                      <span className="line-clamp-2 text-xs text-muted-foreground">{d.preview}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <h2 className="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
            Кастинги с откликом
          </h2>
          {byCasting.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет чатов по откликам</p>
          ) : (
            <ul className="space-y-1">
              {byCasting.map((c) => (
                <li key={c.castingId}>
                  <button
                    type="button"
                    onClick={() => loadApp(c.chatId)}
                    className={cn(
                      "w-full rounded-lg px-2 py-2.5 text-left text-sm transition hover:bg-muted/60",
                      panel?.kind === "application" &&
                        panel.chatId === c.chatId &&
                        "bg-primary/10 font-medium shadow-sm ring-1 ring-primary/30",
                    )}
                  >
                    <span className="block font-medium">{c.castingTitle}</span>
                    <span className="text-xs text-muted-foreground">{c.producerLabel}</span>
                    {c.preview ? (
                      <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{c.preview}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="flex min-h-[min(520px,70vh)] flex-col md:col-span-8 md:min-h-[480px]">
        {!panel ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Выберите кастинг или личный диалог слева.
          </div>
        ) : (
          <>
            <div className="mb-3 border-b border-border pb-3">
              <h2 className="text-lg font-bold">{panel.title}</h2>
              <p className="text-sm text-muted-foreground">{panel.subtitle}</p>
            </div>
            <div className="min-h-[200px] flex-1 space-y-2 overflow-y-auto rounded-xl border border-border/80 bg-muted/20 p-2 sm:min-h-[240px] sm:p-3">
              {panel.messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.senderId === currentUserId
                      ? "ml-auto max-w-[min(100%,18rem)] rounded-2xl border border-primary/25 bg-white/90 px-2.5 py-2 text-sm text-foreground shadow-sm backdrop-blur-sm dark:border-primary/35 dark:bg-background/85 sm:max-w-[85%]"
                      : "mr-auto max-w-[min(100%,18rem)] rounded-2xl border border-border bg-white/85 px-2.5 py-2 text-sm text-foreground shadow-sm backdrop-blur-sm dark:bg-background/80 sm:max-w-[85%]"
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
