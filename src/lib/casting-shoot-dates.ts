/** Нормализация списка дат съёмки YYYY-MM-DD из JSON в БД. */
export function parseShootDatesYmdFromJson(json: unknown): string[] | null {
  if (!Array.isArray(json)) return null;
  const out = json
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
  const uniq = [...new Set(out)].sort();
  return uniq.length ? uniq : null;
}

export function parseShootDatesJsonFromForm(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  try {
    const v = JSON.parse(t) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
  } catch {
    return [];
  }
}

/** Первая дата для сортировки / фильтра каталога (полдень UTC). */
export function scheduledAtFromShootDatesYmd(ymdList: string[]): Date | undefined {
  if (!ymdList.length) return undefined;
  const first = ymdList[0]!;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(first);
  if (!m) return undefined;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(Date.UTC(y, mo - 1, d, 12, 0, 0, 0));
}

export function ymdFromLocalDate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}
