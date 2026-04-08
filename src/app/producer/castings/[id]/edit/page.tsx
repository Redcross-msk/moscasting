import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCastingForProducer } from "@/server/services/casting.service";
import { updateCastingFromFormAction } from "@/features/castings/actions";
import { FormSubmitOnceButton } from "@/components/form-submit-once-button";
import { DeleteCastingButton } from "./delete-button";
import { ProducerCastingFormFields } from "@/components/producer-casting-form-fields";
import { parseRoleRequirementsJson } from "@/lib/casting-role-json";
import { parseShootDatesYmdFromJson } from "@/lib/casting-shoot-dates";

export default async function EditCastingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!profile) notFound();

  const casting = await getCastingForProducer(id, profile.id);
  if (!casting) notFound();

  const parsed = parseRoleRequirementsJson(casting.roleRequirementsJson);
  const defaultCat = casting.castingCategory ?? "";

  const addressDefault =
    casting.addressLine?.trim() ||
    (!casting.metroStation?.trim() && casting.metroOrPlace?.trim() ? casting.metroOrPlace.trim() : "");

  const shootDatesYmd = parseShootDatesYmdFromJson(casting.shootDatesJson) ?? [];

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Редактировать кастинг</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            После сохранения кастинг снова отправляется на модерацию и скрывается из каталога до одобрения.
          </p>
          {casting.moderationComment ? (
            <p className="mt-2 text-sm text-destructive">Замечание модератора: {casting.moderationComment}</p>
          ) : null}
        </div>
        <form action={updateCastingFromFormAction} className="space-y-4 rounded-lg border p-6">
          <input type="hidden" name="castingId" value={casting.id} />
          <ProducerCastingFormFields
            defaults={{
              title: casting.title,
              description: casting.description,
              projectType: casting.projectType,
              paymentRub: casting.paymentRub,
              paymentPeriod: casting.paymentPeriod,
              shootDatesYmd,
              scheduledAt: casting.scheduledAt,
              shootStartTime: casting.shootStartTime,
              workHoursNote: casting.workHoursNote,
              metroStation: casting.metroStation,
              addressLine: addressDefault,
              applicationDeadline: casting.applicationDeadline,
            }}
            categoryDefaults={{
              defaultCategory: defaultCat,
              defaultMass: parsed.mass,
              defaultSolo: parsed.solo,
              defaultGroup: parsed.group,
            }}
          />
          <FormSubmitOnceButton>Сохранить и отправить на модерацию</FormSubmitOnceButton>
        </form>
        <DeleteCastingButton castingId={casting.id} />
      </div>
    </div>
  );
}
