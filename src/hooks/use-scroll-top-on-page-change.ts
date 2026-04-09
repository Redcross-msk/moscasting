"use client";

import { useEffect, useRef } from "react";

/**
 * После смены страницы пагинации (не при первом монтировании) прокручивает документ в начало.
 * Нужно на мобильных, где контент короче экрана и остаётся «внизу» после нажатия «Вперёд».
 */
export function useScrollTopOnPageChange(page: number) {
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [page]);
}
