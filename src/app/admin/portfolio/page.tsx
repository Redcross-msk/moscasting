import Link from "next/link";
import { ServiceLeadStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listAllPortfolioDaysForAdmin,
  listPortfolioApplicationsForAdmin,
  countPortfolioApplicationsForDay,
} from "@/server/services/portfolio-slot.service";
import {
  adminCreatePortfolioDayAction,
  adminUpdatePortfolioDayAction,
  adminSetPortfolioLeadFromFormAction,
} from "@/features/admin/service-leads-actions";
import { PortfolioDayDeleteButton } from "@/components/admin/service-slot-delete-buttons";
import { cn } from "@/lib/utils";

const statusRu: Record<ServiceLeadStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Завершена",
  CANCELLED: "Отменена",
};

export default async function AdminPortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "leads" ? "leads" : "slots";
  const [days, leads] = await Promise.all([listAllPortfolioDaysForAdmin(), listPortfolioApplicationsForAdmin()]);

  const daysWithLive = await Promise.all(
    days.map(async (d) => ({
      ...d,
      booked: await countPortfolioApplicationsForDay(d.id),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Портфолио</h1>
        <p className="mt-1 text-sm text-muted-foreground">Календарь съёмок и заявки на портфолио / видеовизитку.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        <Button variant={tab === "slots" ? "default" : "ghost"} size="sm" asChild>
          <Link href="/admin/portfolio?tab=slots">Календарь</Link>
        </Button>
        <Button variant={tab === "leads" ? "default" : "ghost"} size="sm" asChild>
          <Link href="/admin/portfolio?tab=leads">Заявки ({leads.length})</Link>
        </Button>
      </div>

      {tab === "slots" ? (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Новый день съёмки</CardTitle>
              <CardDescription>
                Добавьте дату и лимит заявок. На сайте пользователи видят только активные дни со свободными местами.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={adminCreatePortfolioDayAction} className="grid max-w-md gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shootDate">Дата</Label>
                  <Input id="shootDate" name="shootDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBookings">Максимум заявок</Label>
                  <Input id="maxBookings" name="maxBookings" type="number" min={1} max={200} defaultValue={6} />
                </div>
                <Button type="submit">Добавить</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Все дни</h2>
            {daysWithLive.length === 0 ? (
              <p className="text-sm text-muted-foreground">Пока нет дат.</p>
            ) : (
              <div className="space-y-4">
                {daysWithLive.map((d) => (
                  <Card key={d.id}>
                    <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                      <div className="text-sm">
                        <p className="font-medium">{d.shootDate.toLocaleDateString("ru-RU")}</p>
                        <p className="text-muted-foreground">
                          Заявок: {d.booked} / {d.maxBookings} ·{" "}
                          <span className={cn(!d.isActive && "text-destructive")}>
                            {d.isActive ? "активен" : "скрыт"}
                          </span>
                        </p>
                      </div>
                      <form action={adminUpdatePortfolioDayAction} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="id" value={d.id} />
                        <div className="space-y-1">
                          <Label className="text-xs">Лимит</Label>
                          <Input
                            name="maxBookings"
                            type="number"
                            min={1}
                            max={200}
                            defaultValue={d.maxBookings}
                            className="h-9 w-24"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Статус</Label>
                          <select
                            name="isActive"
                            defaultValue={d.isActive ? "true" : "false"}
                            className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
                          >
                            <option value="true">Активен</option>
                            <option value="false">Скрыт</option>
                          </select>
                        </div>
                        <Button type="submit" size="sm" variant="secondary">
                          Сохранить
                        </Button>
                      </form>
                      <PortfolioDayDeleteButton dayId={d.id} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">Заявок пока нет.</p>
          ) : (
            leads.map((l) => (
              <Card key={l.id}>
                <CardContent className="space-y-3 py-4 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium">{l.fullName}</span>
                    <span className="text-muted-foreground">{l.email}</span>
                  </div>
                  <p className="text-muted-foreground">{l.phone}</p>
                  <p>
                    Дата рождения: {l.birthDate.toLocaleDateString("ru-RU")} · Желаемая съёмка:{" "}
                    {l.slot.shootDate.toLocaleDateString("ru-RU")}
                  </p>
                  <form action={adminSetPortfolioLeadFromFormAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="leadId" value={l.id} />
                    <select
                      name="status"
                      defaultValue={l.status}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {Object.values(ServiceLeadStatus).map((st) => (
                        <option key={st} value={st}>
                          {statusRu[st]}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm">
                      Обновить статус
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
