import Link from "next/link";
import { listPendingCastingModeration } from "@/server/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  approveCastingModerationFormAction,
  rejectCastingModerationAction,
} from "@/features/admin/moderation-actions";

export default async function AdminModerationPage() {
  const castings = await listPendingCastingModeration();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Модерация кастингов</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Только заявки на публикацию кастингов. Регистрация актёров и продюсеров проходит без модерации.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Очередь ({castings.length})</h2>
        <div className="space-y-3">
          {castings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет заявок в очереди.</p>
          ) : (
            castings.map((c) => (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link href={`/castings/${c.id}`} className="hover:underline">
                      {c.title}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {c.producerProfile.companyName} · {c.city.name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="line-clamp-3 text-muted-foreground">{c.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <form action={approveCastingModerationFormAction}>
                      <input type="hidden" name="castingId" value={c.id} />
                      <Button type="submit" size="sm">
                        Опубликовать
                      </Button>
                    </form>
                  </div>
                  <form action={rejectCastingModerationAction} className="space-y-2 rounded-md border border-dashed p-3">
                    <input type="hidden" name="castingId" value={c.id} />
                    <Label htmlFor={`rej-c-${c.id}`}>Отклонить с комментарием</Label>
                    <Textarea
                      id={`rej-c-${c.id}`}
                      name="comment"
                      required
                      rows={2}
                      placeholder="Что исправить у кастинг-директора"
                    />
                    <Button type="submit" size="sm" variant="destructive">
                      Отклонить
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
