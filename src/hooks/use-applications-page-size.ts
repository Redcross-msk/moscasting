"use client";

import { useEffect, useState } from "react";

/** «Мои отклики»: 6 карточек на мобилке, 9 от md. */
export function useActorApplicationsPageSize() {
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setPageSize(mq.matches ? 9 : 6);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return pageSize;
}
