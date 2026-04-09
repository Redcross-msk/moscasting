"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import type { ApplicationStatus } from "@prisma/client";
import { ChatComposerUnified } from "@/components/chat-composer-unified";
import { ChatMessageContent } from "@/components/chat-message-content";
import {
  ChatThreadMessageBubble,
  type ChatOutgoingReceipt,
} from "@/components/chat-thread-message-bubble";
import { ChatInboxSortMenu } from "@/components/chat-inbox-sort-menu";
import { ChatInboxUnreadBadge } from "@/components/chat-inbox-unread-badge";
import { ProducerApplicationChatToolbar } from "@/components/producer-application-chat-toolbar";
import { Button } from "@/components/ui/button";
import {
  fetchApplicationChatPanelAction,
  fetchDirectThreadPanelAction,
  sendDirectThreadMessageAction,
} from "@/features/chat/direct-actions";
import { useInboxPageSize } from "@/hooks/use-inbox-page-size";
import { useScrollTopOnPageChange } from "@/hooks/use-scroll-top-on-page-change";
import { type ChatInboxSortMode, sortChatInboxRows } from "@/lib/chat-inbox-sort";
import { formatChatPreviewTime } from "@/lib/format-chat-preview-time";
import { cn, formatActorSurnameAndFirstName } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export type ProducerInboxItem = {
  kind: "application";
  castingId: string;
  castingTitle: string;
  chatId: string;
  actorName: string;
  actorProfileId: string;
  preview: string;
  applicationSubmittedAt: string;
  lastMessageIsMine: boolean | null;
  hasUnread: boolean;
  unreadCount: number;
  lastMessageAt: string;
};

type MergedRow = ProducerInboxItem & { sortDateMs: number };

type PanelMessage = {
  id: string;
  senderId: string;
  senderLabel: string;
  createdAtIso: string;
  timeHm: string;
  receipt: ChatOutgoingReceipt;
  body: string;
  payload?: unknown;
};

type PanelApp = {
  kind: "application";
  chatId: string;
  title: string;
  subtitle: string;
  closedAt: string | null;
  applicationId: string;
  applicationStatus: ApplicationStatus;
  messages: PanelMessage[];
};

type PanelDirect = {
  kind: "direct";
  threadId: string;
  title: string;
  subtitle: string;
  messages: PanelMessage[];
};

type Panel = PanelApp | PanelDirect | null;

export function ProducerChatsInbox({
  items,
  currentUserId,
  directChatDisabledMessage,
}: {
  items: ProducerInboxItem[];
  currentUserId: string;
  directChatDisabledMessage?: string | null;
}) {
  const searchParams = useSearchParams();
  const [panel, setPanel] = useState<Panel>(null);
  const [pending, start] = useTransition();
  const [composer, setComposer] = useState("");
  const [sortMode, setSortMode] = useState<ChatInboxSortMode>("respond_new");
  const [page, setPage] = useState(1);
  const pageSize = useInboxPageSize();
  const [clearedUnread, setClearedUnread] = useState<Record<string, true>>({});

  const loadApp = useCallback((chatId: string) => {
    start(async () => {
      const data = await fetchApplicationChatPanelAction(chatId);
      setPanel(data);
      if (data) setClearedUnread((p) => ({ ...p, [`app:${chatId}`]: true }));
    });
  }, []);

  const loadDirect = useCallback((threadId: string) => {
    start(async () => {
      const data = await fetchDirectThreadPanelAction(threadId);
      setPanel(data);
      if (data) setClearedUnread((p) => ({ ...p, [`dir:${threadId}`]: true }));
    });
  }, []);

  useEffect(() => {
    const d = searchParams.get("direct");
    const ch = searchParams.get("chat");
    if (d) loadDirect(d);
    else if (ch) loadApp(ch);
  }, [searchParams, loadDirect, loadApp]);

  const merged = useMemo((): MergedRow[] => {
    const rows: MergedRow[] = items.map((it) => ({
      ...it,
      sortDateMs: Date.parse(it.applicationSubmittedAt),
    }));
    return sortChatInboxRows(rows, sortMode);
  }, [items, sortMode]);

  const totalPages = Math.max(1, Math.ceil(merged.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageSlice = useMemo(
    () => merged.slice((safePage - 1) * pageSize, safePage * pageSize),
    [merged, safePage, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [sortMode, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useScrollTopOnPageChange(safePage);

  function sendDirect() {
    const text = composer.trim();
    if (!text || !panel || panel.kind !== "direct") return;
    start(async () => {
      await sendDirectThreadMessageAction(panel.threadId, text);
      setComposer("");
      loadDirect(panel.threadId);
    });
  }

  const hasAny = merged.length > 0;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        !panel && "space-y-4",
        panel && "min-h-0 overflow-hidden",
      )}
    >
      {!panel ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h1 className="text-2xl font-bold">Чаты</h1>
          {hasAny ? (
            <ChatInboxSortMenu sortMode={sortMode} onSortModeChange={setSortMode} className="w-full sm:w-auto" />
          ) : null}
        </div>
      ) : null}

      {directChatDisabledMessage ? (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          {directChatDisabledMessage}
        </div>
      ) : null}
      <div
        className={cn(
          "min-h-0 gap-0 md:grid md:grid-cols-12 md:items-stretch md:gap-4",
          panel
            ? "flex flex-1 min-h-0 flex-col overflow-hidden md:min-h-[min(560px,calc(100dvh-10rem))] md:max-h-[calc(100dvh-10rem)]"
            : "md:min-h-[480px]",
        )}
      >
        <aside
          className={cn(
            "border-b border-border pb-4 md:col-span-4 md:flex md:min-h-0 md:flex-col md:border-b-0 md:border-r md:pb-0 md:pr-4",
            panel ? "hidden md:flex" : "flex",
          )}
        >
          <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
            {!hasAny ? (
              <p className="text-sm text-muted-foreground">Пока нет чатов</p>
            ) : (
              <>
                <ul className="flex flex-col gap-2.5">
                  {pageSlice.map((row) => (
                    <li key={row.chatId}>
                      <button
                        type="button"
                        onClick={() => loadApp(row.chatId)}
                        className={cn(
                          "relative flex w-full flex-col gap-2 rounded-lg border border-border bg-background/90 px-3 pb-7 pt-3 text-left text-sm shadow-sm transition hover:bg-muted/40 active:bg-muted/60",
                          panel?.kind === "application" &&
                            panel.chatId === row.chatId &&
                            "border-primary/40 bg-primary/5 font-medium ring-2 ring-primary/20",
                        )}
                      >
                        <ChatInboxUnreadBadge
                          count={clearedUnread[`app:${row.chatId}`] ? 0 : row.unreadCount}
                          className="absolute right-2 top-2"
                        />
                        <span className="min-w-0 flex-1 pr-10">
                          <span className="block font-semibold leading-snug">{row.castingTitle}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {formatActorSurnameAndFirstName(row.actorName)}
                          </span>
                          {row.preview ? (
                            <span className="mt-2 block border-t border-border/50 pt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                              {row.preview}
                            </span>
                          ) : null}
                        </span>
                        <span className="absolute bottom-2 right-2 text-xs tabular-nums text-muted-foreground">
                          {formatChatPreviewTime(row.lastMessageAt)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {totalPages > 1 ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border/60 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 min-w-[5.5rem]"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Назад
                    </Button>
                    <span className="px-2 text-sm tabular-nums text-muted-foreground">
                      {safePage} / {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 min-w-[5.5rem]"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Вперёд
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </aside>

        <section
          className={cn(
            "flex min-h-0 flex-col overflow-hidden md:col-span-8 md:min-h-0",
            !panel && "hidden md:flex md:min-h-[480px]",
            panel && "min-h-0 flex-1 md:h-full md:max-h-none",
          )}
        >
          {!panel ? (
            <div className="flex min-h-[480px] flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground md:p-8">
              Выберите чат в списке слева.
            </div>
          ) : (
            <>
              <div className="mb-3 shrink-0 space-y-3 border-b border-border pb-3">
                <div>
                  <h2 className="text-lg font-bold leading-tight">{panel.title}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{panel.subtitle}</p>
                </div>
                {panel.kind === "application" ? (
                  <ProducerApplicationChatToolbar
                    applicationId={panel.applicationId}
                    status={panel.applicationStatus}
                    onDone={() => loadApp(panel.chatId)}
                  />
                ) : null}
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain rounded-xl border border-border/80 bg-muted/20 p-2 sm:p-3">
                {panel.messages.map((m) => (
                  <ChatThreadMessageBubble
                    key={m.id}
                    isMine={m.senderId === currentUserId}
                    senderLabel={m.senderLabel}
                    timeHm={m.timeHm}
                    createdAtIso={m.createdAtIso}
                    receipt={m.receipt}
                  >
                    {panel.kind === "application" ? (
                      <ChatMessageContent body={m.body} payload={m.payload} />
                    ) : (
                      <p className="whitespace-pre-wrap">{m.body}</p>
                    )}
                  </ChatThreadMessageBubble>
                ))}
              </div>
              {panel.kind === "application" ? (
                <div className="mt-2 shrink-0 sm:mt-3">
                  <ChatComposerUnified
                    chatId={panel.chatId}
                    disabled={!!panel.closedAt}
                    compact
                    onAfterSend={() => loadApp(panel.chatId)}
                  />
                </div>
              ) : (
                <form
                  className="mt-2 flex shrink-0 flex-col gap-2 sm:mt-3"
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
