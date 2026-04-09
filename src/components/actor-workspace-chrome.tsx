"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ExploreRoleBar } from "@/components/explore-role-bar";
import { Button } from "@/components/ui/button";

export function ActorWorkspaceChrome({ role, children }: { role: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const immersiveChat =
    pathname.startsWith("/actor/chats/") ||
    (pathname === "/actor/chats" &&
      (Boolean(searchParams.get("chat")) || Boolean(searchParams.get("direct"))));

  if (immersiveChat) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="mb-3 shrink-0 border-b border-border pb-3">
          <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
            <Link href="/actor/chats">
              <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
              К списку чатов
            </Link>
          </Button>
        </div>
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 sm:gap-6">
      <div className="flex min-w-0 shrink-0 flex-row flex-wrap items-center gap-x-2 gap-y-2 border-b border-border pb-4 lg:flex-nowrap lg:items-center lg:justify-between">
        <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
          <Link href="/explore?tab=castings">
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            На главную
          </Link>
        </Button>
        <div className="min-w-0 flex-1 lg:w-auto lg:max-w-[min(100%,42rem)] lg:flex-none">
          <ExploreRoleBar role={role} />
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
