import Link from "next/link";
import { ServiceLeadStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listAllCourseSlotsForAdmin,
  listCourseApplicationsForAdmin,
  countCourseApplicationsForSlot,
} from "@/server/services/course-slot.service";
import {
  adminCreateCourseSlotAction,
  adminUpdateCourseSlotAction,
  adminSetCourseLeadFromFormAction,
} from "@/features/admin/service-leads-actions";
import { CourseSlotDeleteButton } from "@/components/admin/service-slot-delete-buttons";
import { cn } from "@/lib/utils";

const statusRu: Record<ServiceLeadStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Завершена",
  CANCELLED: "Отменена",
};

export default async function AdminObucheniePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "leads" ? "leads" : "slots";
  const [slots, leads] = await Promise.all([listAllCourseSlotsForAdmin(), listCourseApplicationsForAdmin()]);

  const slotsWithLive = await Promise.all(
    slots.map(async (s) => ({
      ...s,
      booked: await countCourseApplicationsForSlot(s.id),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Обучение</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Календарь курсов (8 и 16 часов) и заявки пользователей.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        <Button variant={tab === "slots" ? "default" : "ghost"} size="sm" asChild>
          <Link href="/admin/obuchenie?tab=slots">Слоты курсов</Link>
        </Button>
        <Button variant={tab === "leads" ? "default" : "ghost"} size="sm" asChild>
          <Link href="/admin/obuchenie?tab=leads">Заявки ({leads.length})</Link>
        </Button>
      </div>

      {tab === "slots" ? (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Новый слот</CardTitle>
              <CardDescription>
                Для 16-часового курса укажите второй учебный день. На публичной странице отображаются только активные
                слоты с свободными местами.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={adminCreateCourseSlotAction} className="grid max-w-md gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-type">Формат</Label>
                  <select
                    id="new-type"
                    name="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    defaultValue="EIGHT_HOURS"
                  >
                    <option value="EIGHT_HOURS">8 часов (1 день)</option>
                    <option value="SIXTEEN_HOURS">16 часов (2 дня)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-start">Первый день</Label>
                  <Input id="new-start" name="startDay" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-second">Второй день (только для 16 ч)</Label>
                  <Input id="new-second" name="secondDay" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-max">Максимум человек</Label>
                  <Input id="new-max" name="maxParticipants" type="number" min={1} max={500} defaultValue={12} />
                </div>
                <Button type="submit">Добавить слот</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Все слоты</h2>
            {slotsWithLive.length === 0 ? (
              <p className="text-sm text-muted-foreground">Пока нет записей.</p>
            ) : (
              <div className="space-y-4">
                {slotsWithLive.map((s) => {
                  const d1 = s.startDay.toLocaleDateString("ru-RU");
                  const d2 = s.secondDay ? s.secondDay.toLocaleDateString("ru-RU") : null;
                  return (
                    <Card key={s.id}>
                      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                        <div className="text-sm">
                          <p className="font-medium">
                            {s.type === "EIGHT_HOURS" ? "8 ч" : "16 ч"} · {d1}
                            {d2 ? ` — ${d2}` : ""}
                          </p>
                          <p className="text-muted-foreground">
                            Записано: {s.booked} / {s.maxParticipants} ·{" "}
                            <span className={cn(!s.isActive && "text-destructive")}>
                              {s.isActive ? "активен" : "скрыт"}
                            </span>
                          </p>
                        </div>
                        <form action={adminUpdateCourseSlotAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="id" value={s.id} />
                          <div className="space-y-1">
                            <Label className="text-xs">Лимит</Label>
                            <Input
                              name="maxParticipants"
                              type="number"
                              min={1}
                              max={500}
                              defaultValue={s.maxParticipants}
                              className="h-9 w-24"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Статус</Label>
                            <select
                              name="isActive"
                              defaultValue={s.isActive ? "true" : "false"}
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
                        <CourseSlotDeleteButton slotId={s.id} />
                      </CardContent>
                    </Card>
                  );
                })}
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
                    Дата рождения: {l.birthDate.toLocaleDateString("ru-RU")} · Курс:{" "}
                    {l.courseType === "EIGHT_HOURS" ? "8 ч" : "16 ч"}
                  </p>
                  <p>
                    Слот: {l.slot.startDay.toLocaleDateString("ru-RU")}
                    {l.slot.secondDay ? ` — ${l.slot.secondDay.toLocaleDateString("ru-RU")}` : ""}
                  </p>
                  <p className="whitespace-pre-wrap text-muted-foreground">{l.experience}</p>
                  <form action={adminSetCourseLeadFromFormAction} className="flex flex-wrap items-center gap-2">
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
