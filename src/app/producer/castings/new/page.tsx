import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createCastingAction } from "@/features/castings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CastingCategoryFields } from "@/components/casting-category-fields";
import { FormSubmitOnceButton } from "@/components/form-submit-once-button";

export default async function NewCastingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRODUCER") redirect("/");

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Новый кастинг</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            После сохранения кастинг уходит на модерацию. После одобрения администратором появится в каталоге.
          </p>
        </div>
        <form action={createCastingAction} className="space-y-4 rounded-lg border p-6 shadow-sm">
          <input type="hidden" name="citySlug" value="moscow" />
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание проекта</Label>
            <Textarea id="description" name="description" required rows={5} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="projectType">Проект</Label>
              <Input id="projectType" name="projectType" placeholder="Реклама, сериал…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentRub">Оплата, ₽ (число для сортировки)</Label>
              <Input id="paymentRub" name="paymentRub" type="number" min={0} placeholder="5000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentInfo">Оплата (текст для карточки)</Label>
            <Input id="paymentInfo" name="paymentInfo" placeholder="5000 ₽ / смена" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Дата съёмки</Label>
              <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shootStartTime">Время начала</Label>
              <Input id="shootStartTime" name="shootStartTime" placeholder="10:00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workHoursNote">Рабочие часы / смена</Label>
            <Input id="workHoursNote" name="workHoursNote" placeholder="8 часов, перерыв 1 ч" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="metroStation">Метро</Label>
              <Input id="metroStation" name="metroStation" placeholder="м. Тверская" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine">Адрес</Label>
              <Input id="addressLine" name="addressLine" placeholder="ул. …, павильон …" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slotsNeeded">Кол-во людей (слотов)</Label>
              <Input id="slotsNeeded" name="slotsNeeded" type="number" min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Дедлайн откликов</Label>
              <Input id="applicationDeadline" name="applicationDeadline" type="datetime-local" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidateRequirements">Общие требования (кратко)</Label>
            <Textarea id="candidateRequirements" name="candidateRequirements" rows={3} />
          </div>

          <CastingCategoryFields />

          <FormSubmitOnceButton size="lg" className="w-full sm:w-auto">
            Отправить на модерацию
          </FormSubmitOnceButton>
        </form>
      </div>
    </div>
  );
}
