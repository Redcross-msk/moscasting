"use client";

import { useEffect, useState } from "react";

/** История одобренных кастингов: 3 карточки на мобилке, 6 от md. */
export function useCastingHistoryPageSize() {
  const [pageSize, setPageSize] = useState(3);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setPageSize(mq.matches ? 6 : 3);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return pageSize;
}
