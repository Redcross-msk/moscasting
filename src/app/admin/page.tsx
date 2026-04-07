import Link from "next/link";
import {
  getAdminDashboardStats,
  type AdminStatsPeriod,
} from "@/server/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const periods: { id: AdminStatsPeriod; label: string }[] = [
  { id: "day", label: "День" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "year", label: "Год" },
];

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.period;
  const period: AdminStatsPeriod =
    raw === "day" || raw === "week" || raw === "month" || raw === "year" ? raw : "week";
  const s = await getAdminDashboardStats(period);

  const items = [
    {
      label: "Посещения портала",
      value: s.portalVisitsTotal,
      hint: `За выбранный период. С аккаунтом: ${s.portalVisitsRegistered}, без входа: ${s.portalVisitsGuest}`,
    },
    {
      label: "Зарегистрированных пользователей",
      value: s.usersRegistered,
      hint: "Все аккаунты, кроме администраторов",
    },
    { label: "Актёров", value: s.actors, hint: "Пользователи с ролью ACTOR" },
    { label: "Продюсеров", value: s.producers, hint: "Пользователи с ролью PRODUCER" },
    { label: "Кастингов", value: s.castings, hint: "Не удалённые объявления" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Обзор</h1>

      <div className="flex flex-wrap gap-2">
        <span className="w-full text-xs font-medium text-muted-foreground sm:w-auto sm:py-1.5">Период:</span>
        {periods.map((p) => (
          <Link
            key={p.id}
            href={`/admin?period=${p.id}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              period === p.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {items.map((i) => (
          <Card key={i.label} className="overflow-hidden shadow-sm">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-xs font-medium leading-tight text-muted-foreground sm:text-sm">
                {i.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pb-4 pt-0">
              <p className="text-xl font-semibold tabular-nums sm:text-2xl">{i.value}</p>
              {i.hint ? <p className="text-[10px] leading-snug text-muted-foreground sm:text-xs">{i.hint}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
