import Link from "next/link";
import { listCastingReportsFromActors } from "@/server/services/report.service";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "./report-actions";

export default async function AdminReportsPage() {
  const reports = await listCastingReportsFromActors();
  const ids = [...new Set(reports.map((r) => r.targetId))];
  const castings =
    ids.length === 0
      ? []
      : await prisma.casting.findMany({
          where: { id: { in: ids } },
          select: {
            id: true,
            title: true,
            deletedAt: true,
            producerProfile: { select: { companyName: true } },
          },
        });
  const castingById = Object.fromEntries(castings.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Жалобы</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Заявки от актёров на кастинги. Обработайте жалобу и при необходимости откройте объявление в админке.
        </p>
      </div>

      <div className="space-y-2">
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Жалоб пока нет.</p>
        ) : (
          reports.map((r) => {
            const c = castingById[r.targetId];
            return (
              <Card key={r.id}>
                <CardContent className="space-y-3 py-4 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{r.status}</Badge>
                    <Badge variant="outline">Кастинг</Badge>
                  </div>
                  <p>
                    <span className="text-muted-foreground">От актёра:</span> {r.reporter.email}
                  </p>
                  <div className="rounded-md border border-border bg-muted/30 p-3">
                    {c ? (
                      <>
                        <p className="font-medium">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.producerProfile.companyName}</p>
                        {c.deletedAt ? (
                          <p className="mt-2 text-xs text-destructive">Кастинг удалён</p>
                        ) : (
                          <Link href={`/castings/${c.id}`} className="mt-2 inline-block text-sm underline">
                            Открыть кастинг
                          </Link>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">Кастинг не найден (ID: {r.targetId})</p>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-muted-foreground">{r.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString("ru-RU")}
                  </p>
                  <ReportActions reportId={r.id} />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
