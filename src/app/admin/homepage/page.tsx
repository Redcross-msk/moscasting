import {
  getHomepageFeaturedSlotsAdmin,
  listActorsForHomepageAdminPicker,
  listCastingsForHomepageAdminPicker,
} from "@/server/services/homepage.service";
import { env } from "@/lib/env";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AdminHomepageActorsPickForm,
  AdminHomepageCastingsPickForm,
} from "@/components/admin/homepage-slot-pickers";

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

  const castingOpts = pickCastings.map((c) => ({
    id: c.id,
    title: c.title,
    cityName: c.city.name,
  }));
  const actorOpts = pickActors.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    cityName: a.city.name,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Главная страница</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          До шести карточек в каждом блоке. Для каждого слота нажмите «Выбрать», найдите кастинг или актёра в списке и
          подтвердите. Пустой слот заполняется автоматически из каталога (Москва).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Кастинги на главной</CardTitle>
          <CardDescription>Позиции 1–6 сверху вниз в блоке «Активные кастинги».</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminHomepageCastingsPickForm castings={castingOpts} initialByPosition={castingIdByPos} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Актёры на главной</CardTitle>
          <CardDescription>Позиции 1–6 слева направо, затем следующий ряд.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminHomepageActorsPickForm actors={actorOpts} initialByPosition={actorIdByPos} />
        </CardContent>
      </Card>
    </div>
  );
}
