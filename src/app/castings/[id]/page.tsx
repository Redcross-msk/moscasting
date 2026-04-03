import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CastingPublicDetail } from "@/components/casting-public-detail";
import { CastingQuickApply } from "@/components/casting-quick-apply";
import { ExploreRoleBar } from "@/components/explore-role-bar";
import { FavoriteHeartButton } from "@/components/favorite-heart-button";
import { Button } from "@/components/ui/button";
import { getCastingPublic, recordCastingView } from "@/server/services/casting.service";
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

  let castingFavorited = false;
  if (session?.user?.id) {
    const fav = await prisma.favoriteCasting.findUnique({
      where: { userId_castingId: { userId: session.user.id, castingId: id } },
    });
    castingFavorited = Boolean(fav);
  }

  const topActions = (
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
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
          <Link href="/explore?tab=castings">
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            На главную
          </Link>
        </Button>
        {session?.user?.role ? <ExploreRoleBar role={session.user.role} /> : null}
      </div>

      <CastingPublicDetail casting={casting} topActions={topActions} />
    </div>
  );
}
