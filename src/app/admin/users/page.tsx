import Link from "next/link";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  listUsers,
  listPendingActorRegistrations,
  listPendingProducerRegistrations,
} from "@/server/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SuspendUserButton } from "./suspend-button";
import { BlockActorButton } from "../actors/block-button";
import {
  approveActorProfileModerationFormAction,
  approveProducerProfileModerationFormAction,
  rejectActorProfileModerationAction,
  rejectProducerProfileModerationAction,
} from "@/features/admin/moderation-actions";

const tabs = [
  { id: "users", label: "Аккаунты" },
  { id: "registrations", label: "Регистрации (ожидают)" },
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
  const tab = (tabs.find((t) => t.id === sp.tab)?.id ?? "users") as TabId;

  const [users, pendingActors, pendingProducers, allActors, allProducers] = await Promise.all([
    listUsers(),
    listPendingActorRegistrations(),
    listPendingProducerRegistrations(),
    prisma.actorProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } }, city: true },
    }),
    prisma.producerProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Аккаунты, регистрации актёров и кастинг-директоров, списки профилей.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {tabs.map((t) => (
          <Button key={t.id} variant={tab === t.id ? "default" : "ghost"} size="sm" asChild>
            <Link href={`/admin/users?tab=${t.id}`}>{t.label}</Link>
          </Button>
        ))}
      </div>

      {tab === "users" && (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                <div>
                  <p className="font-medium">{u.email}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge>{u.role}</Badge>
                    <Badge variant="outline">{u.status}</Badge>
                    {u.actorProfile && (
                      <span className="text-muted-foreground">Актёр: {u.actorProfile.fullName}</span>
                    )}
                    {u.producerProfile && (
                      <span className="text-muted-foreground">Продюсер: {u.producerProfile.companyName}</span>
                    )}
                  </div>
                </div>
                {u.role !== UserRole.ADMIN && <SuspendUserButton userId={u.id} suspended={u.status === "SUSPENDED"} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "registrations" && (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Актёры ({pendingActors.length})</h2>
            <div className="space-y-3">
              {pendingActors.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет заявок.</p>
              ) : (
                pendingActors.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="space-y-3 py-4">
                      <div>
                        <Link href={`/actors/${a.id}`} className="font-medium hover:underline">
                          {a.fullName}
                        </Link>
                        <p className="text-sm text-muted-foreground">{a.user.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <form action={approveActorProfileModerationFormAction}>
                          <input type="hidden" name="profileId" value={a.id} />
                          <Button type="submit" size="sm">
                            Одобрить
                          </Button>
                        </form>
                        <form action={rejectActorProfileModerationAction} className="min-w-[240px] flex-1 space-y-2">
                          <input type="hidden" name="profileId" value={a.id} />
                          <Textarea name="comment" required rows={2} placeholder="Причина отклонения" />
                          <Button type="submit" size="sm" variant="outline">
                            Отклонить
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Кастинг-директора ({pendingProducers.length})</h2>
            <div className="space-y-3">
              {pendingProducers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет заявок.</p>
              ) : (
                pendingProducers.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="space-y-3 py-4">
                      <div>
                        <p className="font-medium">{p.companyName}</p>
                        <p className="text-sm text-muted-foreground">{p.user.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <form action={approveProducerProfileModerationFormAction}>
                          <input type="hidden" name="profileId" value={p.id} />
                          <Button type="submit" size="sm">
                            Одобрить
                          </Button>
                        </form>
                        <form action={rejectProducerProfileModerationAction} className="min-w-[240px] flex-1 space-y-2">
                          <input type="hidden" name="profileId" value={p.id} />
                          <Textarea name="comment" required rows={2} placeholder="Причина отклонения" />
                          <Button type="submit" size="sm" variant="outline">
                            Отклонить
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {tab === "actors" && (
        <div className="space-y-2">
          {allActors.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                <div>
                  <Link href={`/actors/${a.id}`} className="font-medium hover:underline">
                    {a.fullName}
                  </Link>
                  <p className="text-muted-foreground">{a.user.email}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant="outline">{a.moderationStatus}</Badge>
                    <span>{a.city.name}</span>
                  </div>
                </div>
                <BlockActorButton profileId={a.id} blocked={a.isBlockedByAdmin} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "producers" && (
        <div className="space-y-2">
          {allProducers.map((p) => (
            <Card key={p.id}>
              <CardContent className="py-4 text-sm">
                <Link href={`/producers/${p.id}`} className="font-medium hover:underline">
                  {p.companyName}
                </Link>
                <p className="text-muted-foreground">{p.user.email}</p>
                <Badge className="mt-2" variant="outline">
                  {p.moderationStatus}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
