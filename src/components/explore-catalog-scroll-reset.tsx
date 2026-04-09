"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Каталог /explore: при смене вкладки или страницы пагинации (page / cPage) поднимаем скролл.
 * Ссылки пагинации не всегда сбрасывают позицию на мобильных.
 */
export function ExploreCatalogScrollReset() {
  const sp = useSearchParams();
  const tab = sp.get("tab") ?? "castings";
  const actorPage = sp.get("page") ?? "";
  const cPage = sp.get("cPage") ?? "";
  const marker = `${tab}|${actorPage}|${cPage}`;
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevRef.current === null) {
      prevRef.current = marker;
      return;
    }
    if (prevRef.current !== marker) {
      prevRef.current = marker;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [marker]);

  return null;
}
