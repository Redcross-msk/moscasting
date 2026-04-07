"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAccountMenu } from "@/components/user-account-menu";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "МОСКАСТИНГ";

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex min-h-12 min-w-0 max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:min-h-14 sm:px-4">
        <Link
          href={status === "authenticated" ? "/explore?tab=castings" : "/"}
          className="min-w-0 shrink truncate text-base font-semibold text-primary sm:text-lg"
        >
          {appName}
        </Link>
        <nav className="flex shrink-0 items-center gap-1.5 text-sm sm:gap-2">
          {status === "loading" ? null : session ? (
            <UserAccountMenu />
          ) : (
            <>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Вход
                    <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem asChild>
                    <Link href="/login">Войти</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/obuchenie">Обучение</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portfolio">Портфолио</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/register">
                <Button size="sm">Регистрация</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
