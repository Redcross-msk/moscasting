import Link from "next/link";
import { auth } from "@/auth";
import { listProducerCastings } from "@/server/services/casting.service";
import { prisma } from "@/lib/db";
import { CastingStatus, ModerationStatus } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ProducerCastingsPaginatedList,
  type ProducerCastingListItem,
} from "@/components/producer-castings-paginated-list";
import { parseShootDatesYmdFromJson } from "@/lib/casting-shoot-dates";

function toProducerCastingListItem(
  c: Awaited<ReturnType<typeof listProducerCastings>>[number],
): ProducerCastingListItem {
  return {
    id: c.id,
    title: c.title,
    cityName: c.city.name,
    metroStation: c.metroStation,
    addressLine: c.addressLine,
    metroOrPlace: c.metroOrPlace,
    paymentRub: c.paymentRub,
    paymentInfo: c.paymentInfo,
    paymentPeriod: c.paymentPeriod,
    shootStartTime: c.shootStartTime,
    scheduledAtIso: c.scheduledAt?.toISOString() ?? null,
    shootDatesYmd: parseShootDatesYmdFromJson(c.shootDatesJson),
    applicationDeadlineIso: c.applicationDeadline?.toISOString() ?? null,
    description: c.description,
    moderationComment: c.moderationComment,
  };
}

export default async function ProducerCastingsPage() {
  const session = await auth();
  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!profile) return <p>Нет профиля</p>;

  const castings = await listProducerCastings(profile.id);

  const moderationQueue = castings.filter(
    (c) => c.moderationStatus === ModerationStatus.PENDING || c.moderationStatus === ModerationStatus.REJECTED,
  );
  const active = castings.filter(
    (c) => c.status === CastingStatus.ACTIVE && c.moderationStatus === ModerationStatus.APPROVED,
  );
  const completed = castings.filter(
    (c) => c.status === CastingStatus.CLOSED || c.status === CastingStatus.ARCHIVED,
  );
  const rest = castings.filter(
    (c) => !moderationQueue.includes(c) && !active.includes(c) && !completed.includes(c),
  );

  return (
    <div className="space-y-8 pb-8 sm:space-y-10 sm:pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Мои кастинги</h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Всего: <span className="font-medium text-foreground">{castings.length}</span>
          </p>
        </div>
        <Button className="h-10 w-full shrink-0 text-sm sm:h-11 sm:w-auto sm:min-w-[180px]" asChild>
          <Link href="/producer/castings/new">Добавить кастинг</Link>
        </Button>
      </div>

      {moderationQueue.length > 0 && (
        <section className="space-y-3">
          <div className="border-l-2 border-amber-500 pl-3">
            <h2 className="text-base font-bold sm:text-lg">На модерации</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">До появления в каталоге</p>
          </div>
          <ProducerCastingsPaginatedList items={moderationQueue.map(toProducerCastingListItem)} />
        </section>
      )}

      <section className="space-y-3">
        <div className="border-l-2 border-primary pl-3">
          <h2 className="text-base font-bold sm:text-lg">Активные</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">В каталоге для актёров</p>
        </div>
        {active.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-xs text-muted-foreground sm:text-sm">
              Нет активных кастингов.
            </CardContent>
          </Card>
        ) : (
          <ProducerCastingsPaginatedList
            items={active.map(toProducerCastingListItem)}
            showComplete
          />
        )}
      </section>

      <section className="space-y-3">
        <div className="border-l-2 border-muted-foreground/30 pl-3">
          <h2 className="text-base font-bold sm:text-lg">Завершённые</h2>
        </div>
        {completed.length === 0 ? (
          <p className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground sm:text-sm">
            Пока пусто.
          </p>
        ) : (
          <ProducerCastingsPaginatedList items={completed.map(toProducerCastingListItem)} />
        )}
      </section>

      {rest.length > 0 && (
        <section className="space-y-3">
          <div className="border-l-2 border-border pl-3">
            <h2 className="text-base font-bold sm:text-lg">Прочие</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">Черновики, пауза</p>
          </div>
          <ProducerCastingsPaginatedList items={rest.map(toProducerCastingListItem)} />
        </section>
      )}
    </div>
  );
}
