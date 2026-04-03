import Link from "next/link";
import { auth } from "@/auth";
import { listRecentNotifications } from "@/server/services/notification.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { markAllNotificationsReadAction, markNotificationReadFormAction } from "@/features/notifications/actions";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary underline">
          Войдите
        </Link>
        , чтобы видеть уведомления.
      </p>
    );
  }

  const items = await listRecentNotifications(session.user.id, 50);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Уведомления</h1>
        {items.some((n) => !n.readAt) && (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline" size="sm">
              Прочитать все
            </Button>
          </form>
        )}
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока пусто.</p>
        ) : (
          items.map((n) => (
            <Card key={n.id} className={!n.readAt ? "border-primary/30" : ""}>
              <CardContent className="flex flex-col gap-2 py-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="mt-1 text-muted-foreground">{n.body}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                  {!n.readAt && (
                    <form action={markNotificationReadFormAction}>
                      <input type="hidden" name="notificationId" value={n.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Ок
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
