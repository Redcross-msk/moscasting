export type ChatInboxSortMode = "respond_new" | "respond_old" | "msg_unread" | "msg_read";

export const CHAT_INBOX_SORT_OPTIONS: { value: ChatInboxSortMode; label: string }[] = [
  { value: "respond_new", label: "По дате отклика: новые первыми" },
  { value: "respond_old", label: "По дате отклика: старые первыми" },
  {
    value: "msg_unread",
    label: "По сообщениям: сначала с ответом собеседника (как непрочитанные)",
  },
  {
    value: "msg_read",
    label: "По сообщениям: сначала где вы писали последним (как прочитанные)",
  },
];

/** Приоритет для сортировки «кто написал последним»: собеседник → нет сообщений → вы. */
function lastMessageSortPriority(lastMessageIsMine: boolean | null): number {
  if (lastMessageIsMine === false) return 0;
  if (lastMessageIsMine === null) return 1;
  return 2;
}

export function sortChatInboxRows<T extends { sortDateMs: number; lastMessageIsMine: boolean | null }>(
  rows: T[],
  mode: ChatInboxSortMode,
): T[] {
  const arr = [...rows];
  if (mode === "respond_new") {
    arr.sort((a, b) => b.sortDateMs - a.sortDateMs);
  } else if (mode === "respond_old") {
    arr.sort((a, b) => a.sortDateMs - b.sortDateMs);
  } else if (mode === "msg_unread") {
    arr.sort(
      (a, b) =>
        lastMessageSortPriority(a.lastMessageIsMine) - lastMessageSortPriority(b.lastMessageIsMine) ||
        b.sortDateMs - a.sortDateMs,
    );
  } else {
    arr.sort(
      (a, b) =>
        lastMessageSortPriority(b.lastMessageIsMine) - lastMessageSortPriority(a.lastMessageIsMine) ||
        b.sortDateMs - a.sortDateMs,
    );
  }
  return arr;
}
