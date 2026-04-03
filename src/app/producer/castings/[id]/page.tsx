import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CastingStatus, ModerationStatus } from "@prisma/client";
import { getCastingForProducer } from "@/server/services/casting.service";
import { listApplicationsForCasting } from "@/server/services/application.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateAge } from "@/lib/utils";
import { ProducerCastingCardActions } from "@/components/producer-casting-card-actions";
import { ProducerCastingSpecGrid } from "@/components/producer-casting-spec-grid";

function formatDt(d: Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export default async function ProducerCastingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!profile) notFound();

  const casting = await getCastingForProducer(id, profile.id);
  if (!casting) notFound();

  let applications;
  try {
    applications = await listApplicationsForCasting(id, profile.id);
  } catch {
    notFound();
  }

  const isActivePublished =
    casting.status === CastingStatus.ACTIVE && casting.moderationStatus === ModerationStatus.APPROVED;

  const loc =
    [casting.metroStation, casting.addressLine].filter(Boolean).join(" · ") || casting.metroOrPlace || "—";
  const pay =
    casting.paymentRub != null
      ? `${casting.paymentRub.toLocaleString("ru-RU")} ₽${casting.paymentInfo ? ` · ${casting.paymentInfo}` : ""}`
      : casting.paymentInfo || "—";

  return (
    <div className="space-y-5 pb-8 sm:space-y-6">
      <div className="space-y-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl md:text-3xl">{casting.title}</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">{casting.city.name}</p>
          {casting.moderationComment ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive">
              {casting.moderationComment}
            </p>
          ) : null}
        </div>

        <div className="flex max-w-full flex-nowrap gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible">
          <Button variant="outline" size="sm" className="h-8 shrink-0 text-xs sm:h-9 sm:text-sm" asChild>
            <Link href={`/producer/castings/${id}/edit`}>Редактировать</Link>
          </Button>
          <Button size="sm" className="h-8 shrink-0 text-xs sm:h-9 sm:text-sm" asChild>
            <Link href={`/producer/castings/${id}/applications`}>Отклики</Link>
          </Button>
        </div>
        <ProducerCastingCardActions castingId={id} showComplete={isActivePublished} mode="detail" />
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-4 p-3 sm:p-4">
          <ProducerCastingSpecGrid
            rows={[
              { label: "Съёмка", value: formatDt(casting.scheduledAt) },
              { label: "Старт / смена", value: [casting.shootStartTime, casting.workHoursNote].filter(Boolean).join(" · ") || "—" },
              { label: "Локация", value: loc, span: "full" },
              { label: "Оплата", value: pay, span: "full" },
              {
                label: "Отклики",
                value: (
                  <>
                    Дедлайн: {formatDt(casting.applicationDeadline)}
                    {casting.slotsNeeded != null ? ` · слотов: ${casting.slotsNeeded}` : ""}
                  </>
                ),
                span: "full",
              },
            ]}
          />
          <div className="border-t border-border/60 pt-3">
            <h2 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Описание
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{casting.description}</p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-2">
        <h2 className="text-base font-semibold sm:text-lg">Отклики</h2>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
          {applications.length === 0 ? (
            <p className="text-xs text-muted-foreground sm:text-sm">Пока нет откликов.</p>
          ) : (
            applications.map((app) => (
              <Card key={app.id} className="border-border/70 shadow-sm">
                <CardContent className="space-y-2 p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{app.actorProfile.fullName}</p>
                      <p className="text-[11px] text-muted-foreground sm:text-xs">
                        {app.actorProfile.city.name} · {calculateAge(app.actorProfile.birthDate)} лет
                      </p>
                    </div>
                  </div>
                  {app.coverNote ? (
                    <p className="rounded-md bg-muted/40 px-2 py-1.5 text-xs text-muted-foreground line-clamp-3">
                      «{app.coverNote}»
                    </p>
                  ) : null}
                  {app.chat ? (
                    <Button size="sm" variant="secondary" className="h-8 w-full text-xs sm:w-auto" asChild>
                      <Link href={`/producer/chats/${app.chat.id}`}>Чат</Link>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
