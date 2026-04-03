import Link from "next/link";
import { auth } from "@/auth";
import { listProducerCastings } from "@/server/services/casting.service";
import { prisma } from "@/lib/db";
import { CastingStatus, ModerationStatus } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProducerCastingCardActions } from "@/components/producer-casting-card-actions";
import { ProducerCastingSpecGrid } from "@/components/producer-casting-spec-grid";

function formatDtShort(d: Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
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

  function CastingListCard({ c, showComplete }: { c: (typeof castings)[0]; showComplete?: boolean }) {
    const loc = [c.metroStation, c.addressLine].filter(Boolean).join(" · ") || c.metroOrPlace || "—";
    const pay =
      c.paymentRub != null
        ? `${c.paymentRub.toLocaleString("ru-RU")} ₽${c.paymentInfo ? ` · ${c.paymentInfo}` : ""}`
        : c.paymentInfo || "—";

    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="space-y-3 p-3 sm:space-y-3 sm:p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
            <h3 className="min-w-0 text-base font-semibold leading-snug sm:text-lg">
              <Link href={`/producer/castings/${c.id}`} className="text-foreground hover:text-primary hover:underline">
                {c.title}
              </Link>
            </h3>
            <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">{c.city.name}</span>
          </div>

          <ProducerCastingSpecGrid
            rows={[
              { label: "Съёмка", value: formatDtShort(c.scheduledAt) },
              { label: "Старт", value: c.shootStartTime?.trim() || "—" },
              { label: "Локация", value: loc, span: "full" },
              { label: "Оплата", value: pay, span: "full" },
              { label: "Дедлайн откликов", value: formatDtShort(c.applicationDeadline) },
            ]}
          />

          {c.moderationComment ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">
              {c.moderationComment}
            </p>
          ) : null}

          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{c.description}</p>

          <ProducerCastingCardActions castingId={c.id} showComplete={showComplete} />
        </CardContent>
      </Card>
    );
  }

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
          <div className="grid gap-3">
            {moderationQueue.map((c) => (
              <CastingListCard key={c.id} c={c} />
            ))}
          </div>
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
          <div className="grid gap-3">
            {active.map((c) => (
              <CastingListCard key={c.id} c={c} showComplete />
            ))}
          </div>
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
          <div className="grid gap-3">
            {completed.map((c) => (
              <CastingListCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </section>

      {rest.length > 0 && (
        <section className="space-y-3">
          <div className="border-l-2 border-border pl-3">
            <h2 className="text-base font-bold sm:text-lg">Прочие</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">Черновики, пауза</p>
          </div>
          <div className="grid gap-3">
            {rest.map((c) => (
              <CastingListCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
