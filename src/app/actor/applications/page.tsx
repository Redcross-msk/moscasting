import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { listApplicationsForActor } from "@/server/services/application.service";
import { ApplicationStatus, ReviewDirection } from "@prisma/client";
import { ReviewBlock } from "@/components/review-block";
import { ActorApplicationCatalogCard } from "@/components/actor-application-catalog-card";
import { prismaCastingToSerializedHome } from "@/lib/prisma-casting-to-serialized";

export default async function ActorApplicationsPage() {
  const session = await auth();
  const profile = await prisma.actorProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!profile) return <p>Нет профиля</p>;

  const applications = await listApplicationsForActor(profile.id);

  return (
    <div className="space-y-8 pb-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Мои отклики</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Тот же вид, что в каталоге: справа — перейти в чат и отозвать отклик.
        </p>
      </header>

      <div className="space-y-6">
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет откликов — загляните в каталог кастингов.</p>
        ) : (
          applications.map((app) => {
            const serialized = prismaCastingToSerializedHome(app.casting);
            return (
              <div key={app.id} className="space-y-3">
                <ActorApplicationCatalogCard
                  c={serialized}
                  applicationId={app.id}
                  status={app.status}
                  chatId={app.chat?.id ?? null}
                  coverNote={app.coverNote}
                />
                {(app.status === ApplicationStatus.INVITED || app.status === ApplicationStatus.CAST_PASSED) && (
                  <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-3 sm:px-4">
                    <p className="mb-2 text-xs text-muted-foreground">
                      Оцените кастинг-директора — отзыв появится в его профиле после сохранения.
                    </p>
                    <ReviewBlock
                      applicationId={app.id}
                      direction={ReviewDirection.ACTOR_TO_PRODUCER}
                      existing={app.reviews.find(
                        (r) =>
                          r.direction === ReviewDirection.ACTOR_TO_PRODUCER && r.authorId === session!.user.id,
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
