"use client";

import { cn } from "@/lib/utils";
import { ChatComposerUnified } from "@/components/chat-composer-unified";

const barInner =
  "mx-auto max-w-6xl border-t border-border/60 bg-background shadow-[0_-6px_20px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_-6px_20px_-6px_rgba(0,0,0,0.35)] px-3 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))]";

/** Нижняя панель: на узком экране fixed к вьюпорту (Safari), иначе в потоке. */
export function ChatMobileFixedBottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "shrink-0",
        "max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-[70]",
        "sm:static sm:z-auto",
      )}
    >
      <div className={barInner}>{children}</div>
    </div>
  );
}

/**
 * На телефоне композер вне flex-потока (fixed к низу экрана), иначе Safari часто уводит его под панель браузера.
 * На sm+ остаётся обычный блок в колонке чата.
 */
export function ChatThreadComposerBar({
  chatId,
  disabled,
  compact,
  onAfterSend,
}: {
  chatId: string;
  disabled?: boolean;
  compact?: boolean;
  onAfterSend?: () => void;
}) {
  return (
    <ChatMobileFixedBottomBar>
      <ChatComposerUnified
        chatId={chatId}
        disabled={disabled}
        compact={compact}
        onAfterSend={onAfterSend}
      />
    </ChatMobileFixedBottomBar>
  );
}
