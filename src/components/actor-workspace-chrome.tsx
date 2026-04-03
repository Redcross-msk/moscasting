"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ExploreRoleBar } from "@/components/explore-role-bar";
import { Button } from "@/components/ui/button";

export function ActorWorkspaceChrome({ role, children }: { role: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex min-w-0 flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
          <Link href="/explore?tab=castings">
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            На главную
          </Link>
        </Button>
        <div className="min-w-0 w-full sm:w-auto sm:max-w-[min(100%,42rem)]">
          <ExploreRoleBar role={role} />
        </div>
      </div>
      {children}
    </div>
  );
}
