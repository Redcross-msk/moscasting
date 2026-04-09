"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * На мобильных фиксированный 100dvh «залипает» после закрытия клавиатуры — остаётся пустота.
 * Высота блока чатов привязываем к window.visualViewport (реальная видимая область).
 * На sm+ остаются только CSS calc (десктоп).
 */
export function ChatsRouteHeightShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lastVvHRef = useRef(0);

  const apply = useCallback(() => {
    const el = rootRef.current;
    if (!el || typeof window === "undefined") return;

    if (!window.matchMedia("(max-width: 639.98px)").matches) {
      el.style.removeProperty("height");
      el.style.removeProperty("max-height");
      lastVvHRef.current = 0;
      return;
    }

    const vv = window.visualViewport;
    if (!vv) return;

    const top = el.getBoundingClientRect().top;
    const pad = 8;
    const h = Math.max(180, Math.round(vv.height - top - pad));
    el.style.height = `${h}px`;
    el.style.maxHeight = `${h}px`;

    const vvH = vv.height;
    if (lastVvHRef.current > 0 && vvH > lastVvHRef.current + 80) {
      window.scrollTo(0, 0);
    }
    lastVvHRef.current = vvH;
  }, []);

  useEffect(() => {
    apply();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    document.addEventListener("focusin", apply);
    document.addEventListener("focusout", apply);
    return () => {
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
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
