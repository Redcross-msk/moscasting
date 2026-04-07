import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { listApplicationsForActor } from "@/server/services/application.service";
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
