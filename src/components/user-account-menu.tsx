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

export function UserAccountMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") {
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

  if (status !== "authenticated" || !session?.user?.email) return null;

  const role = session.user.role;
  const profileHref = role === "PRODUCER" ? "/producer/profile" : role === "ACTOR" ? "/actor/profile" : "/admin";
  const myCastingsHref = "/producer/castings";
  const myAppsHref = "/actor/applications";
  const chatsHref = role === "PRODUCER" ? "/producer/chats" : role === "ACTOR" ? "/actor/chats" : "/admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="max-w-[min(100%,240px)] gap-1 border-border px-2 font-normal">
          <span className="truncate text-xs sm:text-sm">{session.user.email}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {session.user.email}
        </DropdownMenuLabel>
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
          >
            Чаты
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
