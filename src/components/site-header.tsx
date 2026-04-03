"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
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
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Вход
                </Button>
              </Link>
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
