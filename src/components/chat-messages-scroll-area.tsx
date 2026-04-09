"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Прокрутка к последнему сообщению при открытии треда и после скрытия клавиатуры.
 */
export function ChatMessagesScrollArea({
  children,
  className,
  scrollKey,
}: {
  children: React.ReactNode;
  className?: string;
  scrollKey: string | number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prevVvHeightRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [scrollKey, scrollToBottom]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    prevVvHeightRef.current = vv.height;

    const onResize = () => {
      const h = vv.height;
      const prev = prevVvHeightRef.current;
      if (prev > 0 && h > prev + 72) {
        requestAnimationFrame(() => {
          requestAnimationFrame(scrollToBottom);
        });
      }
      prevVvHeightRef.current = h;
    };

    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, [scrollToBottom]);

  return (
    <div ref={ref} className={cn(className)}>
      <div className="flex min-w-0 flex-col space-y-2">{children}</div>
    </div>
  );
}
