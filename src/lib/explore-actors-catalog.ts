/** Размер страницы каталога актёров на десктопе (/explore?tab=actors). */
export const ACTORS_CATALOG_PAGE_SIZE_DESKTOP = 9;

/** На мобильных — 10 карточек, чтобы сетка 2×5 без «дырки» после 9. */
export const ACTORS_CATALOG_PAGE_SIZE_MOBILE = 10;

/** @deprecated Используйте resolveActorsCatalogPageSize для учёта мобильной версии. */
export const ACTORS_CATALOG_PAGE_SIZE = ACTORS_CATALOG_PAGE_SIZE_DESKTOP;

/** Размер страницы каталога кастингов (/explore?tab=castings). */
export const CASTINGS_CATALOG_PAGE_SIZE = 9;

export function isMobileCatalogUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

export function resolveActorsCatalogPageSize(userAgent: string | null): number {
  return isMobileCatalogUserAgent(userAgent)
    ? ACTORS_CATALOG_PAGE_SIZE_MOBILE
    : ACTORS_CATALOG_PAGE_SIZE_DESKTOP;
}
