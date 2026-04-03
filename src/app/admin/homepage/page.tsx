import {
  getHomepageFeaturedSlotsAdmin,
  listActorsForHomepageAdminPicker,
  listCastingsForHomepageAdminPicker,
} from "@/server/services/homepage.service";
import { env } from "@/lib/env";
import { saveHomepageFeaturedActorsAction, saveHomepageFeaturedCastingsAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default async function AdminHomepagePage() {
  const citySlug = env.NEXT_PUBLIC_DEFAULT_CITY_SLUG;
  const [pickCastings, pickActors, { castingSlots, actorSlots }] = await Promise.all([
    listCastingsForHomepageAdminPicker(citySlug),
    listActorsForHomepageAdminPicker(citySlug),
    getHomepageFeaturedSlotsAdmin(),
  ]);

  const castingIdByPos: Record<number, string> = {};
  for (const s of castingSlots) {
    castingIdByPos[s.position] = s.castingId;
  }
  const actorIdByPos: Record<number, string> = {};
  for (const s of actorSlots) {
    actorIdByPos[s.position] = s.actorProfileId;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Главная страница</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          До шести карточек в каждом блоке. Слоты можно продавать как рекламные места. Пустые слоты на сайте
          заполняются автоматически из публичного каталога (Москва).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Кастинги на главной</CardTitle>
          <CardDescription>Позиции 1–6 сверху вниз в блоке «Активные кастинги».</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomepageFeaturedCastingsAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((p) => (
                <div key={p} className="space-y-2">
                  <Label htmlFor={`casting_slot_${p}`}>Слот {p}</Label>
                  <select
                    id={`casting_slot_${p}`}
                    name={`casting_slot_${p}`}
                    defaultValue={castingIdByPos[p] ?? ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">— автоматически из каталога —</option>
                    {pickCastings.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.city.name})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <Button type="submit">Сохранить кастинги</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Актёры на главной</CardTitle>
          <CardDescription>Позиции 1–6 слева направо, затем следующий ряд.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveHomepageFeaturedActorsAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((p) => (
                <div key={p} className="space-y-2">
                  <Label htmlFor={`actor_slot_${p}`}>Слот {p}</Label>
                  <select
                    id={`actor_slot_${p}`}
                    name={`actor_slot_${p}`}
                    defaultValue={actorIdByPos[p] ?? ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">— автоматически из каталога —</option>
                    {pickActors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({a.city.name})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <Button type="submit">Сохранить актёров</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
