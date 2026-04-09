import Link from "next/link";
import { ChatsNavButton } from "@/components/chats-nav-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "ACTOR" | "PRODUCER" | "ADMIN" | string;

type ExploreRoleBarProps = {
  role: Role;
  className?: string;
  /** Активная вкладка /explore?tab=favorites — подсветка «Избранное», остальные outline */
  favoritesLinkActive?: boolean;
};

/** Одна строка кнопок; на узком экране при нехватке места — горизонтальная прокрутка. */
/** pt-2 на узкой ширине: при overflow-x-auto вертикальная ось тоже режет вылеты — иначе бейдж «Чаты» обрезается сверху. */
const roleNavClusterClass =
  "flex min-w-0 w-full max-w-full flex-nowrap items-center justify-start gap-x-1.5 overflow-x-auto overscroll-x-contain pt-2 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:ml-auto lg:w-max lg:justify-end lg:gap-2 lg:overflow-visible lg:py-0 [&::-webkit-scrollbar]:hidden";

export function ExploreRoleBar({ role, className, favoritesLinkActive }: ExploreRoleBarProps) {
  const barBtn =
    "h-8 shrink-0 whitespace-nowrap px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm";

  if (role === "ADMIN") {
    return (
      <div
        className={cn(
          roleNavClusterClass,
          className,
        )}
      >
        <Button variant={favoritesLinkActive ? "default" : "outline"} size="sm" className={barBtn} asChild>
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
          roleNavClusterClass,
          className,
        )}
      >
        <Button variant={favoritesLinkActive ? "outline" : "default"} size="sm" className={barBtn} asChild>
          <Link href="/actor/profile">Профиль</Link>
        </Button>
        <Button variant="outline" size="sm" className={barBtn} asChild>
          <Link href="/actor/applications">Мои отклики</Link>
        </Button>
        <ChatsNavButton href="/actor/chats" className={barBtn} />
        <Button variant={favoritesLinkActive ? "default" : "outline"} size="sm" className={barBtn} asChild>
          <Link href="/explore?tab=favorites">Избранное</Link>
        </Button>
      </div>
    );
  }

  if (role === "PRODUCER") {
    return (
      <div
        className={cn(
          roleNavClusterClass,
          className,
        )}
      >
        <Button variant={favoritesLinkActive ? "outline" : "default"} size="sm" className={barBtn} asChild>
          <Link href="/producer/profile">Профиль</Link>
        </Button>
        <Button variant="outline" size="sm" className={barBtn} asChild>
          <Link href="/producer/castings">Мои кастинги</Link>
        </Button>
        <Button variant="outline" size="sm" className={cn(barBtn, "font-semibold")} asChild>
          <Link href="/producer/castings/new">Добавить кастинг</Link>
        </Button>
        <ChatsNavButton href="/producer/chats" className={barBtn} />
        <Button variant={favoritesLinkActive ? "default" : "outline"} size="sm" className={barBtn} asChild>
          <Link href="/explore?tab=favorites">Избранное</Link>
        </Button>
      </div>
    );
  }

  return null;
}
