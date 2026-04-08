"use client";

import { useEffect, useState } from "react";

/** Мобильная адаптация: 6 строк; десктоп (md+): 12. */
export function useInboxPageSize() {
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setPageSize(mq.matches ? 12 : 6);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return pageSize;
}
