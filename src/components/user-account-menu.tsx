"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadChatCount } from "@/hooks/use-unread-chat-count";

export function UserAccountMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);
  const unreadChats = useUnreadChatCount();

  useEffect(() => {
    if (status !== "authenticated") {
      setNotifCount(0);
      return;
    }
    if (pathname === "/notifications") {
      setNotifCount(0);
      return;
    }
    let cancelled = false;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d: { count?: number }) => {
        if (!cancelled) setNotifCount(typeof d.count === "number" ? d.count : 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status, pathname]);

  if (status !== "authenticated" || !session?.user?.id) return null;

  const menuLabel =
    session.user.displayName?.trim() || session.user.name?.trim() || session.user.email || "Аккаунт";

  const role = session.user.role;
  const profileHref = role === "PRODUCER" ? "/producer/profile" : role === "ACTOR" ? "/actor/profile" : "/admin";
  const myCastingsHref = "/producer/castings";
  const myAppsHref = "/actor/applications";
  const chatsHref = role === "PRODUCER" ? "/producer/chats" : role === "ACTOR" ? "/actor/chats" : "/admin";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="max-w-[min(100%,240px)] gap-1 border-border px-2 font-normal">
          <span className="truncate text-xs sm:text-sm">{menuLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{menuLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            router.push("/explore?tab=castings");
          }}
        >
          Главная
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            router.push("/explore?tab=castings");
          }}
        >
          Кастинги
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            router.push("/explore?tab=favorites");
          }}
        >
          Избранное
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            router.push("/obuchenie");
          }}
        >
          Обучение
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            router.push("/portfolio");
          }}
        >
          Портфолио
        </DropdownMenuItem>
        {role === "PRODUCER" ? (
          <DropdownMenuItem
            onSelect={() => {
              router.push(myCastingsHref);
            }}
          >
            Мои кастинги
          </DropdownMenuItem>
        ) : null}
        {role === "ACTOR" ? (
          <DropdownMenuItem
            onSelect={() => {
              router.push(myAppsHref);
            }}
          >
            Мои отклики
          </DropdownMenuItem>
        ) : null}
        {role !== "ADMIN" ? (
          <DropdownMenuItem
            onSelect={() => {
              router.push(chatsHref);
            }}
            className="flex cursor-pointer items-center justify-between gap-2"
          >
            <span>Чаты</span>
            {unreadChats > 0 ? (
              <span
                className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#e53935] px-1 text-[10px] font-semibold text-white"
                aria-hidden
              >
                {unreadChats > 99 ? "99+" : unreadChats}
              </span>
            ) : null}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onSelect={() => {
            router.push("/notifications");
          }}
          className="flex cursor-pointer items-center justify-between gap-2"
        >
          <span>Уведомления</span>
          {notifCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {notifCount > 99 ? "99+" : notifCount}
            </span>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            router.push(profileHref);
          }}
        >
          Профиль
        </DropdownMenuItem>
        {role === "ADMIN" ? (
          <DropdownMenuItem
            onSelect={() => {
              router.push("/admin");
            }}
          >
            Админка
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void signOut({ redirect: false }).then(() => {
              window.location.assign("/");
            });
          }}
        >
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
