import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CastingPublicDetail } from "@/components/casting-public-detail";
import { CastingQuickApply } from "@/components/casting-quick-apply";
import { ExploreRoleBar } from "@/components/explore-role-bar";
import { FavoriteHeartButton } from "@/components/favorite-heart-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCastingPublic, isCastingPublicViewOnly, recordCastingView } from "@/server/services/casting.service";
import { cn } from "@/lib/utils";
import { ReportCastingButton } from "./report-button";

export default async function CastingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const casting = await getCastingPublic(id);
  if (!casting) notFound();

  const session = await auth();
  await recordCastingView(id, session?.user?.id ?? null);

  let myApplicationChatId: string | null = null;
  if (session?.user.role === "ACTOR") {
    const profile = await prisma.actorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (profile) {
      const app = await prisma.application.findUnique({
        where: {
          castingId_actorProfileId: { castingId: id, actorProfileId: profile.id },
        },
        include: { chat: { select: { id: true } } },
      });
      myApplicationChatId = app?.chat?.id ?? null;
    }
  }

  const viewOnly = isCastingPublicViewOnly(casting.status);

  let castingFavorited = false;
  if (!viewOnly && session?.user?.id) {
    const fav = await prisma.favoriteCasting.findUnique({
      where: { userId_castingId: { userId: session.user.id, castingId: id } },
    });
    castingFavorited = Boolean(fav);
  }

  const topActions = viewOnly ? (
    <>
      <div
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "pointer-events-none w-full border-primary text-primary hover:bg-transparent",
          "text-center text-xs font-semibold uppercase tracking-wide",
        )}
        role="status"
      >
        КАСТИНГ ЗАВЕРШЕН
      </div>
      {session?.user ? <ReportCastingButton castingId={id} compactLabel className="font-medium" /> : null}
    </>
  ) : (
    <>
      {session?.user ? (
        <div className="flex justify-end lg:justify-start">
          <FavoriteHeartButton
            kind="casting"
            targetId={id}
            initial={castingFavorited}
            label="Избранный кастинг"
            className="h-11 w-11"
          />
        </div>
      ) : null}
      <CastingQuickApply
        castingId={id}
        castingTitle={casting.title}
        myApplicationChatId={myApplicationChatId}
        userRole={session?.user?.role}
        variant="detailPageColumn"
      />
      {session?.user ? <ReportCastingButton castingId={id} compactLabel className="font-medium" /> : null}
    </>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex min-w-0 flex-row flex-wrap items-center gap-x-2 gap-y-2 border-b border-border pb-4 lg:flex-nowrap lg:items-center lg:justify-between">
        <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
          <Link href="/explore?tab=castings">
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            На главную
          </Link>
        </Button>
        {session?.user?.role ? (
          <div className="min-w-0 flex-1 lg:w-auto lg:flex-none">
            <ExploreRoleBar role={session.user.role} />
          </div>
        ) : null}
      </div>

      <CastingPublicDetail casting={casting} topActions={topActions} />
    </div>
  );
}
