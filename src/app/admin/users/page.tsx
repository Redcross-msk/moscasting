import Link from "next/link";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SuspendUserButton } from "./suspend-button";
import { BlockActorButton } from "../actors/block-button";
import { BlockProducerButton } from "./block-producer-button";
import { DeleteUserButton } from "./delete-user-button";

const tabs = [
  { id: "actors", label: "Актёры" },
  { id: "producers", label: "Продюсеры" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = (tabs.find((t) => t.id === sp.tab)?.id ?? "actors") as TabId;

  const [allActors, allProducers] = await Promise.all([
    prisma.actorProfile.findMany({
      where: { user: { role: UserRole.ACTOR } },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, status: true } },
        city: true,
      },
    }),
    prisma.producerProfile.findMany({
      where: { user: { role: UserRole.PRODUCER } },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, email: true, status: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Актёры и продюсеры. Модерация регистрации не требуется — блокировка аккаунта, профиля или полное удаление.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {tabs.map((t) => (
          <Button key={t.id} variant={tab === t.id ? "default" : "ghost"} size="sm" asChild>
            <Link href={`/admin/users?tab=${t.id}`}>{t.label}</Link>
          </Button>
        ))}
      </div>

      {tab === "actors" && (
        <div className="space-y-2">
          {allActors.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-col gap-3 py-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                  <Link href={`/actors/${a.id}`} className="font-medium hover:underline">
                    {a.fullName}
                  </Link>
                  <p className="text-muted-foreground">{a.user.email}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant="outline">{a.user.status}</Badge>
                    <Badge variant="outline">{a.moderationStatus}</Badge>
                    <span className="text-muted-foreground">{a.city.name}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SuspendUserButton userId={a.user.id} suspended={a.user.status === "SUSPENDED"} />
                  <BlockActorButton profileId={a.id} blocked={a.isBlockedByAdmin} />
                  <DeleteUserButton userId={a.user.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "producers" && (
        <div className="space-y-2">
          {allProducers.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-col gap-3 py-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                  <Link href={`/producers/${p.id}`} className="font-medium hover:underline">
                    {p.companyName}
                  </Link>
                  <p className="text-muted-foreground">{p.user.email}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant="outline">{p.user.status}</Badge>
                    <Badge variant="outline">{p.moderationStatus}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SuspendUserButton userId={p.user.id} suspended={p.user.status === "SUSPENDED"} />
                  <BlockProducerButton profileId={p.id} blocked={p.isBlockedByAdmin} />
                  <DeleteUserButton userId={p.user.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
