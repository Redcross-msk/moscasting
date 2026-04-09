"use client";

import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useUnreadChatCount } from "@/hooks/use-unread-chat-count";
import { cn } from "@/lib/utils";

type ChatsNavButtonProps = {
  href: string;
  className?: string;
  variant?: ButtonProps["variant"];
};

/** Кнопка «Чаты» с красным бейджем количества диалогов с непрочитанными входящими. */
export function ChatsNavButton({ href, className, variant = "outline" }: ChatsNavButtonProps) {
  const count = useUnreadChatCount();
  const label = count > 99 ? "99+" : String(count);

  return (
    <Button variant={variant} size="sm" className={cn("relative overflow-visible", className)} asChild>
      <Link href={href} className="relative overflow-visible">
        Чаты
        {count > 0 ? (
          <span
            className="pointer-events-none absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#e53935] px-1 text-[10px] font-semibold leading-none text-white shadow-sm ring-2 ring-background"
            aria-label={`Непрочитанных чатов: ${count}`}
          >
            {label}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
