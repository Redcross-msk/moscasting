/** Время последнего сообщения в превью списка чатов: сегодня — ЧЧ:ММ, иначе дд.мм. */
export function formatChatPreviewTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}
