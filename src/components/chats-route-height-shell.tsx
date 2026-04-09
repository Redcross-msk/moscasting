"use client";

import { cn } from "@/lib/utils";

/**
 * Заполняет оставшееся место под шапкой (body.chat-immersive + flex-цепочка).
 * Без фиксированных dvh и без JS по visualViewport — меньше рассинхрона и прокрутки всей страницы.
 */
export function ChatsRouteHeightShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden basis-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
