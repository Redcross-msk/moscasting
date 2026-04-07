import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { adminUpdateCastingBasicsAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function AdminEditCastingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await prisma.casting.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      title: true,
      description: true,
      producerProfile: { select: { companyName: true } },
    },
  });
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/castings">← К списку</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Редактирование кастинга</CardTitle>
          <CardDescription>
            {c.producerProfile.companyName} · публичная страница:{" "}
            <Link href={`/castings/${c.id}`} className="underline">
              открыть
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={adminUpdateCastingBasicsAction} className="space-y-4">
            <input type="hidden" name="castingId" value={c.id} />
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" name="title" required minLength={2} defaultValue={c.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" name="description" required minLength={5} rows={10} defaultValue={c.description} />
            </div>
            <Button type="submit">Сохранить</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
