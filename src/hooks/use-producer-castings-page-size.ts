"use client";

import { useEffect, useState } from "react";

/** «Мои кастинги»: 3 карточки на мобилке, 9 от md. */
export function useProducerCastingsPageSize() {
  const [pageSize, setPageSize] = useState(3);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setPageSize(mq.matches ? 9 : 3);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return pageSize;
}
