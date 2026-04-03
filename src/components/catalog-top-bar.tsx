import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ExploreRoleBar } from "@/components/explore-role-bar";
import { Button } from "@/components/ui/button";

/** Верхняя полоса «На главную» + те же кнопки, что в каталоге (профиль, кастинги, чаты, избранное…). */
export function CatalogTopBar({ role }: { role: string }) {
  return (
    <div className="mb-8 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
        <Link href="/explore?tab=castings">
          <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
          На главную
        </Link>
      </Button>
      <ExploreRoleBar role={role} />
    </div>
  );
}
