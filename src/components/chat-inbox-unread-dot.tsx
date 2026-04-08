import { cn } from "@/lib/utils";

/** Синий индикатор непрочитанных входящих в строке списка чатов (цвет primary). */
export function ChatInboxUnreadDot({
  show,
  className,
}: {
  show: boolean;
  className?: string;
}) {
  if (!show) return null;
  return (
    <span
      className={cn(
        "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-sm ring-2 ring-card",
        className,
      )}
      title="Непрочитанные сообщения"
      aria-hidden
    />
  );
}
