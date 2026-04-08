import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { listApplicationsForActor } from "@/server/services/application.service";
import { ActorApplicationsPaginatedList } from "@/components/actor-applications-paginated-list";
import { prismaCastingToSerializedHome } from "@/lib/prisma-casting-to-serialized";

export default async function ActorApplicationsPage() {
  const session = await auth();
  const profile = await prisma.actorProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!profile) return <p>Нет профиля</p>;

  const applications = await listApplicationsForActor(profile.id);

  const rows = applications.map((app) => ({
    applicationId: app.id,
    status: app.status,
    chatId: app.chat?.id ?? null,
    coverNote: app.coverNote,
    c: prismaCastingToSerializedHome(app.casting),
  }));

  return (
    <div className="space-y-8 pb-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Мои отклики</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Тот же вид, что в каталоге: справа — перейти в чат и отозвать отклик.
        </p>
      </header>

      <ActorApplicationsPaginatedList rows={rows} />
    </div>
  );
}
