import type { ChatMessageReceipt } from "@/lib/chat-message-receipt";
import { cn } from "@/lib/utils";

export type ChatOutgoingReceipt = ChatMessageReceipt;

export function ChatThreadMessageBubble({
  isMine,
  senderLabel,
  timeHm,
  createdAtIso,
  receipt,
  children,
}: {
  isMine: boolean;
  senderLabel: string;
  timeHm: string;
  createdAtIso: string;
  receipt: ChatOutgoingReceipt;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-[min(100%,22rem)] rounded-2xl border px-3 py-2 text-sm shadow-sm sm:max-w-[min(100%,26rem)]",
        isMine
          ? "ml-auto border-primary/25 bg-white/90 text-foreground dark:border-primary/35 dark:bg-background/85"
          : "mr-auto border-border bg-white/85 text-foreground dark:bg-background/80",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-[10px] font-medium leading-snug text-foreground/85 sm:text-xs">
          {senderLabel}
        </p>
        <time
          dateTime={createdAtIso}
          className="shrink-0 text-[10px] tabular-nums text-muted-foreground sm:text-xs"
        >
          {timeHm}
        </time>
      </div>
      <div className="mt-1.5">{children}</div>
      {receipt !== "none" ? (
        <p
          className="mt-1 flex justify-end text-[11px] leading-none text-muted-foreground"
          aria-label={
            receipt === "read"
              ? isMine
                ? "Прочитано собеседником"
                : "Прочитано вами"
              : isMine
                ? "Доставлено"
                : "Получено"
          }
        >
          <span className="tracking-tight">{receipt === "read" ? "✓✓" : "✓"}</span>
        </p>
      ) : null}
    </div>
  );
}
