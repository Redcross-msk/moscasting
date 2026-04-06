import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "ACTOR" | "PRODUCER" | "ADMIN" | string;

type ExploreRoleBarProps = {
  role: Role;
  className?: string;
  /** На /explore вкладка «Избранное» уже есть — не дублировать кнопку */
  omitFavoritesLink?: boolean;
};

export function ExploreRoleBar({ role, className, omitFavoritesLink }: ExploreRoleBarProps) {
  const barBtn =
    "h-8 shrink-0 whitespace-nowrap px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm";

  if (role === "ADMIN") {
    return (
      <div
        className={cn(
          "flex w-max min-w-0 max-w-full flex-nowrap items-center justify-end gap-1.5 sm:gap-2 md:ml-auto",
          className,
        )}
      >
        {!omitFavoritesLink ? (
          <Button variant="outline" size="sm" className={barBtn} asChild>
            <Link href="/explore?tab=favorites">Избранное</Link>
          </Button>
        ) : null}
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
          "flex w-max min-w-0 max-w-full flex-nowrap items-center justify-end gap-1.5 sm:gap-2 md:ml-auto",
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
        {!omitFavoritesLink ? (
          <Button variant="outline" size="sm" className={barBtn} asChild>
            <Link href="/explore?tab=favorites">Избранное</Link>
          </Button>
        ) : null}
      </div>
    );
  }

  if (role === "PRODUCER") {
    return (
      <div
        className={cn(
          "flex w-max min-w-0 max-w-full flex-nowrap items-center justify-end gap-1.5 sm:gap-2 md:ml-auto",
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
        {!omitFavoritesLink ? (
          <Button variant="outline" size="sm" className={barBtn} asChild>
            <Link href="/explore?tab=favorites">Избранное</Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return null;
}
