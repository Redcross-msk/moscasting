import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "ACTOR" | "PRODUCER" | "ADMIN" | string;

export function ExploreRoleBar({ role, className }: { role: Role; className?: string }) {
  const barBtn =
    "h-8 shrink-0 whitespace-nowrap px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm";

  if (role === "ADMIN") {
    return (
      <div
        className={cn(
          "mobile-scroll-row w-full min-w-0 justify-start sm:justify-end",
          className,
        )}
      >
        <Button variant="outline" size="sm" className={barBtn} asChild>
          <Link href="/explore?tab=favorites">Избранное</Link>
        </Button>
        <Button variant="outline" size="sm" className={barBtn} asChild>
          <Link href="/admin">Админка</Link>
        </Button>
      </div>
    );
  }

  if (role === "ACTOR") {
    return (
      <div
        className={cn(
          "mobile-scroll-row w-full min-w-0 justify-start sm:justify-end",
          className,
        )}
      >
        <Button variant="default" size="sm" className={barBtn} asChild>
          <Link href="/actor/profile">Профиль</Link>
        </Button>
        <Button variant="outline" size="sm" className={barBtn} asChild>
          <Link href="/actor/applications">Мои отклики</Link>
        </Button>
        <Button variant="outline" size="sm" className={barBtn} asChild>
          <Link href="/actor/chats">Чаты</Link>
        </Button>
        <Button variant="outline" size="sm" className={barBtn} asChild>
          <Link href="/explore?tab=favorites">Избранное</Link>
        </Button>
      </div>
    );
  }

  if (role === "PRODUCER") {
    return (
      <div
        className={cn(
          "mobile-scroll-row w-full min-w-0 justify-start sm:justify-end",
          className,
        )}
      >
        <Button variant="default" size="sm" className={barBtn} asChild>
          <Link href="/producer/profile">Профиль</Link>
        </Button>
        <Button variant="outline" size="sm" className={barBtn} asChild>
          <Link href="/producer/castings">Мои кастинги</Link>
        </Button>
        <Button variant="outline" size="sm" className={cn(barBtn, "font-semibold")} asChild>
          <Link href="/producer/castings/new">Добавить кастинг</Link>
        </Button>
        <Button variant="outline" size="sm" className={barBtn} asChild>
          <Link href="/producer/chats">Чаты</Link>
        </Button>
        <Button variant="outline" size="sm" className={barBtn} asChild>
          <Link href="/explore?tab=favorites">Избранное</Link>
        </Button>
      </div>
    );
  }

  return null;
}
