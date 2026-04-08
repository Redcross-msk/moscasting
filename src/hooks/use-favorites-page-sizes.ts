"use client";

import { useEffect, useState } from "react";

/** Избранное: кастинги 3 / 6, актёры 6 / 9 (моб / md+). */
export function useFavoritesPageSizes() {
  const [castingsPageSize, setCastingsPageSize] = useState(3);
  const [actorsPageSize, setActorsPageSize] = useState(6);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      if (mq.matches) {
        setCastingsPageSize(6);
        setActorsPageSize(9);
      } else {
        setCastingsPageSize(3);
        setActorsPageSize(6);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return { castingsPageSize, actorsPageSize };
}
