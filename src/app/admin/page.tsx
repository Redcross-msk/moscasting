import { getAdminStats } from "@/server/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  const s = await getAdminStats();

  const items = [
    { label: "Пользователи", value: s.users },
    { label: "Актёры (аккаунты)", value: s.actors },
    { label: "Продюсеры (аккаунты)", value: s.producers },
    { label: "Кастинги", value: s.castings },
    { label: "Отклики", value: s.applications },
    { label: "Чаты", value: s.chats },
    { label: "Жалобы (открытые/в работе)", value: s.reports },
    { label: "Заблокированные профили актёров", value: s.blockedProfiles },
    { label: "Заблокированные кастинги", value: s.blockedCastings },
    { label: "Записей просмотров кастингов", value: s.castingViews },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Админка</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Card key={i.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{i.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{i.value}</CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Детальная аналитика посещений и BI — этап 2; сейчас считаются события CastingView и агрегаты из БД.
      </p>
    </div>
  );
}
