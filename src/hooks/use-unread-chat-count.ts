"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const DEFAULT_POLL_MS = 22_000;

/** Счётчик диалогов с непрочитанными входящими; обновляется при смене маршрута, фокусе окна и по интервалу. */
export function useUnreadChatCount(pollMs: number = DEFAULT_POLL_MS) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void fetch("/api/chats/unread-count")
        .then((r) => r.json())
        .then((d: { count?: number }) => {
          if (!cancelled) setCount(typeof d.count === "number" ? d.count : 0);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, pollMs);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname, pollMs]);

  return count;
}
