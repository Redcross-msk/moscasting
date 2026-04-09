"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * На мобильных высота блока чатов по нижней границе visualViewport (с учётом offsetTop).
 * Раньше использовались vv.height - top без offsetTop и слушатель scroll на vv — из-за этого
 * после клавиатуры получалась лишняя прокрутка и «белый» хвост внутри списка сообщений.
 * На sm+ — только CSS calc.
 */
export function ChatsRouteHeightShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  const apply = useCallback(() => {
    const el = rootRef.current;
    if (!el || typeof window === "undefined") return;

    if (!window.matchMedia("(max-width: 639.98px)").matches) {
      el.style.removeProperty("height");
      el.style.removeProperty("max-height");
      return;
    }

    const vv = window.visualViewport;
    if (!vv) return;

    const top = el.getBoundingClientRect().top;
    const pad = 8;
    const visibleBottom = vv.offsetTop + vv.height;
    let h = Math.round(visibleBottom - top - pad);
    const ceiling = Math.round(window.innerHeight - top - pad);
    h = Math.min(h, ceiling);
    h = Math.max(180, h);
    el.style.height = `${h}px`;
    el.style.maxHeight = `${h}px`;
  }, []);

  useEffect(() => {
    apply();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", apply);
    window.addEventListener("resize", apply);
    document.addEventListener("focusin", apply);
    document.addEventListener("focusout", apply);
    return () => {
      vv?.removeEventListener("resize", apply);
      window.removeEventListener("resize", apply);
      document.removeEventListener("focusin", apply);
      document.removeEventListener("focusout", apply);
    };
  }, [apply]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex min-h-0 w-full max-w-full flex-col overflow-hidden",
        "h-[calc(100dvh-10.5rem)] max-h-[calc(100dvh-10.5rem)] sm:h-[calc(100dvh-11.5rem)] sm:max-h-[calc(100dvh-11.5rem)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
