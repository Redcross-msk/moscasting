import Link from "next/link";
import { listAllCastings } from "@/server/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPaginatedCardList } from "@/components/admin/admin-paginated-card-list";
import { BlockCastingButton } from "./block-button";
import { AdminDeleteCastingButton } from "./delete-casting-button";

function parseDateStart(s?: string): Date | undefined {
  if (!s?.trim()) return undefined;
  const d = new Date(`${s.trim()}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseDateEnd(s?: string): Date | undefined {
  if (!s?.trim()) return undefined;
  const d = new Date(`${s.trim()}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function AdminCastingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string; producer?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const producerQ = sp.producer?.trim();
  const dateFrom = parseDateStart(sp.from);
  const dateTo = parseDateEnd(sp.to);

  const castings = await listAllCastings({
    q: q || undefined,
    dateFrom,
    dateTo,
    producerQ: producerQ || undefined,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Кастинги</h1>

      <form method="get" className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[180px] flex-1 space-y-2">
          <Label htmlFor="q">Название / описание</Label>
          <Input id="q" name="q" placeholder="Поиск…" defaultValue={q ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="from">Размещено с</Label>
          <Input id="from" name="from" type="date" defaultValue={sp.from ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">по</Label>
          <Input id="to" name="to" type="date" defaultValue={sp.to ?? ""} />
        </div>
        <div className="min-w-[160px] flex-1 space-y-2">
          <Label htmlFor="producer">Продюсер</Label>
          <Input id="producer" name="producer" placeholder="Компания или имя" defaultValue={producerQ ?? ""} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Применить</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/castings">Сброс</Link>
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {castings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ничего не найдено.</p>
        ) : (
          <AdminPaginatedCardList pageSizeMobile={6} pageSizeDesktop={9}>
            {castings.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex flex-col gap-3 py-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/castings/${c.id}`} className="font-medium hover:underline">
                      {c.title}
                    </Link>
                    <p className="text-muted-foreground">
                      {c.producerProfile.companyName} · {c.city.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Размещён: {new Date(c.createdAt).toLocaleString("ru-RU")}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge variant="outline">{c.status}</Badge>
                      <Badge variant="secondary">{c.moderationStatus}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/castings/${c.id}/edit`}>Редактировать</Link>
                    </Button>
                    <BlockCastingButton
                      castingId={c.id}
                      blocked={c.status === "BLOCKED" || c.moderationStatus === "BLOCKED"}
                    />
                    <AdminDeleteCastingButton castingId={c.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </AdminPaginatedCardList>
        )}
      </div>
    </div>
  );
}
