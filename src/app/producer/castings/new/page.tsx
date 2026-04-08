import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createCastingAction } from "@/features/castings/actions";
import { FormSubmitOnceButton } from "@/components/form-submit-once-button";
import { ProducerCastingFormFields } from "@/components/producer-casting-form-fields";

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
          <ProducerCastingFormFields />
          <FormSubmitOnceButton size="lg" className="w-full sm:w-auto">
            Отправить на модерацию
          </FormSubmitOnceButton>
        </form>
      </div>
    </div>
  );
}
