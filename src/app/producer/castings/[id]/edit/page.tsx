import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCastingForProducer } from "@/server/services/casting.service";
import { updateCastingFromFormAction } from "@/features/castings/actions";
import { FormSubmitOnceButton } from "@/components/form-submit-once-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeleteCastingButton } from "./delete-button";
import { CastingCategoryFields } from "@/components/casting-category-fields";
import { parseRoleRequirementsJson } from "@/lib/casting-role-json";
export default async function EditCastingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!profile) notFound();

  const casting = await getCastingForProducer(id, profile.id);
  if (!casting) notFound();

  const dl = casting.applicationDeadline
    ? new Date(casting.applicationDeadline).toISOString().slice(0, 16)
    : "";
  const sd = casting.scheduledAt ? new Date(casting.scheduledAt).toISOString().slice(0, 16) : "";

  const parsed = parseRoleRequirementsJson(casting.roleRequirementsJson);
  const defaultCat = casting.castingCategory ?? "";

  const addressDefault =
    casting.addressLine?.trim() ||
    (!casting.metroStation?.trim() && casting.metroOrPlace?.trim() ? casting.metroOrPlace.trim() : "");

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Редактировать кастинг</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          После сохранения кастинг снова отправляется на модерацию и скрывается из каталога до одобрения.
        </p>
        {casting.moderationComment && (
          <p className="mt-2 text-sm text-destructive">Замечание модератора: {casting.moderationComment}</p>
        )}
      </div>
      <form action={updateCastingFromFormAction} className="space-y-4 rounded-lg border p-6">
        <input type="hidden" name="castingId" value={casting.id} />
        <div className="space-y-2">
          <Label htmlFor="title">Название</Label>
          <Input id="title" name="title" defaultValue={casting.title} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea id="description" name="description" defaultValue={casting.description} required rows={6} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="projectType">Проект</Label>
            <Input id="projectType" name="projectType" defaultValue={casting.projectType ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentRub">Оплата, ₽</Label>
            <Input
              id="paymentRub"
              name="paymentRub"
              type="number"
              min={0}
              defaultValue={casting.paymentRub ?? ""}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentInfo">Оплата (текст)</Label>
          <Input id="paymentInfo" name="paymentInfo" defaultValue={casting.paymentInfo ?? ""} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Дата съёмки</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" defaultValue={sd} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shootStartTime">Время начала</Label>
            <Input
              id="shootStartTime"
              name="shootStartTime"
              defaultValue={casting.shootStartTime ?? ""}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="workHoursNote">Рабочие часы</Label>
          <Input id="workHoursNote" name="workHoursNote" defaultValue={casting.workHoursNote ?? ""} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="metroStation">Метро</Label>
            <Input id="metroStation" name="metroStation" defaultValue={casting.metroStation ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine">Адрес</Label>
            <Input id="addressLine" name="addressLine" defaultValue={addressDefault} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slotsNeeded">Кол-во людей</Label>
            <Input
              id="slotsNeeded"
              name="slotsNeeded"
              type="number"
              min={1}
              defaultValue={casting.slotsNeeded ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicationDeadline">Дедлайн откликов</Label>
            <Input id="applicationDeadline" name="applicationDeadline" type="datetime-local" defaultValue={dl} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="candidateRequirements">Общие требования</Label>
          <Textarea
            id="candidateRequirements"
            name="candidateRequirements"
            defaultValue={casting.candidateRequirements ?? ""}
          />
        </div>

        <CastingCategoryFields
          defaultCategory={defaultCat}
          defaultMass={parsed.mass}
          defaultSolo={parsed.solo}
          defaultGroup={parsed.group}
        />

        <FormSubmitOnceButton>Сохранить и отправить на модерацию</FormSubmitOnceButton>
      </form>
      <DeleteCastingButton castingId={casting.id} />
      </div>
    </div>
  );
}
