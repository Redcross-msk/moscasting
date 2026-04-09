import { cn } from "@/lib/utils";

/** Красный кружок с числом непрочитанных входящих в списке чатов. */
export function ChatInboxUnreadBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={cn(
        "flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-[#e53935] px-1.5 text-[11px] font-bold leading-none text-white shadow-sm ring-2 ring-card",
        className,
      )}
      title={`Непрочитанных сообщений: ${count}`}
      aria-label={`Непрочитанных сообщений: ${count}`}
    >
      {label}
    </span>
  );
}
